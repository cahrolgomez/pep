import { useState } from "react";
import { AcaoStatus, type Procedimento } from "./Manutencao";
import { Cadastro, EstadoDados, Tabela } from "./Operacoes";
import { useDados } from "../hooks/useDados";
import { diaBr, salvar, type Plano } from "../services/operacoes";

type Carteirinha = {
  id_paciente_convenio: string;
  numero_carteirinha: string;
  validade: string | null;
  status: string;
  convenio: string;
  plano: string;
};

export default function Carteirinhas({ paciente, planos }: { paciente: string; planos: Plano[] }) {
  const [versao, setVersao] = useState(0);
  const [vinculo, setVinculo] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const path = "pacientes/" + paciente + "/carteirinhas";
  const lista = useDados<Carteirinha[]>(path, versao);
  const procedimentos = useDados<Procedimento[]>("procedimentos");
  const cobertura = useDados<{ coberto: boolean }>(vinculo && procedimento
    ? path + "/" + vinculo + "/cobertura?" + new URLSearchParams({ id_procedimento: procedimento }) : null, versao);
  const atualizar = () => setVersao(v => v + 1);

  return <section className="card">
    <h2>Carteirinhas do paciente</h2>
    <EstadoDados loading={lista.loading} error={lista.error} empty={lista.data?.length === 0 ? "Nenhuma carteirinha vinculada." : undefined} />
    {!!lista.data?.length && <Tabela colunas={["Convênio e plano", "Carteirinha", "Validade", "Situação", "Ação"]}>
      {lista.data.map(item => <tr key={item.id_paciente_convenio}>
        <td>{item.convenio} · {item.plano}</td><td>{item.numero_carteirinha}</td><td>{item.validade ? diaBr(item.validade) : "—"}</td><td>{item.status}</td>
        <td><AcaoStatus path={path + "/" + item.id_paciente_convenio + "/status"} status={item.status} atualizar={atualizar} /></td>
      </tr>)}
    </Tabela>}
    <h3>Vincular carteirinha</h3>
    <Cadastro label="Vincular" disabled={!planos.length} concluido={atualizar}
      enviar={fields => salvar(path, { ...Object.fromEntries(fields), validade: fields.get("validade") || null })}>
      <label>Plano<select name="id_plano" required>
        <option value="">Selecione</option>
        {planos.map(item => <option key={item.id_plano} value={item.id_plano}>{item.convenio} · {item.nome}</option>)}
      </select></label>
      <label>Número da carteirinha<input name="numero_carteirinha" required maxLength={80} /></label>
      <label>Validade<input name="validade" type="date" /></label>
    </Cadastro>
    <h3>Verificar cobertura atual</h3>
    <div className="form-grid">
      <label>Carteirinha<select value={vinculo} onChange={event => setVinculo(event.target.value)}>
        <option value="">Selecione</option>
        {lista.data?.map(item => <option key={item.id_paciente_convenio} value={item.id_paciente_convenio}>{item.plano} · {item.numero_carteirinha}</option>)}
      </select></label>
      <label>Procedimento<select value={procedimento} onChange={event => setProcedimento(event.target.value)}>
        <option value="">Selecione</option>
        {procedimentos.data?.filter(item => item.status === "ativo").map(item => <option key={item.id_procedimento} value={item.id_procedimento}>{item.nome}</option>)}
      </select></label>
    </div>
    <EstadoDados loading={cobertura.loading || procedimentos.loading} error={cobertura.error || procedimentos.error} />
    {cobertura.data && <p role="status">{cobertura.data.coberto ? "Procedimento coberto." : "Procedimento sem cobertura para esta carteirinha."}</p>}
  </section>;
}
