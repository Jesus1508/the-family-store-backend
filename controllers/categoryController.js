const { validationResult } = require("express-validator");
const Category = require("../models/Category");

exports.listCategories = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { activa: true };
    const categories = await Category.find(filter).sort({ nombre: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al listar categorías", error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Ya existe una categoría con ese slug" });
    }
    res.status(500).json({ success: false, message: "Error al crear la categoría", error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: "Categoría no encontrada" });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar la categoría", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Categoría no encontrada" });
    }
    res.json({ success: true, message: "Categoría eliminada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar la categoría", error: error.message });
  }
};
