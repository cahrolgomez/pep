import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
export default function Especialidades() {
 const search = "";
 return <AppLayout medical={false}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Especialidades</h1>
            <p>Mantenha os cadastros de apoio atualizados.</p>
          </div>
        </div>
        <section className="card">
          <h2>Cadastros disponíveis</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    Especialidade
                  </th>
                  <th scope="col">
                    Descrição
                  </th>
                </tr>
              </thead>
              <SearchBody search={search}>
                <tr>
                  <td>
                    Clínica geral
                  </td>
                  <td>
                    Atendimento clínico geral
                  </td>
                </tr>
                <tr>
                  <td>
                    Cardiologia
                  </td>
                  <td>
                    Saúde cardiovascular
                  </td>
                </tr>
                <tr>
                  <td>
                    Dermatologia
                  </td>
                  <td>
                    Saúde da pele
                  </td>
                </tr>
              </SearchBody>
            </table>
          </div>
        </section>
        <section className="card">
          <h2>Novo cadastro</h2>
          <DemoForm demo>
            <div className="form-grid">
              <label>
                Nome da especialidade
                <input name="nome" type="text" required />
              </label>
              <label>
                Descrição
                <input name="descricao" type="text" required />
              </label>
            </div>
            <div className="actions">
              <button type="submit">Salvar cadastro</button>
            </div>
          </DemoForm>
        </section>
      </AppLayout>;
}
