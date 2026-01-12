import { Router } from "express";
import {
  registrar,
  login,
  logout,
  cambiarPassword,
} from "../controllers/authController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registrar);
router.post("/login", login);
router.post("/logout", verificarToken, logout);
router.post("/password", verificarToken, cambiarPassword);

export default router;
