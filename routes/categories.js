const express = require("express");
const { body } = require("express-validator");
const categoryController = require("../controllers/categoryController");
const protectAdmin = require("../middleware/protectAdmin");

const router = express.Router();

const categoryValidators = [
  body("nombre").notEmpty().withMessage("El nombre es requerido"),
  body("slug")
    .notEmpty()
    .withMessage("El slug es requerido")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("El slug solo puede contener minúsculas, números y guiones"),
];

router.get("/", categoryController.listCategories);
router.post("/", protectAdmin, categoryValidators, categoryController.createCategory);
router.put("/:id", protectAdmin, categoryValidators, categoryController.updateCategory);
router.delete("/:id", protectAdmin, categoryController.deleteCategory);

module.exports = router;
