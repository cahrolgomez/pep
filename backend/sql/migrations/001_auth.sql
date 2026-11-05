-- Executada pelo comando python -m app.manage migrate, na mesma transação.
ALTER TABLE usuario ALTER COLUMN senha DROP DEFAULT;
ALTER TABLE usuario ALTER COLUMN status SET DEFAULT 'ativo';
ALTER TABLE usuario ADD CONSTRAINT usuario_perfil_check CHECK (perfil IN ('administrador','atendente','medico'));
ALTER TABLE usuario ADD CONSTRAINT usuario_status_check CHECK (status IN ('ativo','inativo'));
ALTER TABLE usuario ADD CONSTRAINT usuario_senha_check CHECK (senha LIKE 'pbkdf2_sha256$600000$%');
CREATE UNIQUE INDEX usuario_email_lower_key ON usuario (lower(email));
CREATE TABLE sessao (
    token_hash VARCHAR(64) PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    expira_em TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '8 hours')
);
CREATE INDEX sessao_usuario_idx ON sessao (id_usuario);
