const bcrypt = require("bcrypt");
const repo = require("../repositories/auth.repo");
const { generateToken } = require("../utils/jwt");

exports.signup = async (email, password) => {
  const hashed = await bcrypt.hash(password, 10);
  await repo.createUser(email, hashed);
};

exports.login = async (email, password) => {
  const { data } = await repo.findUserByEmail(email);
  if (!data) throw new Error("User not found");

  const valid = await bcrypt.compare(password, data.password);
  if (!valid) throw new Error("Invalid password");

  return generateToken(data.id);
};
