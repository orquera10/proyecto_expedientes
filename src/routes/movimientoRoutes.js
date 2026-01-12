import { Router } from "express";
import {
  listarMovimientos,
  crearMovimiento,
  listarMovimientosPorExpediente,
} from "../controllers/movimientoController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listarMovimientos);
router.post("/", crearMovimiento);
router.get("/expediente/:codigo/:numero/:anio", listarMovimientosPorExpediente);

export default router;
