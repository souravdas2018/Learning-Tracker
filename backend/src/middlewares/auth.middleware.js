// Author: Sourav Kumar Das
const jwt = require("jsonwebtoken");
const tokenBlacklist = require("../utils/tokenBlacklist");

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

    // Reject tokens that were explicitly invalidated on logout
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ error: "Token has been invalidated. Please log in again." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info and raw token to request
    req.token = token;
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


