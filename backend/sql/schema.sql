-- Tabelas

CREATE TABLE usuario (
    id_usuario uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    perfil VARCHAR(50) NOT NULL CONSTRAINT usuario_perfil_check CHECK (perfil IN ('administrador', 'atendente', 'medico')),
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CONSTRAINT usuario_status_check CHECK (status IN ('ativo', 'inativo')),
    senha VARCHAR(255) NOT NULL CONSTRAINT usuario_senha_check CHECK (senha LIKE 'pbkdf2_sha256$600000$%')
);

CREATE TABLE medico (
    id_medico uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario uuid NOT NULL UNIQUE,
    crm VARCHAR(30) NOT NULL UNIQUE,
    telefone VARCHAR(20),

    CONSTRAINT fk_medico_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE paciente (
    id_paciente uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    cpf varchar(11) NOT NULL UNIQUE,
    data_nascimento date,
    telefone text,
    email text
);

CREATE TABLE especialidades (
    id_especialidade INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome_especialidade VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE medico_especialidade (
    id_medico uuid NOT NULL,
    id_especialidade INTEGER NOT NULL,

    PRIMARY KEY (id_medico, id_especialidade),

    FOREIGN KEY (id_medico)
        REFERENCES medico(id_medico),

    FOREIGN KEY (id_especialidade)
        REFERENCES especialidades(id_especialidade)
);

CREATE UNIQUE INDEX usuario_email_lower_key ON usuario (lower(email));
CREATE TABLE sessao (
    token_hash VARCHAR(64) PRIMARY KEY,
    id_usuario uuid NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    expira_em TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '8 hours')
);
CREATE INDEX sessao_usuario_idx ON sessao (id_usuario);
