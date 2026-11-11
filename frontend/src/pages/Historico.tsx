import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { EstadoDados } from "../components/Operacoes";
import { useDados } from "../hooks/useDados";
import { diaBr, situacoes, type Agendamento, type Paciente } from "../services/operacoes";

export default function Historico() {
  const [params, setParams] = useSearchParams();
  const [busca, setBusca] = useState("");
  const id = params.get("paciente") ?? "";
  const usuario = useDados<{ perfil: string }>("auth/me");
  const pacientes = useDados<Paciente[]>("pacientes?" + new URLSearchParams({ q: busca }));
  const agenda = useDados<Agendamento[]>(id ? "agendamentos?" + new URLSearchParams({ id_paciente: id }) : null);
  const paciente = pacientes.data?.find(item => item.id_paciente === id);
  const consultas = (agenda.data ?? []).filter(item => item.id_consulta).sort((a, b) =>
    `${b.data_consulta}T${b.horario_consulta}`.localeCompare(`${a.data_consulta}T${a.horario_consulta}`));
  return <AppLayout medical={usuario.data?.perfil === "medico"}>
    <div className="page-heading"><h1>Histórico do paciente</h1></div>
    <section className="card">
      <div className="form-grid">
        <label>Buscar paciente por nome ou CPF<input type="search" value={busca} onChange={event => setBusca(event.target.value)} /></label>
        <label>Paciente<select value={id} onChange={event => setParams(event.target.value ? { paciente: event.target.value } : {})}>
          <option value="">Selecione</option>
          {id && !paciente && <option value={id}>{agenda.data?.[0]?.paciente ?? "Paciente selecionado"}</option>}
          {pacientes.data?.map(item => <option key={item.id_paciente} value={item.id_paciente}>{item.nome} · {item.cpf_mascarado}</option>)}
        </select></label>
      </div>
      <EstadoDados loading={pacientes.loading} error={pacientes.error} />
    </section>
    {id && <section className="card">
      <h2>Consultas de {agenda.data?.[0]?.paciente ?? paciente?.nome ?? "paciente selecionado"}</h2>
      <EstadoDados loading={agenda.loading} error={agenda.error} empty={agenda.data && !consultas.length ? "Nenhuma consulta encontrada." : undefined} />
      <div className="timeline">
        {consultas.map(item => <article key={item.id_consulta}>
          <p className="eyebrow">{diaBr(item.data_consulta ?? item.data)} · {(item.horario_consulta ?? item.horario).slice(0, 5)}</p>
          <h3>{situacoes[item.status_consulta ?? item.status] ?? item.status_consulta ?? item.status}</h3>
          <p className="muted">{item.medico}{item.especialidades && " · " + item.especialidades}</p>
          {item.observacao_administrativa && <p>{item.observacao_administrativa}</p>}
        </article>)}
      </div>
    </section>}
  </AppLayout>;
}
