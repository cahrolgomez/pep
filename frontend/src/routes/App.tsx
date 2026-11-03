import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "../pages/Login";
import Agenda from "../pages/Agenda";
import Convenios from "../pages/Convenios";
import Especialidades from "../pages/Especialidades";
import Faturamento from "../pages/Faturamento";
import Historico from "../pages/Historico";
import Medicos from "../pages/Medicos";
import NovoAgendamento from "../pages/NovoAgendamento";
import NovoPaciente from "../pages/NovoPaciente";
import Pacientes from "../pages/Pacientes";
import PainelMedico from "../pages/PainelMedico";
import Painel from "../pages/Painel";
import Prontuario from "../pages/Prontuario";
export default function App() { return <BrowserRouter><Routes><Route path="/" element={<Login />} /><Route path="/agenda" element={<Agenda />} /><Route path="/convenios" element={<Convenios />} /><Route path="/especialidades" element={<Especialidades />} /><Route path="/faturamento" element={<Faturamento />} /><Route path="/historico" element={<Historico />} /><Route path="/medicos" element={<Medicos />} /><Route path="/novo-agendamento" element={<NovoAgendamento />} /><Route path="/novo-paciente" element={<NovoPaciente />} /><Route path="/pacientes" element={<Pacientes />} /><Route path="/painel-medico" element={<PainelMedico />} /><Route path="/painel" element={<Painel />} /><Route path="/prontuario" element={<Prontuario />} /><Route path="*" element={<main><h1>Página não encontrada</h1><Link to="/">Voltar ao início</Link></main>} /></Routes></BrowserRouter>;}
