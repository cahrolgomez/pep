# PEP — Banco de Dados II

Base local de desenvolvimento: FastAPI, PostgreSQL 16, MongoDB 7 e Redis 7.

## Iniciar

Instale e abra o Docker Desktop com suporte a containers Linux. Na pasta do projeto, execute no PowerShell:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

O arquivo `.env` contém credenciais locais de exemplo e não é versionado. Altere-as antes do primeiro uso se necessário. Esta configuração é para desenvolvimento com dados fictícios; não representa uma implantação de produção.

- API: http://localhost:8000
- Documentação interativa: http://localhost:8000/docs
- Processo ativo: http://localhost:8000/health
- Conexões aos bancos: http://localhost:8000/health/ready

Os serviços reiniciam automaticamente após falhas ou reinicialização do Docker, salvo quando parados manualmente. A API aguarda as verificações de saúde dos bancos na inicialização.

Somente a API publica uma porta, restrita ao próprio computador. Os bancos são acessíveis pelos serviços dentro da rede do Compose. O código em `backend/app` é atualizado automaticamente durante o desenvolvimento.

## Comandos úteis

```powershell
docker compose logs -f api
docker compose exec postgres psql -U pep -d pep
docker compose stop
docker compose down
```

Se alterar usuário ou nome do PostgreSQL no `.env`, ajuste os argumentos do comando `psql`.

`stop` e `down` preservam os volumes de PostgreSQL e MongoDB. Não use `down -v` se quiser manter os dados: essa opção exclui os volumes. Redis é apenas cache e não persiste dados.

As credenciais de inicialização do PostgreSQL e MongoDB são aplicadas ao criar os volumes pela primeira vez. Alterar somente o `.env` depois disso não altera a senha já armazenada nos bancos.

## Organização e próximos passos

```text
compose.yaml          Serviços, rede, volumes e verificações de saúde
.env.example          Modelo de configuração local
backend/
  Dockerfile          Imagem da API
  requirements.txt    Dependências Python
  app/
    main.py           Aplicação e rotas de saúde
```

A base contém usuários, médicos, especialidades, vínculos e sessões. Cadastro de usuários e autenticação estão implementados na API; as demais telas continuam usando dados ilustrativos.

## SQL, migrações e login

`backend/sql/schema.sql` define um banco novo; `migrations/` guarda alterações e `seed.sql` contém exemplos opcionais. Não reaplique o schema em um banco existente. Após iniciar os serviços:

```powershell
docker compose exec api python -m app.manage migrate
docker compose exec api python -m app.manage create-admin
```

A migração é transacional, registra a versão e pode ser executada novamente. Preserva cadastros e converte senhas antigas para PBKDF2 com salt, mantendo a senha usada para entrar. Contas com senha vazia ficam sem senha utilizável. Perfis aceitos: `administrador`, `atendente`, `medico`; status: `ativo`, `inativo`. Dados incompatíveis ou e-mails duplicados sem distinguir maiúsculas interrompem e revertem a migração para correção manual.

O comando `create-admin` solicita nome, e-mail e senha sem exibir a senha. Use-o para criar seu primeiro administrador.

Exemplos opcionais (não alteram contas existentes):

```powershell
docker compose exec api python -m app.manage seed
```

Novos exemplos recebem a senha `PepDemo123!`. João, Laura e Rafael são vinculados por e-mail aos registros de médico, sem IDs fixos. O seed não é aplicado automaticamente.

Endpoints disponíveis em http://localhost:8000/docs:

- `POST /auth/login`: recebe `email` e `senha`; retorna `access_token` e usuário sem senha.
- `GET /auth/me`: consulta a conta autenticada.
- `POST /usuarios`: somente administradores; recebe `name`, `email`, `senha` (8 a 128 caracteres), `perfil` e, para médicos, `crm` e `telefone` opcional. Salva usuário e médico na mesma transação, com status ativo.
- `POST /auth/logout`: revoga a sessão atual.

Nas rotas autenticadas envie o cabeçalho `Authorization: Bearer TOKEN`. Sessões duram oito horas; apenas o hash do token é armazenado no banco. O frontend usa o login real e o perfil retornado pela API. As demais telas ainda são demonstrações; futuras rotas de negócio precisam validar sessão e permissões na API. A configuração permanece voltada ao desenvolvimento local.

Verificação de integração (remove contas temporárias ao terminar):

```powershell
docker compose exec api python -m app.check_auth
```


## Comandos do bd

Entrar no banco postgree

```text 
docker compose exec postgres psql -U pep -d pep
```

Listar tabelas

```text 
\dt
```

Acessar tabela

```text 
\d nome da tabela
```

Sair do banco 

```text 
\q
```
