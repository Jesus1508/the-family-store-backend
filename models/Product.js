const mongoose = require("mongoose");

const imagenSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const tallaSchema = new mongoose.Schema(
  {
    talla: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "" },
    precio: { type: Number, required: true, min: 0 },
    precioOriginal: { type: Number, min: 0 },
    categoria: { type: String, required: true, trim: true, lowercase: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, trim: true },
    imagenes: { type: [imagenSchema], default: [] },
    tallas: { type: [tallaSchema], default: [] },
    proximamente: { type: Boolean, default: false },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
