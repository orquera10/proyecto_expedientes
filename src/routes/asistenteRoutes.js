import { Router } from "express";
import {
  consultarExpedienteAsistente,
  prepararEntradaAsistente,
  registrarEntradaAsistente,
  prepararSalidaAsistente,
  registrarSalidaAsistente,
} from "../controllers/asistenteController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verificarToken);

router.get("/:codigo/:numero/:anio/entrada", prepararEntradaAsistente);
router.post("/:codigo/:numero/:anio/entrada", registrarEntradaAsistente);
router.get("/:codigo/:numero/:anio/salida", prepararSalidaAsistente);
router.post("/:codigo/:numero/:anio/salida", registrarSalidaAsistente);
router.get("/:codigo/:numero/:anio", consultarExpedienteAsistente);

export default router;
