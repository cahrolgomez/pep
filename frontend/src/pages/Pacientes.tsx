import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { apiRequest } from "../services/api";

type Paciente = {
  id_paciente: string;
  nome: string;
  cpf_mascarado: string;
  telefone: string | null;
  convenios: string | null;
};

export default function Pacientes() {
 const [search, setSearch] = useState("");
 const [pacientes, setPacientes] = useState<Paciente[]>([]);
 const [erro, setErro] = useState("");
 const [carregando, setCarregando] = useState(true);

 useEffect(() => {
   const controller = new AbortController();
   setCarregando(true);
   setErro("");

   const timer = window.setTimeout(async () => {
     try {
       const params = new URLSearchParams({ q: search.trim() });
       const dados = await apiRequest<Paciente[]>(`pacientes?${params}`, {
         signal: controller.signal,
       });
       if (!controller.signal.aborted) setPacientes(dados);
     } catch {
       if (!controller.signal.aborted) {
         setPacientes([]);
         setErro("Não foi possível carregar os pacientes.");
       }
     } finally {
       if (!controller.signal.aborted) setCarregando(false);
     }
   }, 300);

   return () => {
     window.clearTimeout(timer);
     controller.abort();
   };
 }, [search]);

 return <AppLayout medical={false}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Pacientes</h1>
            <p>Dados cadastrais organizados para um atendimento mais próximo.</p>
          </div>
          <Link className="button" to="/novo-paciente">+ Novo paciente</Link>
        </div>
        <section className="card">
          <h2>Todos os pacientes</h2>
          <label>
            Buscar por nome ou CPF
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Digite para buscar" />
          </label>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    Paciente
                  </th>
                  <th scope="col">
                    CPF
                  </th>
                  <th scope="col">
                    Convênio
                  </th>
                  <th scope="col">
                    Contato
                  </th>
                  <th scope="col">Ação</th>
                </tr>
              </thead>
              <tbody>
                {carregando && <tr><td colSpan={5} role="status">Buscando pacientes...</td></tr>}
                {erro && <tr><td colSpan={5} role="alert">{erro}</td></tr>}
                {!carregando && !erro && pacientes.length === 0 && (
                  <tr><td colSpan={5}>Nenhum paciente encontrado.</td></tr>
                )}
                {!carregando && pacientes.map((paciente) => (
                  <tr key={paciente.id_paciente}>
                    <td>{paciente.nome}</td>
                    <td>{paciente.cpf_mascarado}</td>
                    <td>{paciente.convenios ?? "Particular"}</td>
                    <td>{paciente.telefone ?? "—"}</td>
                    <td><Link to={"/historico?paciente=" + paciente.id_paciente}>Ver histórico</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </AppLayout>;
}
