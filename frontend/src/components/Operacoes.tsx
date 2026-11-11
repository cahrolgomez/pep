import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { salvar } from "../services/operacoes";

export function EstadoDados({ loading, error, empty }: { loading: boolean; error?: string; empty?: string }) {
  if (error) return <p role="alert">{error}</p>;
  if (loading) return <p role="status">Carregando…</p>;
  return empty ? <p>{empty}</p> : null;
}

export function Tabela({ colunas, children }: { colunas: string[]; children: ReactNode }) {
  return <div className="table-wrap"><table>
    <thead><tr>{colunas.map(coluna => <th key={coluna} scope="col">{coluna}</th>)}</tr></thead>
    <tbody>{children}</tbody>
  </table></div>;
}

export function Cadastro({ children, enviar, concluido, label = "Salvar cadastro", disabled = false }: {
  children: ReactNode;
  enviar: (fields: FormData) => Promise<unknown>;
  concluido?: () => void;
  label?: string;
  disabled?: boolean;
}) {
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setFeedback("");
    setError(false);
    try {
      await enviar(new FormData(form));
      form.reset();
      concluido?.();
      setFeedback("Registro salvo.");
    } catch (err) {
      setError(true);
      setFeedback(err instanceof Error ? err.message : "Não foi possível salvar o registro.");
    } finally {
      setSaving(false);
    }
  }

  return <form onSubmit={submit}>
    <fieldset disabled={saving} className="form-grid">{children}</fieldset>
    <div className="actions"><button disabled={saving || disabled}>{saving ? "Salvando…" : label}</button></div>
    {feedback && <p className="feedback" role={error ? "alert" : "status"}>{feedback}</p>}
  </form>;
}

export function AcaoAgendamento({ id, status, atualizar }: { id: string; status: string; atualizar: () => void }) {
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  async function alterar(novo: string, motivo?: string) {
    setOcupado(true);
    setErro("");
    try {
      await salvar("agendamentos/" + id, { status: novo, motivo_cancelamento: motivo }, "PATCH");
      setCancelando(false);
      atualizar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível alterar a situação.");
    } finally {
      setOcupado(false);
    }
  }

  if (["cancelado", "realizado", "encerrado"].includes(status)) return null;
  return <div>
    {status === "pendente" && <button type="button" disabled={ocupado} onClick={() => alterar("confirmado")}>Confirmar</button>}
    {status !== "em_atendimento" && <button type="button" disabled={ocupado} onClick={() => alterar("em_atendimento")}>Iniciar</button>}
    {status === "em_atendimento"
      ? <button type="button" disabled={ocupado} onClick={() => alterar("realizado")}>Concluir</button>
      : <button type="button" disabled={ocupado} onClick={() => setCancelando(!cancelando)}>{cancelando ? "Voltar" : "Cancelar"}</button>}
    {cancelando && <form onSubmit={event => {
      event.preventDefault();
      void alterar("cancelado", String(new FormData(event.currentTarget).get("motivo")));
    }}>
      <label>Motivo do cancelamento<input name="motivo" required maxLength={500} /></label>
      <button disabled={ocupado}>Confirmar cancelamento</button>
    </form>}
    {erro && <p role="alert">{erro}</p>}
  </div>;
}
