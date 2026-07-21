const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");

exports.listAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-passwordHash").sort({ createdAt: 1 });
    res.json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al listar administradores", error: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { nombre, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ nombre, email: email.toLowerCase(), passwordHash });

    res.status(201).json({
      success: true,
      data: { id: admin._id, nombre: admin.nombre, email: admin.email, createdAt: admin.createdAt },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Ya existe un administrador con ese email" });
    }
    res.status(500).json({ success: false, message: "Error al crear el administrador", error: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    if (req.params.id === req.admin.id) {
      return res.status(400).json({ success: false, message: "No puedes eliminar tu propia cuenta" });
    }

    const total = await Admin.countDocuments();
    if (total <= 1) {
      return res.status(400).json({ success: false, message: "Debe existir al menos un administrador" });
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Administrador no encontrado" });
    }

    res.json({ success: true, message: "Administrador eliminado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar el administrador", error: error.message });
  }
};
