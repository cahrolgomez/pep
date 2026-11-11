import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AcaoAgendamento, EstadoDados, Tabela } from "../components/Operacoes";
import { AdicionarProcedimento, Horarios } from "../components/Manutencao";
import { useDados } from "../hooks/useDados";
import { diaBr, situacoes, type Agendamento, type Painel } from "../services/operacoes";

export default function PainelMedico() {
  const [data, setData] = useState("");
  const [versao, setVersao] = useState(0);
  const painel = useDados<Painel>("painel", versao);
  const agenda = useDados<Agendamento[]>(data ? "agendamentos?" + new URLSearchParams({ data }) : null, versao);
  const dia = data ? agenda.data : painel.data?.dia;
  return <AppLayout medical>
    <div className="page-heading"><h1>Minha agenda</h1></div>
    <EstadoDados loading={painel.loading || agenda.loading} error={painel.error || agenda.error} />
    <section className="card">
      <label>Data<input type="date" value={data || painel.data?.hoje || ""} onChange={event => setData(event.target.value)} /></label>
    </section>
    {dia && <>
      <div className="stats stats-medical">
        {[
          ["Consultas do dia", dia.filter(item => item.status !== "cancelado").length],
          ["Aguardando", dia.filter(item => item.status === "pendente").length],
          ["Em atendimento", dia.filter(item => item.status === "em_atendimento").length],
          ["Concluídas", dia.filter(item => ["realizado", "encerrado"].includes(item.status)).length],
        ].map(([rotulo, quantidade]) => <article className="card stat" key={rotulo}><span className="muted">{rotulo}</span><strong>{quantidade}</strong></article>)}
      </div>
      <section className="card">
        <h2>Agenda de {diaBr(data || painel.data?.hoje || "")}</h2>
        {dia.length ? <Tabela colunas={["Horário", "Paciente", "Situação", "Procedimentos", "Ações"]}>
          {dia.map(item => <tr key={item.id_agendamento}>
            <td>{item.horario.slice(0, 5)}</td><td>{item.paciente}</td><td>{situacoes[item.status] ?? item.status}</td>
            <td>{item.procedimentos ?? "—"}</td>
            <td>
              <Link to={"/historico?paciente=" + item.id_paciente}>Ver histórico</Link>
              <AcaoAgendamento id={item.id_agendamento} status={item.status} atualizar={() => setVersao(v => v + 1)} />
              {item.id_consulta && item.aceita_procedimento && <AdicionarProcedimento id={item.id_consulta} atualizar={() => setVersao(v => v + 1)} />}
            </td>
          </tr>)}
        </Tabela> : <p>Nenhum atendimento nesta data.</p>}
      </section>
    </>}
    <Horarios medical />
  </AppLayout>;
}
