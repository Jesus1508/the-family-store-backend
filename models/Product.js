const mongoose = require("mongoose");

const CATEGORIAS = [
  "ropa-dama",
  "ropa-caballero",
  "calzado",
  "bolsos",
  "belleza-cosmeticos",
  "cuidado-personal",
];

const imagenSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "" },
    precio: { type: Number, required: true, min: 0 },
    categoria: { type: String, required: true, enum: CATEGORIAS },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, trim: true },
    imagenes: { type: [imagenSchema], default: [] },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.statics.CATEGORIAS = CATEGORIAS;

module.exports = mongoose.model("Product", productSchema);
