import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { Cadastro, EstadoDados, Tabela } from "../components/Operacoes";
import { AcaoRegistro, AdicionarProcedimento, moeda } from "../components/Manutencao";
import { useDados } from "../hooks/useDados";
import { diaBr, salvar, type Convenio } from "../services/operacoes";

type Atendimento = {
  id_consulta: string;
  data: string;
  paciente: string;
  convenio: string | null;
  id_faturamento: string | null;
  valor_total: number | null;
  valor_procedimentos: number | null;
  procedimentos: string | null;
  status: string | null;
  motivo_cancelamento: string | null;
};

export default function Faturamento() {
  const [params, setParams] = useSearchParams();
  const [versao, setVersao] = useState(0);
  const [consulta, setConsulta] = useState("");
  const convenios = useDados<Convenio[]>("convenios");
  const faturamento = useDados<Atendimento[]>("faturamento?" + params, versao);
  const lista = faturamento.data ?? [];
  const faturaveis = lista.filter(item => !item.id_faturamento && item.valor_procedimentos != null);
  const selecionado = faturaveis.find(item => item.id_consulta === consulta);
  const pendentes = lista.filter(item => !item.id_faturamento || item.status === "pendente");
  const vigentes = lista.filter(item => item.status !== "cancelado");
  const total = (itens: Atendimento[]) => moeda.format(itens.reduce((centavos, item) => centavos + Math.round(Number(item.valor_total ?? 0) * 100), 0) / 100);
  const atualizar = () => setVersao(v => v + 1);

  return <AppLayout>
    <div className="page-heading"><h1>Faturamento</h1></div>
    <section className="card">
      <h2>Período de referência</h2>
      <form className="toolbar" onSubmit={event => {
        event.preventDefault();
        const campos = new FormData(event.currentTarget);
        const filtros = new URLSearchParams();
        for (const key of ["inicio", "fim"]) {
          const valor = campos.get(key);
          if (valor) filtros.set(key, String(valor));
        }
        const convenio = campos.get("convenio");
        if (convenio === "particular") filtros.set("particular", "true");
        else if (convenio) filtros.set("id_convenio", String(convenio));
        setParams(filtros);
        setConsulta("");
      }}>
        <label>De<input name="inicio" type="date" defaultValue={params.get("inicio") ?? ""} /></label>
        <label>Até<input name="fim" type="date" defaultValue={params.get("fim") ?? ""} /></label>
        <label>Convênio<select name="convenio" key={String(convenios.loading)} defaultValue={params.get("id_convenio") ?? (params.has("particular") ? "particular" : "")}>
          <option value="">Todos</option><option value="particular">Particular</option>
          {convenios.data?.map(item => <option key={item.id_convenio} value={item.id_convenio}>{item.nome}</option>)}
        </select></label>
        <button>Consultar período</button>
      </form>
      <EstadoDados loading={convenios.loading} error={convenios.error} />
    </section>
    <EstadoDados loading={faturamento.loading} error={faturamento.error} />
    {faturamento.data && <>
      <div className="stats">
        <article className="card stat"><span className="muted">Total faturado</span><strong>{total(vigentes)}</strong></article>
        <article className="card stat"><span className="muted">Convênios</span><strong>{total(vigentes.filter(item => item.convenio))}</strong></article>
        <article className="card stat"><span className="muted">Particular</span><strong>{total(vigentes.filter(item => !item.convenio))}</strong></article>
        <article className="card stat"><span className="muted">Atendimentos pendentes</span><strong>{pendentes.length}</strong></article>
      </div>
      <section className="card">
        <h2>Atendimentos para faturamento</h2>
        {lista.length ? <Tabela colunas={["Data", "Paciente", "Convênio", "Procedimentos", "Valor faturado", "Situação", "Ação"]}>
          {lista.map(item => <tr key={item.id_consulta}>
            <td>{diaBr(item.data)}</td><td>{item.paciente}</td><td>{item.convenio ?? "Particular"}</td><td>{item.procedimentos ?? "—"}</td>
            <td>{item.valor_total == null ? "—" : moeda.format(Number(item.valor_total))}</td>
            <td>{item.status === "pago" ? "Pago" : item.status === "pendente" ? "Aguardando pagamento" : item.status === "cancelado" ? "Cancelado" : item.status ?? "A faturar"}
              {item.motivo_cancelamento && <p className="muted">{item.motivo_cancelamento}</p>}</td>
            <td>{!item.id_faturamento && <AdicionarProcedimento id={item.id_consulta} atualizar={atualizar} />}
              {item.id_faturamento && item.status === "pendente" && <>
                <AcaoRegistro label="Registrar pagamento" atualizar={atualizar}
                  executar={() => salvar("faturamento/" + item.id_faturamento + "/pagamento", {}, "PATCH")} />
                <details><summary>Cancelar cobrança</summary>
                  <Cadastro label="Confirmar cancelamento" concluido={atualizar}
                    enviar={fields => salvar("faturamento/" + item.id_faturamento + "/cancelamento", { motivo: fields.get("motivo") }, "PATCH")}>
                    <label>Motivo<input name="motivo" required maxLength={500} /></label>
                  </Cadastro>
                </details>
              </>}</td>
          </tr>)}
        </Tabela> : <p>Nenhum atendimento encontrado.</p>}
      </section>
      <section className="card">
        <h2>Registrar faturamento</h2>
        <Cadastro label="Registrar faturamento" disabled={!selecionado} concluido={() => { setConsulta(""); atualizar(); }}
          enviar={fields => salvar("faturamento", { id_consulta: consulta, forma_pagamento: fields.get("forma") })}>
          <label>Atendimento concluído<select required value={consulta} onChange={event => setConsulta(event.target.value)}>
            <option value="">Selecione</option>
            {faturaveis.map(item => <option key={item.id_consulta} value={item.id_consulta}>
              {item.paciente} · {diaBr(item.data)} · {item.convenio ?? "Particular"}
            </option>)}
          </select></label>
          <label>Total dos procedimentos<input value={selecionado ? moeda.format(Number(selecionado.valor_procedimentos)) : ""} readOnly /></label>
          <label>Forma de pagamento<select key={consulta} name="forma" required>
            {selecionado?.convenio ? <option value="convenio">Convênio</option> : <>
              <option value="pix">Pix</option><option value="cartao">Cartão</option><option value="dinheiro">Dinheiro</option>
            </>}
          </select></label>
        </Cadastro>
      </section>
      <section className="card">
        <h2>Conferência do período</h2>
        <p>{total(lista.filter(item => item.status === "pago"))} recebidos · {total(lista.filter(item => item.status === "pendente"))} a receber</p>
        <p>{lista.filter(item => !item.id_faturamento).length} atendimentos aguardando faturamento.</p>
      </section>
    </>}
  </AppLayout>;
}
