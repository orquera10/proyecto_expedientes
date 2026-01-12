import pool from "../config/db.js";

export async function obtenerMovimientos() {
  const result = await pool.query(
    `SELECT id,
            codigo,
            numero,
            anio,
            fechamov,
            origen,
            destino,
            motivo,
            estado,
            movimiento,
            usuario,
            codigounm,
            codigosector,
            usuariodestino,
            observaciones,
            codigoren,
            coddestino
     FROM movimiento
     ORDER BY id DESC`
  );
  return result.rows;
}

export async function guardarMovimiento(data) {
  const result = await pool.query(
    `INSERT INTO movimiento (
       codigo,
       numero,
       anio,
       fechamov,
       origen,
       destino,
       motivo,
       estado,
       movimiento,
       usuario,
       codigounm,
       codigosector,
       usuariodestino,
       observaciones,
       codigoren,
       coddestino
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8,
       $9, $10, $11, $12, $13, $14, $15, $16
     )
     RETURNING id,
               codigo,
               numero,
               anio,
               fechamov,
               origen,
               destino,
               motivo,
               estado,
               movimiento,
               usuario,
               codigounm,
               codigosector,
               usuariodestino,
               observaciones,
               codigoren,
               coddestino`,
    [
      data.codigo ?? null,
      data.numero ?? null,
      data.anio ?? null,
      data.fechamov ?? null,
      data.origen ?? null,
      data.destino ?? null,
      data.motivo ?? null,
      data.estado ?? null,
      data.movimiento ?? null,
      data.usuario ?? null,
      data.codigounm ?? null,
      data.codigosector ?? null,
      data.usuariodestino ?? null,
      data.observaciones ?? null,
      data.codigoren ?? null,
      data.coddestino ?? null,
    ]
  );
  return result.rows[0];
}

export async function obtenerMovimientosPorExpediente(codigo, numero, anio) {
  const result = await pool.query(
    `SELECT id,
            codigo,
            numero,
            anio,
            fechamov,
            origen,
            destino,
            motivo,
            estado,
            movimiento,
            usuario,
            codigounm,
            codigosector,
            usuariodestino,
            observaciones,
            codigoren,
            coddestino,
            habilitado
     FROM movimiento
     WHERE codigo = $1 AND numero = $2 AND anio = $3
     ORDER BY fechamov DESC NULLS LAST, id DESC`,
    [codigo, numero, anio]
  );
  return result.rows;
}
