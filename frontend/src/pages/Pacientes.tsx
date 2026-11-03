import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
export default function Pacientes() {
 const [search, setSearch] = useState("");
 return <AppLayout medical={false}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Pacientes</h1>
            <p>Dados cadastrais organizados para um atendimento mais próximo.</p>
          </div>
          <Link className="button" to="/novo-paciente">+ Novo paciente</Link>
        </div>
        <section className="card">
          <h2>Todos os pacientes</h2>
          <label>
            Buscar por nome ou CPF
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Digite para buscar" />
          </label>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    Paciente
                  </th>
                  <th scope="col">
                    CPF
                  </th>
                  <th scope="col">
                    Convênio
                  </th>
                  <th scope="col">
                    Contato
                  </th>
                  <th scope="col">
                    Ação
                  </th>
                </tr>
              </thead>
              <SearchBody search={search}>
                <tr>
                  <td>
                    Marina Oliveira
                  </td>
                  <td>
                    ***.***.***-01
                  </td>
                  <td>
                    Vida Saúde
                  </td>
                  <td>
                    (82) 90000-0001
                  </td>
                  <td>
                    <Link className="" to="/historico">Ver histórico</Link>
                  </td>
                </tr>
                <tr>
                  <td>
                    Pedro Almeida
                  </td>
                  <td>
                    ***.***.***-02
                  </td>
                  <td>
                    Particular
                  </td>
                  <td>
                    (82) 90000-0002
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
