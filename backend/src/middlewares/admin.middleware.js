const jwt = require("jsonwebtoken");
const adminRepo = require("../repositories/admin.repo");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: admin } = await adminRepo.findAdminById(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: "Admin not found" });
    }

    // 🔑 THIS is the only authorization rule
    if (admin.access !== true) {
      return res
        .status(403)
        .json({ error: "You are not authorized to grant admin access" });
    }

    // attach user info to request
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
