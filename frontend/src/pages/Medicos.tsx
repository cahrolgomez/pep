import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
export default function Medicos() {
 const search = "";
 return <AppLayout medical={false}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Equipe médica</h1>
            <p>Profissionais e especialidades da clínica.</p>
          </div>
        </div>
        <section className="card">
          <h2>Profissionais cadastrados</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    Profissional
                  </th>
                  <th scope="col">
                    CRM / UF
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
                    Dra. Laura Costa
                  </td>
                  <td>
                    00001 / AL
                  </td>
                  <td>
                    Clínica geral
                  </td>
                  <td>
                    Ativo
                  </td>
                </tr>
                <tr>
                  <td>
                    Dr. Rafael Lima
                  </td>
                  <td>
                    00002 / AL
                  </td>
                  <td>
                    Cardiologia
                  </td>
                  <td>
                    Ativo
                  </td>
                </tr>
              </SearchBody>
            </table>
          </div>
        </section>
        <section className="card">
          <h2>Cadastrar profissional</h2>
          <DemoForm demo>
            <div className="form-grid">
              <label>
                Nome completo
                <input name="nome" type="text" required />
              </label>
              <label>
                CRM
                <input name="crm" type="text" required />
              </label>
              <label>
                UF do CRM
                <select name="uf" required>
                  <option>AL</option>
                  <option>SE</option>
                  <option>PE</option>
                  <option>BA</option>
                </select>
              </label>
              <label>
                Especialidade
                <select name="especialidade" required>
                  <option>Clínica geral</option>
                  <option>Cardiologia</option>
                  <option>Dermatologia</option>
                </select>
              </label>
              <label>
                E-mail
                <input name="email" type="email" required />
              </label>
              <label>
                Telefone
                <input name="telefone" type="tel" required />
              </label>
            </div>
            <div className="actions">
              <button type="submit">Salvar cadastro</button>
            </div>
          </DemoForm>
        </section>
      </AppLayout>;
}
