CREATE DATABASE IF NOT EXISTS lista_tarefas;

USE lista_tarefas;

CREATE TABLE tarefas (
    id_tarefa INT AUTO_INCREMENT PRIMARY KEY,
    nome_tarefa VARCHAR(45),
    prazo_tarefa DATE,
    situacao_tarefa INT,
    status_tarefa TINYINT DEFAULT 1
);

INSERT INTO tarefas (nome_tarefa, prazo_tarefa, situacao_tarefa)
VALUES 
('Teste 1', '2026-05-01', 1),
('Teste 2', '2026-05-02', 2);