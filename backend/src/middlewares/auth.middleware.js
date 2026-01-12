const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Accept either "Bearer <token>" or just "<token>"
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Token missing or invalid" });
    }

    // Remove "Bearer " prefix if present
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    // Author: Sourav Kumar Das
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};


