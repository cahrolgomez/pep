import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
export default function Prontuario() {
 const search = "";
 return <AppLayout medical={true}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Registro do atendimento</h1>
            <p>Atendimento ATD-003 · 30 de outubro de 2026</p>
          </div>
          <Link className="button secondary" to="/historico">Ver histórico</Link>
        </div>
        <section className="card">
          <h2>Paciente</h2>
          <div className="patient">
            <span className="avatar">MO</span>
            <div>
              <h2>Marina Oliveira</h2>
              <span className="muted">Paciente demonstrativa · 34 anos · Vida Saúde</span>
            </div>
          </div>
        </section>
        <div className="notice">
          Demonstração com dados fictícios. Os registros preenchidos não são armazenados.
        </div>
        <section className="card">
          <h2>Prontuário clínico</h2>
          <DemoForm demo>
            <div className="form-grid">
              <label>
                Queixa principal
                <textarea name="queixa" required>
                </textarea>
              </label>
              <label>
                Evolução clínica
                <textarea name="evolucao" required>
                </textarea>
              </label>
              <label>
                Hipótese diagnóstica
                <input name="diagnostico" type="text" required />
              </label>
              <label>
                Conduta e orientações
                <textarea name="conduta" required>
                </textarea>
              </label>
              <label>
                Prescrição: medicamento, dose, via e duração
                <textarea name="prescricao" required>
                </textarea>
              </label>
              <label>
                Exames solicitados e justificativa
                <textarea name="exames" required>
                </textarea>
              </label>
              <label>
                Informação específica da especialidade
                <input name="campo" type="text" required />
              </label>
              <label>
                Valor / observação clínica
                <input name="valor" type="text" required />
              </label>
              <label>
                Anexos
                <input type="file" name="anexos" multiple />
                <small>Seleção local; nenhum arquivo será enviado.</small>
              </label>
            </div>
            <div className="actions">
              <button type="submit">Simular finalização do atendimento</button>
            </div>
          </DemoForm>
        </section>
      </AppLayout>;
}
