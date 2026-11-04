import { NavLink, Link } from "react-router-dom";
import type { ReactNode } from "react";
const admin = [
  ["painel", "Visão geral", "/icones/dashboard-svgrepo-com.svg"],
  ["agenda", "Agenda", "/icones/agenda-handbook-note-svgrepo-com.svg"],
  ["pacientes", "Pacientes", "/icones/patient-svgrepo-com.svg"],
  ["medicos", "Médicos", "/icones/doctor-svgrepo-com.svg"],
  ["especialidades", "Especialidades", "/icones/medical-medicine-health-3-svgrepo-com.svg"],
  ["convenios", "Convênios", "/icones/health-insurance-finance-svgrepo-com.svg"],
  ["faturamento", "Faturamento", "/icones/invoice-bill-svgrepo-com.svg"],
];
const doctor = [
  ["painel-medico", "Minha agenda", "/icones/agenda-handbook-note-svgrepo-com.svg"],
  ["historico", "Histórico do paciente", "/icones/user-history-svgrepo-com.svg"],
  ["prontuario", "Atendimento", "/icones/service-svgrepo-com.svg"],
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
        <Link className="sidebar-brand" to={medical ? "/painel-medico" : "/painel"}>
          <img src="/logo-pep.jpeg" alt="PEP - Prontuário Eletrônico do Paciente" />
        </Link>
        <nav aria-label="Navegação principal">
          {(medical ? doctor : admin).map(([path, label, icon]) => (
            <NavLink key={path} to={"/" + path} className={({ isActive }) => (isActive ? "active" : "")}>
              {icon && <img src={icon} alt={label} className="sidebar-icon" />}
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
