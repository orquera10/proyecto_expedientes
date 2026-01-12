import { Router } from "express";
import {
  listarMovimientos,
  crearMovimiento,
} from "../controllers/movimientoController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listarMovimientos);
router.post("/", crearMovimiento);

export default router;
