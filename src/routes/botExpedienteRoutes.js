import { Router } from "express";
import { consultarExpedienteParaBot } from "../controllers/botExpedienteController.js";
import { verificarBotApiKey } from "../middlewares/botApiKeyMiddleware.js";

const router = Router();
router.use(verificarBotApiKey);
router.get("/:codigo/:numero/:anio", consultarExpedienteParaBot);

export default router;
