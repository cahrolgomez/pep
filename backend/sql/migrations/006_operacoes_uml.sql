ALTER TABLE especialidades ADD COLUMN status text NOT NULL DEFAULT 'ativo';
ALTER TABLE especialidades ADD COLUMN novo_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE medico_especialidade ADD COLUMN novo_id uuid;
UPDATE medico_especialidade me SET novo_id = e.novo_id
FROM especialidades e WHERE e.id_especialidade = me.id_especialidade;
ALTER TABLE medico_especialidade
    DROP CONSTRAINT medico_especialidade_id_especialidade_fkey,
    DROP CONSTRAINT medico_especialidade_pkey,
    DROP COLUMN id_especialidade,
    ALTER COLUMN novo_id SET NOT NULL;
ALTER TABLE especialidades DROP CONSTRAINT especialidades_pkey;
ALTER TABLE especialidades RENAME COLUMN id_especialidade TO id_legado;
ALTER TABLE especialidades RENAME COLUMN novo_id TO id_especialidade;
ALTER TABLE especialidades ADD PRIMARY KEY (id_especialidade);
ALTER TABLE medico_especialidade RENAME COLUMN novo_id TO id_especialidade;
ALTER TABLE medico_especialidade ADD PRIMARY KEY (id_medico, id_especialidade),
    ADD FOREIGN KEY (id_especialidade) REFERENCES especialidades(id_especialidade);

ALTER TABLE usuario ADD COLUMN telefone varchar(20);
UPDATE usuario u SET telefone = m.telefone FROM medico m WHERE m.id_usuario = u.id_usuario;

CREATE TABLE plano_procedimento (
    id_plano uuid NOT NULL REFERENCES plano(id_plano),
    id_procedimento uuid NOT NULL REFERENCES procedimento(id_procedimento),
    PRIMARY KEY (id_plano, id_procedimento)
);

ALTER TABLE faturamento ADD COLUMN cancelado_em timestamptz;
ALTER TABLE faturamento ADD COLUMN motivo_cancelamento text;
