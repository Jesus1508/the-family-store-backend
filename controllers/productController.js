const { validationResult } = require("express-validator");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "the-family-store/products" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

exports.listProducts = async (req, res) => {
  try {
    const { categoria, search, page = 1, limit = 20 } = req.query;
    const filter = { activo: true };

    if (categoria) filter.categoria = categoria;
    if (search) filter.nombre = { $regex: search, $options: "i" };

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({ success: true, data: products, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al listar productos", error: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener el producto", error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const files = req.files || [];
    const uploads = await Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer)));
    const imagenes = uploads.map((result) => ({ url: result.secure_url, publicId: result.public_id }));

    const product = await Product.create({ ...req.body, imagenes });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear el producto", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    const files = req.files || [];
    if (files.length > 0) {
      const uploads = await Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer)));
      const nuevasImagenes = uploads.map((result) => ({ url: result.secure_url, publicId: result.public_id }));

      await Promise.all(
        product.imagenes.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => null))
      );
      req.body.imagenes = nuevasImagenes;
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar el producto", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    await Promise.all(
      product.imagenes.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => null))
    );
    await product.deleteOne();

    res.json({ success: true, message: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar el producto", error: error.message });
  }
};
