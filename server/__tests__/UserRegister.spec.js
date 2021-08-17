const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
};

const postUser = (user = validUser, options = {}) => {
  const agent = request(app).post('/api/1.0/users');
  if (options.language) {
    agent.set('Accept-Language', options.language);
  }
  return agent.send(user);
};

describe('User Registration', () => {
  it('returns 200 OK when signup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it('return success message when signup request is valid', async () => {
    const response = await postUser();
    expect(response.body.message).toBe('User created');
  });

  it('saves the user to database', async () => {
    await postUser();
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it('saves the username and email to database', async () => {
    await postUser();
    const userList = await User.findAll();

    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@mail.com');
  });

  it('hashes the password in database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).not.toBe('P4ssword');
  });

  it('returns 400 when username is null', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });
    expect(response.status).toBe(400);
  });

  it('returns validationErrors field in response body when validation error occurs', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'P4ssword',
    });
    const body = response.body;
    expect(body.validationErrors).not.toBeUndefined();
  });

  it('returns errors for both when username and email is null', async () => {
    const response = await postUser({
      username: null,
      email: null,
      password: 'P4ssword',
    });
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });

  const username_null = 'Username cannot be null';
  const username_size = 'Must have min 4 and max 32 characters';
  const email_null = 'E-mail cannot be null';
  const email_invalid = 'E-mail is not valid';
  const password_null = 'Password cannot be null';
  const password_size = 'Password must be at least 6 characters';
  const password_pattern = 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number';
  const email_inuse = 'E-mail in use';

  it.each`
    field         | value               | expectedMessage
    ${'username'} | ${null}             | ${username_null}
    ${'username'} | ${'usr'}            | ${username_size}
    ${'username'} | ${'a'.repeat(33)}   | ${username_size}
    ${'email'}    | ${null}             | ${email_null}
    ${'email'}    | ${'mail.com'}       | ${email_invalid}
    ${'email'}    | ${'user.mail.com'}  | ${email_invalid}
    ${'email'}    | ${'user@email'}     | ${email_invalid}
    ${'password'} | ${null}             | ${password_null}
    ${'password'} | ${'p4ssw'}          | ${password_size}
    ${'password'} | ${'allowercase'}    | ${password_pattern}
    ${'password'} | ${'ALLUPPETERCASE'} | ${password_pattern}
    ${'password'} | ${'1234567890'}     | ${password_pattern}
    ${'password'} | ${'lowerandUPPER'}  | ${password_pattern}
    ${'password'} | ${'lowerand12345'}  | ${password_pattern}
    ${'password'} | ${'UPPER12345'}     | ${password_pattern}
  `('returns $expectedMessage when $field is $value', async ({ field, expectedMessage, value }) => {
    const user = {
      username: 'user1',
      email: 'user1@mail.com',
      password: 'p4ssword',
    };
    user[field] = value;
    const response = await postUser(user);
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it(`returns ${email_inuse} when same email is already in use`, async () => {
    await User.create({ ...validUser });
    const response = await postUser();
    expect(response.body.validationErrors.email).toBe(email_inuse);
  });

  it('returns errors for both username is null and email is in use', async () => {
    await User.create({ ...validUser });
    const response = await postUser({
      username: null,
      email: validUser.email,
      password: 'P4ssowrd',
    });
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });
});

describe('Internationalization', () => {
  const username_null = 'Username não pode ser nulo';
  const username_size = 'Precisa ter entre 4 e 32 caracteres';
  const email_null = 'E-mail não pode ser nulo';
  const email_invalid = 'E-mail não é válido';
  const password_null = 'Password não pode ser nulo';
  const password_size = 'Password precisa ter pelo menos 6 caracteres';
  const password_pattern = 'Password precisa ter pelo menos 1 letra maiúscula, 1 letra minúscula e 1 número';
  const email_inuse = 'E-mail em uso';

  const user_create_success = 'Usuário criado';

  it.each`
    field         | value               | expectedMessage
    ${'username'} | ${null}             | ${username_null}
    ${'username'} | ${'usr'}            | ${username_size}
    ${'username'} | ${'a'.repeat(33)}   | ${username_size}
    ${'email'}    | ${null}             | ${email_null}
    ${'email'}    | ${'mail.com'}       | ${email_invalid}
    ${'email'}    | ${'user.mail.com'}  | ${email_invalid}
    ${'email'}    | ${'user@email'}     | ${email_invalid}
    ${'password'} | ${null}             | ${password_null}
    ${'password'} | ${'p4ssw'}          | ${password_size}
    ${'password'} | ${'allowercase'}    | ${password_pattern}
    ${'password'} | ${'ALLUPPETERCASE'} | ${password_pattern}
    ${'password'} | ${'1234567890'}     | ${password_pattern}
    ${'password'} | ${'lowerandUPPER'}  | ${password_pattern}
    ${'password'} | ${'lowerand12345'}  | ${password_pattern}
    ${'password'} | ${'UPPER12345'}     | ${password_pattern}
  `('returns $expectedMessage when $field is $value', async ({ field, expectedMessage, value }) => {
    const user = {
      username: 'user1',
      email: 'user1@mail.com',
      password: 'p4ssword',
    };
    user[field] = value;
    const response = await postUser(user, { language: 'pt-BR' });
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it(`returns ${email_inuse} when same email is already in use`, async () => {
    await User.create({ ...validUser });
    const response = await postUser({ ...validUser }, { language: 'pt-BR' });
    expect(response.body.validationErrors.email).toBe(email_inuse);
  });

  it(`return success message of ${user_create_success} when signup request is valid and language is set as portuguese`, async () => {
    const response = await postUser({ ...validUser }, { language: 'pt-BR' });
    expect(response.body.message).toBe(user_create_success);
  });
});
