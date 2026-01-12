import { Router } from "express";
import { listarSectores, crearSector } from "../controllers/sectorController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listarSectores);
router.post("/", crearSector);

export default router;
