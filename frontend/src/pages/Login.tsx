import { useState } from "react";
import { Link } from "react-router-dom";
import { DemoForm } from "../components/Demo";
export default function Login() {
  const [perfil, setPerfil] = useState("");
  return (
    <>
      <main className="login">
        <section className="login-story">
          <Link to="/" className="brand">
            <img src="/pep_logo_fundo_verde.png" alt="PEP - Prontuário Eletrônico do Paciente" />
          </Link>
          <p className="eyebrow remove-eyebrow" style={{ color: "#b9d9cd" }}>
            Prontuário eletrônico do paciente
          </p>
          <h1>
            Mais conexão.
            <br />
            Mais cuidado.
          </h1>
          <p>
            Uma rotina mais leve para a clínica. Uma história de cuidado mais
            completa para cada paciente.
          </p>
        </section>
        <section className="login-form" aria-labelledby="login-title">
          <DemoForm id="login-form">
            <p className="eyebrow">Faça login</p>
            <h1 id="login-title">Bem-vindo ao PEP</h1>
            <label>
              E-mail
              <input
                type="email"
                name="email"
                autoComplete="username"
                placeholder="voce@clinica.com.br"
                required
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                name="senha"
                autoComplete="current-password"
                minLength={6}
                required
              />
            </label>
            <input type="hidden" name="perfil" value={perfil} />
            <label id="perfil-label">Escolha um perfil.</label>
            <div className="button-group" role="group" aria-labelledby="perfil-label">
              <button type="button" aria-pressed={perfil === "painel"} onClick={() => setPerfil("painel")}>Administrativo</button>
              <button type="button" aria-pressed={perfil === "painel-medico"} onClick={() => setPerfil("painel-medico")}>Médico</button>
            </div>
            <button type="submit" disabled={!perfil}>Entrar</button>
          </DemoForm>
        </section>
      </main>
    </>
  );
}
