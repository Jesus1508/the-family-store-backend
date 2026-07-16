const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const passwordMatches = await admin.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, nombre: admin.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: { id: admin._id, email: admin.email, nombre: admin.nombre },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al iniciar sesión", error: error.message });
  }
};

exports.me = async (req, res) => {
  res.json({ success: true, data: req.admin });
};
