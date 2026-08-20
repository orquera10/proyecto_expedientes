import { Router } from "express";
import {
  listarMovimientos,
  crearMovimiento,
  listarMovimientosPorExpediente,
  descargarRemito,
  listarSalidasParaEntrada,
  listarEntradasParaSalida,
  registrarEntrada,
  registrarSalida,
  deshabilitarMovimiento,
  habilitarMovimiento,
} from "../controllers/movimientoController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listarMovimientos);
router.get("/salidas/entrada", listarSalidasParaEntrada);
router.get("/entradas/salida", listarEntradasParaSalida);
router.post("/entrada", registrarEntrada);
router.post("/salida", registrarSalida);
router.get("/:id/remito", descargarRemito);
router.put("/:id/deshabilitar", deshabilitarMovimiento);
router.put("/:id/habilitar", habilitarMovimiento);
router.post("/", crearMovimiento);
router.get("/expediente/:codigo/:numero/:anio", listarMovimientosPorExpediente);

export default router;
