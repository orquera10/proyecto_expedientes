import pool from "../config/db.js";
import { normalizeArgentinePhone } from "../utils/phone.js";

export async function autorizarUsuarioBot(req, res, next) {
  const telefono = normalizeArgentinePhone(req.params.telefono);
  if (!telefono) {
    return res.status(400).json({ autorizado: false, error: "Numero de telefono invalido" });
  }

  try {
    const result = await pool.query(
      `SELECT id, usuario, COALESCE(nombreusuario, nombre) AS nombre,
              nivel, codigosector
       FROM usuarios
       WHERE telefono = $1 AND habilitado IS NOT FALSE
       LIMIT 1`,
      [telefono]
    );
    const usuario = result.rows[0];
    if (!usuario) {
      return res.status(404).json({ autorizado: false });
    }
    return res.json({ autorizado: true, usuario });
  } catch (err) {
    next(err);
  }
}
