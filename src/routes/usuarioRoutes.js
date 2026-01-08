import { Router } from "express";
import {
  listarUsuarios,
  crearUsuario,
  obtenerUsuario,
  actualizarUsuarioController,
  borrarUsuario,
} from "../controllers/usuarioController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listarUsuarios);
router.post("/", crearUsuario);
router.get("/:id", obtenerUsuario);
router.put("/:id", actualizarUsuarioController);
router.delete("/:id", borrarUsuario);

export default router;
