const express = require('express');
const User = require('../src/user/User');
const bcrypt = require('bcrypt');

const app = express();

//Necessário para conseguir fazer o parse do body da requisição.
app.use(express.json());

app.post('/api/1.0/users', (req, res) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    // const user = {
    //   username: req.body.username,
    //   email: req.body.email,
    //   password: hash,
    // };

    //forma alternativa:
    // const user = Object.assign({}, req.body, { password: hash });

    //Uma outra forma alternativa:
    const user = { ...req.body, password: hash };
    //Para essa forma funcionar sem o eslint reclamar, alteramos a configuração ecmaVersion para 2018:
    // "parserOptions": {
    //   "ecmaVersion": 2018
    // },

    User.create(user).then(() => {
      return res.send({ message: 'User created' });
    });
  });
});

module.exports = app;
