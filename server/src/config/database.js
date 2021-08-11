const Sequelize = require('sequelize');

//1º parâmetro - Nome do banco de dados
//2º parâmetro - Nome do usuário do banco
//3º parametro - senha
//4º parametro - configurações do banco. No caso especificamos o dialeto que vamos usar e
//como vamos usar sqlite estamos informando onde será o armazenamento, que será o arquivo chamado database.sqlite.
const sequelize = new Sequelize('hoaxify', 'my-db-user', 'db-p4ss', {
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

module.exports = sequelize;
