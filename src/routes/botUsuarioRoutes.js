import { Router } from "express";
import { autorizarUsuarioBot } from "../controllers/botUsuarioController.js";
import { verificarBotApiKey } from "../middlewares/botApiKeyMiddleware.js";

const router = Router();
router.use(verificarBotApiKey);
router.get("/telefono/:telefono", autorizarUsuarioBot);

export default router;
