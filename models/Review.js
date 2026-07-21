const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    nombreCliente: { type: String, required: true, trim: true },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, default: "", trim: true },
    aprobada: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
