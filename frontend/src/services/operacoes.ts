import { apiRequest } from "./api";

export type Paciente = { id_paciente: string; nome: string; cpf_mascarado: string };
export type Medico = { id_medico: string; nome: string; status: string; especialidades: string | null };
export type Especialidade = { id_especialidade: string; nome_especialidade: string; descricao: string | null; profissionais: number; status: string };
export type Convenio = { id_convenio: string; nome: string; cnpj: string; telefone: string | null; email: string | null; status: string };
export type Plano = { id_plano: string; nome: string; convenio: string; cobertura: string | null; status: string; procedimentos: string[] };
export type Agendamento = {
  id_agendamento: string;
  id_paciente: string;
  data: string;
  horario: string;
  status: string;
  paciente: string;
  medico: string;
  especialidades: string | null;
  id_consulta: string | null;
  status_consulta: string | null;
  data_consulta: string | null;
  horario_consulta: string | null;
  observacao_administrativa: string | null;
  aceita_procedimento: boolean;
  procedimentos: string | null;
};
export type Painel = {
  hoje: string;
  dia: Agendamento[];
  proximos?: Agendamento[];
  pacientes?: number;
  profissionais?: number;
  especialidades?: number;
};

export function salvar(path: string, data: object, method = "POST") {
  return apiRequest(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
}

export function diaBr(data: string) {
  return data.split("-").reverse().join("/");
}

export const situacoes: Record<string, string> = {
  pendente: "Aguardando",
  confirmado: "Confirmado",
  em_atendimento: "Em atendimento",
  cancelado: "Cancelado",
  realizado: "Concluído",
  encerrado: "Encerrado",
  realizada: "Concluída",
};
