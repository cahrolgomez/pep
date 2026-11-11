import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { Cadastro, EstadoDados } from "../components/Operacoes";
import Carteirinhas from "../components/Carteirinhas";
import { useDados } from "../hooks/useDados";
import { salvar, type Plano } from "../services/operacoes";

type DadosPaciente = {
  nome: string; cpf: string; data_nascimento: string | null;
  telefone: string | null; email: string | null; endereco: string | null;
};

export default function NovoPaciente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const path = id ? "pacientes/" + id : "pacientes";
  const paciente = useDados<DadosPaciente>(id ? path : null);
  const planos = useDados<Plano[]>("planos");
  const [plano, setPlano] = useState("");
  const dados = paciente.data;

  return <AppLayout>
    <div className="page-heading"><h1>{id ? "Editar paciente" : "Cadastrar paciente"}</h1></div>
    <EstadoDados loading={paciente.loading || planos.loading} error={paciente.error || planos.error} />
    {(!id || dados) && <section className="card">
      <h2>Identificação e contato</h2>
      <Cadastro key={path} concluido={() => navigate("/pacientes")} enviar={fields => salvar(path, {
        nome: fields.get("nome"),
        cpf: String(fields.get("cpf")).replace(/[.\-\s]/g, ""),
        data_nascimento: fields.get("data_nascimento") || null,
        telefone: fields.get("telefone") || null,
        email: fields.get("email") || null,
        endereco: fields.get("endereco") || null,
        ...(!id && { id_plano: plano || null, numero_carteirinha: fields.get("carteirinha") || null, validade: fields.get("validade") || null }),
      }, id ? "PUT" : "POST")}>
        <label>Nome completo<input name="nome" defaultValue={dados?.nome} required maxLength={150} /></label>
        <label>CPF<input name="cpf" defaultValue={dados?.cpf} required inputMode="numeric" maxLength={14} /></label>
        <label>Data de nascimento<input name="data_nascimento" defaultValue={dados?.data_nascimento ?? ""} type="date" required={!id} /></label>
        <label>Telefone<input name="telefone" defaultValue={dados?.telefone ?? ""} type="tel" maxLength={20} /></label>
        <label>E-mail<input name="email" defaultValue={dados?.email ?? ""} type="email" maxLength={255} /></label>
        <label>Endereço<input name="endereco" defaultValue={dados?.endereco ?? ""} maxLength={255} /></label>
        {!id && <label>Plano<select value={plano} onChange={event => setPlano(event.target.value)}>
          <option value="">Particular</option>
          {planos.data?.map(item => <option key={item.id_plano} value={item.id_plano}>{item.convenio} · {item.nome}</option>)}
        </select></label>}
        {!id && plano && <>
          <label>Número da carteirinha<input name="carteirinha" required maxLength={80} /></label>
          <label>Validade da carteirinha<input name="validade" type="date" /></label>
        </>}
      </Cadastro>
    </section>}
    {id && dados && <Carteirinhas key={id} paciente={id} planos={planos.data ?? []} />}
  </AppLayout>;
}
