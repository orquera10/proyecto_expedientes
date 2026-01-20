import { Router } from "express";
import {
  listarExpedientes,
  crearExpediente,
  obtenerExpedientePorClaveController,
  actualizarExpedientePorClaveController,
  cargarExpediente,
  deshabilitarExpedienteController,
  listarExpedientesPorClave,
} from "../controllers/expedienteController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listarExpedientes);
router.post("/", crearExpediente);
router.post("/cargar", cargarExpediente);
router.get("/clave/:codigo/:numero/:anio", listarExpedientesPorClave);
router.get("/:codigo/:numero/:anio", obtenerExpedientePorClaveController);
router.put("/:codigo/:numero/:anio", actualizarExpedientePorClaveController);
router.put(
  "/:codigo/:numero/:anio/deshabilitar",
  deshabilitarExpedienteController
);

export default router;
