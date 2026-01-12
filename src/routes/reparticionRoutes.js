import { Router } from "express";
import {
  listarReparticiones,
  crearReparticion,
} from "../controllers/reparticionController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listarReparticiones);
router.post("/", crearReparticion);

export default router;
