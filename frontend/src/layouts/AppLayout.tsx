import { NavLink, Link } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

type Usuario = { id_usuario: string; name: string };
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
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [erroUsuario, setErroUsuario] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<Usuario>("auth/me", { signal: controller.signal })
      .then(user => {
        if (!controller.signal.aborted) setUsuario(user);
      })
      .catch(() => {
        if (!controller.signal.aborted) setErroUsuario(true);
      });
    return () => controller.abort();
  }, []);

  const iniciais = usuario?.name.trim().split(/\s+/)
    .filter(Boolean).slice(0, 2).map(parte => parte[0]).join("").toLocaleUpperCase("pt-BR");

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
          <span className="user">
            <span className="avatar" aria-hidden="true">{iniciais || "…"}</span>
            {usuario?.name ?? (erroUsuario ? "Não foi possível carregar o usuário" : "Carregando usuário…")}
          </span>
        </header>
        <main id="conteudo">{children}</main>
      </div>
    </>
  );
}
