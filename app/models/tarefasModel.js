// requisitar o pool de conexões
const pool = require("../../config/pool_conexoes");

// criar um objeto com funções de acesso ao SGBD
const tarefasModel = {

    //select itens ativos com suporte a paginação
    findAll: async (offset = null, qtde = null) => {
        try {
            if (offset != null && qtde != null) {
                var [linhas] = await pool.query(
                    "SELECT * FROM tarefas WHERE status_tarefa = 1 LIMIT ?,?",
                    [offset, qtde]
                );
            } else {
                var [linhas] = await pool.query(
                    "SELECT * FROM tarefas WHERE status_tarefa = 1"
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
                "SELECT * FROM tarefas WHERE status_tarefa = 1 AND id_tarefa = ?",
                [id]
            );
            return linhas;
        } catch (erro) {
            return erro;
        }
    },

    //insert
    create: async (dados) => {
        try {
            const [resultInsert] = await pool.query(
                "INSERT INTO tarefas(`nome_tarefa`,`prazo_tarefa`,`situacao_tarefa`) VALUES(?,?,?)",
                [dados.nome, dados.prazo, dados.situacao]
            );
            return resultInsert;
        } catch (erro) {
            return erro;
        }
    },

    // update
    update: async (dados) => {
        try {
            const [resultUpdate] = await pool.query(
                "UPDATE tarefas SET `nome_tarefa`= ?, `prazo_tarefa`= ?, `situacao_tarefa`= ? WHERE id_tarefa = ?",
                [dados.nome, dados.prazo, dados.situacao, dados.id]
            );
            return resultUpdate;
        } catch (erro) {
            return erro;
        }
    },

    // deleteLogico: soft delete — marca o registro como inativo (status_tarefa = 0)
    // O registro continua no banco, mas não aparece nas listagens
    deleteLogico: async (id) => {
        try {
            const [resultSoftDelete] = await pool.query(
                "UPDATE tarefas SET `status_tarefa` = 0 WHERE id_tarefa = ?",
                [id]
            );
            return resultSoftDelete;
        } catch (erro) {
            return erro;
        }
    },

    // deleteFisico: hard delete — remove permanentemente o registro do banco
    deleteFisico: async (id) => {
        try {
            const [resultHardDelete] = await pool.query(
                "DELETE FROM tarefas WHERE id_tarefa = ?",
                [id]
            );
            return resultHardDelete;
        } catch (erro) {
            return erro;
        }
    },

    totRegistros: async () => {
        try {
            const [linhas] = await pool.query(
                "SELECT COUNT(*) AS total FROM tarefas WHERE status_tarefa = 1"
            );
            return linhas[0].total;
        } catch (erro) {
            return erro;
        }
    }
};

// exportar este objeto como um módulo js
module.exports = { tarefasModel };
// uso de chave torna obrigatório o uso do nome indicado na importação
