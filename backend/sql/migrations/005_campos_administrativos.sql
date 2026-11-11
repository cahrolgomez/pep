ALTER TABLE public.paciente ADD COLUMN IF NOT EXISTS endereco text;
ALTER TABLE public.convenio ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.especialidades ADD COLUMN IF NOT EXISTS descricao text;
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS observacoes text;
