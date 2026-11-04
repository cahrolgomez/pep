-- Tabelas

CREATE TABLE usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    perfil VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE medico (
    id_medico INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE,
    crm VARCHAR(30) NOT NULL UNIQUE,
    telefone VARCHAR(20),

    CONSTRAINT fk_medico_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE especialidades (
    id_especialidade INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome_especialidade VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE medico_especialidade (
    id_medico INTEGER NOT NULL,
    id_especialidade INTEGER NOT NULL,

    PRIMARY KEY (id_medico, id_especialidade),

    FOREIGN KEY (id_medico)
        REFERENCES medico(id_medico),

    FOREIGN KEY (id_especialidade)
        REFERENCES especialidades(id_especialidade)
);

-- Cadastro de usuário

INSERT INTO usuario (name, email, perfil, status, senha)
VALUES (
    'Maria Silva',
    'mariasilva@pep.com',
    'atendente',
    'ativo',
    '123456'
);