import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
export default function PainelMedico() {
 const search = "";
 return <AppLayout medical={true}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Sua agenda, seu cuidado.</h1>
            <p>Sexta-feira, 30 de outubro de 2026 · Agenda demonstrativa</p>
          </div>
        </div>
        <div className="stats stats-medical">
          <article className="card stat">
            <span className="muted">Consultas do dia</span>
            <strong>8</strong>
            <small>Clínica geral</small>
          </article>
          <article className="card stat">
            <span className="muted">Aguardando</span>
            <strong>3</strong>
            <small>Na recepção</small>
          </article>
          <article className="card stat">
            <span className="muted">Em atendimento</span>
            <strong>1</strong>
            <small>Consulta iniciada</small>
          </article>
          <article className="card stat">
            <span className="muted">Concluídas</span>
            <strong>4</strong>
            <small>Registros finalizados</small>
          </article>
        </div>
        <section className="card">
          <h2>Agenda do dia</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    Horário
                  </th>
                  <th scope="col">
                    Paciente
                  </th>
                  <th scope="col">
                    Situação
                  </th>
                  <th scope="col">
                    Ação
                  </th>
                </tr>
              </thead>
              <SearchBody search={search}>
                <tr>
                  <td>
                    08:00
                  </td>
                  <td>
                    Marina Oliveira
                  </td>
                  <td>
                    Em atendimento
                  </td>
                  <td>
                    <Link className="" to="/prontuario">Continuar atendimento</Link>
                  </td>
                </tr>
                <tr>
                  <td>
                    09:00
                  </td>
                  <td>
                    Beatriz Santos
                  </td>
                  <td>
                    Aguardando
                  </td>
                  <td>
                    <Link className="" to="/historico">Consultar histórico</Link>
                  </td>
                </tr>
              </SearchBody>
            </table>
          </div>
        </section>
      </AppLayout>;
}
