from datetime import date, time
from decimal import Decimal
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, model_validator
from psycopg.errors import ForeignKeyViolation, UniqueViolation

from .auth import current_user
from .database import connect

router = APIRouter(dependencies=[Depends(current_user)])


def equipe(user=Depends(current_user)):
    if user["perfil"] == "medico":
        raise HTTPException(403, "Esta operação é restrita à equipe administrativa")


class Dados(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_min_length=1)


class PacienteCadastro(Dados):
    nome: str = Field(max_length=150)
    cpf: str = Field(pattern=r"^[0-9]{11}$")
    data_nascimento: date | None = None
    telefone: str | None = Field(default=None, max_length=20)
    email: str | None = Field(default=None, max_length=255, pattern=r"^[^\s@]+@[^\s@]+$")
    endereco: str | None = Field(default=None, max_length=255)


class Paciente(PacienteCadastro):
    id_plano: UUID | None = None
    numero_carteirinha: str | None = Field(default=None, max_length=80)
    validade: date | None = None

    @model_validator(mode="after")
    def validar_plano(self):
        if bool(self.id_plano) != bool(self.numero_carteirinha) or (self.validade and not self.id_plano):
            raise ValueError("Informe o plano e o número da carteirinha")
        return self


class Especialidade(Dados):
    nome: str = Field(max_length=100)
    descricao: str | None = Field(default=None, max_length=500)


class Convenio(Dados):
    nome: str = Field(max_length=150)
    cnpj: str = Field(pattern=r"^[0-9]{14}$")
    telefone: str | None = Field(default=None, max_length=20)
    email: str | None = Field(default=None, max_length=255, pattern=r"^[^\s@]+@[^\s@]+$")


class Plano(Dados):
    id_convenio: UUID
    nome: str = Field(max_length=150)
    cobertura: str | None = Field(default=None, max_length=500)


class Horario(Dados):
    id_medico: UUID | None = None
    data: date
    horario: time


class Agendamento(Dados):
    id_disponibilidade: UUID
    id_paciente: UUID
    id_paciente_convenio: UUID | None = None
    observacoes: str | None = Field(default=None, max_length=500)


class Situacao(Dados):
    status: Literal["pendente", "confirmado", "em_atendimento", "cancelado", "realizado"]
    motivo_cancelamento: str | None = Field(default=None, max_length=500)


class Fatura(Dados):
    id_consulta: UUID
    forma_pagamento: Literal["pix", "cartao", "dinheiro", "convenio"]


class CancelamentoFatura(Dados):
    motivo: str = Field(max_length=500)


@router.post("/pacientes", status_code=201, dependencies=[Depends(equipe)])
def cadastrar_paciente(dados: Paciente):
    try:
        with connect() as conn:
            paciente = conn.execute("""
                INSERT INTO paciente (nome, cpf, data_nascimento, telefone, email, endereco)
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id_paciente
            """, (dados.nome, dados.cpf, dados.data_nascimento, dados.telefone, dados.email, dados.endereco)).fetchone()
            if dados.id_plano:
                vinculo = conn.execute("""
                    INSERT INTO paciente_convenio (id_paciente, id_plano, numero_carteirinha, validade)
                    SELECT %s, p.id_plano, %s, %s FROM plano p JOIN convenio c USING (id_convenio)
                    WHERE p.id_plano = %s AND p.status = 'ativo' AND c.status = 'ativo'
                    RETURNING id_paciente_convenio
                """, (paciente["id_paciente"], dados.numero_carteirinha, dados.validade, dados.id_plano)).fetchone()
                if not vinculo:
                    raise HTTPException(422, "Selecione um plano ativo")
            return paciente
    except UniqueViolation as exc:
        raise HTTPException(409, "CPF já cadastrado") from exc


@router.get("/especialidades")
def especialidades():
    with connect() as conn:
        return conn.execute("""
            SELECT e.id_especialidade, e.nome_especialidade, e.descricao, e.status, count(me.id_medico) AS profissionais
            FROM especialidades e LEFT JOIN medico_especialidade me USING (id_especialidade)
            GROUP BY e.id_especialidade ORDER BY e.nome_especialidade
        """).fetchall()


@router.post("/especialidades", status_code=201, dependencies=[Depends(equipe)])
def cadastrar_especialidade(dados: Especialidade):
    try:
        with connect() as conn:
            return conn.execute("""
                INSERT INTO especialidades (nome_especialidade, descricao) VALUES (%s, %s) RETURNING id_especialidade
            """, (dados.nome, dados.descricao)).fetchone()
    except UniqueViolation as exc:
        raise HTTPException(409, "Especialidade já cadastrada") from exc


@router.get("/convenios", dependencies=[Depends(equipe)])
def convenios():
    with connect() as conn:
        return conn.execute("SELECT id_convenio, nome, cnpj, telefone, email, status FROM convenio ORDER BY nome").fetchall()


@router.post("/convenios", status_code=201, dependencies=[Depends(equipe)])
def cadastrar_convenio(dados: Convenio):
    try:
        with connect() as conn:
            return conn.execute("""
                INSERT INTO convenio (nome, cnpj, telefone, email) VALUES (%s, %s, %s, %s) RETURNING id_convenio
            """, (dados.nome, dados.cnpj, dados.telefone, dados.email)).fetchone()
    except UniqueViolation as exc:
        raise HTTPException(409, "CNPJ já cadastrado") from exc


@router.get("/planos", dependencies=[Depends(equipe)])
def planos(incluir_inativos: bool = False):
    with connect() as conn:
        return conn.execute("""
            SELECT p.id_plano, p.nome, p.cobertura, p.status, c.nome AS convenio,
                   coalesce((SELECT array_agg(pp.id_procedimento) FROM plano_procedimento pp
                             WHERE pp.id_plano = p.id_plano), ARRAY[]::uuid[]) AS procedimentos
            FROM plano p JOIN convenio c USING (id_convenio)
            WHERE %s OR (p.status = 'ativo' AND c.status = 'ativo') ORDER BY c.nome, p.nome
        """, (incluir_inativos,)).fetchall()


@router.post("/planos", status_code=201, dependencies=[Depends(equipe)])
def cadastrar_plano(dados: Plano):
    with connect() as conn:
        convenio = conn.execute("""
            SELECT id_convenio FROM convenio WHERE id_convenio = %s AND status = 'ativo' FOR UPDATE
        """, (dados.id_convenio,)).fetchone()
        if not convenio:
            raise HTTPException(422, "Selecione um convênio ativo")
        if conn.execute("SELECT 1 FROM plano WHERE id_convenio = %s AND lower(nome) = lower(%s)",
                        (dados.id_convenio, dados.nome)).fetchone():
            raise HTTPException(409, "Já existe um plano com esse nome no convênio")
        return conn.execute("""
            INSERT INTO plano (id_convenio, nome, cobertura) VALUES (%s, %s, %s) RETURNING id_plano
        """, (dados.id_convenio, dados.nome, dados.cobertura)).fetchone()


@router.get("/pacientes/{id_paciente}/convenios", dependencies=[Depends(equipe)])
def convenios_paciente(id_paciente: UUID, data: date | None = None):
    with connect() as conn:
        return conn.execute("""
            SELECT pc.id_paciente_convenio, c.nome AS convenio, p.nome AS plano
            FROM paciente_convenio pc JOIN plano p USING (id_plano) JOIN convenio c USING (id_convenio)
            WHERE pc.id_paciente = %s AND pc.status = 'ativo' AND p.status = 'ativo' AND c.status = 'ativo'
              AND (pc.validade IS NULL OR pc.validade >= coalesce(%s, (now() AT TIME ZONE 'America/Fortaleza')::date))
            ORDER BY c.nome, p.nome
        """, (id_paciente, data)).fetchall()


@router.get("/disponibilidades", dependencies=[Depends(equipe)])
def disponibilidades(id_medico: UUID, data: date):
    with connect() as conn:
        return conn.execute("""
            SELECT d.id_disponibilidade, d.horario FROM disponibilidade_agenda d
            JOIN medico m USING (id_medico) JOIN usuario u USING (id_usuario)
            WHERE d.id_medico = %s AND d.data = %s AND d.status = 'disponivel' AND u.status = 'ativo'
              AND d.data + d.horario >= now() AT TIME ZONE 'America/Fortaleza'
              AND NOT EXISTS (SELECT 1 FROM agendamento a WHERE a.id_medico = d.id_medico
                  AND a.data = d.data AND a.horario = d.horario AND a.status <> 'cancelado')
            ORDER BY d.horario
        """, (id_medico, data)).fetchall()


@router.post("/disponibilidades", status_code=201)
def cadastrar_horario(dados: Horario, user=Depends(current_user)):
    medico = user['perfil'] == 'medico'
    if not medico and dados.id_medico is None:
        raise HTTPException(422, "Selecione o profissional")
    with connect() as conn:
        horario = conn.execute("""
            INSERT INTO disponibilidade_agenda (id_medico, data, horario, status)
            SELECT m.id_medico, %s, %s, 'disponivel' FROM medico m JOIN usuario u USING (id_usuario)
            WHERE (%s::uuid IS NULL OR m.id_medico = %s)
              AND (%s::uuid IS NULL OR m.id_usuario = %s) AND u.status = 'ativo'
              AND %s::date + %s::time >= now() AT TIME ZONE 'America/Fortaleza'
              AND NOT EXISTS (SELECT 1 FROM agendamento a WHERE a.id_medico = m.id_medico
                  AND a.data = %s AND a.horario = %s AND a.status <> 'cancelado')
            ON CONFLICT DO NOTHING RETURNING id_disponibilidade
        """, (dados.data, dados.horario, dados.id_medico, dados.id_medico,
              user['id_usuario'] if medico else None, user['id_usuario'] if medico else None, dados.data, dados.horario,
              dados.data, dados.horario)).fetchone()
        if not horario:
            raise HTTPException(409, "Informe um horário futuro e livre para um profissional ativo")
        return horario


@router.post("/agendamentos", status_code=201, dependencies=[Depends(equipe)])
def agendar(dados: Agendamento):
    try:
        with connect() as conn:
            horario = conn.execute("""
                UPDATE disponibilidade_agenda d SET status = 'ocupado'
                FROM medico m JOIN usuario u USING (id_usuario)
                WHERE d.id_disponibilidade = %s AND d.id_medico = m.id_medico AND u.status = 'ativo'
                  AND d.status = 'disponivel' AND d.data + d.horario >= now() AT TIME ZONE 'America/Fortaleza'
                  AND NOT EXISTS (SELECT 1 FROM agendamento a WHERE a.id_medico = d.id_medico
                      AND a.data = d.data AND a.horario = d.horario AND a.status <> 'cancelado')
                RETURNING d.id_medico, d.data, d.horario
            """, (dados.id_disponibilidade,)).fetchone()
            if not horario:
                raise HTTPException(409, "O horário não está mais disponível")
            if dados.id_paciente_convenio and not conn.execute("""
                SELECT 1 FROM paciente_convenio pc JOIN plano p USING (id_plano)
                JOIN convenio c USING (id_convenio)
                WHERE pc.id_paciente_convenio = %s AND pc.id_paciente = %s
                  AND pc.status = 'ativo' AND p.status = 'ativo' AND c.status = 'ativo'
                  AND (pc.validade IS NULL OR pc.validade >= %s)
            """, (dados.id_paciente_convenio, dados.id_paciente, horario["data"])).fetchone():
                raise HTTPException(422, "Selecione um convênio válido para o paciente e a data")
            return conn.execute("""
                INSERT INTO agendamento (id_medico, id_paciente, data, horario, status, id_paciente_convenio, observacoes)
                VALUES (%s, %s, %s, %s, 'pendente', %s, %s) RETURNING id_agendamento
            """, (horario["id_medico"], dados.id_paciente, horario["data"], horario["horario"],
                  dados.id_paciente_convenio, dados.observacoes)).fetchone()
    except ForeignKeyViolation as exc:
        raise HTTPException(422, "Paciente ou vínculo não encontrado") from exc


def listar_agenda(conn, user, data=None, id_medico=None, id_paciente=None, proximos=False, limite=None):
    medico = user["id_usuario"] if user["perfil"] == "medico" else None
    return conn.execute("""
        SELECT a.id_agendamento, a.id_paciente, a.data, a.horario, a.status,
               p.nome AS paciente, u.name AS medico, especialidades.nomes AS especialidades,
               cs.id_consulta, cs.status AS status_consulta,
               cs.data AS data_consulta, cs.horario AS horario_consulta,
               cs.observacao_administrativa,
               itens.procedimentos,
               cs.id_consulta IS NOT NULL AND NOT EXISTS (
                   SELECT 1 FROM faturamento f WHERE f.id_consulta = cs.id_consulta
               ) AS aceita_procedimento
        FROM agendamento a JOIN paciente p USING (id_paciente)
        JOIN medico m USING (id_medico) JOIN usuario u USING (id_usuario)
        LEFT JOIN consulta cs USING (id_agendamento)
        LEFT JOIN LATERAL (
            SELECT string_agg(pr.nome || ' × ' || cp.quantidade, ', ' ORDER BY pr.nome) AS procedimentos
            FROM consulta_procedimento cp JOIN procedimento pr USING (id_procedimento)
            WHERE cp.id_consulta = cs.id_consulta
        ) itens ON true
        LEFT JOIN LATERAL (
            SELECT string_agg(e.nome_especialidade, ', ' ORDER BY e.nome_especialidade) AS nomes
            FROM medico_especialidade me JOIN especialidades e USING (id_especialidade)
            WHERE me.id_medico = m.id_medico AND e.status = 'ativo'
        ) especialidades ON true
        WHERE (%(usuario)s::uuid IS NULL OR m.id_usuario = %(usuario)s)
          AND (%(data)s::date IS NULL OR a.data = %(data)s)
          AND (%(medico)s::uuid IS NULL OR a.id_medico = %(medico)s)
          AND (%(paciente)s::uuid IS NULL OR a.id_paciente = %(paciente)s)
          AND (NOT %(proximos)s OR (a.data + a.horario >= now() AT TIME ZONE 'America/Fortaleza'
               AND a.status IN ('pendente', 'confirmado')))
        ORDER BY a.data, a.horario, a.id_agendamento
        LIMIT %(limite)s
    """, {"usuario": medico, "data": data, "medico": id_medico, "paciente": id_paciente,
          "proximos": proximos, "limite": limite}).fetchall()


@router.get("/agendamentos")
def agenda(data: date | None = None, id_medico: UUID | None = None,
           id_paciente: UUID | None = None, user=Depends(current_user)):
    with connect() as conn:
        return listar_agenda(conn, user, data, id_medico, id_paciente)


@router.patch("/agendamentos/{id_agendamento}")
def atualizar_agendamento(id_agendamento: UUID, dados: Situacao, user=Depends(current_user)):
    with connect() as conn:
        agendamento = conn.execute("""
            SELECT a.*, m.id_usuario FROM agendamento a JOIN medico m USING (id_medico)
            WHERE a.id_agendamento = %s FOR UPDATE OF a
        """, (id_agendamento,)).fetchone()
        if not agendamento or (user["perfil"] == "medico" and agendamento["id_usuario"] != user["id_usuario"]):
            raise HTTPException(404, "Agendamento não encontrado")
        anterior = agendamento["status"]
        if anterior == dados.status:
            return {"status": anterior}
        if anterior in ("cancelado", "realizado", "encerrado"):
            raise HTTPException(409, "O atendimento já foi encerrado")
        if anterior == "em_atendimento" and dados.status != "realizado":
            raise HTTPException(409, "O atendimento em andamento só pode ser concluído")
        if dados.status == "cancelado" and not dados.motivo_cancelamento:
            raise HTTPException(422, "Informe o motivo do cancelamento")
        conn.execute("""
            UPDATE agendamento SET status = %s, motivo_cancelamento = %s WHERE id_agendamento = %s
        """, (dados.status, dados.motivo_cancelamento if dados.status == "cancelado" else None, id_agendamento))
        if dados.status == "cancelado":
            conn.execute("""
                UPDATE disponibilidade_agenda SET status = 'disponivel'
                WHERE id_medico = %s AND data = %s AND horario = %s AND status = 'ocupado'
            """, (agendamento["id_medico"], agendamento["data"], agendamento["horario"]))
        if dados.status in ("em_atendimento", "realizado"):
            conn.execute("""
                INSERT INTO consulta (id_agendamento, data, horario, status, observacao_administrativa)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (id_agendamento) DO UPDATE SET status = EXCLUDED.status
            """, (id_agendamento, agendamento["data"], agendamento["horario"],
                  "realizada" if dados.status == "realizado" else "em_atendimento", agendamento["observacoes"]))
        return {"status": dados.status}


@router.get("/painel")
def painel(user=Depends(current_user)):
    with connect() as conn:
        hoje = conn.execute("SELECT (now() AT TIME ZONE 'America/Fortaleza')::date AS hoje").fetchone()["hoje"]
        dia = listar_agenda(conn, user, data=hoje)
        resultado = {"hoje": hoje, "dia": dia}
        if user["perfil"] != "medico":
            resultado.update(conn.execute("""
                SELECT (SELECT count(*) FROM paciente) AS pacientes,
                       (SELECT count(*) FROM medico) AS profissionais,
                       (SELECT count(*) FROM especialidades) AS especialidades
            """).fetchone())
            resultado["proximos"] = listar_agenda(conn, user, proximos=True, limite=10)
        return resultado


@router.get("/faturamento", dependencies=[Depends(equipe)])
def faturamento(inicio: date | None = None, fim: date | None = None,
                id_convenio: UUID | None = None, particular: bool = False):
    if inicio and fim and inicio > fim:
        raise HTTPException(422, "A data inicial deve ser anterior ou igual à final")
    with connect() as conn:
        return conn.execute("""
            SELECT cs.id_consulta, cs.data, p.nome AS paciente, c.nome AS convenio,
                   f.id_faturamento, f.valor_total, f.status, f.forma_pagamento, f.data_pagamento, f.motivo_cancelamento,
                   itens.total AS valor_procedimentos, itens.procedimentos
            FROM consulta cs JOIN agendamento a USING (id_agendamento)
            JOIN paciente p ON p.id_paciente = a.id_paciente
            LEFT JOIN paciente_convenio pc USING (id_paciente_convenio)
            LEFT JOIN plano pl USING (id_plano) LEFT JOIN convenio c USING (id_convenio)
            LEFT JOIN faturamento f USING (id_consulta)
            LEFT JOIN LATERAL (
                SELECT sum(cp.valor * cp.quantidade) AS total,
                       string_agg(pr.nome, ', ' ORDER BY cp.data, cp.horario, pr.nome) AS procedimentos
                FROM consulta_procedimento cp JOIN procedimento pr USING (id_procedimento)
                WHERE cp.id_consulta = cs.id_consulta
            ) itens ON true
            WHERE (cs.status = 'realizada' OR f.id_faturamento IS NOT NULL)
              AND (%(inicio)s::date IS NULL OR cs.data >= %(inicio)s)
              AND (%(fim)s::date IS NULL OR cs.data <= %(fim)s)
              AND (%(convenio)s::uuid IS NULL OR c.id_convenio = %(convenio)s)
              AND (NOT %(particular)s OR a.id_paciente_convenio IS NULL)
            ORDER BY cs.data DESC, cs.horario DESC, cs.id_consulta
        """, {"inicio": inicio, "fim": fim, "convenio": id_convenio, "particular": particular}).fetchall()


def obter_consulta_faturavel(conn, id_consulta, user):
    consulta = conn.execute("""
        SELECT cs.status, cs.data, a.id_paciente_convenio, a.id_paciente, m.id_usuario
        FROM consulta cs JOIN agendamento a USING (id_agendamento) JOIN medico m USING (id_medico)
        WHERE cs.id_consulta = %s FOR UPDATE OF cs
    """, (id_consulta,)).fetchone()
    if not consulta or (user['perfil'] == 'medico' and consulta['id_usuario'] != user['id_usuario']):
        raise HTTPException(404, "Consulta não encontrada")
    if conn.execute("SELECT 1 FROM faturamento WHERE id_consulta = %s", (id_consulta,)).fetchone():
        raise HTTPException(409, "Já existe faturamento para esta consulta")
    return consulta


@router.post("/faturamento", status_code=201, dependencies=[Depends(equipe)])
def registrar_fatura(dados: Fatura, user=Depends(current_user)):
    with connect() as conn:
        consulta = obter_consulta_faturavel(conn, dados.id_consulta, user)
        if consulta['status'] != 'realizada' or bool(consulta['id_paciente_convenio']) != (dados.forma_pagamento == 'convenio'):
            raise HTTPException(422, "Confira o atendimento concluído e a forma de pagamento")
        total = conn.execute("""
            SELECT sum(valor * quantidade) AS total FROM consulta_procedimento WHERE id_consulta = %s
        """, (dados.id_consulta,)).fetchone()['total']
        if total is None:
            raise HTTPException(422, "Adicione pelo menos um procedimento à consulta")
        if total > Decimal('9999999999.99'):
            raise HTTPException(422, "O total dos procedimentos excede o limite do faturamento")
        return conn.execute("""
            INSERT INTO faturamento (id_consulta, valor_total, forma_pagamento, status)
            VALUES (%s, %s, %s, 'pendente') RETURNING id_faturamento, valor_total
        """, (dados.id_consulta, total, dados.forma_pagamento)).fetchone()


@router.patch("/faturamento/{id_faturamento}/cancelamento", dependencies=[Depends(equipe)])
def cancelar_faturamento(id_faturamento: UUID, dados: CancelamentoFatura):
    with connect() as conn:
        registro = conn.execute("""
            UPDATE faturamento SET status = 'cancelado', cancelado_em = now(), motivo_cancelamento = %s
            WHERE id_faturamento = %s AND status = 'pendente' RETURNING id_faturamento
        """, (dados.motivo, id_faturamento)).fetchone()
        if not registro:
            raise HTTPException(409, "Somente cobranças pendentes podem ser canceladas")
        return registro


@router.patch("/faturamento/{id_faturamento}/pagamento", dependencies=[Depends(equipe)])
def registrar_pagamento(id_faturamento: UUID):
    with connect() as conn:
        registro = conn.execute("""
            UPDATE faturamento SET status = 'pago',
                   data_pagamento = (now() AT TIME ZONE 'America/Fortaleza')::date,
                   hora_pagamento = (now() AT TIME ZONE 'America/Fortaleza')::time
            WHERE id_faturamento = %s AND status = 'pendente' RETURNING id_faturamento
        """, (id_faturamento,)).fetchone()
        if not registro:
            raise HTTPException(409, "Faturamento pendente não encontrado")
        return registro
