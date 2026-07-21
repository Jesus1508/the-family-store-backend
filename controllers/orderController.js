const { validationResult } = require("express-validator");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Settings = require("../models/Settings");
const { calcularReservado } = require("../utils/availability");
const { deleteProductAndImages } = require("./productController");

const COSTO_ENVIO_LOCAL = 60;

exports.createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { items, cliente, metodoPago, envio } = req.body;

  if (envio?.solicitado) {
    const dir = envio.direccion || {};
    const camposFaltantes = ["calle", "numero", "colonia", "ciudad", "codigoPostal"].filter((campo) => !dir[campo]);
    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Faltan datos de la dirección de envío: ${camposFaltantes.join(", ")}`,
      });
    }
  }

  try {
    const itemsValidados = [];
    let total = 0;

    for (const item of items) {
      const product = await Product.findById(item.productoId);
      if (!product || !product.activo) {
        return res.status(404).json({ success: false, message: `Producto no encontrado: ${item.productoId}` });
      }

      let stockBase = product.stock;
      if (item.talla) {
        const tallaData = product.tallas.find((t) => t.talla === item.talla);
        if (!tallaData) {
          return res.status(400).json({ success: false, message: `Talla inválida para ${product.nombre}` });
        }
        stockBase = tallaData.stock;
      }

      const reservado = await calcularReservado(product._id, item.talla || undefined);
      const disponible = stockBase - reservado;

      if (item.cantidad > disponible) {
        return res.status(409).json({
          success: false,
          message: `Solo quedan ${Math.max(0, disponible)} disponibles de "${product.nombre}"${item.talla ? ` (talla ${item.talla})` : ""}`,
        });
      }

      itemsValidados.push({
        producto: product._id,
        nombre: product.nombre,
        precio: product.precio,
        talla: item.talla || undefined,
        cantidad: item.cantidad,
      });
      total += product.precio * item.cantidad;
    }

    const costoEnvio = envio?.solicitado ? COSTO_ENVIO_LOCAL : 0;
    total += costoEnvio;

    const order = await Order.create({
      items: itemsValidados,
      cliente,
      metodoPago,
      envio: envio?.solicitado
        ? { solicitado: true, costo: costoEnvio, direccion: envio.direccion }
        : { solicitado: false, costo: 0 },
      total,
    });

    const settings = await Settings.findOne();

    res.status(201).json({ success: true, data: { order, settings } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear el pedido", error: error.message });
  }
};

exports.listOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.estado) filter.estado = req.query.estado;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al listar pedidos", error: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Pedido no encontrado" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener el pedido", error: error.message });
  }
};

exports.confirmarOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Pedido no encontrado" });
    }
    if (order.estado !== "pendiente_pago") {
      return res.status(400).json({ success: false, message: "Este pedido ya fue procesado" });
    }

    for (const item of order.items) {
      const product = await Product.findById(item.producto);
      if (!product) continue;

      if (item.talla) {
        const tallaData = product.tallas.find((t) => t.talla === item.talla);
        if (tallaData) {
          tallaData.stock = Math.max(0, tallaData.stock - item.cantidad);
        }
      }

      product.stock = Math.max(0, product.stock - item.cantidad);

      if (product.stock <= 0 && product.eliminarAlAgotarse) {
        await deleteProductAndImages(product);
      } else {
        await product.save();
      }
    }

    order.estado = "confirmado";
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al confirmar el pedido", error: error.message });
  }
};

exports.cancelarOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Pedido no encontrado" });
    }
    if (order.estado !== "pendiente_pago") {
      return res.status(400).json({ success: false, message: "Este pedido ya fue procesado" });
    }

    order.estado = "cancelado";
    if (req.body.notasAdmin) order.notasAdmin = req.body.notasAdmin;
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al cancelar el pedido", error: error.message });
  }
};
