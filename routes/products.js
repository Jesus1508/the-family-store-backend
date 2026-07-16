const express = require("express");
const { body } = require("express-validator");
const productController = require("../controllers/productController");
const protectAdmin = require("../middleware/protectAdmin");
const upload = require("../middleware/upload");
const Product = require("../models/Product");

const router = express.Router();

const productValidators = [
  body("nombre").notEmpty().withMessage("El nombre es requerido"),
  body("precio").isFloat({ min: 0 }).withMessage("El precio debe ser un número positivo"),
  body("categoria").isIn(Product.CATEGORIAS).withMessage("Categoría inválida"),
  body("stock").optional().isInt({ min: 0 }).withMessage("El stock debe ser un entero positivo"),
  body("sku").notEmpty().withMessage("El SKU es requerido"),
];

router.get("/", productController.listProducts);
router.get("/:id", productController.getProduct);

router.post("/", protectAdmin, upload.array("imagenes", 5), productValidators, productController.createProduct);
router.put("/:id", protectAdmin, upload.array("imagenes", 5), productValidators, productController.updateProduct);
router.delete("/:id", protectAdmin, productController.deleteProduct);

module.exports = router;
