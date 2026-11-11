import { useState } from "react";
import { AppLayout } from "../layouts/AppLayout";
import { Cadastro, EstadoDados, Tabela } from "../components/Operacoes";
import { AcaoStatus, type Procedimento } from "../components/Manutencao";
import { useDados } from "../hooks/useDados";
import { salvar, type Convenio, type Plano } from "../services/operacoes";

export default function Convenios() {
  const [versao, setVersao] = useState(0);
  const convenios = useDados<Convenio[]>("convenios", versao);
  const planos = useDados<Plano[]>("planos?incluir_inativos=true", versao);
  const procedimentos = useDados<Procedimento[]>("procedimentos");
  const atualizar = () => setVersao(v => v + 1);
  return <AppLayout>
    <div className="page-heading"><h1>Convênios</h1></div>
    <section className="card">
      <h2>Convênios cadastrados</h2>
      <EstadoDados loading={convenios.loading} error={convenios.error} empty={convenios.data?.length === 0 ? "Nenhum convênio cadastrado." : undefined} />
      {!!convenios.data?.length && <Tabela colunas={["Convênio", "CNPJ", "Telefone", "E-mail", "Situação", "Ação"]}>
        {convenios.data.map(item => <tr key={item.id_convenio}><td>{item.nome}</td><td>{item.cnpj}</td><td>{item.telefone ?? "—"}</td><td>{item.email ?? "—"}</td><td>{item.status}</td>
          <td><AcaoStatus path={"convenios/" + item.id_convenio + "/status"} status={item.status} atualizar={atualizar} /></td></tr>)}
      </Tabela>}
    </section>
    <section className="card">
      <h2>Novo convênio</h2>
      <Cadastro concluido={atualizar} enviar={fields => salvar("convenios", {
        nome: fields.get("nome"), cnpj: String(fields.get("cnpj")).replace(/[.\/\-\s]/g, ""),
        telefone: fields.get("telefone") || null, email: fields.get("email") || null,
      })}>
        <label>Nome<input name="nome" required maxLength={150} /></label>
        <label>CNPJ<input name="cnpj" required maxLength={18} inputMode="numeric" /></label>
        <label>Telefone<input name="telefone" type="tel" maxLength={20} /></label>
        <label>E-mail<input name="email" type="email" maxLength={255} /></label>
      </Cadastro>
    </section>
    <section className="card">
      <h2>Planos cadastrados</h2>
      <EstadoDados loading={planos.loading} error={planos.error} empty={planos.data?.length === 0 ? "Nenhum plano cadastrado." : undefined} />
      {!!planos.data?.length && <Tabela colunas={["Convênio", "Plano", "Cobertura", "Situação", "Ações"]}>
        {planos.data.map(item => <tr key={item.id_plano}><td>{item.convenio}</td><td>{item.nome}</td><td>{item.cobertura ?? "—"}</td><td>{item.status}</td>
          <td><AcaoStatus path={"planos/" + item.id_plano + "/status"} status={item.status} atualizar={atualizar} />
            <details><summary>Editar cobertura</summary>
              <EstadoDados loading={procedimentos.loading} error={procedimentos.error} />
              <Cadastro concluido={atualizar} disabled={procedimentos.loading || !!procedimentos.error}
                enviar={fields => salvar("planos/" + item.id_plano + "/cobertura", {
                  cobertura: fields.get("cobertura") || null, procedimentos: fields.getAll("procedimento"),
                }, "PUT")}>
                <label>Descrição da cobertura<input name="cobertura" defaultValue={item.cobertura ?? ""} maxLength={500} /></label>
                <fieldset><legend>Procedimentos cobertos</legend>
                  {procedimentos.data?.filter(proc => proc.status === "ativo" || item.procedimentos.includes(proc.id_procedimento)).map(proc =>
                    <label key={proc.id_procedimento}><input type="checkbox" name="procedimento" value={proc.id_procedimento}
                      defaultChecked={item.procedimentos.includes(proc.id_procedimento)} />{proc.nome}{proc.status !== "ativo" && " (inativo)"}</label>)}
                </fieldset>
              </Cadastro>
            </details>
          </td></tr>)}
      </Tabela>}
      <h3>Novo plano</h3>
      <Cadastro concluido={atualizar} disabled={!convenios.data?.some(item => item.status === "ativo")}
        enviar={fields => salvar("planos", { ...Object.fromEntries(fields), cobertura: fields.get("cobertura") || null })}>
        <label>Convênio<select name="id_convenio" required>
          <option value="">Selecione</option>
          {convenios.data?.filter(item => item.status === "ativo").map(item => <option key={item.id_convenio} value={item.id_convenio}>{item.nome}</option>)}
        </select></label>
        <label>Nome do plano<input name="nome" required maxLength={150} /></label>
        <label>Cobertura<input name="cobertura" maxLength={500} /></label>
      </Cadastro>
    </section>
  </AppLayout>;
}
