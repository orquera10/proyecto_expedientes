import { Router } from "express";
import { responderConsulta } from "../controllers/aiController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.post("/chat", responderConsulta);

export default router;
