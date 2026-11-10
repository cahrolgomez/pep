import hashlib
import secrets
from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Response
from pydantic import BaseModel, Field, field_validator
from psycopg.errors import UniqueViolation

from .database import connect
from .security import hash_password, verify_password

router = APIRouter(tags=['Usuários e autenticação'])


class Login(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    senha: str = Field(min_length=1, max_length=128)

    @field_validator('email')
    @classmethod
    def email_valid(cls, value):
        value = value.strip().lower()
        if value.count('@') != 1 or not all(value.split('@')) or any(c.isspace() for c in value):
            raise ValueError('E-mail inválido')
        return value


class Cadastro(Login):
    name: str = Field(min_length=1, max_length=150)
    senha: str = Field(min_length=8, max_length=128)
    perfil: Literal['administrador', 'atendente', 'medico']
    cpf: str | None = Field(default=None, pattern=r"^[0-9]{11}$")
    crm: str | None = Field(default=None, min_length=1, max_length=30)
    telefone: str | None = Field(default=None, max_length=20)


def current_user(authorization: str = Header(default='')):
    kind, _, token = authorization.partition(' ')
    if kind.lower() != 'bearer' or not token:
        raise HTTPException(401, 'Autenticação necessária')
    with connect() as conn:
        user = conn.execute('''SELECT u.id_usuario, u.name, u.email, u.perfil, u.status
            FROM usuario u JOIN sessao s USING (id_usuario)
            WHERE s.token_hash = %s AND s.expira_em > now() AND u.status = 'ativo' ''',
            (hashlib.sha256(token.encode()).hexdigest(),)).fetchone()
    if not user:
        raise HTTPException(401, 'Sessão inválida ou expirada')
    return user


@router.post('/auth/login')
def login(data: Login):
    with connect() as conn:
        user = conn.execute('SELECT * FROM usuario WHERE lower(email) = %s', (data.email,)).fetchone()
        if not user or not verify_password(data.senha, user['senha']) or user['status'] != 'ativo':
            raise HTTPException(401, 'E-mail ou senha inválidos')
        token = secrets.token_urlsafe(32)
        conn.execute('INSERT INTO sessao (token_hash, id_usuario) VALUES (%s, %s)',
                     (hashlib.sha256(token.encode()).hexdigest(), user['id_usuario']))
        del user['senha']
        return {'access_token': token, 'token_type': 'bearer', 'expires_in': 28800, 'usuario': user}


@router.get('/auth/me')
def me(user=Depends(current_user)):
    return user


@router.post('/auth/logout', status_code=204)
def logout(authorization: str = Header(default=''), user=Depends(current_user)):
    token = authorization.partition(' ')[2]
    with connect() as conn:
        conn.execute('DELETE FROM sessao WHERE token_hash = %s', (hashlib.sha256(token.encode()).hexdigest(),))
    return Response(status_code=204)


@router.get('/medicos')
def listar_medicos(user=Depends(current_user)):
    with connect() as conn:
        return conn.execute("""
            SELECT m.id_medico, u.name AS nome, m.crm, u.status,
                   string_agg(e.nome_especialidade, ', ' ORDER BY e.nome_especialidade)
                       AS especialidades
            FROM medico m
            JOIN usuario u USING (id_usuario)
            LEFT JOIN medico_especialidade me USING (id_medico)
            LEFT JOIN especialidades e USING (id_especialidade)
            GROUP BY m.id_medico, u.name, u.status
            ORDER BY u.name, m.crm
        """).fetchall()


@router.post('/usuarios', status_code=201)
def register(data: Cadastro, actor=Depends(current_user)):
    if actor['perfil'] != 'administrador':
        raise HTTPException(403, 'Somente administradores podem cadastrar usuários')
    if not data.name.strip() or (data.perfil == 'medico' and not (data.crm or '').strip()):
        raise HTTPException(422, 'Informe o nome e, para médicos, o CRM')
    if data.perfil == 'medico' and not data.cpf:
        raise HTTPException(422, 'Informe o CPF do médico')
    if data.perfil != 'medico' and (data.crm or data.telefone or data.cpf):
        raise HTTPException(422, 'CPF, CRM e telefone são exclusivos do cadastro de médico')
    try:
        with connect() as conn:
            user = conn.execute('''INSERT INTO usuario (name,email,perfil,status,senha)
                VALUES (%s,%s,%s,'ativo',%s) RETURNING id_usuario,name,email,perfil,status''',
                (data.name.strip(), data.email, data.perfil, hash_password(data.senha))).fetchone()
            if data.perfil == 'medico':
                conn.execute('INSERT INTO medico (id_usuario,crm,telefone,cpf) VALUES (%s,%s,%s,%s)',
                             (user['id_usuario'], data.crm.strip(), data.telefone, data.cpf))
            return user
    except UniqueViolation:
        raise HTTPException(409, 'E-mail, CRM ou CPF já cadastrado')
