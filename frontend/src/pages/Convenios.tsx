import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
export default function Convenios() {
 const search = "";
 return <AppLayout medical={false}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Convênios</h1>
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
                    Convênio
                  </th>
                  <th scope="col">
                    Código
                  </th>
                  <th scope="col">
                    Situação
                  </th>
                </tr>
              </thead>
              <SearchBody search={search}>
                <tr>
                  <td>
                    Vida Saúde
                  </td>
                  <td>
                    CONV-001
                  </td>
                  <td>
                    Ativo
                  </td>
                </tr>
                <tr>
                  <td>
                    Bem Cuidar
                  </td>
                  <td>
                    CONV-002
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
          <h2>Novo cadastro</h2>
          <DemoForm demo>
            <div className="form-grid">
              <label>
                Nome do convênio
                <input name="nome" type="text" required />
              </label>
              <label>
                Código de identificação
                <input name="codigo" type="text" required />
              </label>
              <label>
                Contato
                <input name="contato" type="tel" required />
              </label>
              <label>
                E-mail
                <input name="email" type="email" required />
              </label>
            </div>
            <div className="actions">
              <button type="submit">Salvar cadastro</button>
            </div>
          </DemoForm>
        </section>
      </AppLayout>;
}
