import pool from "../config/db.js";

export async function obtenerDatosRemitoLote(id) {
  const remitoResult = await pool.query(
    `SELECT id, fechamov, fechahora, codigoren, coddestino, origen, destino,
            usuario_id, usuario, habilitado
     FROM remito_lote
     WHERE id = $1`,
    [id]
  );
  const remito = remitoResult.rows[0];
  if (!remito) return null;

  const expedientesResult = await pool.query(
    `SELECT m.id AS movimiento_id,
            TRIM(m.codigo::text) AS codigo,
            m.numero,
            m.anio,
            m.motivo,
            e.tipo,
            e.asunto,
            e.fojas,
            e.beneficiario,
            e.partida
     FROM remito_lote_movimiento rlm
     JOIN movimiento m ON m.id = rlm.movimiento_id
     JOIN expedientes e
       ON TRIM(e.codigo::text) = TRIM(m.codigo::text)
      AND e.numero::text = m.numero::text
      AND e.anio::text = m.anio::text
     WHERE rlm.remito_lote_id = $1
       AND m.habilitado IS NOT FALSE
     ORDER BY m.id ASC`,
    [id]
  );
  return { ...remito, expedientes: expedientesResult.rows };
}
