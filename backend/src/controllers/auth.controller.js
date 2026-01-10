const authService = require("../services/auth.service");

exports.signup = async (req, res) => {
  try {
    await authService.signup(req.body.email, req.body.password);
    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const token = await authService.login(req.body.email, req.body.password);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
