import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
export default function Faturamento() {
 const search = "";
 const [closing, setClosing] = useState(false);
 return <AppLayout medical={false}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Faturamento</h1>
            <p>Consulte atendimentos e acompanhe o fechamento por período.</p>
          </div>
        </div>
        <section className="card">
          <h2>Período de referência</h2>
          <DemoForm filter className="toolbar">
            <label>
              De
              <input name="inicio" type="date" required />
            </label>
            <label>
              Até
              <input name="fim" type="date" required />
            </label>
            <label>
              Convênio
              <select name="convenio" required>
                <option>Todos os convênios</option>
                <option>Vida Saúde</option>
                <option>Bem Cuidar</option>
                <option>Particular</option>
              </select>
            </label>
            <button>Consultar período</button>
          </DemoForm>
        </section>
        <div className="stats">
          <article className="card stat">
            <span className="muted">Total realizado</span>
            <strong>R$ 8.450</strong>
            <small>42 atendimentos</small>
          </article>
          <article className="card stat">
            <span className="muted">Convênios</span>
            <strong>R$ 6.300</strong>
            <small>32 atendimentos</small>
          </article>
          <article className="card stat">
            <span className="muted">Particular</span>
            <strong>R$ 2.150</strong>
            <small>10 atendimentos</small>
          </article>
          <article className="card stat">
            <span className="muted">Pendentes</span>
            <strong>2</strong>
            <small>Aguardando revisão</small>
          </article>
        </div>
        <section className="card">
          <h2>Atendimentos para faturamento</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    Atendimento
                  </th>
                  <th scope="col">
                    Data
                  </th>
                  <th scope="col">
                    Paciente
                  </th>
                  <th scope="col">
                    Convênio
                  </th>
                  <th scope="col">
                    Valor
                  </th>
                  <th scope="col">
                    Situação
                  </th>
                </tr>
              </thead>
              <SearchBody search={search}>
                <tr>
                  <td>
                    ATD-001
                  </td>
                  <td>
                    29/10/2026
                  </td>
                  <td>
                    Pedro Almeida
                  </td>
                  <td>
                    Particular
                  </td>
                  <td>
                    R$ 215,00
                  </td>
                  <td>
                    Registrado
                  </td>
                </tr>
                <tr>
                  <td>
                    ATD-002
                  </td>
                  <td>
                    29/10/2026
                  </td>
                  <td>
                    Marina Oliveira
                  </td>
                  <td>
                    Vida Saúde
                  </td>
                  <td>
                    R$ 180,00
                  </td>
                  <td>
                    Registrado
                  </td>
                </tr>
              </SearchBody>
            </table>
          </div>
        </section>
        <section className="card">
          <h2>Registrar faturamento</h2>
          <DemoForm demo>
            <div className="form-grid">
              <label>
                Atendimento concluído
                <select name="atendimento" required>
                  <option>ATD-001 — Pedro Almeida</option>
                  <option>ATD-002 — Marina Oliveira</option>
                </select>
              </label>
              <label>
                Valor (R$)
                <input name="valor" type="number" required />
              </label>
              <label>
                Convênio
                <select name="convenio" required>
                  <option>Particular</option>
                  <option>Vida Saúde</option>
                  <option>Bem Cuidar</option>
                </select>
              </label>
            </div>
            <div className="actions">
              <button type="submit">Simular registro</button>
            </div>
          </DemoForm>
        </section>
        <section className="card">
          <h2>Fechamento mensal</h2>
          <p className="muted">Revise os atendimentos e as pendências antes de consolidar as cobranças.</p>
          <button type="button" onClick={() => setClosing(true)}>Simular fechamento de outubro</button>
          <p role="status" className="feedback" id="closing-feedback">{closing ? "Simulação de fechamento concluída. Nenhuma cobrança foi gerada." : ""}</p>
        </section>
      </AppLayout>;
}
