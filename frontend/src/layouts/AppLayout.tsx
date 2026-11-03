import { NavLink, Link } from "react-router-dom";
import type { ReactNode } from "react";
const admin = [
  ["painel", "Visão geral"],
  ["agenda", "Agenda"],
  ["pacientes", "Pacientes"],
  ["medicos", "Médicos"],
  ["especialidades", "Especialidades"],
  ["convenios", "Convênios"],
  ["faturamento", "Faturamento"],
];
const doctor = [
  ["painel-medico", "Minha agenda"],
  ["historico", "Histórico do paciente"],
  ["prontuario", "Atendimento"],
];
export function AppLayout({
  medical = false,
  children,
}: {
  medical?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <aside className="sidebar">
        <Link className="brand sidebar-brand" to={medical ? "/painel-medico" : "/painel"}>
          <img src="/logo-pep.jpeg" alt="PEP - Prontuário Eletrônico do Paciente" />
        </Link>
        <nav aria-label="Navegação principal">
          {(medical ? doctor : admin).map(([path, label]) => (
            <NavLink
              key={path}
              to={"/" + path}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          Ambiente de demonstração
          <br />
          Dados inteiramente fictícios
          <br />
          <Link to="/">Sair da demonstração →</Link>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Clínica PEP{" "}
            <span className="muted">
              {" "}
              / {medical ? "Área médica" : "Área administrativa"}
            </span>
          </span>
          <span>
            <span className="avatar">{medical ? "LC" : "AC"}</span>
            {medical ? "Dra. Laura Costa" : "Ana · Administração"}
          </span>
        </header>
        <main id="conteudo">{children}</main>
      </div>
    </>
  );
}
