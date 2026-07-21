const { validationResult } = require("express-validator");
const Review = require("../models/Review");

exports.createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { producto, nombreCliente, calificacion, comentario } = req.body;
    const review = await Review.create({ producto, nombreCliente, calificacion, comentario });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al enviar la reseña", error: error.message });
  }
};

exports.listPublicReviews = async (req, res) => {
  try {
    const filter = { aprobada: true };
    if (req.query.producto) filter.producto = req.query.producto;

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al listar reseñas", error: error.message });
  }
};

exports.listAllReviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.aprobada !== undefined) filter.aprobada = req.query.aprobada === "true";
    if (req.query.producto) filter.producto = req.query.producto;

    const reviews = await Review.find(filter).populate("producto", "nombre").sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al listar reseñas", error: error.message });
  }
};

exports.aprobarReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { aprobada: true }, { new: true });
    if (!review) {
      return res.status(404).json({ success: false, message: "Reseña no encontrada" });
    }
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al aprobar la reseña", error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Reseña no encontrada" });
    }
    res.json({ success: true, message: "Reseña eliminada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar la reseña", error: error.message });
  }
};
