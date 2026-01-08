import { Router } from "express";
import { registrar, login, logout } from "../controllers/authController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registrar);
router.post("/login", login);
router.post("/logout", verificarToken, logout);

export default router;
