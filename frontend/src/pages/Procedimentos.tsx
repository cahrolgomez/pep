import { useState } from "react";
import { AcaoStatus, moeda, type Procedimento } from "../components/Manutencao";
import { Cadastro, EstadoDados, Tabela } from "../components/Operacoes";
import { useDados } from "../hooks/useDados";
import { AppLayout } from "../layouts/AppLayout";
import { salvar } from "../services/operacoes";

function FormularioProcedimento({ item, atualizar }: { item?: Procedimento; atualizar: () => void }) {
  return <Cadastro concluido={atualizar} enviar={fields => salvar(
    item ? "procedimentos/" + item.id_procedimento : "procedimentos",
    { nome: fields.get("nome"), descricao: fields.get("descricao") || null, valor: fields.get("valor") },
    item ? "PUT" : "POST",
  )}>
    <label>Nome<input name="nome" required maxLength={150} defaultValue={item?.nome} /></label>
    <label>Descrição<input name="descricao" maxLength={500} defaultValue={item?.descricao ?? ""} /></label>
    <label>Valor (R$)<input name="valor" type="number" required min="0" max="9999999999.99" step="0.01" defaultValue={item?.valor} /></label>
  </Cadastro>;
}

export default function Procedimentos() {
  const [versao, setVersao] = useState(0);
  const lista = useDados<Procedimento[]>("procedimentos", versao);
  const atualizar = () => setVersao(v => v + 1);
  return <AppLayout>
    <div className="page-heading"><h1>Procedimentos</h1></div>
    <section className="card">
      <h2>Catálogo</h2>
      <EstadoDados loading={lista.loading} error={lista.error} empty={lista.data?.length === 0 ? "Nenhum procedimento cadastrado." : undefined} />
      {!!lista.data?.length && <Tabela colunas={["Nome", "Descrição", "Valor", "Situação", "Ações"]}>
        {lista.data.map(item => <tr key={item.id_procedimento}>
          <td>{item.nome}</td><td>{item.descricao ?? "—"}</td><td>{moeda.format(Number(item.valor))}</td><td>{item.status}</td>
          <td><AcaoStatus path={"procedimentos/" + item.id_procedimento + "/status"} status={item.status} atualizar={atualizar} />
            <details><summary>Editar procedimento</summary><FormularioProcedimento item={item} atualizar={atualizar} /></details>
          </td>
        </tr>)}
      </Tabela>}
    </section>
    <section className="card"><h2>Novo procedimento</h2><FormularioProcedimento atualizar={atualizar} /></section>
  </AppLayout>;
}
