import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { EstadoDados, Tabela } from "../components/Operacoes";
import { useDados } from "../hooks/useDados";
import { diaBr, situacoes, type Painel as DadosPainel } from "../services/operacoes";

export default function Painel() {
  const { data, loading, error } = useDados<DadosPainel>("painel");
  const proximos = data?.proximos ?? [];
  return <AppLayout>
    <div className="page-heading"><h1>Visão geral da clínica</h1><Link className="button" to="/novo-agendamento">+ Nova consulta</Link></div>
    <EstadoDados loading={loading} error={error} />
    {data && <>
      <div className="stats">
        <article className="card stat"><span className="muted">Consultas hoje</span><strong>{data.dia.filter(item => item.status !== "cancelado").length}</strong>
          <small>{data.dia.filter(item => item.status === "confirmado").length} confirmadas</small></article>
        <article className="card stat"><span className="muted">Pacientes cadastrados</span><strong>{data.pacientes}</strong></article>
        <article className="card stat"><span className="muted">Profissionais</span><strong>{data.profissionais}</strong><small>{data.especialidades} especialidades</small></article>
      </div>
      <section className="card">
        <h2>Próximos atendimentos</h2>
        {proximos.length ? <Tabela colunas={["Data", "Horário", "Paciente", "Profissional", "Especialidade", "Situação", "Ação"]}>
          {proximos.map(item => <tr key={item.id_agendamento}>
            <td>{diaBr(item.data)}</td><td>{item.horario.slice(0, 5)}</td><td>{item.paciente}</td>
            <td>{item.medico}</td><td>{item.especialidades ?? "—"}</td><td>{situacoes[item.status] ?? item.status}</td>
            <td><Link to={"/historico?paciente=" + item.id_paciente}>Ver histórico</Link></td>
          </tr>)}
        </Tabela> : <p>Nenhum atendimento próximo.</p>}
      </section>
    </>}
  </AppLayout>;
}
