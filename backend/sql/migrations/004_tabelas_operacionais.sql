CREATE TABLE IF NOT EXISTS public.convenio (
    id_convenio uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    cnpj varchar(14) NOT NULL UNIQUE,
    telefone text,
    status text NOT NULL DEFAULT 'ativo'
);

CREATE TABLE IF NOT EXISTS public.plano (
    id_plano uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_convenio uuid NOT NULL REFERENCES public.convenio(id_convenio),
    nome text NOT NULL,
    cobertura text,
    status text NOT NULL DEFAULT 'ativo'
);

CREATE TABLE IF NOT EXISTS public.paciente_convenio (
    id_paciente_convenio uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_paciente uuid NOT NULL REFERENCES public.paciente(id_paciente),
    id_plano uuid NOT NULL REFERENCES public.plano(id_plano),
    numero_carteirinha text NOT NULL,
    validade date,
    status text NOT NULL DEFAULT 'ativo'
);

CREATE TABLE IF NOT EXISTS public.disponibilidade_agenda (
    id_disponibilidade uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_medico uuid NOT NULL REFERENCES public.medico(id_medico),
    data date NOT NULL,
    horario time NOT NULL,
    status text NOT NULL,

    UNIQUE (id_medico, data, horario)
);

CREATE TABLE IF NOT EXISTS public.agendamento (
    id_agendamento uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_medico uuid NOT NULL REFERENCES public.medico(id_medico),
    id_paciente uuid NOT NULL REFERENCES public.paciente(id_paciente),
    data date NOT NULL,
    horario time NOT NULL,
    status text NOT NULL,
    motivo_cancelamento text,
    id_paciente_convenio uuid REFERENCES public.paciente_convenio(id_paciente_convenio)
);

CREATE TABLE IF NOT EXISTS public.consulta (
    id_consulta uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_agendamento uuid NOT NULL UNIQUE REFERENCES public.agendamento(id_agendamento),
    data date NOT NULL,
    horario time NOT NULL,
    status text NOT NULL,
    observacao_administrativa text
);

CREATE TABLE IF NOT EXISTS public.procedimento (
    id_procedimento uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    descricao text,
    valor numeric(12, 2) NOT NULL CHECK (valor >= 0),
    status text NOT NULL DEFAULT 'ativo'
);

CREATE TABLE IF NOT EXISTS public.consulta_procedimento (
    id_consulta_procedimento uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_consulta uuid NOT NULL REFERENCES public.consulta(id_consulta),
    id_procedimento uuid NOT NULL REFERENCES public.procedimento(id_procedimento),
    data date NOT NULL,
    horario time NOT NULL,
    valor numeric(12, 2) NOT NULL CHECK (valor >= 0),
    quantidade integer NOT NULL CHECK (quantidade > 0)
);

CREATE TABLE IF NOT EXISTS public.faturamento (
    id_faturamento uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_consulta uuid NOT NULL UNIQUE REFERENCES public.consulta(id_consulta),
    valor_total numeric(12, 2) NOT NULL CHECK (valor_total >= 0),
    forma_pagamento text,
    data_pagamento date,
    hora_pagamento time,
    status text NOT NULL
);
