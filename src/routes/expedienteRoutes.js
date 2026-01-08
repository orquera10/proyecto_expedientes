import { Router } from "express";
import {
  listarExpedientes,
  crearExpediente,
} from "../controllers/expedienteController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listarExpedientes);
router.post("/", crearExpediente);

export default router;
