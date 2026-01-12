// Author: Sourav Kumar Das
const jwt = require("jsonwebtoken");
const adminRepo = require("../repositories/admin.repo");

module.exports = async (req, res, next) => {
  try {
    // Accept either "Bearer <token>" or just "<token>"
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    // Remove "Bearer " prefix if present
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: admin } = await adminRepo.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: "Admin not found" });
    }

    if (admin.access !== true) {
      return res
        .status(403)
        .json({ error: "You are not authorized to grant admin access" });
    }

    // Attach admin info
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
