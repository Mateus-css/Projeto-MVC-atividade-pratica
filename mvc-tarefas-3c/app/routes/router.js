var express = require("express");
var router = express.Router();
//requisição do Model uso onrigatório de chaves e nome definido no objeto
const { tarefasModel } = require("../models/tarefasModel");
const moment = require("moment");
moment.locale("pt-br");
const { body, validationResult } = require("express-validator");

router.get("/", async function (req, res) {
  res.locals.moment = moment;
  //recuperar a página solicitada caso não exista será a página 1
  let paginaAtual = req.query.pagina == undefined ? 1 : req.query.pagina;
  //definir a qtde de registros por página
  let qtdePagina = 5;
  //definir o offset em relação a pagina atual
  let offset = (paginaAtual - 1) * qtdePagina;
  //definir o número de páginas de resultados
  let totalPaginas = Math.ceil(
    (await tarefasModel.totRegistros()) / qtdePagina,
  );

  if (totalPaginas > 1) {
    var paginador = { paginaAtual: paginaAtual, totalPaginas: totalPaginas };
  } else {
    var paginador = null;
  }

  try {
    const linhas = await tarefasModel.findAll(offset, qtdePagina);
    res.render("pages/index", { linhasTabela: linhas, notificador: paginador });
  } catch (erro) {
    console.log(erro);
  }
});

router.get("/cadastro", (req, res) => {
  res.locals.moment = moment;
  res.render("pages/cadastro", {
    tituloAba: "Cadastro de tarefa",
    tituloPagina: "Nova Tarefa",
    tarefa: {
      id_tarefa: 0,
      nome_tarefa: "",
      prazo_tarefa: "",
      situacao_tarefa: 1,
    },
  });
});

router.get("/alterar", async (req, res) => {
  res.locals.moment = moment;
  //recuperar o id da queryString
  const id = req.query.id;
  try {
    const tarefa = await tarefasModel.findById(id);

    res.render("pages/cadastro", {
      tituloAba: "Edição de tarefa",
      tituloPagina: "Alterar Tarefa",
      tarefa: tarefa[0],
    });
  } catch (erro) {
    console.log(erro);
  }
});

router.post(
  "/cadastro",
  [
    body("tarefa")
      .isLength({ min: 5, max: 45 })
      .withMessage("A tarefa deve ter entre 5 e 45 caracteres"),

    body("prazo")
      .isDate()
      .withMessage("Data inválida")
      .custom((value) => {
        const hoje = new Date();
        const data = new Date(value);

        if (data < hoje.setHours(0, 0, 0, 0)) {
          throw new Error("A data deve ser hoje ou futura");
        }
        return true;
      }),

    body("situacao")
      .isInt({ min: 0, max: 4 })
      .withMessage("Situação deve ser entre 0 e 4"),
  ],
  async (req, res) => {
    const erros = validationResult(req);

    if (!erros.isEmpty()) {
      return res.render("pages/cadastro", {
        tituloAba: "Erro",
        tituloPagina: "Corrija os erros",
        tarefa: {
          id_tarefa: req.body.id,
          nome_tarefa: req.body.tarefa,
          prazo_tarefa: req.body.prazo,
          situacao_tarefa: req.body.situacao,
        },
        erros: erros.array(),
      });
    }

    const objJson = {
      id: req.body.id,
      nome: req.body.tarefa,
      prazo: req.body.prazo,
      situacao: req.body.situacao,
    };

    try {
      if (objJson.id == 0) {
        await tarefasModel.create(objJson);
      } else {
        await tarefasModel.update(objJson);
      }

      res.redirect("/");
    } catch (erro) {
      console.log(erro);
    }
  },
);

router.get("/teste-insert", async (req, res) => {
  const dadosInsert = {
    nome: "instalar o fortnite no Lab 1 Terreo",
    prazo: "2026-03-19",
  };
  try {
    const resultInsert = await tarefasModel.create(dadosInsert);
    res.send(resultInsert);
  } catch (erro) {
    console.log(erro);
  }
});

//delete físico - hard delete
router.get("/teste-delete", async (req, res) => {
  let idTarefa = 17;
  try {
    const resultDelete = await tarefasModel.deleteFisico(idTarefa);
    res.send(resultDelete);
  } catch (erro) {
    console.log(erro);
  }
});

//exercicio - teste de update -> delete lógico ou soft delete
//delete lógico - soft delete
router.get("/teste-soft-delete", async (req, res) => {
  let idTarefa = 15;
  try {
    const resultUpdate = await tarefasModel.deleteLogico(idTarefa);
    res.send(resultUpdate);
  } catch (erro) {
    console.log(erro);
  }
});

router.get("/excluir-logico/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await tarefasModel.deleteLogico(id);
    res.redirect("/");
  } catch (erro) {
    console.log(erro);
  }
});

module.exports = router;
