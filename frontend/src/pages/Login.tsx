import { Link } from "react-router-dom";
import { DemoForm } from "../components/Demo";
export default function Login() { return <>
    <main className="login" style={{"padding": "0", "maxWidth": "none", "margin": "0"}}>
      <section className="login-story">
        <Link to="/" className="brand"><span className="mark" aria-hidden="true">+</span> pep.</Link>
        <p className="eyebrow" style={{"color": "#b9d9cd"}}>Prontuário eletrônico do paciente</p>
        <h1>Mais conexão.<br />Mais cuidado.</h1>
        <p>Uma rotina mais leve para a clínica. Uma história de cuidado mais completa para cada paciente.</p>
        <small style={{"color": "#b9d9cd"}}>PEP · Projeto Banco de Dados II · UFAL</small>
      </section>
      <section className="login-form" aria-labelledby="login-title">
        <DemoForm id="login-form">
          <p className="eyebrow">Bem-vindo ao PEP</p>
          <h1 id="login-title">Seu espaço de cuidado.</h1>
          <p className="muted">Escolha um perfil para conhecer as telas.</p>
          <label>
            E-mail
            <input type="email" name="email" autoComplete="username" placeholder="voce@clinica.com.br" required />
          </label>
          <label>
            Senha
            <input type="password" name="senha" autoComplete="current-password" minLength={6} required />
          </label>
          <label>
            Perfil de demonstração
            <select name="perfil">
              <option value="painel">Administrativo</option>
              <option value="painel-medico">Médico</option>
            </select>
          </label>
          <button type="submit">Entrar na demonstração →</button>
          <small>Protótipo visual sem autenticação. Use um e-mail fictício e qualquer senha de 6 caracteres. Não informe credenciais reais.</small>
        </DemoForm>
      </section>
    </main>
  </>; }
