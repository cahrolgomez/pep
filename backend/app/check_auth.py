"""Verificação de integração local; remove os usuários de teste ao terminar."""
import json
import secrets
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from psycopg import ClientCursor
from .database import connect
from .security import hash_password, verify_password
from .manage import SQL


def run():
    password = 'TesteSeguro123!'
    hashed = hash_password(password)
    assert verify_password(password, hashed)
    assert not verify_password('incorreta', hashed)
    # Schema e seed em espaço isolado, sempre revertidos.
    with connect() as conn:
        conn.execute('CREATE SCHEMA check_auth_temp')
        conn.execute('SET LOCAL search_path TO check_auth_temp')
        conn.execute((SQL / 'schema.sql').read_text(encoding='utf-8-sig'))
        with ClientCursor(conn) as cursor:
            for _ in range(2):
                cursor.execute((SQL / 'seed.sql').read_text(encoding='utf-8-sig'), {'senha': hashed})
        assert conn.execute('SELECT count(*) AS n FROM usuario').fetchone()['n'] == 4
        assert conn.execute('SELECT count(*) AS n FROM medico').fetchone()['n'] == 3
        conn.rollback()

    email = f'check-{secrets.token_hex(8)}@example.invalid'
    doctor_email = 'doctor-' + email
    def request(path, data=None, token=None, expected=200):
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = 'Bearer ' + token
        req = Request('http://localhost:8000' + path, headers=headers,
                      data=json.dumps(data).encode() if data is not None else None)
        try:
            with urlopen(req) as response:
                assert response.status == expected, response.status
                body = response.read()
                return json.loads(body) if body else None
        except HTTPError as exc:
            assert exc.code == expected, (exc.code, exc.read())
    try:
        with connect() as conn:
            conn.execute("INSERT INTO usuario(name,email,perfil,status,senha) VALUES ('Teste',%s,'administrador','ativo',%s)", (email,hashed))
        request('/auth/login', {'email':email,'senha':'errada'}, expected=401)
        result = request('/auth/login', {'email':email,'senha':password})
        token = result['access_token']
        assert 'senha' not in result['usuario']
        assert request('/auth/me', token=token)['email'] == email
        cadastro = {'name':'Teste Médico','email':doctor_email,'senha':password,'perfil':'medico','crm':secrets.token_hex(10)}
        request('/usuarios',cadastro,expected=401)
        user = request('/usuarios',cadastro,token,201)
        request('/usuarios',cadastro,token,409)
        with connect() as conn:
            assert conn.execute('SELECT 1 FROM medico WHERE id_usuario=%s',(user['id_usuario'],)).fetchone()
        doctor = request('/auth/login',{'email':doctor_email,'senha':password})['access_token']
        request('/usuarios',cadastro,doctor,403)
        request('/auth/logout',{},token,204)
        request('/auth/me',token=token,expected=401)
        with connect() as conn:
            conn.execute("UPDATE usuario SET status='inativo' WHERE email=%s",(doctor_email,))
        request('/auth/me',token=doctor,expected=401)
    finally:
        with connect() as conn:
            conn.execute('DELETE FROM medico WHERE id_usuario IN (SELECT id_usuario FROM usuario WHERE email IN (%s,%s))',(email,doctor_email))
            conn.execute('DELETE FROM usuario WHERE email IN (%s,%s)',(email,doctor_email))
    print('OK: schema, seed repetido, hash, login, cadastro, permissões, inativação e logout.')


if __name__ == '__main__':
    run()
