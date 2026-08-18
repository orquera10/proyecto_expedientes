import { Router } from "express";
import {
  consultarExpedienteParaBot,
  prepararEntradaExpedienteParaBot,
  registrarEntradaExpedienteParaBot,
  prepararSalidaExpedienteParaBot,
  registrarSalidaExpedienteParaBot,
} from "../controllers/botExpedienteController.js";
import { verificarBotApiKey } from "../middlewares/botApiKeyMiddleware.js";

const router = Router();
router.use(verificarBotApiKey);
router.get("/:codigo/:numero/:anio/entrada", prepararEntradaExpedienteParaBot);
router.post("/:codigo/:numero/:anio/entrada", registrarEntradaExpedienteParaBot);
router.get("/:codigo/:numero/:anio/salida", prepararSalidaExpedienteParaBot);
router.post("/:codigo/:numero/:anio/salida", registrarSalidaExpedienteParaBot);
router.get("/:codigo/:numero/:anio", consultarExpedienteParaBot);

export default router;
