"""Administração local: migrate, seed e create-admin."""
import argparse
import getpass
import secrets
from psycopg import ClientCursor
from pathlib import Path

from .database import connect
from .security import hash_password

SQL = Path('/app/sql')
if not SQL.exists():
    SQL = Path(__file__).resolve().parents[1] / 'sql'


def migrate():
    with connect() as conn:
        conn.execute('SELECT pg_advisory_xact_lock(417203)')
        conn.execute('CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, aplicada_em TIMESTAMPTZ DEFAULT now())')
        if conn.execute("SELECT 1 FROM schema_migrations WHERE version='001_auth'").fetchone():
            print('Banco já atualizado.')
            return
        exists = conn.execute("SELECT to_regclass('public.usuario') AS tabela").fetchone()['tabela']
        if not exists:
            conn.execute((SQL / 'schema.sql').read_text(encoding='utf-8-sig'))
        else:
            conn.execute('LOCK TABLE usuario IN ACCESS EXCLUSIVE MODE')
            conn.execute('ALTER TABLE usuario ADD COLUMN IF NOT EXISTS senha VARCHAR(255)')
            users = conn.execute('SELECT id_usuario, senha FROM usuario').fetchall()
            for user in users:
                password = user['senha'] or secrets.token_urlsafe(48)
                if not password.startswith('pbkdf2_sha256$600000$'):
                    conn.execute('UPDATE usuario SET senha=%s WHERE id_usuario=%s',
                                 (hash_password(password), user['id_usuario']))
            conn.execute('ALTER TABLE usuario ALTER COLUMN senha SET NOT NULL')
            conn.execute((SQL / 'migrations/001_auth.sql').read_text(encoding='utf-8-sig'))
        conn.execute("INSERT INTO schema_migrations(version) VALUES ('001_auth')")
    print('Migração concluída; cadastros preservados. Senhas vazias foram inutilizadas.')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=['migrate', 'seed', 'create-admin'])
    args = parser.parse_args()
    if args.command == 'migrate':
        migrate()
    elif args.command == 'seed':
        with connect() as conn:
            with ClientCursor(conn) as cursor:
                cursor.execute((SQL / 'seed.sql').read_text(encoding='utf-8-sig'),
                               {'senha': hash_password('PepDemo123!')})
        print('Dados fictícios criados; senha dos novos exemplos: PepDemo123!')
    else:
        name = input('Nome: ').strip()
        email = input('E-mail: ').strip().lower()
        password = getpass.getpass('Senha (mínimo 8 caracteres): ')
        if not name or email.count('@') != 1 or not all(email.split('@')) or len(password) < 8:
            raise SystemExit('Nome, e-mail ou senha inválidos.')
        with connect() as conn:
            conn.execute("INSERT INTO usuario(name,email,perfil,status,senha) VALUES (%s,%s,'administrador','ativo',%s)",
                         (name,email,hash_password(password)))
        print('Administrador criado.')


if __name__ == '__main__':
    main()
