# Front-end do PEP

Aplicação React com TypeScript e Vite. Preserva as telas e a identidade visual do protótipo.

## Executar

Requer Node.js e npm. Na pasta `frontend`:

```powershell
npm install
npm run dev
```

Abra o endereço informado pelo Vite (normalmente http://localhost:5173).

```powershell
npm run build
npm run preview
```

O build verifica os tipos e gera `dist/`. Ao hospedar, configure o servidor para responder com `index.html` nas rotas da aplicação.

## Organização

- `src/pages`: login, painéis, agenda, pacientes, médicos, especialidades, convênios, prontuário, histórico e faturamento.
- `src/layouts/AppLayout.tsx`: navegação e cabeçalho compartilhados.
- `src/components/Demo.tsx`: formulários demonstrativos e busca local das tabelas.
- `src/routes/App.tsx`: rotas da aplicação.
- `src/styles/styles.css`: estilos e responsividade.
- `src/services/api.ts`: cliente para futuros endpoints. Em desenvolvimento, Vite encaminha `/api` para `http://localhost:8000`.
- `index.html`: ponto de entrada usado pelo Vite para carregar a aplicação React.

## Demonstração

Use e-mail fictício e senha com pelo menos seis caracteres, selecionando o perfil administrativo ou médico. O login apenas navega e não autentica. A busca de pacientes funciona localmente. Formulários e fechamento mostram feedback, sem salvar dados. Filtros de data e convênio permanecem demonstrativos; anexos não são enviados.

O backend ainda precisa dos endpoints de cadastros, autenticação, consultas e prontuários. Os dados exibidos são fictícios. Para produção, configure também o encaminhamento de `/api` ao backend.

