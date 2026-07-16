require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const run = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOMBRE, MONGODB_URI } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Define ADMIN_EMAIL y ADMIN_PASSWORD en tu .env antes de correr este script.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const existing = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`Ya existe un admin con el email ${ADMIN_EMAIL}. No se creó ninguno nuevo.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await Admin.create({
    nombre: ADMIN_NOMBRE || "Administrador",
    email: ADMIN_EMAIL.toLowerCase(),
    passwordHash,
  });

  console.log(`Admin creado con éxito: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Error al crear el admin:", error.message);
  process.exit(1);
});
