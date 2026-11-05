-- Dados fictícios opcionais. Executar com python -m app.manage seed.
-- Não substitui senhas nem dados de usuários já existentes.
INSERT INTO usuario (name,email,perfil,status,senha) VALUES
('Maria Silva','mariasilva@pep.com','atendente','ativo',%(senha)s),
('João Silva','joaosilva@pep.com','medico','ativo',%(senha)s),
('Laura Costa','lauracosta@pep.com','medico','ativo',%(senha)s),
('Rafael Lima','rafaellima@pep.com','medico','ativo',%(senha)s)
ON CONFLICT DO NOTHING;

INSERT INTO medico (id_usuario,crm,telefone)
SELECT u.id_usuario, d.crm, d.telefone FROM usuario u
JOIN (VALUES
('joaosilva@pep.com','123456-AL','82999999999'),
('lauracosta@pep.com','234567-AL','82988888888'),
('rafaellima@pep.com','345678-AL','82977777777')
) AS d(email,crm,telefone) ON lower(u.email)=d.email
WHERE u.perfil='medico'
ON CONFLICT DO NOTHING;
