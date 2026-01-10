const adminService = require("../services/admin.service");
const adminRepo = require("../repositories/admin.repo");

exports.signup = async (req, res) => {
  try {
    const admin = await adminService.signup(req.body);

    res.json({
      message: "Admin registered successfully",
      id: admin.id,
      email: admin.email
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { token, admin } = await adminService.login(
      req.body.email,
      req.body.password
    );

    res.json({
      token,
      id: admin.id
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const adminId = req.admin.id; // from token

    await adminService.logout(adminId);

    res.json({ message: "Admin logged out successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.giveAdminAccess = async (req, res) => {
  try {
    const { email } = req.body; // target admin email

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { data: targetAdmin } = await adminRepo.findByEmail(email);

    if (!targetAdmin) {
      return res.status(404).json({ error: "Target admin not found" });
    }

    if (targetAdmin.access === true) {
      return res.json({ message: "Admin already has access" });
    }

    await adminRepo.updateAdminAccessByEmail(email, true);

    res.json({
      message: "Admin access granted successfully",
      email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingAdmins = async (req, res) => {
  try {
    const admins = await adminService.getPendingAdmins();
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



