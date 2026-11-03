import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
export default function NovoAgendamento() {
 const search = "";
 return <AppLayout medical={false}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Agendar consulta</h1>
            <p>Selecione o paciente e um horário disponível.</p>
          </div>
        </div>
        <section className="card">
          <h2>Dados do agendamento</h2>
          <div className="notice">
            Disponibilidade ilustrativa. A confirmação de conflitos dependerá da API.
          </div>
          <DemoForm demo>
            <div className="form-grid">
              <label>
                Paciente
                <select name="paciente" required>
                  <option>Marina Oliveira</option>
                  <option>Pedro Almeida</option>
                  <option>Beatriz Santos</option>
                </select>
              </label>
              <label>
                Médico
                <select name="medico" required>
                  <option>Dra. Laura Costa — Clínica geral</option>
                  <option>Dr. Rafael Lima — Cardiologia</option>
                </select>
              </label>
              <label>
                Data
                <input name="data" type="date" required />
              </label>
              <label>
                Horário disponível
                <select name="horario" required>
                  <option>09:30</option>
                  <option>10:00</option>
                  <option>10:30</option>
                  <option>11:00</option>
                </select>
              </label>
              <label>
                Convênio
                <select name="convenio" required>
                  <option>Particular</option>
                  <option>Vida Saúde</option>
                  <option>Bem Cuidar</option>
                </select>
              </label>
              <label>
                Observações
                <textarea name="observacoes" required>
                </textarea>
              </label>
            </div>
            <div className="actions">
              <button type="submit">Simular agendamento</button>
            </div>
          </DemoForm>
        </section>
      </AppLayout>;
}
