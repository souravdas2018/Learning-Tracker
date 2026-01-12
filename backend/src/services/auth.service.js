// Author: Sourav Kumar Das
const bcrypt = require("bcrypt");
const authRepo = require("../repositories/auth.repo");
const { generateUserToken } = require("../utils/jwt");

exports.signup = async (data) => {
  const { first_name, last_name, phone, email, password } = data;

  const { data: existingUser } = await authRepo.findUserByEmail(email);
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: newUser, error } = await authRepo.createUser({
    first_name,
    last_name,
    phone,
    email,
    password: hashedPassword
  });

  if (error) throw new Error(error.message);

  return newUser; // ✅ now safe
};



exports.login = async (email, password) => {
  const { data: user } = await authRepo.findUserByEmail(email);
  if (!user) throw new Error("User not found");

  if (user.is_active) {
    throw new Error("User already logged in");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid credentials");

  // mark user active + save login time
  await authRepo.activateUser(user.id);

  const token = generateUserToken(user);

  return { token, user };
};


