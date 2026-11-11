-- Dados fictícios opcionais. Executar com python -m app.manage seed.
-- Não substitui senhas nem dados de usuários já existentes.
INSERT INTO usuario (name,email,perfil,status,senha) VALUES
('Maria Silva','mariasilva@pep.com','atendente','ativo',%(senha)s),
('João Silva','joaosilva@pep.com','medico','ativo',%(senha)s),
('Laura Costa','lauracosta@pep.com','medico','ativo',%(senha)s),
('Rafael Lima','rafaellima@pep.com','medico','ativo',%(senha)s)
ON CONFLICT DO NOTHING;

INSERT INTO medico (id_usuario,crm,telefone,cpf)
SELECT u.id_usuario, d.crm, d.telefone, d.cpf FROM usuario u
JOIN (VALUES
('joaosilva@pep.com','123456-AL','82999999999','00000000100'),
('lauracosta@pep.com','234567-AL','82988888888','00000000200'),
('rafaellima@pep.com','345678-AL','82977777777','00000000300')
) AS d(email,crm,telefone,cpf) ON lower(u.email)=d.email
WHERE u.perfil='medico'
ON CONFLICT DO NOTHING;

INSERT INTO especialidades (nome_especialidade) VALUES
('Clínica Médica'), ('Cardiologia'), ('Dermatologia')
ON CONFLICT DO NOTHING;

INSERT INTO medico_especialidade (id_medico, id_especialidade)
SELECT m.id_medico, e.id_especialidade
FROM (VALUES
    ('123456-AL', 'Clínica Médica'),
    ('234567-AL', 'Cardiologia'),
    ('345678-AL', 'Dermatologia')
) AS exemplo(crm, especialidade)
JOIN medico m ON m.crm = exemplo.crm
JOIN especialidades e ON e.nome_especialidade = exemplo.especialidade
ON CONFLICT DO NOTHING;

-- Documentos de teste usam dígitos verificadores inválidos de propósito.
INSERT INTO paciente (nome, cpf, data_nascimento, telefone, email) VALUES
('Beatriz Nunes Cavalcanti', '00000001100', '1987-04-19', '82900000011', 'beatriz.cavalcanti@example.com'),
('Marcos Vinícius Ferreira', '00000001200', '1975-09-03', '82900000012', 'marcos.ferreira@example.com'),
('Luana Ribeiro Matos', '00000001300', '1996-02-27', '82900000013', 'luana.matos@example.com'),
('André Lucas Barbosa', '00000001400', '1982-12-11', '82900000014', 'andre.barbosa@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO convenio (nome, cnpj, telefone, status) VALUES
('Saúde Lagoa', '00000001000100', '8230000011', 'ativo'),
('Rede Farol Saúde', '00000002000100', '8230000012', 'ativo')
ON CONFLICT DO NOTHING;

-- IDs fixos identificam exemplos nas tabelas sem chave natural única.
INSERT INTO plano (id_plano, id_convenio, nome, cobertura, status)
SELECT exemplo.id_plano::uuid, c.id_convenio, exemplo.nome, exemplo.cobertura, 'ativo'
FROM (VALUES
    ('2d45982b-75e1-43c8-b709-000000000001', '00000001000100', 'Lagoa Essencial', 'Consultas ambulatoriais e exames simples'),
    ('2d45982b-75e1-43c8-b709-000000000002', '00000002000100', 'Farol Integral', 'Consultas especializadas e exames cardiológicos')
) AS exemplo(id_plano, cnpj, nome, cobertura)
JOIN convenio c ON c.cnpj = exemplo.cnpj
ON CONFLICT DO NOTHING;

INSERT INTO paciente_convenio (id_paciente_convenio, id_paciente, id_plano, numero_carteirinha, validade, status)
SELECT exemplo.id::uuid, p.id_paciente, plano.id_plano, exemplo.carteirinha, exemplo.validade::date, 'ativo'
FROM (VALUES
    ('2d45982b-75e1-43c8-b709-000000000011', '00000001200', '2d45982b-75e1-43c8-b709-000000000002', 'FRL-804216-01', '2027-09-30'),
    ('2d45982b-75e1-43c8-b709-000000000012', '00000001400', '2d45982b-75e1-43c8-b709-000000000001', 'LAG-271608-01', '2027-06-30')
) AS exemplo(id, cpf, id_plano, carteirinha, validade)
JOIN paciente p ON p.cpf = exemplo.cpf
JOIN plano ON plano.id_plano = exemplo.id_plano::uuid
ON CONFLICT DO NOTHING;

INSERT INTO agendamento (id_agendamento, id_medico, id_paciente, data, horario, status, motivo_cancelamento, id_paciente_convenio)
SELECT exemplo.id::uuid, m.id_medico, p.id_paciente, exemplo.data::date, exemplo.horario::time,
       exemplo.status, exemplo.motivo, pc.id_paciente_convenio
FROM (VALUES
    ('2d45982b-75e1-43c8-b709-000000000021', '123456-AL', '00000001100', '2026-11-09', '08:30', 'realizado', NULL, NULL),
    ('2d45982b-75e1-43c8-b709-000000000022', '234567-AL', '00000001200', '2026-11-10', '10:00', 'realizado', NULL, '2d45982b-75e1-43c8-b709-000000000011'),
    ('2d45982b-75e1-43c8-b709-000000000023', '345678-AL', '00000001300', '2026-11-10', '14:00', 'cancelado', 'Paciente solicitou remarcação.', NULL),
    ('2d45982b-75e1-43c8-b709-000000000024', '123456-AL', '00000001400', '2026-11-16', '09:00', 'confirmado', NULL, '2d45982b-75e1-43c8-b709-000000000012')
) AS exemplo(id, crm, cpf, data, horario, status, motivo, id_convenio)
JOIN medico m ON m.crm = exemplo.crm
JOIN paciente p ON p.cpf = exemplo.cpf
LEFT JOIN paciente_convenio pc ON pc.id_paciente_convenio = exemplo.id_convenio::uuid AND pc.id_paciente = p.id_paciente
WHERE exemplo.id_convenio IS NULL OR pc.id_paciente_convenio IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO disponibilidade_agenda (id_medico, data, horario, status)
SELECT id_medico, data, horario,
       CASE WHEN status = 'cancelado' THEN 'disponivel' ELSE 'ocupado' END
FROM agendamento
WHERE id_agendamento IN (
    '2d45982b-75e1-43c8-b709-000000000021', '2d45982b-75e1-43c8-b709-000000000022',
    '2d45982b-75e1-43c8-b709-000000000023', '2d45982b-75e1-43c8-b709-000000000024'
)
UNION ALL
SELECT id_medico, DATE '2026-11-16', TIME '09:30', 'disponivel'
FROM medico WHERE crm = '123456-AL'
ON CONFLICT DO NOTHING;

INSERT INTO consulta (id_agendamento, data, horario, status, observacao_administrativa)
SELECT a.id_agendamento, a.data, a.horario, 'realizada', exemplo.observacao
FROM (VALUES
    ('2d45982b-75e1-43c8-b709-000000000021', 'Cadastro atualizado na recepção.'),
    ('2d45982b-75e1-43c8-b709-000000000022', 'Elegibilidade do convênio conferida.')
) AS exemplo(id_agendamento, observacao)
JOIN agendamento a ON a.id_agendamento = exemplo.id_agendamento::uuid
ON CONFLICT DO NOTHING;

INSERT INTO procedimento (id_procedimento, nome, descricao, valor, status) VALUES
('2d45982b-75e1-43c8-b709-000000000031', 'Consulta de clínica médica', 'Atendimento ambulatorial com clínico geral.', 180.00, 'ativo'),
('2d45982b-75e1-43c8-b709-000000000032', 'Consulta cardiológica', 'Atendimento ambulatorial com cardiologista.', 220.00, 'ativo'),
('2d45982b-75e1-43c8-b709-000000000033', 'Eletrocardiograma de repouso', 'Registro da atividade elétrica cardíaca em repouso.', 95.00, 'ativo')
ON CONFLICT DO NOTHING;

INSERT INTO consulta_procedimento (id_consulta_procedimento, id_consulta, id_procedimento, data, horario, valor, quantidade)
SELECT exemplo.id::uuid, c.id_consulta, p.id_procedimento, c.data, c.horario + exemplo.espera::interval, p.valor, 1
FROM (VALUES
    ('2d45982b-75e1-43c8-b709-000000000041', '2d45982b-75e1-43c8-b709-000000000021', '2d45982b-75e1-43c8-b709-000000000031', '0 minutes'),
    ('2d45982b-75e1-43c8-b709-000000000042', '2d45982b-75e1-43c8-b709-000000000022', '2d45982b-75e1-43c8-b709-000000000032', '0 minutes'),
    ('2d45982b-75e1-43c8-b709-000000000043', '2d45982b-75e1-43c8-b709-000000000022', '2d45982b-75e1-43c8-b709-000000000033', '20 minutes')
) AS exemplo(id, id_agendamento, id_procedimento, espera)
JOIN consulta c ON c.id_agendamento = exemplo.id_agendamento::uuid
JOIN procedimento p ON p.id_procedimento = exemplo.id_procedimento::uuid
ON CONFLICT DO NOTHING;

INSERT INTO faturamento (id_consulta, valor_total, forma_pagamento, data_pagamento, hora_pagamento, status)
SELECT c.id_consulta, SUM(cp.valor * cp.quantidade), exemplo.forma, exemplo.data::date, exemplo.horario::time, exemplo.status
FROM (VALUES
    ('2d45982b-75e1-43c8-b709-000000000021', 'pix', '2026-11-09', '09:05', 'pago'),
    ('2d45982b-75e1-43c8-b709-000000000022', 'convenio', NULL, NULL, 'pendente')
) AS exemplo(id_agendamento, forma, data, horario, status)
JOIN consulta c ON c.id_agendamento = exemplo.id_agendamento::uuid
JOIN consulta_procedimento cp ON cp.id_consulta = c.id_consulta
GROUP BY c.id_consulta, exemplo.forma, exemplo.data, exemplo.horario, exemplo.status
ON CONFLICT DO NOTHING;
