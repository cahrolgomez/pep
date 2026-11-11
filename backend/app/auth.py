import hashlib
import secrets
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Response
from pydantic import BaseModel, Field, field_validator
from psycopg.errors import ForeignKeyViolation, UniqueViolation

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
    id_especialidade: UUID | int | None = None


class AlteracaoSenha(BaseModel):
    senha_atual: str = Field(min_length=1, max_length=128)
    nova_senha: str = Field(min_length=8, max_length=128)


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


def administrador(user=Depends(current_user)):
    if user['perfil'] != 'administrador':
        raise HTTPException(403, 'Acesso restrito a administradores')
    return user


@router.post('/auth/login')
def login(data: Login):
    with connect() as conn:
        user = conn.execute('SELECT * FROM usuario WHERE lower(email) = %s FOR SHARE', (data.email,)).fetchone()
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


@router.patch('/auth/senha', status_code=204)
def alterar_senha(data: AlteracaoSenha, authorization: str = Header(default=''), user=Depends(current_user)):
    token_hash = hashlib.sha256(authorization.partition(' ')[2].encode()).hexdigest()
    with connect() as conn:
        conta = conn.execute('SELECT senha, status FROM usuario WHERE id_usuario = %s FOR UPDATE',
                             (user['id_usuario'],)).fetchone()
        if conta['status'] != 'ativo' or not verify_password(data.senha_atual, conta['senha']):
            raise HTTPException(422, 'Senha atual incorreta')
        conn.execute('UPDATE usuario SET senha = %s WHERE id_usuario = %s',
                     (hash_password(data.nova_senha), user['id_usuario']))
        conn.execute('DELETE FROM sessao WHERE id_usuario = %s AND token_hash <> %s',
                     (user['id_usuario'], token_hash))


@router.get('/usuarios')
def listar_usuarios(actor=Depends(administrador)):
    with connect() as conn:
        return conn.execute('SELECT id_usuario, name, email, perfil, status, telefone FROM usuario ORDER BY name, email').fetchall()


@router.patch('/usuarios/{id_usuario}/desativacao', status_code=204)
def desativar_usuario(id_usuario: UUID, actor=Depends(administrador)):
    if id_usuario == actor['id_usuario']:
        raise HTTPException(409, 'Peça a outro administrador para desativar sua conta')
    with connect() as conn:
        conn.execute('SELECT pg_advisory_xact_lock(417204)')
        if not conn.execute("SELECT 1 FROM usuario WHERE id_usuario = %s AND status = 'ativo'",
                            (actor['id_usuario'],)).fetchone():
            raise HTTPException(403, 'Conta administrativa inativa')
        if not conn.execute("UPDATE usuario SET status = 'inativo' WHERE id_usuario = %s RETURNING id_usuario",
                            (id_usuario,)).fetchone():
            raise HTTPException(404, 'Usuário não encontrado')
        conn.execute('DELETE FROM sessao WHERE id_usuario = %s', (id_usuario,))


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
            LEFT JOIN especialidades e ON e.id_especialidade = me.id_especialidade AND e.status = 'ativo'
            GROUP BY m.id_medico, u.name, u.status
            ORDER BY u.name, m.crm
        """).fetchall()


@router.post('/usuarios', status_code=201)
def register(data: Cadastro, actor=Depends(administrador)):
    if not data.name.strip() or (data.perfil == 'medico' and not (data.crm or '').strip()):
        raise HTTPException(422, 'Informe o nome e, para médicos, o CRM')
    if data.perfil == 'medico' and not data.cpf:
        raise HTTPException(422, 'Informe o CPF do médico')
    if data.perfil != 'medico' and (data.crm or data.cpf or data.id_especialidade):
        raise HTTPException(422, 'CPF, CRM e especialidade são exclusivos do cadastro de médico')
    try:
        with connect() as conn:
            user = conn.execute('''INSERT INTO usuario (name,email,perfil,status,senha,telefone)
                VALUES (%s,%s,%s,'ativo',%s,%s) RETURNING id_usuario,name,email,perfil,status''',
                (data.name.strip(), data.email, data.perfil, hash_password(data.senha), data.telefone)).fetchone()
            if data.perfil == 'medico':
                medico = conn.execute('''INSERT INTO medico (id_usuario,crm,telefone,cpf)
                    VALUES (%s,%s,%s,%s) RETURNING id_medico''',
                    (user['id_usuario'], data.crm.strip(), data.telefone, data.cpf)).fetchone()
                if data.id_especialidade is not None:
                    especialidade = data.id_especialidade
                    vinculo = conn.execute("""INSERT INTO medico_especialidade (id_medico, id_especialidade)
                        SELECT %s, id_especialidade FROM especialidades
                        WHERE status = 'ativo' AND (id_especialidade = %s OR id_legado = %s)
                        RETURNING id_especialidade""", (medico['id_medico'],
                        especialidade if isinstance(especialidade, UUID) else None,
                        especialidade if isinstance(especialidade, int) else None)).fetchone()
                    if not vinculo:
                        raise HTTPException(422, 'Selecione uma especialidade ativa')
            return user
    except UniqueViolation:
        raise HTTPException(409, 'E-mail, CRM ou CPF já cadastrado')
    except ForeignKeyViolation:
        raise HTTPException(422, 'Especialidade não encontrada')
