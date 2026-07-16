require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const sampleProducts = [
  {
    nombre: "Tahari Glowing Lip Oil Set",
    descripcion:
      "Set de aceites labiales importados en 5 tonos: Spicy Chocolate, Caramel Brown, Mauve Pink, Blush Nude y Vamp Red. Hidrata y nutre, brillo natural, suaviza y realza tus labios. Precio por unidad.",
    precio: 100,
    categoria: "belleza-cosmeticos",
    stock: 20,
    sku: "TFS-TAHARI-001",
  },
  {
    nombre: "Moon Drops Beauty Jumbo Lip Cream Strawberry Matcha",
    descripcion:
      "Lip cream con ácido hialurónico para hidratación profunda. Fórmula PH-reactive que crea un tono rosado único para cada persona. Aroma y sabor a fresa con un toque de matcha. Incluye llavero.",
    precio: 150,
    categoria: "belleza-cosmeticos",
    stock: 20,
    sku: "TFS-MOONDROPS-001",
  },
  {
    nombre: "Anne Klein Peptide Glow Butter",
    descripcion:
      "Glow butter para labios hidratados, con péptidos y manteca. Fórmula ligera y no pegajosa, brillo natural y labios radiantes. Tamaño mini, perfecto para bolsa o cosmetiquera. Disponible en Strawberry, Cherry y Peach.",
    precio: 85,
    categoria: "belleza-cosmeticos",
    stock: 20,
    sku: "TFS-ANNEKLEIN-001",
  },
  {
    nombre: "The Devil Wears Prada Lip Balm (Mad Beauty)",
    descripcion:
      "Bálsamo labial de edición especial con brillo intenso y acabado luminoso. Hidratación y suavidad, no pegajoso y cómodo. Disponible en dos estilos.",
    precio: 85,
    categoria: "belleza-cosmeticos",
    stock: 20,
    sku: "TFS-DEVILPRADA-001",
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const data of sampleProducts) {
    const existing = await Product.findOne({ sku: data.sku });
    if (existing) {
      console.log(`Ya existe "${data.nombre}" (SKU ${data.sku}), se omite.`);
      continue;
    }
    await Product.create({ ...data, imagenes: [] });
    console.log(`Creado: ${data.nombre}`);
  }

  console.log("\nListo. Los productos se crearon sin imágenes — súbelas desde el panel admin (Editar producto).");
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Error al sembrar productos:", error.message);
  process.exit(1);
});
