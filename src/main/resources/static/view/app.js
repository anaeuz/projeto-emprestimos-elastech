const TIPOS = ["NOTEBOOK", "MONITOR", "HEADSET", "TECLADO", "MOUSE", "OUTRO"];

let equipamentos = [];
let colaboradores = [];
let timerAviso = null;

async function api(metodo, caminho, corpo) {
    const opcoes = { method: metodo, headers: {} };
    if (corpo !== undefined) {
        opcoes.headers["Content-Type"] = "application/json";
        opcoes.body = JSON.stringify(corpo);
    }
    const resposta = await fetch(caminho, opcoes);
    if (!resposta.ok) {
        let mensagem = "Erro " + resposta.status;
        try {
            const erro = await resposta.json();
            if (erro.message) {
                mensagem = erro.message;
            }
        } catch (e) {
        }
        throw new Error(mensagem);
    }
    if (resposta.status === 204) {
        return null;
    }
    return resposta.json();
}

function avisar(texto, tipo) {
    const aviso = document.getElementById("aviso");
    aviso.textContent = texto;
    aviso.className = "aviso " + tipo;
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => aviso.classList.add("escondido"), 4000);
}

function formatarData(data) {
    if (!data) {
        return "-";
    }
    const [ano, mes, dia] = data.split("-");
    return dia + "/" + mes + "/" + ano;
}

function texto(valor) {
    const div = document.createElement("div");
    div.textContent = valor == null ? "" : valor;
    return div.innerHTML;
}

function nomeEquipamento(id) {
    const equipamento = equipamentos.find(e => e.id === id);
    return equipamento ? equipamento.patrimonio + " · " + equipamento.nome : "#" + id;
}

function nomeColaborador(id) {
    const colaborador = colaboradores.find(c => c.id === id);
    return colaborador ? colaborador.nome : "#" + id;
}

function seloEmprestimo(emprestimo) {
    if (emprestimo.dataDevolucao) {
        return '<span class="selo cinza">Devolvido</span>';
    }
    if (emprestimo.atrasado) {
        return '<span class="selo vermelho">Atrasado</span>';
    }
    return '<span class="selo amarelo">Em aberto</span>';
}

function linhaVazia(colunas, mensagem) {
    return '<tr><td class="vazio" colspan="' + colunas + '">' + mensagem + "</td></tr>";
}

function trocarAba(nome) {
    document.querySelectorAll(".aba").forEach(aba => aba.classList.toggle("ativa", aba.dataset.aba === nome));
    document.querySelectorAll(".painel").forEach(painel => painel.classList.toggle("escondido", painel.id !== nome));
    if (nome === "equipamentos") {
        carregarEquipamentos();
    } else if (nome === "colaboradores") {
        carregarColaboradores();
    } else {
        carregarEmprestimos();
    }
}

function preencherTipos() {
    const opcoes = TIPOS.map(t => '<option value="' + t + '">' + t + "</option>").join("");
    document.getElementById("equipamento-tipo").innerHTML = opcoes;
    document.getElementById("filtro-tipo").innerHTML = '<option value="">Todos os tipos</option>' + opcoes;
}

async function carregarEquipamentos() {
    const tipo = document.getElementById("filtro-tipo").value;
    const disponivel = document.getElementById("filtro-disponivel").value;
    const parametros = new URLSearchParams();
    if (tipo) {
        parametros.set("tipo", tipo);
    }
    if (disponivel) {
        parametros.set("disponivel", disponivel);
    }
    const consulta = parametros.toString();
    try {
        const lista = await api("GET", "/equipamentos" + (consulta ? "?" + consulta : ""));
        const corpo = document.getElementById("lista-equipamentos");
        if (lista.length === 0) {
            corpo.innerHTML = linhaVazia(6, "Nenhum equipamento encontrado");
            return;
        }
        corpo.innerHTML = lista.map(e =>
            "<tr>" +
            "<td>" + e.id + "</td>" +
            "<td>" + texto(e.patrimonio) + "</td>" +
            "<td>" + texto(e.nome) + "</td>" +
            "<td>" + texto(e.tipo) + "</td>" +
            "<td>" + (e.disponivel
                ? '<span class="selo verde">Disponível</span>'
                : '<span class="selo amarelo">Emprestado</span>') + "</td>" +
            '<td class="acoes">' +
            '<button class="botao pequeno" data-editar="' + e.id + '">Editar</button>' +
            '<button class="botao pequeno perigo" data-remover="' + e.id + '">Remover</button>' +
            "</td>" +
            "</tr>"
        ).join("");
    } catch (erro) {
        avisar(erro.message, "erro");
    }
}

function limparFormEquipamento() {
    document.getElementById("form-equipamento").reset();
    document.getElementById("equipamento-id").value = "";
    document.getElementById("equipamento-patrimonio").disabled = false;
    document.getElementById("titulo-form-equipamento").textContent = "Novo equipamento";
    document.getElementById("botao-salvar-equipamento").textContent = "Cadastrar";
    document.getElementById("botao-cancelar-equipamento").classList.add("escondido");
}

async function editarEquipamento(id) {
    try {
        const equipamento = await api("GET", "/equipamentos/" + id);
        document.getElementById("equipamento-id").value = equipamento.id;
        document.getElementById("equipamento-patrimonio").value = equipamento.patrimonio;
        document.getElementById("equipamento-patrimonio").disabled = true;
        document.getElementById("equipamento-nome").value = equipamento.nome;
        document.getElementById("equipamento-tipo").value = equipamento.tipo;
        document.getElementById("titulo-form-equipamento").textContent = "Editar equipamento #" + equipamento.id;
        document.getElementById("botao-salvar-equipamento").textContent = "Salvar";
        document.getElementById("botao-cancelar-equipamento").classList.remove("escondido");
        document.getElementById("equipamento-nome").focus();
    } catch (erro) {
        avisar(erro.message, "erro");
    }
}

async function salvarEquipamento(evento) {
    evento.preventDefault();
    const id = document.getElementById("equipamento-id").value;
    const dados = {
        patrimonio: document.getElementById("equipamento-patrimonio").value.trim(),
        nome: document.getElementById("equipamento-nome").value.trim(),
        tipo: document.getElementById("equipamento-tipo").value
    };
    try {
        if (id) {
            await api("PUT", "/equipamentos/" + id, dados);
            avisar("Equipamento atualizado", "sucesso");
        } else {
            await api("POST", "/equipamentos", dados);
            avisar("Equipamento cadastrado", "sucesso");
        }
        limparFormEquipamento();
        carregarEquipamentos();
    } catch (erro) {
        avisar(erro.message, "erro");
    }
}

async function removerEquipamento(id) {
    if (!confirm("Remover o equipamento #" + id + "?")) {
        return;
    }
    try {
        await api("DELETE", "/equipamentos/" + id);
        avisar("Equipamento removido", "sucesso");
        carregarEquipamentos();
    } catch (erro) {
        avisar(erro.message, "erro");
    }
}

async function carregarColaboradores() {
    try {
        colaboradores = await api("GET", "/colaboradores");
        const corpo = document.getElementById("lista-colaboradores");
        if (colaboradores.length === 0) {
            corpo.innerHTML = linhaVazia(5, "Nenhum colaborador cadastrado");
            return;
        }
        corpo.innerHTML = colaboradores.map(c =>
            "<tr>" +
            "<td>" + c.id + "</td>" +
            "<td>" + texto(c.nome) + "</td>" +
            "<td>" + texto(c.email) + "</td>" +
            "<td>" + texto(c.cargo || "-") + "</td>" +
            '<td class="acoes"><button class="botao pequeno" data-historico="' + c.id + '">Histórico</button></td>' +
            "</tr>"
        ).join("");
    } catch (erro) {
        avisar(erro.message, "erro");
    }
}

async function salvarColaborador(evento) {
    evento.preventDefault();
    const dados = {
        nome: document.getElementById("colaborador-nome").value.trim(),
        email: document.getElementById("colaborador-email").value.trim(),
        cargo: document.getElementById("colaborador-cargo").value.trim()
    };
    try {
        await api("POST", "/colaboradores", dados);
        avisar("Colaborador cadastrado", "sucesso");
        document.getElementById("form-colaborador").reset();
        carregarColaboradores();
    } catch (erro) {
        avisar(erro.message, "erro");
    }
}

async function mostrarHistorico(id) {
    try {
        equipamentos = await api("GET", "/equipamentos");
        const lista = await api("GET", "/colaboradores/" + id + "/emprestimos");
        document.getElementById("titulo-historico").textContent = "Histórico de " + nomeColaborador(id);
        const corpo = document.getElementById("lista-historico");
        corpo.innerHTML = lista.length === 0
            ? linhaVazia(6, "Nenhum empréstimo")
            : lista.map(e =>
                "<tr>" +
                "<td>" + e.id + "</td>" +
                "<td>" + texto(nomeEquipamento(e.equipamentoId)) + "</td>" +
                "<td>" + formatarData(e.dataEmprestimo) + "</td>" +
                "<td>" + formatarData(e.dataPrevistaDevolucao) + "</td>" +
                "<td>" + formatarData(e.dataDevolucao) + "</td>" +
                "<td>" + seloEmprestimo(e) + "</td>" +
                "</tr>"
            ).join("");
        document.getElementById("cartao-historico").classList.remove("escondido");
        document.getElementById("cartao-historico").scrollIntoView({ behavior: "smooth" });
    } catch (erro) {
        avisar(erro.message, "erro");
    }
}

async function carregarEmprestimos() {
    const atrasados = document.getElementById("filtro-atrasados").checked;
    try {
        const [listaEquipamentos, listaColaboradores, lista] = await Promise.all([
            api("GET", "/equipamentos"),
            api("GET", "/colaboradores"),
            api("GET", "/emprestimos" + (atrasados ? "?atrasados=true" : ""))
        ]);
        equipamentos = listaEquipamentos;
        colaboradores = listaColaboradores;

        const disponiveis = equipamentos.filter(e => e.disponivel);
        document.getElementById("emprestimo-equipamento").innerHTML = disponiveis.length === 0
            ? '<option value="">Nenhum equipamento disponível</option>'
            : disponiveis.map(e => '<option value="' + e.id + '">' + texto(e.patrimonio + " · " + e.nome) + "</option>").join("");
        document.getElementById("emprestimo-colaborador").innerHTML = colaboradores.length === 0
            ? '<option value="">Nenhum colaborador cadastrado</option>'
            : colaboradores.map(c => '<option value="' + c.id + '">' + texto(c.nome) + "</option>").join("");

        const corpo = document.getElementById("lista-emprestimos");
        if (lista.length === 0) {
            corpo.innerHTML = linhaVazia(8, atrasados ? "Nenhum empréstimo atrasado" : "Nenhum empréstimo registrado");
            return;
        }
        corpo.innerHTML = lista.map(e =>
            "<tr>" +
            "<td>" + e.id + "</td>" +
            "<td>" + texto(nomeEquipamento(e.equipamentoId)) + "</td>" +
            "<td>" + texto(nomeColaborador(e.colaboradorId)) + "</td>" +
            "<td>" + formatarData(e.dataEmprestimo) + "</td>" +
            "<td>" + formatarData(e.dataPrevistaDevolucao) + "</td>" +
            "<td>" + formatarData(e.dataDevolucao) + "</td>" +
            "<td>" + seloEmprestimo(e) + "</td>" +
            '<td class="acoes">' + (e.dataDevolucao
                ? ""
                : '<button class="botao pequeno" data-devolver="' + e.id + '">Devolver</button>') + "</td>" +
            "</tr>"
        ).join("");
    } catch (erro) {
        avisar(erro.message, "erro");
    }
}

async function salvarEmprestimo(evento) {
    evento.preventDefault();
    const equipamentoId = document.getElementById("emprestimo-equipamento").value;
    const colaboradorId = document.getElementById("emprestimo-colaborador").value;
    if (!equipamentoId || !colaboradorId) {
        avisar("Escolha um equipamento e um colaborador", "erro");
        return;
    }
    try {
        const emprestimo = await api("POST", "/emprestimos?equipamentoId=" + equipamentoId + "&colaboradorId=" + colaboradorId);
        avisar("Empréstimo registrado. Devolução prevista: " + formatarData(emprestimo.dataPrevistaDevolucao), "sucesso");
        carregarEmprestimos();
    } catch (erro) {
        avisar(erro.message, "erro");
    }
}

async function devolver(id) {
    try {
        await api("PUT", "/emprestimos/" + id + "/devolucao");
        avisar("Devolução registrada", "sucesso");
        carregarEmprestimos();
    } catch (erro) {
        avisar(erro.message, "erro");
    }
}

document.querySelectorAll(".aba").forEach(aba => aba.addEventListener("click", () => trocarAba(aba.dataset.aba)));

document.getElementById("form-equipamento").addEventListener("submit", salvarEquipamento);
document.getElementById("botao-cancelar-equipamento").addEventListener("click", limparFormEquipamento);
document.getElementById("filtro-tipo").addEventListener("change", carregarEquipamentos);
document.getElementById("filtro-disponivel").addEventListener("change", carregarEquipamentos);
document.getElementById("lista-equipamentos").addEventListener("click", evento => {
    const botao = evento.target.closest("button");
    if (!botao) {
        return;
    }
    if (botao.dataset.editar) {
        editarEquipamento(botao.dataset.editar);
    }
    if (botao.dataset.remover) {
        removerEquipamento(botao.dataset.remover);
    }
});

document.getElementById("form-colaborador").addEventListener("submit", salvarColaborador);
document.getElementById("lista-colaboradores").addEventListener("click", evento => {
    const botao = evento.target.closest("button");
    if (botao && botao.dataset.historico) {
        mostrarHistorico(Number(botao.dataset.historico));
    }
});
document.getElementById("botao-fechar-historico").addEventListener("click", () =>
    document.getElementById("cartao-historico").classList.add("escondido"));

document.getElementById("form-emprestimo").addEventListener("submit", salvarEmprestimo);
document.getElementById("filtro-atrasados").addEventListener("change", carregarEmprestimos);
document.getElementById("lista-emprestimos").addEventListener("click", evento => {
    const botao = evento.target.closest("button");
    if (botao && botao.dataset.devolver) {
        devolver(botao.dataset.devolver);
    }
});

preencherTipos();
carregarEquipamentos();
