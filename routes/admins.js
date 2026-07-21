const express = require("express");
const { body } = require("express-validator");
const adminController = require("../controllers/adminController");
const protectAdmin = require("../middleware/protectAdmin");

const router = express.Router();

const adminValidators = [
  body("nombre").notEmpty().withMessage("El nombre es requerido"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
];

router.use(protectAdmin);

router.get("/", adminController.listAdmins);
router.post("/", adminValidators, adminController.createAdmin);
router.delete("/:id", adminController.deleteAdmin);

module.exports = router;
