"""Base da API do PEP. Rotas de negócio serão adicionadas por módulo."""

import os
import re

import psycopg
from fastapi import Depends, FastAPI
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from redis import Redis
from .auth import current_user, router as auth_router
from .database import connect
from .operacoes import router as operacoes_router

app = FastAPI(title="PEP — Prontuário Eletrônico do Paciente", version="0.1.0")
app.include_router(auth_router)
app.include_router(operacoes_router)


@app.get("/", tags=["Sistema"])
def root():
    return {"projeto": "PEP", "documentacao": "/docs"}


@app.get("/health", tags=["Sistema"])
def health():
    return {"status": "ok"}


@app.get("/health/ready", tags=["Sistema"])
def readiness():
    services = {}
    try:
        with psycopg.connect(
            host=os.environ["POSTGRES_HOST"], dbname=os.environ["POSTGRES_DB"],
            user=os.environ["POSTGRES_USER"], password=os.environ["POSTGRES_PASSWORD"],
            connect_timeout=3,
        ) as connection:
            connection.execute("SELECT 1").fetchone()
        services["postgres"] = "ok"
    except Exception:
        services["postgres"] = "indisponivel"

    try:
        with MongoClient(
            host=os.environ["MONGO_HOST"], username=os.environ["MONGO_USER"],
            password=os.environ["MONGO_PASSWORD"], authSource="admin",
            serverSelectionTimeoutMS=3000, connectTimeoutMS=3000, socketTimeoutMS=3000,
        ) as client:
            client[os.environ["MONGO_DB"]].command("ping")
        services["mongo"] = "ok"
    except Exception:
        services["mongo"] = "indisponivel"

    try:
        with Redis(
            host=os.environ["REDIS_HOST"], password=os.environ["REDIS_PASSWORD"],
            socket_connect_timeout=3, socket_timeout=3,
        ) as client:
            client.ping()
        services["redis"] = "ok"
    except Exception:
        services["redis"] = "indisponivel"

    ready = all(value == "ok" for value in services.values())
    return JSONResponse(
        status_code=200 if ready else 503,
        content={"status": "ok" if ready else "indisponivel", "servicos": services},
    )


@app.get("/pacientes", tags=["Pacientes"])
def listar_pacientes(q: str = "", user=Depends(current_user)):
    termo = q.strip()
    cpf = re.sub(r"[.\-\s]", "", termo)
    prefixo_cpf = f"{cpf}%" if cpf.isdecimal() else None
    nome = termo.replace("!", "!!").replace("%", "!%").replace("_", "!_")

    with connect() as connection:
        return connection.execute(
            """
            SELECT p.id_paciente, p.nome,
                   '***.***.***-' || right(p.cpf, 2) AS cpf_mascarado,
                   p.telefone, planos.convenios
            FROM paciente p
            LEFT JOIN LATERAL (
                SELECT string_agg(DISTINCT c.nome, ', ' ORDER BY c.nome) AS convenios
                FROM paciente_convenio pc JOIN plano pl USING (id_plano) JOIN convenio c USING (id_convenio)
                WHERE pc.id_paciente = p.id_paciente AND pc.status = 'ativo'
                  AND pl.status = 'ativo' AND c.status = 'ativo'
                  AND (pc.validade IS NULL OR pc.validade >= (now() AT TIME ZONE 'America/Fortaleza')::date)
            ) planos ON true
            WHERE (p.nome ILIKE %s ESCAPE '!' OR p.cpf LIKE %s)
              AND (%s <> 'medico' OR EXISTS (
                  SELECT 1 FROM agendamento a JOIN medico m USING (id_medico)
                  WHERE a.id_paciente = p.id_paciente AND m.id_usuario = %s AND a.status <> 'cancelado'
              ))
            ORDER BY p.nome, p.id_paciente
            LIMIT 50
            """,
            (f"%{nome}%", prefixo_cpf, user['perfil'], user['id_usuario']),
        ).fetchall()
