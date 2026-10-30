# Front-end do PEP

Protótipo em HTML, CSS e JavaScript puro, baseado nos requisitos e no fluxo de navegação da apresentação executiva do MVP.

## Abrir

Abra `index.html` no navegador. Não exige instalação, compilação ou conexão externa. No login demonstrativo, use dados fictícios e selecione o perfil administrativo ou médico.

## Organização

- `index.html`: entrada e seleção de perfil demonstrativo.
- `pages/`: páginas HTML completas e independentes.
- `css/styles.css`: identidade visual, estrutura, componentes, formulários, login e responsividade em seções comentadas.
- `js/app.js`: navegação de login, busca local e feedback das simulações.
- `src/` e `public/`: pastas da organização anterior, reservadas para evolução futura.

## Telas e requisitos

- Painel administrativo e agenda: RF01 a RF03.
- Listagem e cadastro de pacientes: RF04 e RF05.
- Consulta e cadastro de médicos: RF06 e RF07.
- Especialidades e convênios: cadastros previstos no fluxo administrativo.
- Painel médico, prontuário e histórico: RF08 a RF11, com evolução, prescrições, exames, anexos e informações específicas da especialidade.
- Faturamento: RF12 e RF13, com registro, consulta por período e fechamento mensal demonstrativos.

## Identidade visual

Verde profundo para ações e navegação, fundo claro, cartões brancos, tipografia do sistema e espaçamento consistente. Layout responsivo, campos rotulados e tabelas com rolagem em telas pequenas. Sem fontes ou bibliotecas externas.

## Limites do protótipo

Todos os dados são fictícios. Formulários exibem feedback e não persistem dados. Filtros de data e convênio são apenas visuais; a busca de pacientes funciona localmente. O login apenas navega entre telas e não implementa autorização. A seleção de anexos não faz upload. A regularidade do CPF, horários realmente disponíveis, prevenção de duplicidades, autorização de prontuários, faturamento e fechamento transacional precisam ser implementados na API. Este protótipo não demonstra conformidade com a LGPD ou segurança de produção.
