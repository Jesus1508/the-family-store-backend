const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    talla: { type: String },
    cantidad: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    items: { type: [itemSchema], required: true, validate: (v) => v.length > 0 },
    cliente: {
      nombre: { type: String, required: true, trim: true },
      telefono: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    metodoPago: { type: String, required: true, enum: ["transferencia", "deposito"] },
    estado: {
      type: String,
      enum: ["pendiente_pago", "confirmado", "cancelado"],
      default: "pendiente_pago",
    },
    total: { type: Number, required: true, min: 0 },
    notasAdmin: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
