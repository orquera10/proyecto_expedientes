import { Router } from "express";
import { listarPartidas, crearPartida } from "../controllers/partidaController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listarPartidas);
router.post("/", crearPartida);

export default router;
