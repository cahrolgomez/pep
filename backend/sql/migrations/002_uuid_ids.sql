-- Migração para bancos antigos que ainda usam IDs inteiros.
-- Converte os IDs de usuario, paciente e medico para UUID,
-- preserva os vínculos e gera UUIDs automaticamente nos novos cadastros.

BEGIN;

LOCK TABLE public.usuario, public.paciente, public.medico,
    public.sessao, public.medico_especialidade IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.usuario ADD COLUMN migracao_uuid uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.medico
    ADD COLUMN migracao_uuid uuid NOT NULL DEFAULT gen_random_uuid(),
    ADD COLUMN migracao_uuid_usuario uuid;
ALTER TABLE public.sessao ADD COLUMN migracao_uuid_usuario uuid;
ALTER TABLE public.medico_especialidade ADD COLUMN migracao_uuid_medico uuid;

UPDATE public.medico AS m
SET migracao_uuid_usuario = u.migracao_uuid
FROM public.usuario AS u
WHERE m.id_usuario = u.id_usuario;

UPDATE public.sessao AS s
SET migracao_uuid_usuario = u.migracao_uuid
FROM public.usuario AS u
WHERE s.id_usuario = u.id_usuario;

UPDATE public.medico_especialidade AS me
SET migracao_uuid_medico = m.migracao_uuid
FROM public.medico AS m
WHERE me.id_medico = m.id_medico;

ALTER TABLE public.medico DROP CONSTRAINT fk_medico_usuario;
ALTER TABLE public.sessao DROP CONSTRAINT sessao_id_usuario_fkey;
ALTER TABLE public.medico_especialidade DROP CONSTRAINT medico_especialidade_id_medico_fkey;

ALTER TABLE public.usuario ALTER COLUMN id_usuario DROP IDENTITY;
ALTER TABLE public.medico ALTER COLUMN id_medico DROP IDENTITY;
ALTER TABLE public.paciente ALTER COLUMN id_paciente DROP IDENTITY;

ALTER TABLE public.usuario
    ALTER COLUMN id_usuario TYPE uuid USING migracao_uuid,
    ALTER COLUMN id_usuario SET DEFAULT gen_random_uuid();
ALTER TABLE public.paciente
    ALTER COLUMN id_paciente TYPE uuid USING gen_random_uuid(),
    ALTER COLUMN id_paciente SET DEFAULT gen_random_uuid();
ALTER TABLE public.medico
    ALTER COLUMN id_medico TYPE uuid USING migracao_uuid,
    ALTER COLUMN id_medico SET DEFAULT gen_random_uuid(),
    ALTER COLUMN id_usuario TYPE uuid USING migracao_uuid_usuario;
ALTER TABLE public.sessao ALTER COLUMN id_usuario TYPE uuid USING migracao_uuid_usuario;
ALTER TABLE public.medico_especialidade ALTER COLUMN id_medico TYPE uuid USING migracao_uuid_medico;

ALTER TABLE public.medico ADD CONSTRAINT fk_medico_usuario
    FOREIGN KEY (id_usuario) REFERENCES public.usuario (id_usuario);
ALTER TABLE public.sessao ADD CONSTRAINT sessao_id_usuario_fkey
    FOREIGN KEY (id_usuario) REFERENCES public.usuario (id_usuario) ON DELETE CASCADE;
ALTER TABLE public.medico_especialidade ADD CONSTRAINT medico_especialidade_id_medico_fkey
    FOREIGN KEY (id_medico) REFERENCES public.medico (id_medico);

ALTER TABLE public.usuario DROP COLUMN migracao_uuid;
ALTER TABLE public.medico DROP COLUMN migracao_uuid, DROP COLUMN migracao_uuid_usuario;
ALTER TABLE public.sessao DROP COLUMN migracao_uuid_usuario;
ALTER TABLE public.medico_especialidade DROP COLUMN migracao_uuid_medico;

COMMIT;
