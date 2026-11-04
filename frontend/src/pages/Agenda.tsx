import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
import { useState } from "react";
export default function Agenda() {
 const search = "";
const [status, setStatus] = useState({
  1: "pendente",
  2: "pendente",
  3: "pendente"
});

function atualizarStatus(id: number, novoStatus: string) {
  setStatus((anterior) => ({
    ...anterior,
    [id]: novoStatus
  }));
}
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
            <button className="btn-consulta">Consultar</button>
          </DemoForm>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    Horário
                  </th>
                  <th scope="col">
                    Data
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
                </tr>
              </thead>
              <SearchBody search={search}>
                <tr>
                  <td>
                    08:00
                  </td>
                  <td>
                    16/11/2026
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
                    <select className={`select-status ${status[1]}`} value={status[1]} onChange={(e) => atualizarStatus(1, e.target.value)}>
                      <option value="confirmado">Confirmado</option>
                      <option value="pendente">Aguardando</option>
                      <option value="cancelado">Cancelado</option>
                      <option value="encerrado">Encerrado</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>
                    08:30
                  </td>
                  <td>
                    16/11/2026
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
                    <select className={`select-status ${status[2]}`} value={status[2]} onChange={(e) => atualizarStatus(2, e.target.value)}>
                      <option value="confirmado">Confirmado</option>
                      <option value="pendente">Aguardando</option>
                      <option value="cancelado">Cancelado</option>
                      <option value="encerrado">Encerrado</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>
                    09:00
                  </td>
                  <td>
                    16/11/2026
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
                    <select className={`select-status ${status[3]}`} value={status[3]} onChange={(e) => atualizarStatus(3, e.target.value)}>
                      <option value="confirmado">Confirmado</option>
                      <option value="pendente">Aguardando</option>
                      <option value="cancelado">Cancelado</option>
                      <option value="encerrado">Encerrado</option>
                    </select>
                  </td>
                </tr>
              </SearchBody>
            </table>
          </div>
        </section>
      </AppLayout>;
}
