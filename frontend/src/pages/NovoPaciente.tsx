import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { Cadastro, EstadoDados } from "../components/Operacoes";
import { useDados } from "../hooks/useDados";
import { salvar, type Plano } from "../services/operacoes";

export default function NovoPaciente() {
  const navigate = useNavigate();
  const planos = useDados<Plano[]>("planos");
  const [plano, setPlano] = useState("");

  return <AppLayout>
    <div className="page-heading"><h1>Cadastrar paciente</h1></div>
    <section className="card">
      <h2>Identificação e contato</h2>
      <EstadoDados loading={planos.loading} error={planos.error} />
      <Cadastro concluido={() => navigate("/pacientes")} enviar={fields => salvar("pacientes", {
        nome: fields.get("nome"),
        cpf: String(fields.get("cpf")).replace(/[.\-\s]/g, ""),
        data_nascimento: fields.get("data_nascimento") || null,
        telefone: fields.get("telefone") || null,
        email: fields.get("email") || null,
        endereco: fields.get("endereco") || null,
        id_plano: plano || null,
        numero_carteirinha: fields.get("carteirinha") || null,
        validade: fields.get("validade") || null,
      })}>
        <label>Nome completo<input name="nome" required maxLength={150} /></label>
        <label>CPF<input name="cpf" required inputMode="numeric" maxLength={14} /></label>
        <label>Data de nascimento<input name="data_nascimento" type="date" required /></label>
        <label>Telefone<input name="telefone" type="tel" maxLength={20} /></label>
        <label>E-mail<input name="email" type="email" maxLength={255} /></label>
        <label>Endereço<input name="endereco" maxLength={255} /></label>
        <label>Plano<select value={plano} onChange={event => setPlano(event.target.value)}>
          <option value="">Particular</option>
          {planos.data?.map(item => <option key={item.id_plano} value={item.id_plano}>{item.convenio} · {item.nome}</option>)}
        </select></label>
        {plano && <>
          <label>Número da carteirinha<input name="carteirinha" required maxLength={80} /></label>
          <label>Validade da carteirinha<input name="validade" type="date" /></label>
        </>}
      </Cadastro>
    </section>
  </AppLayout>;
}
