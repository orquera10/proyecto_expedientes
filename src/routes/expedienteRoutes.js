import { Router } from "express";
import {
  listarExpedientes,
  crearExpediente,
  obtenerExpedientePorClaveController,
  actualizarExpedientePorClaveController,
} from "../controllers/expedienteController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listarExpedientes);
router.post("/", crearExpediente);
router.get("/:codigo/:numero/:anio", obtenerExpedientePorClaveController);
router.put("/:codigo/:numero/:anio", actualizarExpedientePorClaveController);

export default router;
