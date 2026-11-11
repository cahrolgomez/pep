import { useState } from "react";
import { AppLayout } from "../layouts/AppLayout";
import { Cadastro, EstadoDados, Tabela } from "../components/Operacoes";
import { AcaoStatus } from "../components/Manutencao";
import { useDados } from "../hooks/useDados";
import { salvar, type Especialidade } from "../services/operacoes";

export default function Especialidades() {
  const [versao, setVersao] = useState(0);
  const lista = useDados<Especialidade[]>("especialidades", versao);
  const atualizar = () => setVersao(v => v + 1);
  return <AppLayout>
    <div className="page-heading"><h1>Especialidades</h1></div>
    <section className="card">
      <h2>Especialidades cadastradas</h2>
      <EstadoDados loading={lista.loading} error={lista.error} empty={lista.data?.length === 0 ? "Nenhuma especialidade cadastrada." : undefined} />
      {!!lista.data?.length && <Tabela colunas={["Especialidade", "Descrição", "Profissionais", "Situação", "Ações"]}>
        {lista.data.map(item => <tr key={item.id_especialidade}>
          <td>{item.nome_especialidade}</td><td>{item.descricao ?? "—"}</td><td>{item.profissionais}</td><td>{item.status}</td>
          <td><AcaoStatus path={"especialidades/" + item.id_especialidade + "/status"} status={item.status} atualizar={atualizar} />
            <details><summary>Editar especialidade</summary>
              <Cadastro concluido={atualizar} enviar={fields => salvar("especialidades/" + item.id_especialidade, {
                nome: fields.get("nome"), descricao: fields.get("descricao") || null,
              }, "PUT")}>
                <label>Nome<input name="nome" defaultValue={item.nome_especialidade} required maxLength={100} /></label>
                <label>Descrição<input name="descricao" defaultValue={item.descricao ?? ""} maxLength={500} /></label>
              </Cadastro>
            </details>
          </td>
        </tr>)}
      </Tabela>}
    </section>
    <section className="card">
      <h2>Nova especialidade</h2>
      <Cadastro concluido={atualizar} enviar={fields => salvar("especialidades", {
        nome: fields.get("nome"), descricao: fields.get("descricao") || null,
      })}>
        <label>Nome da especialidade<input name="nome" required maxLength={100} /></label>
        <label>Descrição<input name="descricao" maxLength={500} /></label>
      </Cadastro>
    </section>
  </AppLayout>;
}
