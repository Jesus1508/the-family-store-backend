const { validationResult } = require("express-validator");
const Product = require("../models/Product");
const Review = require("../models/Review");
const cloudinary = require("../config/cloudinary");
const { calcularReservado } = require("../utils/availability");

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

const parseProductBody = (body) => {
  const parsed = { ...body };

  if (typeof parsed.tallas === "string") {
    try {
      parsed.tallas = JSON.parse(parsed.tallas);
    } catch {
      parsed.tallas = [];
    }
  }

  if (typeof parsed.proximamente === "string") {
    parsed.proximamente = parsed.proximamente === "true";
  }

  if (typeof parsed.eliminarAlAgotarse === "string") {
    parsed.eliminarAlAgotarse = parsed.eliminarAlAgotarse === "true";
  }

  if (parsed.precioOriginal === "" || parsed.precioOriginal === undefined) {
    delete parsed.precioOriginal;
  }

  return parsed;
};

exports.listProducts = async (req, res) => {
  try {
    const { categoria, search, promocion, proximamente, page = 1, limit = 20 } = req.query;
    const filter = { activo: true };

    if (categoria) filter.categoria = categoria;
    if (search) filter.nombre = { $regex: search, $options: "i" };

    if (proximamente === "true") {
      filter.proximamente = true;
    } else {
      filter.proximamente = { $ne: true };
    }

    if (promocion === "true") {
      filter.$expr = { $gt: ["$precioOriginal", "$precio"] };
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    const ratings = await Review.aggregate([
      { $match: { producto: { $in: products.map((p) => p._id) }, aprobada: true } },
      { $group: { _id: "$producto", promedio: { $avg: "$calificacion" }, total: { $sum: 1 } } },
    ]);
    const ratingsPorProducto = new Map(ratings.map((r) => [r._id.toString(), r]));

    const data = products.map((p) => {
      const rating = ratingsPorProducto.get(p._id.toString());
      const obj = p.toObject();
      obj.promedioCalificacion = rating?.promedio || 0;
      obj.totalResenas = rating?.total || 0;
      return obj;
    });

    res.json({ success: true, data, total, page: Number(page) });
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

    const reservadoTotal = await calcularReservado(product._id);
    const data = product.toObject();
    data.disponible = Math.max(0, product.stock - reservadoTotal);

    if (product.tallas?.length > 0) {
      data.tallas = await Promise.all(
        product.tallas.map(async (t) => {
          const reservadoTalla = await calcularReservado(product._id, t.talla);
          return { ...t.toObject(), disponible: Math.max(0, t.stock - reservadoTalla) };
        })
      );
    }

    const reseñasAprobadas = await Review.find({ producto: product._id, aprobada: true });
    data.totalResenas = reseñasAprobadas.length;
    data.promedioCalificacion =
      reseñasAprobadas.length > 0
        ? reseñasAprobadas.reduce((sum, r) => sum + r.calificacion, 0) / reseñasAprobadas.length
        : 0;

    res.json({ success: true, data });
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

    const product = await Product.create({ ...parseProductBody(req.body), imagenes });
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

    const body = parseProductBody(req.body);

    const files = req.files || [];
    if (files.length > 0) {
      const uploads = await Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer)));
      const nuevasImagenes = uploads.map((result) => ({ url: result.secure_url, publicId: result.public_id }));

      await Promise.all(
        product.imagenes.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => null))
      );
      body.imagenes = nuevasImagenes;
    }

    Object.assign(product, body);
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar el producto", error: error.message });
  }
};

const deleteProductAndImages = async (product) => {
  await Promise.all(
    product.imagenes.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => null))
  );
  await product.deleteOne();
};

exports.deleteProductAndImages = deleteProductAndImages;

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    await deleteProductAndImages(product);

    res.json({ success: true, message: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar el producto", error: error.message });
  }
};
