const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const protectAdmin = require("../middleware/protectAdmin");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("La contraseña es requerida"),
  ],
  authController.login
);

router.get("/me", protectAdmin, authController.me);

module.exports = router;
