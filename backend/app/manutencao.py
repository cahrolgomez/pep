from datetime import date
from decimal import Decimal
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import Field
from psycopg.errors import UniqueViolation

from .auth import current_user
from .database import connect
from .operacoes import Dados, Especialidade, PacienteCadastro, equipe, obter_consulta_faturavel

router = APIRouter(dependencies=[Depends(current_user)])
admin = [Depends(equipe)]


class Ativacao(Dados):
    status: Literal["ativo", "inativo"]


class Cobertura(Dados):
    cobertura: str | None = Field(default=None, max_length=500)
    procedimentos: list[UUID] = Field(max_length=500)


class Carteirinha(Dados):
    id_plano: UUID
    numero_carteirinha: str = Field(max_length=80)
    validade: date | None = None


class Procedimento(Dados):
    nome: str = Field(max_length=150)
    descricao: str | None = Field(default=None, max_length=500)
    valor: Decimal = Field(ge=0, max_digits=12, decimal_places=2)


class ItemConsulta(Dados):
    id_procedimento: UUID
    quantidade: int = Field(ge=1, le=999)


class Bloqueio(Dados):
    bloqueado: bool


def exigir_registro(registro, mensagem):
    if not registro:
        raise HTTPException(404, mensagem)
    return registro


@router.get("/pacientes/{id_paciente}", dependencies=admin)
def paciente(id_paciente: UUID):
    with connect() as conn:
        return exigir_registro(conn.execute("""
            SELECT id_paciente, nome, cpf, data_nascimento, telefone, email, endereco
            FROM paciente WHERE id_paciente = %s
        """, (id_paciente,)).fetchone(), "Paciente não encontrado")


@router.put("/pacientes/{id_paciente}", dependencies=admin)
def atualizar_paciente(id_paciente: UUID, dados: PacienteCadastro):
    try:
        with connect() as conn:
            return exigir_registro(conn.execute("""
                UPDATE paciente SET nome = %s, cpf = %s, data_nascimento = %s,
                    telefone = %s, email = %s, endereco = %s
                WHERE id_paciente = %s RETURNING id_paciente
            """, (dados.nome, dados.cpf, dados.data_nascimento, dados.telefone, dados.email,
                  dados.endereco, id_paciente)).fetchone(), "Paciente não encontrado")
    except UniqueViolation as exc:
        raise HTTPException(409, "CPF já cadastrado") from exc


@router.put("/especialidades/{id_especialidade}", dependencies=admin)
def atualizar_especialidade(id_especialidade: UUID, dados: Especialidade):
    try:
        with connect() as conn:
            return exigir_registro(conn.execute("""
                UPDATE especialidades SET nome_especialidade = %s, descricao = %s
                WHERE id_especialidade = %s RETURNING id_especialidade
            """, (dados.nome, dados.descricao, id_especialidade)).fetchone(), "Especialidade não encontrada")
    except UniqueViolation as exc:
        raise HTTPException(409, "Especialidade já cadastrada") from exc


@router.patch("/especialidades/{id_especialidade}/status", dependencies=admin)
def status_especialidade(id_especialidade: UUID, dados: Ativacao):
    with connect() as conn:
        return exigir_registro(conn.execute("""
            UPDATE especialidades SET status = %s WHERE id_especialidade = %s RETURNING id_especialidade
        """, (dados.status, id_especialidade)).fetchone(), "Especialidade não encontrada")


@router.patch("/convenios/{id_convenio}/status", dependencies=admin)
def status_convenio(id_convenio: UUID, dados: Ativacao):
    with connect() as conn:
        return exigir_registro(conn.execute("""
            UPDATE convenio SET status = %s WHERE id_convenio = %s RETURNING id_convenio
        """, (dados.status, id_convenio)).fetchone(), "Convênio não encontrado")


@router.put("/planos/{id_plano}/cobertura", dependencies=admin)
def atualizar_cobertura(id_plano: UUID, dados: Cobertura):
    with connect() as conn:
        plano = exigir_registro(conn.execute("""
            UPDATE plano SET cobertura = %s WHERE id_plano = %s RETURNING id_plano
        """, (dados.cobertura, id_plano)).fetchone(), "Plano não encontrado")
        ids = set(dados.procedimentos)
        if ids:
            encontrados = conn.execute("SELECT count(*) AS total FROM procedimento WHERE id_procedimento = ANY(%s)",
                                       (list(ids),)).fetchone()["total"]
            if encontrados != len(ids):
                raise HTTPException(422, "Selecione procedimentos cadastrados")
        conn.execute("DELETE FROM plano_procedimento WHERE id_plano = %s", (id_plano,))
        if ids:
            conn.execute("""
                INSERT INTO plano_procedimento (id_plano, id_procedimento)
                SELECT %s, unnest(%s::uuid[])
            """, (id_plano, list(ids)))
        return plano


@router.patch("/planos/{id_plano}/status", dependencies=admin)
def status_plano(id_plano: UUID, dados: Ativacao):
    with connect() as conn:
        return exigir_registro(conn.execute("""
            UPDATE plano SET status = %s WHERE id_plano = %s RETURNING id_plano
        """, (dados.status, id_plano)).fetchone(), "Plano não encontrado")


@router.get("/pacientes/{id_paciente}/carteirinhas", dependencies=admin)
def carteirinhas(id_paciente: UUID):
    with connect() as conn:
        return conn.execute("""
            SELECT pc.id_paciente_convenio, pc.numero_carteirinha, pc.validade, pc.status,
                   p.nome AS plano, c.nome AS convenio
            FROM paciente_convenio pc JOIN plano p USING (id_plano) JOIN convenio c USING (id_convenio)
            WHERE pc.id_paciente = %s ORDER BY c.nome, p.nome, pc.numero_carteirinha
        """, (id_paciente,)).fetchall()


@router.post("/pacientes/{id_paciente}/carteirinhas", status_code=201, dependencies=admin)
def cadastrar_carteirinha(id_paciente: UUID, dados: Carteirinha):
    with connect() as conn:
        exigir_registro(conn.execute("SELECT 1 FROM paciente WHERE id_paciente = %s FOR UPDATE",
                                    (id_paciente,)).fetchone(), "Paciente não encontrado")
        if conn.execute("""
            SELECT 1 FROM paciente_convenio WHERE id_paciente = %s AND id_plano = %s AND numero_carteirinha = %s
        """, (id_paciente, dados.id_plano, dados.numero_carteirinha)).fetchone():
            raise HTTPException(409, "Carteirinha já vinculada a este paciente e plano")
        registro = conn.execute("""
            INSERT INTO paciente_convenio (id_paciente, id_plano, numero_carteirinha, validade)
            SELECT %s, p.id_plano, %s, %s FROM plano p JOIN convenio c USING (id_convenio)
            WHERE p.id_plano = %s AND p.status = 'ativo' AND c.status = 'ativo'
            RETURNING id_paciente_convenio
        """, (id_paciente, dados.numero_carteirinha, dados.validade, dados.id_plano)).fetchone()
        if not registro:
            raise HTTPException(422, "Selecione um plano ativo")
        return registro


@router.patch("/pacientes/{id_paciente}/carteirinhas/{id_vinculo}/status", dependencies=admin)
def status_carteirinha(id_paciente: UUID, id_vinculo: UUID, dados: Ativacao):
    with connect() as conn:
        return exigir_registro(conn.execute("""
            UPDATE paciente_convenio SET status = %s
            WHERE id_paciente = %s AND id_paciente_convenio = %s RETURNING id_paciente_convenio
        """, (dados.status, id_paciente, id_vinculo)).fetchone(), "Carteirinha não encontrada")


def verificar_cobertura(conn, id_paciente, id_vinculo, id_procedimento, data):
    return conn.execute("""
        SELECT EXISTS (
            SELECT 1 FROM paciente_convenio pc JOIN plano p USING (id_plano)
            JOIN convenio c USING (id_convenio) JOIN plano_procedimento pp USING (id_plano)
            JOIN procedimento pr USING (id_procedimento)
            WHERE pc.id_paciente = %s AND pc.id_paciente_convenio = %s AND pr.id_procedimento = %s
              AND pc.status = 'ativo' AND p.status = 'ativo' AND c.status = 'ativo' AND pr.status = 'ativo'
              AND (pc.validade IS NULL OR pc.validade >= coalesce(%s, (now() AT TIME ZONE 'America/Fortaleza')::date))
        ) AS coberto
    """, (id_paciente, id_vinculo, id_procedimento, data)).fetchone()["coberto"]


@router.get("/pacientes/{id_paciente}/carteirinhas/{id_vinculo}/cobertura", dependencies=admin)
def cobertura_carteirinha(id_paciente: UUID, id_vinculo: UUID, id_procedimento: UUID, data: date | None = None):
    with connect() as conn:
        return {"coberto": verificar_cobertura(conn, id_paciente, id_vinculo, id_procedimento, data)}


@router.get("/horarios")
def horarios(data: date, id_medico: UUID | None = None, user=Depends(current_user)):
    with connect() as conn:
        return conn.execute("""
            SELECT d.id_disponibilidade, d.horario, d.status, u.name AS medico
            FROM disponibilidade_agenda d JOIN medico m USING (id_medico) JOIN usuario u USING (id_usuario)
            WHERE d.data = %(data)s AND (%(medico)s::uuid IS NULL OR m.id_medico = %(medico)s)
              AND (%(usuario)s::uuid IS NULL OR m.id_usuario = %(usuario)s)
            ORDER BY d.horario, u.name
        """, {"data": data, "medico": id_medico,
              "usuario": user["id_usuario"] if user["perfil"] == "medico" else None}).fetchall()


@router.patch("/horarios/{id_horario}")
def bloquear_horario(id_horario: UUID, dados: Bloqueio, user=Depends(current_user)):
    with connect() as conn:
        registro = conn.execute("""
            UPDATE disponibilidade_agenda d SET status = %(novo)s
            FROM medico m WHERE d.id_medico = m.id_medico AND d.id_disponibilidade = %(id)s
              AND (%(usuario)s::uuid IS NULL OR m.id_usuario = %(usuario)s)
              AND d.status = %(anterior)s
              AND d.data + d.horario >= now() AT TIME ZONE 'America/Fortaleza'
              AND NOT EXISTS (SELECT 1 FROM agendamento a WHERE a.id_medico = d.id_medico
                  AND a.data = d.data AND a.horario = d.horario AND a.status <> 'cancelado')
            RETURNING d.id_disponibilidade
        """, {"novo": "bloqueado" if dados.bloqueado else "disponivel",
              "anterior": "disponivel" if dados.bloqueado else "bloqueado", "id": id_horario,
              "usuario": user["id_usuario"] if user["perfil"] == "medico" else None}).fetchone()
        if not registro:
            raise HTTPException(409, "Horário indisponível para alteração")
        return registro


@router.get("/procedimentos")
def procedimentos():
    with connect() as conn:
        return conn.execute("""
            SELECT id_procedimento, nome, descricao, valor, status FROM procedimento ORDER BY nome
        """).fetchall()


@router.post("/procedimentos", status_code=201, dependencies=admin)
def cadastrar_procedimento(dados: Procedimento):
    with connect() as conn:
        return conn.execute("""
            INSERT INTO procedimento (nome, descricao, valor) VALUES (%s, %s, %s) RETURNING id_procedimento
        """, (dados.nome, dados.descricao, dados.valor)).fetchone()


@router.put("/procedimentos/{id_procedimento}", dependencies=admin)
def atualizar_procedimento(id_procedimento: UUID, dados: Procedimento):
    with connect() as conn:
        return exigir_registro(conn.execute("""
            UPDATE procedimento SET nome = %s, descricao = %s, valor = %s
            WHERE id_procedimento = %s RETURNING id_procedimento
        """, (dados.nome, dados.descricao, dados.valor, id_procedimento)).fetchone(), "Procedimento não encontrado")


@router.patch("/procedimentos/{id_procedimento}/status", dependencies=admin)
def status_procedimento(id_procedimento: UUID, dados: Ativacao):
    with connect() as conn:
        return exigir_registro(conn.execute("""
            UPDATE procedimento SET status = %s WHERE id_procedimento = %s RETURNING id_procedimento
        """, (dados.status, id_procedimento)).fetchone(), "Procedimento não encontrado")


@router.post("/consultas/{id_consulta}/procedimentos", status_code=201)
def adicionar_procedimento(id_consulta: UUID, dados: ItemConsulta, user=Depends(current_user)):
    with connect() as conn:
        consulta = obter_consulta_faturavel(conn, id_consulta, user)
        if consulta["status"] not in ("em_atendimento", "realizada"):
            raise HTTPException(409, "A consulta precisa estar em andamento ou concluída")
        procedimento = conn.execute("""
            SELECT valor FROM procedimento WHERE id_procedimento = %s AND status = 'ativo' FOR SHARE
        """, (dados.id_procedimento,)).fetchone()
        if not procedimento:
            raise HTTPException(422, "Selecione um procedimento ativo")
        if consulta["id_paciente_convenio"] and not verificar_cobertura(
            conn, consulta["id_paciente"], consulta["id_paciente_convenio"], dados.id_procedimento, consulta["data"]
        ):
            raise HTTPException(422, "O convênio do paciente não cobre este procedimento")
        return conn.execute("""
            INSERT INTO consulta_procedimento (id_consulta, id_procedimento, data, horario, valor, quantidade)
            VALUES (%s, %s, %s, (now() AT TIME ZONE 'America/Fortaleza')::time, %s, %s)
            RETURNING id_consulta_procedimento
        """, (id_consulta, dados.id_procedimento, consulta["data"], procedimento["valor"], dados.quantidade)).fetchone()
