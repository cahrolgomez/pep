import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DemoForm, SearchBody } from "../components/Demo";
export default function NovoPaciente() {
 const search = "";
 return <AppLayout medical={false}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Cadastrar paciente</h1>
            <p>Preencha os dados de identificação e contato.</p>
          </div>
        </div>
        <section className="card">
          <h2>Identificação e contato</h2>
          <DemoForm demo>
            <div className="form-grid">
              <label>
                Nome completo
                <input name="nome" type="text" required />
              </label>
              <label>
                CPF
                <input name="cpf" type="text" required />
              </label>
              <label>
                Data de nascimento
                <input name="nascimento" type="date" required />
              </label>
              <label>
                Telefone
                <input name="telefone" type="tel" required />
              </label>
              <label>
                E-mail
                <input name="email" type="email" required />
              </label>
              <label>
                Endereço
                <input name="endereco" type="text" required />
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
                Número da carteirinha
                <input name="carteirinha" type="text" required />
              </label>
            </div>
            <div className="actions">
              <button type="submit">Salvar cadastro</button>
            </div>
          </DemoForm>
        </section>
        <p className="muted">A regularidade do CPF deverá ser consultada pela integração do sistema; esta tela não realiza essa verificação.</p>
      </AppLayout>;
}
