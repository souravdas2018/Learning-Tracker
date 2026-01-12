// Author: Sourav Kumar Das
const jwt = require("jsonwebtoken");

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set. Aborting token generation.");
  }
  return process.env.JWT_SECRET;
}

exports.generateUserToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: "user"
    },
    getSecret(),
    { expiresIn: "1h" }
  );
};

exports.generateAdminToken = (admin) => {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: "admin"
    },
    getSecret(),
    { expiresIn: "1h" }
  );
};

