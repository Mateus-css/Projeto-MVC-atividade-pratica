var express = require("express");
var router = express.Router();

// requisição do Model — uso obrigatório de chaves e nome definido no objeto
const { tarefasModel } = require("../models/tarefasModel");
const moment = require("moment");
moment.locale('pt-br');

// ─────────────────────────────────────────────────────────────────────────────
// express-validator
// MODELO A: importando com nomes de variáveis em português
// ─────────────────────────────────────────────────────────────────────────────
const { body: campo, validationResult: resultadoValidacao } = require("express-validator");

// Regras de validação — usadas nas rotas POST /cadastro
const regrasValidacaoA = [
    campo("tarefa")
        .isLength({ min: 5, max: 45 })
        .withMessage("O nome da tarefa deve ter entre 5 e 45 caracteres!"),
    campo("prazo")
        .isISO8601()
        .withMessage("O prazo deve ser uma data válida (formato AAAA-MM-DD)!")
        .bail()
        .isAfter(new Date(Date.now() - 86400000).toISOString())
        .withMessage("O prazo não pode ser uma data no passado!"),
    campo("situacao")
        .isInt({ min: 0, max: 4 })
        .withMessage("A situação deve ser um número inteiro entre 0 e 4!")
];

// ─────────────────────────────────────────────────────────────────────────────
// MODELO B: importando com nomes de variáveis em inglês (padrão da documentação)
// A diferença está apenas nos aliases das variáveis importadas;
// o comportamento é idêntico ao Modelo A.
// ─────────────────────────────────────────────────────────────────────────────
const { body, validationResult } = require("express-validator");

const regrasValidacaoB = [
    body("tarefa")
        .isLength({ min: 5, max: 45 })
        .withMessage("Task name must be between 5 and 45 characters!"),
    body("prazo")
        .isISO8601()
        .withMessage("Deadline must be a valid date (YYYY-MM-DD)!")
        .bail()
        .isAfter(new Date(Date.now() - 86400000).toISOString())
        .withMessage("Deadline cannot be in the past!"),
    body("situacao")
        .isInt({ min: 0, max: 4 })
        .withMessage("Status must be an integer between 0 and 4!")
];

// ─────────────────────────────────────────────────────────────────────────────
// ROTAS PRINCIPAIS
// ─────────────────────────────────────────────────────────────────────────────

// GET / — listagem paginada
router.get("/", async function (req, res) {
    res.locals.moment = moment;
    let paginaAtual = req.query.pagina == undefined ? 1 : req.query.pagina;
    let qtdePagina = 5;
    let offset = (paginaAtual - 1) * qtdePagina;
    let totalPaginas = Math.ceil(await tarefasModel.totRegistros() / qtdePagina);

    var paginador = totalPaginas > 1
        ? { paginaAtual: paginaAtual, totalPaginas: totalPaginas }
        : null;

    try {
        const linhas = await tarefasModel.findAll(offset, qtdePagina);
        res.render("pages/index", { linhasTabela: linhas, notificador: paginador, erros: [] });
    } catch (erro) {
        console.log(erro);
    }
});

// GET /cadastro — exibe formulário de nova tarefa
router.get("/cadastro", (req, res) => {
    res.locals.moment = moment;
    res.render("pages/cadastro", {
        tituloAba: "Cadastro de tarefa",
        tituloPagina: "Nova Tarefa",
        tarefa: { id_tarefa: 0, nome_tarefa: "", prazo_tarefa: "", situacao_tarefa: 1 },
        erros: []
    });
});

// GET /alterar — exibe formulário de edição
router.get("/alterar", async (req, res) => {
    res.locals.moment = moment;
    const id = req.query.id;
    try {
        const tarefa = await tarefasModel.findById(id);
        res.render("pages/cadastro", {
            tituloAba: "Edição de tarefa",
            tituloPagina: "Alterar Tarefa",
            tarefa: tarefa[0],
            erros: []
        });
    } catch (erro) {
        console.log(erro);
    }
});

// POST /cadastro — salva ou atualiza tarefa COM VALIDAÇÃO (Modelo A — variáveis em português)
router.post("/cadastro", regrasValidacaoA, async (req, res) => {
    res.locals.moment = moment;

    // Verificar resultado da validação
    const erros = resultadoValidacao(req);

    if (!erros.isEmpty()) {
        // Há erros: reexibe o formulário com as mensagens
        const tarefaForm = {
            id_tarefa:      req.body.id,
            nome_tarefa:    req.body.tarefa,
            prazo_tarefa:   req.body.prazo,
            situacao_tarefa: req.body.situacao
        };
        const tituloAba    = req.body.id == 0 ? "Cadastro de tarefa" : "Edição de tarefa";
        const tituloPagina = req.body.id == 0 ? "Nova Tarefa"        : "Alterar Tarefa";

        return res.render("pages/cadastro", {
            tituloAba,
            tituloPagina,
            tarefa: tarefaForm,
            erros: erros.array()   // array de objetos { msg, path, ... }
        });
    }

    // Sem erros: persiste os dados
    const objJson = {
        id:       req.body.id,
        nome:     req.body.tarefa,
        prazo:    req.body.prazo,
        situacao: req.body.situacao
    };

    try {
        if (objJson.id == 0) {
            var result = await tarefasModel.create(objJson);
        } else {
            var result = await tarefasModel.update(objJson);
        }
        console.log(result);
        res.redirect("/");
    } catch (erro) {
        console.log(erro);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROTA DE EXCLUSÃO LÓGICA (soft delete) — chamada pelo link na listagem
// ─────────────────────────────────────────────────────────────────────────────
router.get("/excluir", async (req, res) => {
    const id = req.query.id;
    try {
        const result = await tarefasModel.deleteLogico(id);
        console.log("Exclusão lógica:", result);
        res.redirect("/");
    } catch (erro) {
        console.log(erro);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROTAS DE TESTE
// ─────────────────────────────────────────────────────────────────────────────

// Teste de insert
router.get("/teste-insert", async (req, res) => {
    const dadosInsert = {
        nome:     "instalar o fortnite no Lab 1 Terreo",
        prazo:    "2026-12-31",
        situacao: 1
    };
    try {
        const resultInsert = await tarefasModel.create(dadosInsert);
        res.send(resultInsert);
    } catch (erro) {
        console.log(erro);
    }
});

// Teste de exclusão física (hard delete) — altera o id conforme necessário
router.get("/teste-delete", async (req, res) => {
    let idTarefa = req.query.id || 99; // passa ?id=X na URL ou usa 99 como padrão
    try {
        const resultDelete = await tarefasModel.deleteFisico(idTarefa);
        res.send({
            metodo: "deleteFisico (hard delete)",
            idExcluido: idTarefa,
            resultado: resultDelete
        });
    } catch (erro) {
        console.log(erro);
    }
});

// Teste de exclusão lógica (soft delete) — altera o id conforme necessário
router.get("/teste-soft-delete", async (req, res) => {
    let idTarefa = req.query.id || 99; // passa ?id=X na URL ou usa 99 como padrão
    try {
        const resultUpdate = await tarefasModel.deleteLogico(idTarefa);
        res.send({
            metodo: "deleteLogico (soft delete)",
            idDesativado: idTarefa,
            resultado: resultUpdate
        });
    } catch (erro) {
        console.log(erro);
    }
});

module.exports = router;
