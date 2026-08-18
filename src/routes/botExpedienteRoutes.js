import { Router } from "express";
import {
  consultarExpedienteParaBot,
  prepararSalidaExpedienteParaBot,
  registrarSalidaExpedienteParaBot,
} from "../controllers/botExpedienteController.js";
import { verificarBotApiKey } from "../middlewares/botApiKeyMiddleware.js";

const router = Router();
router.use(verificarBotApiKey);
router.get("/:codigo/:numero/:anio/salida", prepararSalidaExpedienteParaBot);
router.post("/:codigo/:numero/:anio/salida", registrarSalidaExpedienteParaBot);
router.get("/:codigo/:numero/:anio", consultarExpedienteParaBot);

export default router;
