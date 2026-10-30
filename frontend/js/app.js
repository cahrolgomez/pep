/* Interações locais de demonstração. Sem persistência ou acesso à API. */
const login = document.querySelector('#login-form');
login?.addEventListener('submit', (event) => {
  event.preventDefault();
  window.location.href = `pages/${login.elements.perfil.value}.html`;
});

document.querySelectorAll('form[data-demo]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.querySelector('.feedback').textContent = 'Simulação concluída. Nenhum dado foi salvo ou enviado à API.';
  });
});

document.querySelector('[data-search]')?.addEventListener('input', (event) => {
  const term = event.target.value.toLocaleLowerCase('pt-BR');
  document.querySelectorAll('tbody tr').forEach((row) => {
    row.hidden = !row.textContent.toLocaleLowerCase('pt-BR').includes(term);
  });
});

document.querySelectorAll('[data-filter]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.querySelector('.feedback').textContent = 'Dados ilustrativos exibidos. A consulta por filtros depende da integração com a API.';
  });
});

document.querySelector('[data-close]')?.addEventListener('click', () => {
  document.querySelector('#closing-feedback').textContent = 'Simulação de fechamento concluída. Nenhuma cobrança foi gerada.';
});
