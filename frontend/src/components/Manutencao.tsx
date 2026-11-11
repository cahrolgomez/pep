import { useState } from "react";
import { Cadastro, EstadoDados, Tabela } from "./Operacoes";
import { useDados } from "../hooks/useDados";
import { salvar, type Medico } from "../services/operacoes";

export const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export type Procedimento = {
  id_procedimento: string;
  nome: string;
  descricao: string | null;
  valor: number;
  status: string;
};

export function AcaoRegistro({ label, executar, atualizar }: {
  label: string;
  executar: () => Promise<unknown>;
  atualizar: () => void;
}) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  return <>
    <button type="button" disabled={salvando} onClick={async () => {
      setSalvando(true);
      setErro("");
      try {
        await executar();
        atualizar();
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Não foi possível atualizar o registro.");
      } finally {
        setSalvando(false);
      }
    }}>{label}</button>
    {erro && <p role="alert">{erro}</p>}
  </>;
}

export function AcaoStatus({ path, status, atualizar }: { path: string; status: string; atualizar: () => void }) {
  return <AcaoRegistro label={status === "ativo" ? "Desativar" : "Ativar"} atualizar={atualizar}
    executar={() => salvar(path, { status: status === "ativo" ? "inativo" : "ativo" }, "PATCH")} />;
}

export function Horarios({ medical = false }: { medical?: boolean }) {
  const [data, setData] = useState("");
  const [medico, setMedico] = useState("");
  const [versao, setVersao] = useState(0);
  const medicos = useDados<Medico[]>(medical ? null : "medicos");
  const params = new URLSearchParams({ data });
  if (medico) params.set("id_medico", medico);
  const horarios = useDados<{ id_disponibilidade: string; horario: string; medico: string; status: string }[]>(
    data ? "horarios?" + params : null, versao);
  const atualizar = () => setVersao(v => v + 1);
  return <section className="card">
    <h2>Disponibilidade de horários</h2>
    <EstadoDados loading={medicos.loading} error={medicos.error} />
    <Cadastro label="Liberar horário" disabled={!data || (!medical && !medico)}
      concluido={atualizar} enviar={fields => salvar("disponibilidades", {
        id_medico: medico || null, data, horario: fields.get("horario"),
      })}>
      {!medical && <label>Profissional<select value={medico} onChange={event => setMedico(event.target.value)} required>
        <option value="">Selecione</option>
        {medicos.data?.filter(item => item.status === "ativo").map(item => <option key={item.id_medico} value={item.id_medico}>{item.nome}</option>)}
      </select></label>}
      <label>Data<input type="date" required value={data} onChange={event => setData(event.target.value)} /></label>
      <label>Horário<input name="horario" type="time" required /></label>
    </Cadastro>
    <EstadoDados loading={horarios.loading} error={horarios.error} empty={horarios.data?.length === 0 ? "Nenhum horário nesta data." : undefined} />
    {!!horarios.data?.length && <Tabela colunas={["Horário", "Profissional", "Situação", "Ação"]}>
      {horarios.data.map(item => <tr key={item.id_disponibilidade}>
        <td>{item.horario.slice(0, 5)}</td><td>{item.medico}</td>
        <td>{{ disponivel: "Disponível", ocupado: "Ocupado", bloqueado: "Bloqueado" }[item.status] ?? item.status}</td>
        <td>{["disponivel", "bloqueado"].includes(item.status) && <AcaoRegistro
          label={item.status === "bloqueado" ? "Desbloquear" : "Bloquear"} atualizar={atualizar}
          executar={() => salvar("horarios/" + item.id_disponibilidade, { bloqueado: item.status === "disponivel" }, "PATCH")} />}</td>
      </tr>)}
    </Tabela>}
  </section>;
}

export function AdicionarProcedimento({ id, atualizar }: { id: string; atualizar: () => void }) {
  const [aberto, setAberto] = useState(false);
  const catalogo = useDados<Procedimento[]>(aberto ? "procedimentos" : null);
  const ativos = catalogo.data?.filter(item => item.status === "ativo") ?? [];
  return <details onToggle={event => setAberto(event.currentTarget.open)}>
    <summary>Adicionar procedimento</summary>
    <EstadoDados loading={catalogo.loading} error={catalogo.error}
      empty={catalogo.data && !ativos.length ? "Nenhum procedimento ativo." : undefined} />
    <Cadastro label="Adicionar" disabled={!ativos.length} concluido={atualizar}
      enviar={fields => salvar("consultas/" + id + "/procedimentos", {
        id_procedimento: fields.get("procedimento"), quantidade: Number(fields.get("quantidade")),
      })}>
      <label>Procedimento<select name="procedimento" required>
        <option value="">Selecione</option>
        {ativos.map(item => <option key={item.id_procedimento} value={item.id_procedimento}>{item.nome} · {moeda.format(Number(item.valor))}</option>)}
      </select></label>
      <label>Quantidade<input name="quantidade" type="number" min={1} max={999} step={1} defaultValue={1} required /></label>
    </Cadastro>
  </details>;
}

