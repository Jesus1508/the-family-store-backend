const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    banco: { type: String, default: "" },
    titular: { type: String, default: "" },
    numeroCuenta: { type: String, default: "" },
    clabe: { type: String, default: "" },
    notasPago: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    telefono: { type: String, default: "" },
    email: { type: String, default: "" },
    politicaCompra: { type: String, default: "" },
    quienesSomos: { type: String, default: "" },
    mostrarResenasEnTarjetas: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
