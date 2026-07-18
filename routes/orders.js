const express = require("express");
const { body } = require("express-validator");
const orderController = require("../controllers/orderController");
const protectAdmin = require("../middleware/protectAdmin");

const router = express.Router();

const orderValidators = [
  body("items").isArray({ min: 1 }).withMessage("El pedido debe tener al menos un producto"),
  body("items.*.productoId").notEmpty().withMessage("Producto inválido"),
  body("items.*.cantidad").isInt({ min: 1 }).withMessage("Cantidad inválida"),
  body("cliente.nombre").notEmpty().withMessage("El nombre es requerido"),
  body("cliente.telefono").notEmpty().withMessage("El teléfono es requerido"),
  body("metodoPago").isIn(["transferencia", "deposito"]).withMessage("Método de pago inválido"),
];

router.post("/", orderValidators, orderController.createOrder);
router.get("/", protectAdmin, orderController.listOrders);
router.get("/:id", protectAdmin, orderController.getOrder);
router.patch("/:id/confirmar", protectAdmin, orderController.confirmarOrder);
router.patch("/:id/cancelar", protectAdmin, orderController.cancelarOrder);

module.exports = router;
