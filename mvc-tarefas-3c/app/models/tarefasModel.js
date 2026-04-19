// requisitar o pool de conexões
const pool = require("../../config/pool_conexoes");
// criar um objeto com funções de acesso ao SGBD
const tarefasModel = {
  //select itens ativos
  // incluir paramatros offset e qtde
  findAll: async (offset = null, qtde = null) => {
    try {
      if (offset != null && qtde != null) {
        var [linhas] = await pool.query(
          "select * from tarefas where status_tarefa = 1 limit ?,? ",
          [offset, qtde],
        );
      } else {
        var [linhas] = await pool.query(
          "select * from tarefas where status_tarefa = 1",
        );
      }

      return linhas;
    } catch (erro) {
      return erro;
    }
  },
  //select por id específico
  findById: async (id) => {
    try {
      const [linhas] = await pool.query(
        "select * from tarefas where status_tarefa = 1 and id_tarefa = ?",
        [id],
      );
      return linhas;
    } catch (erro) {
      return erro;
    }
  },
  //insert
  create: async (dados) => {
    /*
        dados json no formato:
            {
            nome: "nome",
            prazo:"data mysql",
            situacao:"cod situacao"
            }
        */
    try {
      const [resultInsert] = await pool.query(
        "insert into tarefas(`nome_tarefa`,`prazo_tarefa`, " +
          "`situacao_tarefa`) values(?,?,?)",
        [dados.nome, dados.prazo, dados.situacao],
      );
      return resultInsert;
    } catch (erro) {
      return erro;
    }
  },

  // update :
  update: async (dados) => {
    /*
        dados json no formato:
            {
            id: 3
            nome: "nome",
            prazo:"data mysql",
            situacao:"cod situacao"
            }
        */
    try {
      const [resulUpdate] = await pool.query(
        "update tarefas set `nome_tarefa`= ?,`prazo_tarefa`= ?,  " +
          "`situacao_tarefa`= ? where id_tarefa = ?",
        [dados.nome, dados.prazo, dados.situacao, dados.id],
      );
      return resulUpdate;
    } catch (erro) {
      return erro;
    }
  },

  // deleteLogico :
  deleteLogico: async (id) => {
    try {
      const [result] = await pool.query(
        "UPDATE tarefas SET status_tarefa = 0 WHERE id_tarefa = ?",
        [id],
      );
      return result;
    } catch (erro) {
      return erro;
    }
  },

  // deleteFisico :
  deleteFisico: async (id) => {
    try {
      const [result] = await pool.query(
        "DELETE FROM tarefas WHERE id_tarefa = ?",
        [id],
      );
      return result;
    } catch (erro) {
      return erro;
    }
  },

  totRegistros: async () => {
    try {
      const [linhas] = await pool.query(
        "SELECT count(*) as total FROM `lista_tarefas`.tarefas",
      );
      return linhas[0].total;
    } catch (erro) {
      return erro;
    }
  },
};

//exportar este objeto como um módulo js
module.exports = { tarefasModel };
// uso de chave torna obrigatório o uso do nome indicado
