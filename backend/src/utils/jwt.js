const jwt = require("jsonwebtoken");

exports.generateUserToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: "user"
    },
    process.env.JWT_SECRET,
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
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

