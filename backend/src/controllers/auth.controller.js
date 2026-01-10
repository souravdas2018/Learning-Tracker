const authService = require("../services/auth.service");
const authRepo = require("../repositories/auth.repo");

exports.signup = async (req, res) => {
  try {
    const user = await authService.signup(req.body);

    res.json({
      message: "User registered successfully",
      id: user.id,
      email: user.email
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { token, user } = await authService.login(req.body.email, req.body.password);
    res.json({ token, id: user.id });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user.id; // extracted from token

    await authRepo.logoutUser(userId);

    res.json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



