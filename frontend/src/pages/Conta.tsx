import { useState } from "react";
import { AppLayout } from "../layouts/AppLayout";
import { AcaoRegistro } from "../components/Manutencao";
import { Cadastro, EstadoDados, Tabela } from "../components/Operacoes";
import { useDados } from "../hooks/useDados";
import { salvar } from "../services/operacoes";

type Usuario = { id_usuario: string; name: string; email: string; perfil: string; status: string };

export default function Conta() {
  const [versao, setVersao] = useState(0);
  const atual = useDados<Usuario>("auth/me");
  const admin = atual.data?.perfil === "administrador";
  const usuarios = useDados<Usuario[]>(admin ? "usuarios" : null, versao);
  return <AppLayout medical={atual.data?.perfil === "medico"}>
    <div className="page-heading"><h1>Minha conta</h1></div>
    <EstadoDados loading={atual.loading} error={atual.error} />
    <section className="card">
      <h2>Alterar senha</h2>
      <Cadastro label="Alterar senha" enviar={async fields => {
        if (fields.get("nova_senha") !== fields.get("confirmacao")) throw new Error("As novas senhas precisam ser iguais.");
        await salvar("auth/senha", { senha_atual: fields.get("senha_atual"), nova_senha: fields.get("nova_senha") }, "PATCH");
      }}>
        <label>Senha atual<input name="senha_atual" type="password" autoComplete="current-password" required maxLength={128} /></label>
        <label>Nova senha<input name="nova_senha" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label>
        <label>Confirmar nova senha<input name="confirmacao" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label>
      </Cadastro>
    </section>
    {admin && <>
      <section className="card">
        <h2>Contas da equipe</h2>
        <EstadoDados loading={usuarios.loading} error={usuarios.error} />
        {!!usuarios.data?.length && <Tabela colunas={["Nome", "E-mail", "Perfil", "Situação", "Ação"]}>
          {usuarios.data.map(item => <tr key={item.id_usuario}>
            <td>{item.name}</td><td>{item.email}</td><td>{item.perfil}</td><td>{item.status}</td>
            <td>{item.status === "ativo" && item.id_usuario !== atual.data?.id_usuario &&
              <details><summary>Desativar</summary>
                <AcaoRegistro label="Confirmar desativação" atualizar={() => setVersao(v => v + 1)}
                  executar={() => salvar("usuarios/" + item.id_usuario + "/desativacao", {}, "PATCH")} />
              </details>}</td>
          </tr>)}
        </Tabela>}
      </section>
      <section className="card">
        <h2>Cadastrar usuário da equipe</h2>
        <Cadastro concluido={() => setVersao(v => v + 1)} enviar={fields => salvar("usuarios", {
          ...Object.fromEntries(fields), telefone: fields.get("telefone") || null,
        })}>
          <label>Nome<input name="name" required maxLength={150} /></label>
          <label>E-mail<input name="email" type="email" required maxLength={255} /></label>
          <label>Telefone<input name="telefone" type="tel" maxLength={20} /></label>
          <label>Senha inicial<input name="senha" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label>
          <label>Perfil<select name="perfil"><option value="atendente">Atendente</option><option value="administrador">Administrador</option></select></label>
        </Cadastro>
      </section>
    </>}
  </AppLayout>;
}
