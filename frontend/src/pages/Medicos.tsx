import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiRequest } from "../services/api";
import { AppLayout } from "../layouts/AppLayout";
import { useDados } from "../hooks/useDados";
import type { Especialidade } from "../services/operacoes";
type Medico = {
 id_medico: string;
 nome: string;
 crm: string;
 especialidades: string | null;
 status: string;
};
export default function Medicos() {
 const [feedback, setFeedback] = useState("");
 const [saving, setSaving] = useState(false);

 const [medicos, setMedicos] = useState<Medico[]>([]);
 const [listStatus, setListStatus] = useState("Carregando profissionais…");
 const [listVersion, setListVersion] = useState(0);
 const especialidades = useDados<Especialidade[]>("especialidades");

 useEffect(() => {
  const controller = new AbortController();
  apiRequest<Medico[]>("medicos", { signal: controller.signal })
   .then(rows => {
    if (controller.signal.aborted) return;
    setMedicos(rows);
    setListStatus("");
   })
   .catch(() => {
    if (!controller.signal.aborted) setListStatus("Não foi possível carregar os profissionais.");
   });
  return () => controller.abort();
 }, [listVersion]);

 async function cadastrar(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = new FormData(form);
  setSaving(true);
  setFeedback("");
  try {
   await apiRequest("usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     perfil: "medico",
     name: fields.get("nome"),
     cpf: fields.get("cpf"),
     crm: String(fields.get("crm")).trim() + "-" + fields.get("uf"),
     email: fields.get("email"),
     senha: fields.get("senha"),
     telefone: fields.get("telefone"),
     id_especialidade: fields.get("especialidade") ? Number(fields.get("especialidade")) : null,
    }),
   });
   form.reset();
   setListStatus("Atualizando profissionais…");
   setListVersion(version => version + 1);
   setFeedback("Médico cadastrado.");
  } catch (error) {
   setFeedback(error instanceof Error ? error.message : "Não foi possível cadastrar o médico.");
  } finally {
   setSaving(false);
  }
 }
 return <AppLayout medical={false}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuidado em cada detalhe</p>
            <h1>Equipe médica</h1>
            <p>Profissionais e especialidades da clínica.</p>
          </div>
        </div>
        <section className="card">
          <h2>Profissionais cadastrados</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    Profissional
                  </th>
                  <th scope="col">
                    CRM / UF
                  </th>
                  <th scope="col">
                    Especialidade
                  </th>
                  <th scope="col">
                    Situação
                  </th>
                </tr>
              </thead>
              <tbody>
                {listStatus || medicos.length === 0 ? (
                  <tr><td colSpan={4}>{listStatus || "Nenhum profissional cadastrado."}</td></tr>
                ) : medicos.map(medico => (
                  <tr key={medico.id_medico}>
                    <td>{medico.nome}</td>
                    <td>{medico.crm}</td>
                    <td>{medico.especialidades ?? "—"}</td>
                    <td>{medico.status === "ativo" ? "Ativo" : "Inativo"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="card">
          <h2>Cadastrar profissional</h2>
          <form onSubmit={cadastrar}>
            <div className="form-grid">
              <label>
                Nome completo
                <input name="nome" type="text" maxLength={150} required />
              </label>
              <label>
                CRM
                <input name="crm" type="text" maxLength={27} required />
              </label>
              <label>
                UF do CRM
                <select name="uf" required>
                  <option>AL</option>
                  <option>SE</option>
                  <option>PE</option>
                  <option>BA</option>
                </select>
              </label>
              <label>
                CPF (11 dígitos)
                <input name="cpf" type="text" inputMode="numeric" pattern="[0-9]{11}" required />
              </label>
              <label>
                Senha inicial
                <input name="senha" type="password" minLength={8} maxLength={128} autoComplete="new-password" required />
              </label>
              <label>
                E-mail
                <input name="email" type="email" maxLength={255} required />
              </label>
              <label>
                Telefone
                <input name="telefone" type="tel" maxLength={20} required />
              </label>
              <label>Especialidade<select name="especialidade">
                <option value="">Selecione, se aplicável</option>
                {especialidades.data?.map(item => <option key={item.id_especialidade} value={item.id_especialidade}>{item.nome_especialidade}</option>)}
              </select></label>
            </div>
            {especialidades.error && <p role="alert">{especialidades.error}</p>}
            <div className="actions">
              <button type="submit" disabled={saving}>Salvar cadastro</button>
            </div>
          <p className="feedback" role="status">{feedback}</p>
          </form>
        </section>
      </AppLayout>;
}
