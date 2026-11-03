import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
export default function Historico() {
 const search = "";
 return <AppLayout medical={true}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Histórico do paciente</h1>
            <p>Uma visão contínua da jornada de cuidado.</p>
          </div>
        </div>
        <section className="card">
          <h2>Identificação</h2>
          <div className="patient">
            <span className="avatar">MO</span>
            <div>
              <h2>Marina Oliveira</h2>
              <span className="muted">Paciente demonstrativa · 34 anos · Vida Saúde</span>
            </div>
          </div>
        </section>
        <section className="card">
          <h2>Linha do tempo</h2>
          <div className="timeline">
            <article>
              <p className="eyebrow">30 OUT 2026 · Clínica geral</p>
              <h3>Consulta em andamento</h3>
              <p className="muted">Dra. Laura Costa · Atendimento ATD-003</p>
              <Link className="" to="/prontuario">Abrir prontuário</Link>
            </article>
            <article>
              <p className="eyebrow">12 SET 2026 · Clínica geral</p>
              <h3>Consulta de acompanhamento</h3>
              <p className="muted">Dra. Laura Costa · Atendimento concluído</p>
              <details>
                <summary>Ver registro demonstrativo</summary>
                <p>Evolução, prescrições e exames disponíveis no prontuário para profissionais autorizados.</p>
              </details>
            </article>
          </div>
        </section>
      </AppLayout>;
}
