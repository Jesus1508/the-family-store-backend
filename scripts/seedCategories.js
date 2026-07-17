require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");

const initialCategories = [
  { nombre: "Ropa de Dama", slug: "ropa-dama" },
  { nombre: "Ropa de Caballero", slug: "ropa-caballero" },
  { nombre: "Calzado", slug: "calzado" },
  { nombre: "Bolsos", slug: "bolsos" },
  { nombre: "Belleza y Cosméticos", slug: "belleza-cosmeticos" },
  { nombre: "Cuidado Personal", slug: "cuidado-personal" },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const data of initialCategories) {
    const existing = await Category.findOne({ slug: data.slug });
    if (existing) {
      console.log(`Ya existe "${data.nombre}" (${data.slug}), se omite.`);
      continue;
    }
    await Category.create(data);
    console.log(`Creada: ${data.nombre}`);
  }

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Error al sembrar categorías:", error.message);
  process.exit(1);
});
