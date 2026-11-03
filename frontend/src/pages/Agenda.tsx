import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
export default function Agenda() {
 const search = "";
 return <AppLayout medical={false}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Agenda de consultas</h1>
            <p>Organize horários, profissionais e atendimentos.</p>
          </div>
          <Link className="button" to="/novo-agendamento">+ Agendar consulta</Link>
        </div>
        <section className="card">
          <h2>Consultar agenda</h2>
          <DemoForm className="toolbar" filter>
            <label>
              Data
              <input name="data" type="date" required />
            </label>
            <label>
              Profissional
              <select name="medico" required>
                <option>Todos os profissionais</option>
                <option>Dra. Laura Costa</option>
                <option>Dr. Rafael Lima</option>
              </select>
            </label>
            <button>Consultar</button>
          </DemoForm>
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
      </AppLayout>;
}
