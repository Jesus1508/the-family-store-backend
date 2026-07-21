const express = require("express");
const { body } = require("express-validator");
const reviewController = require("../controllers/reviewController");
const protectAdmin = require("../middleware/protectAdmin");

const router = express.Router();

const reviewValidators = [
  body("producto").notEmpty().withMessage("Producto inválido"),
  body("nombreCliente").notEmpty().withMessage("El nombre es requerido"),
  body("calificacion").isInt({ min: 1, max: 5 }).withMessage("La calificación debe ser de 1 a 5"),
];

router.post("/", reviewValidators, reviewController.createReview);
router.get("/", reviewController.listPublicReviews);
router.get("/admin", protectAdmin, reviewController.listAllReviews);
router.patch("/:id/aprobar", protectAdmin, reviewController.aprobarReview);
router.delete("/:id", protectAdmin, reviewController.deleteReview);

module.exports = router;
