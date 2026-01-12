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

export async function obtenerExpedientesFiltrados({
  fechaInicio,
  fechaFin,
  caja,
  beneficiario,
  asunto,
}) {
  const clauses = [];
  const values = [];

  if (fechaInicio) {
    values.push(fechaInicio);
    clauses.push(`fechainicio >= $${values.length}`);
  }
  if (fechaFin) {
    values.push(fechaFin);
    clauses.push(`fechainicio <= $${values.length}`);
  }
  if (caja) {
    values.push(`%${caja}%`);
    clauses.push(`caja ILIKE $${values.length}`);
  }
  if (beneficiario) {
    values.push(`%${beneficiario}%`);
    clauses.push(`beneficiario ILIKE $${values.length}`);
  }
  if (asunto) {
    values.push(`%${asunto}%`);
    clauses.push(`asunto ILIKE $${values.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT codinum,
            codigo,
            numero,
            anio,
            fechainicio,
            asunto,
            beneficiario,
            caja,
            estado,
            habilitado
     FROM expedientes
     ${where}
     ORDER BY fechainicio DESC NULLS LAST, codinum DESC`,
    values
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

export async function obtenerExpedientePorClave(codigo, numero, anio) {
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
     WHERE codigo = $1 AND numero = $2 AND anio = $3`,
    [codigo, numero, anio]
  );
  return result.rows[0];
}

export async function actualizarExpedientePorClave(codigo, numero, anio, data) {
  const result = await pool.query(
    `UPDATE expedientes
     SET fechainicio = $1,
         iniciador = $2,
         asunto = $3,
         beneficiario = $4,
         fojas = $5,
         cajainterna = $6,
         caja = $7
     WHERE codigo = $8 AND numero = $9 AND anio = $10
     RETURNING codinum,
               codigo,
               numero,
               anio,
               fechainicio,
               asunto,
               iniciador,
               fojas,
               caja,
               cajainterna,
               beneficiario,
               estado,
               habilitado,
               created_at`,
    [
      data.fechainicio ?? null,
      data.iniciador ?? null,
      data.asunto ?? null,
      data.beneficiario ?? null,
      data.fojas ?? null,
      data.cajainterna ?? null,
      data.caja ?? null,
      codigo,
      numero,
      anio,
    ]
  );
  return result.rows[0];
}
