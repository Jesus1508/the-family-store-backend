const Order = require("../models/Order");

/**
 * Suma la cantidad reservada de un producto (opcionalmente por talla) en
 * pedidos que aún no han sido confirmados ni cancelados.
 */
const calcularReservado = async (productoId, talla) => {
  const pedidos = await Order.find({
    estado: "pendiente_pago",
    "items.producto": productoId,
  });

  let reservado = 0;
  for (const pedido of pedidos) {
    for (const item of pedido.items) {
      if (item.producto.toString() !== productoId.toString()) continue;
      if (talla !== undefined && item.talla !== talla) continue;
      reservado += item.cantidad;
    }
  }
  return reservado;
};

module.exports = { calcularReservado };
