# PEP — Banco de Dados II

Base local de desenvolvimento: FastAPI, PostgreSQL 16, MongoDB 7 e Redis 7.

## Iniciar

Instale e abra o Docker Desktop com suporte a containers Linux. Na pasta do projeto, execute no PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
```

O arquivo `.env` contém credenciais locais de exemplo e não é versionado. Altere-as antes do primeiro uso se necessário. Esta configuração é para desenvolvimento com dados fictícios; não representa uma implantação de produção.

- API: http://localhost:8000
- Documentação interativa: http://localhost:8000/docs
- Processo ativo: http://localhost:8000/health
- Conexões aos bancos: http://localhost:8000/health/ready

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

A base ainda não contém tabelas, cadastros, autenticação ou prontuários. Próxima etapa: definir a modelagem e adicionar migrações do PostgreSQL; depois implementar login, cadastros e agendamento. Separe novas rotas, regras de negócio e acesso aos bancos em módulos conforme forem implementados.
