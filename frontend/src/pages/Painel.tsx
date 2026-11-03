import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
export default function Painel() {
 const search = "";
 return <AppLayout medical={false}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Um bom dia começa com cuidado.</h1>
            <p>Acompanhe a rotina da clínica em um só lugar.</p>
          </div>
          <Link className="button" to="/novo-agendamento">+ Nova consulta</Link>
        </div>
        <div className="stats">
          <article className="card stat">
            <span className="muted">Consultas hoje</span>
            <strong>12</strong>
            <small>8 confirmadas</small>
          </article>
          <article className="card stat">
            <span className="muted">Pacientes cadastrados</span>
            <strong>148</strong>
            <small>Base demonstrativa</small>
          </article>
          <article className="card stat">
            <span className="muted">Profissionais</span>
            <strong>6</strong>
            <small>4 especialidades</small>
          </article>
        </div>
        <section className="card">
          <h2>Próximos atendimentos</h2>
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
                    Profissional
                  </th>
                  <th scope="col">
                    Especialidade
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
                    Dra. Laura Costa
                  </td>
                  <td>
                    Clínica geral
                  </td>
                  <td>
                    <span className="badge">Confirmado</span>
                  </td>
                  <td>
                    <Link className="" to="/prontuario">Abrir atendimento</Link>
                  </td>
                </tr>
                <tr>
                  <td>
                    08:30
                  </td>
                  <td>
                    Pedro Almeida
                  </td>
                  <td>
                    Dr. Rafael Lima
                  </td>
                  <td>
                    Cardiologia
                  </td>
                  <td>
                    <span className="badge pending">Aguardando</span>
                  </td>
                  <td>
                    <Link className="" to="/historico">Ver histórico</Link>
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
                    Dra. Laura Costa
                  </td>
                  <td>
                    Clínica geral
                  </td>
                  <td>
                    <span className="badge">Confirmado</span>
                  </td>
                  <td>
                    <Link className="" to="/historico">Ver histórico</Link>
                  </td>
                </tr>
              </SearchBody>
            </table>
          </div>
        </section>
        <div className="grid">
          <section className="card">
            <h2>Uma rotina mais simples</h2>
            <p className="muted">Do primeiro cadastro ao fechamento do mês, cada etapa do cuidado no mesmo lugar.</p>
            <div className="actions">
              <Link className="button secondary" to="/novo-paciente">Cadastrar paciente</Link>
              <Link className="button secondary" to="/novo-agendamento">Agendar consulta</Link>
            </div>
          </section>
          <section className="card">
            <h2>Fechamento de outubro</h2>
            <p className="muted">Consulte os atendimentos e revise as pendências antes de concluir o período.</p>
            <Link className="" to="/faturamento">Consultar faturamento</Link>
          </section>
        </div>
      </AppLayout>;
}
