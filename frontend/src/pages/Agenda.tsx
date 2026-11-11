import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AcaoAgendamento, EstadoDados, Tabela } from "../components/Operacoes";
import { Horarios } from "../components/Manutencao";
import { useDados } from "../hooks/useDados";
import { diaBr, situacoes, type Agendamento, type Medico } from "../services/operacoes";

export default function Agenda() {
  const [params, setParams] = useSearchParams();
  const [versao, setVersao] = useState(0);
  const agenda = useDados<Agendamento[]>("agendamentos?" + params, versao);
  const medicos = useDados<Medico[]>("medicos");

  return <AppLayout>
    <div className="page-heading"><h1>Agenda de consultas</h1><Link className="button" to="/novo-agendamento">+ Agendar consulta</Link></div>
    <section className="card">
      <h2>Consultar agenda</h2>
      <form className="toolbar" onSubmit={event => {
        event.preventDefault();
        const campos = new FormData(event.currentTarget);
        const filtros = new URLSearchParams();
        for (const [key, value] of campos) if (value) filtros.set(key, String(value));
        setParams(filtros);
      }}>
        <label>Data<input name="data" type="date" defaultValue={params.get("data") ?? ""} /></label>
        <label>Profissional<select name="id_medico" key={String(medicos.loading)} defaultValue={params.get("id_medico") ?? ""}>
          <option value="">Todos os profissionais</option>
          {medicos.data?.map(item => <option key={item.id_medico} value={item.id_medico}>{item.nome}</option>)}
        </select></label>
        <button>Consultar</button>
      </form>
      <EstadoDados loading={agenda.loading || medicos.loading} error={agenda.error || medicos.error}
        empty={agenda.data?.length === 0 ? "Nenhum agendamento encontrado." : undefined} />
      {!!agenda.data?.length && <Tabela colunas={["Data", "Horário", "Paciente", "Profissional", "Especialidade", "Situação", "Ações"]}>
        {agenda.data.map(item => <tr key={item.id_agendamento}>
          <td>{diaBr(item.data)}</td><td>{item.horario.slice(0, 5)}</td><td>{item.paciente}</td>
          <td>{item.medico}</td><td>{item.especialidades ?? "—"}</td><td>{situacoes[item.status] ?? item.status}</td>
          <td><AcaoAgendamento id={item.id_agendamento} status={item.status} atualizar={() => setVersao(v => v + 1)} /></td>
        </tr>)}
      </Tabela>}
    </section>
    <Horarios />
  </AppLayout>;
}
