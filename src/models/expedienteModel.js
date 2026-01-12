import pool from "../config/db.js";

export async function obtenerExpedientes() {
  const result = await pool.query(
    `SELECT codinum,
            codigo,
            numero,
            anio,
            fechainicio,
            asunto,
            iniciador,
            fojas,
            fechacarga,
            usuario,
            usuario_id,
            caja,
            beneficiario,
            fechaentrada,
            partida,
            reposicion,
            nacion,
            cajainterna,
            estado,
            habilitado,
            created_at
     FROM expedientes
     ORDER BY codinum DESC`
  );
  return result.rows;
}

export async function guardarExpediente(data) {
  const estado = data.estado || "pendiente";
  const result = await pool.query(
    `INSERT INTO expedientes (
       codigo,
       numero,
       anio,
       fechainicio,
       asunto,
       iniciador,
       fojas,
       fechacarga,
       usuario,
       usuario_id,
       caja,
       beneficiario,
       fechaentrada,
       partida,
       reposicion,
       nacion,
       cajainterna,
       estado,
       habilitado
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9,
       $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
     )
     RETURNING codinum,
               codigo,
               numero,
               anio,
               fechainicio,
               asunto,
               iniciador,
               fojas,
               fechacarga,
               usuario,
               usuario_id,
               caja,
               beneficiario,
               fechaentrada,
               partida,
               reposicion,
               nacion,
               cajainterna,
               estado,
               habilitado,
               created_at`,
    [
      data.codigo ?? null,
      data.numero,
      data.anio ?? null,
      data.fechainicio ?? null,
      data.asunto ?? null,
      data.iniciador ?? null,
      data.fojas ?? null,
      data.fechacarga ?? null,
      data.usuario ?? null,
      data.usuario_id ?? null,
      data.caja ?? null,
      data.beneficiario ?? null,
      data.fechaentrada ?? null,
      data.partida ?? null,
      data.reposicion ?? null,
      data.nacion ?? null,
      data.cajainterna ?? null,
      estado,
      data.habilitado ?? true,
    ]
  );
  return result.rows[0];
}
