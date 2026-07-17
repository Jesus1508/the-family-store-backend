const express = require("express");
const { body } = require("express-validator");
const productController = require("../controllers/productController");
const protectAdmin = require("../middleware/protectAdmin");
const upload = require("../middleware/upload");
const Category = require("../models/Category");

const router = express.Router();

const productValidators = [
  body("nombre").notEmpty().withMessage("El nombre es requerido"),
  body("precio").isFloat({ min: 0 }).withMessage("El precio debe ser un número positivo"),
  body("precioOriginal").optional({ values: "falsy" }).isFloat({ min: 0 }).withMessage("El precio original debe ser un número positivo"),
  body("categoria").custom(async (value) => {
    const category = await Category.findOne({ slug: value, activa: true });
    if (!category) {
      throw new Error("Categoría inválida");
    }
    return true;
  }),
  body("stock").optional().isInt({ min: 0 }).withMessage("El stock debe ser un entero positivo"),
  body("sku").notEmpty().withMessage("El SKU es requerido"),
];

router.get("/", productController.listProducts);
router.get("/:id", productController.getProduct);

router.post("/", protectAdmin, upload.array("imagenes", 5), productValidators, productController.createProduct);
router.put("/:id", protectAdmin, upload.array("imagenes", 5), productValidators, productController.updateProduct);
router.delete("/:id", protectAdmin, productController.deleteProduct);

module.exports = router;
