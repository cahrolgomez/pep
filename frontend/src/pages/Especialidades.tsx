import { useState } from "react";
import { AppLayout } from "../layouts/AppLayout";
import { Cadastro, EstadoDados, Tabela } from "../components/Operacoes";
import { useDados } from "../hooks/useDados";
import { salvar, type Especialidade } from "../services/operacoes";

export default function Especialidades() {
  const [versao, setVersao] = useState(0);
  const lista = useDados<Especialidade[]>("especialidades", versao);
  return <AppLayout>
    <div className="page-heading"><h1>Especialidades</h1></div>
    <section className="card">
      <h2>Especialidades cadastradas</h2>
      <EstadoDados loading={lista.loading} error={lista.error} empty={lista.data?.length === 0 ? "Nenhuma especialidade cadastrada." : undefined} />
      {!!lista.data?.length && <Tabela colunas={["Especialidade", "Descrição", "Profissionais"]}>
        {lista.data.map(item => <tr key={item.id_especialidade}><td>{item.nome_especialidade}</td><td>{item.descricao ?? "—"}</td><td>{item.profissionais}</td></tr>)}
      </Tabela>}
    </section>
    <section className="card">
      <h2>Nova especialidade</h2>
      <Cadastro concluido={() => setVersao(v => v + 1)} enviar={fields => salvar("especialidades", {
        nome: fields.get("nome"), descricao: fields.get("descricao") || null,
      })}>
        <label>Nome da especialidade<input name="nome" required maxLength={100} /></label>
        <label>Descrição<input name="descricao" maxLength={500} /></label>
      </Cadastro>
    </section>
  </AppLayout>;
}
