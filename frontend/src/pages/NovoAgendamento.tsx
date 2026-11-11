import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { Cadastro, EstadoDados } from "../components/Operacoes";
import { useDados } from "../hooks/useDados";
import { salvar, type Medico, type Paciente } from "../services/operacoes";

type Horario = { id_disponibilidade: string; horario: string };
type Vinculo = { id_paciente_convenio: string; convenio: string; plano: string };

export default function NovoAgendamento() {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState("");
  const [busca, setBusca] = useState("");
  const [medico, setMedico] = useState("");
  const [data, setData] = useState("");
  const [versao, setVersao] = useState(0);
  const pacientes = useDados<Paciente[]>("pacientes?" + new URLSearchParams({ q: busca }));
  const medicos = useDados<Medico[]>("medicos");
  const horarios = useDados<Horario[]>(medico && data ? "disponibilidades?" + new URLSearchParams({ id_medico: medico, data }) : null, versao);
  const convenios = useDados<Vinculo[]>(paciente && data ? "pacientes/" + paciente + "/convenios?" + new URLSearchParams({ data }) : null);
  const semHorarios = horarios.data?.length === 0;

  return <AppLayout>
    <div className="page-heading"><h1>Agendar consulta</h1></div>
    <section className="card">
      <h2>Dados do agendamento</h2>
      <EstadoDados loading={medicos.loading || pacientes.loading || horarios.loading || convenios.loading}
        error={medicos.error || pacientes.error || horarios.error || convenios.error} />
      {semHorarios && <p role="status">
        Não há horários livres para o profissional nessa data. Escolha outra data ou{" "}
        <Link to={"/agenda?" + new URLSearchParams({ data, id_medico: medico }) + "#disponibilidade"}>libere um horário na agenda</Link>.
      </p>}
      <Cadastro label="Salvar agendamento" disabled={!paciente || !horarios.data?.length || convenios.loading || !!convenios.error}
        concluido={() => navigate("/agenda?" + new URLSearchParams({ data }))}
        enviar={async fields => {
          try {
            await salvar("agendamentos", {
              id_paciente: paciente,
              id_disponibilidade: fields.get("horario"),
              id_paciente_convenio: fields.get("convenio") || null,
              observacoes: fields.get("observacoes") || null,
            });
          } catch (error) {
            setVersao(version => version + 1);
            throw error;
          }
        }}>
        <label>Buscar paciente por nome ou CPF<input type="search" value={busca} onChange={event => { setBusca(event.target.value); setPaciente(""); }} /></label>
        <label>Paciente<select required value={paciente} onChange={event => setPaciente(event.target.value)}>
          <option value="">Selecione</option>
          {pacientes.data?.map(item => <option key={item.id_paciente} value={item.id_paciente}>{item.nome} · {item.cpf_mascarado}</option>)}
        </select></label>
        <label>Médico<select required value={medico} onChange={event => setMedico(event.target.value)}>
          <option value="">Selecione</option>
          {medicos.data?.filter(item => item.status === "ativo").map(item => <option key={item.id_medico} value={item.id_medico}>
            {item.nome}{item.especialidades ? " · " + item.especialidades : ""}
          </option>)}
        </select></label>
        <label>Data<input type="date" required value={data} onChange={event => setData(event.target.value)} /></label>
        <label>Horário disponível<select name="horario" key={medico + data + versao} required disabled={!horarios.data?.length}>
          <option value="">{!medico || !data ? "Selecione o médico e a data" : semHorarios ? "Nenhum horário disponível" : "Selecione"}</option>
          {horarios.data?.map(item => <option key={item.id_disponibilidade} value={item.id_disponibilidade}>{item.horario.slice(0, 5)}</option>)}
        </select></label>
        <label>Convênio<select name="convenio" key={paciente + data}>
          <option value="">Particular</option>
          {convenios.data?.map(item => <option key={item.id_paciente_convenio} value={item.id_paciente_convenio}>{item.convenio} · {item.plano}</option>)}
        </select></label>
        <label>Observações administrativas<textarea name="observacoes" maxLength={500} /></label>
      </Cadastro>
    </section>
  </AppLayout>;
}
