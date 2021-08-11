const express = require('express');
const UserRouter = require('./user/UserRouter');

const app = express();

app.use(express.json());

//Rotas relacionadas ao User
app.use(UserRouter);

module.exports = app;
