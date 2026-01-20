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
     ORDER BY movimiento DESC NULLS LAST, id DESC`,
    [codigo, numero, anio]
  );
  return result.rows;
}

export async function deshabilitarMovimientoPorId(id) {
  const result = await pool.query(
    `UPDATE movimiento
     SET habilitado = FALSE
     WHERE id = $1
     RETURNING id, habilitado`,
    [id]
  );
  return result.rows[0];
}

export async function habilitarMovimientoPorId(id) {
  const result = await pool.query(
    `UPDATE movimiento
     SET habilitado = TRUE
     WHERE id = $1
     RETURNING id, habilitado`,
    [id]
  );
  return result.rows[0];
}

export async function deshabilitarMovimientosPorExpediente(codigo, numero, anio) {
  const result = await pool.query(
    `UPDATE movimiento
     SET habilitado = FALSE
     WHERE codigo = $1 AND numero = $2 AND anio = $3
     RETURNING id`,
    [codigo, numero, anio]
  );
  return result.rowCount;
}

export async function obtenerUltimasSalidas({
  codigosector,
  incluirTodos,
  limit,
  offset,
  filtrosBusqueda = {},
}) {
  const filtros = [];
  const values = [];

  if (!incluirTodos) {
    values.push(codigosector);
    filtros.push(`l.coddestino::text = $${values.length}::text`);
  }

  if (filtrosBusqueda.codigo) {
    values.push(String(filtrosBusqueda.codigo));
    filtros.push(`l.codigo::text = $${values.length}::text`);
  }
  if (filtrosBusqueda.numero) {
    values.push(Number(filtrosBusqueda.numero));
    filtros.push(`l.numero = $${values.length}`);
  }
  if (filtrosBusqueda.anio) {
    values.push(Number(filtrosBusqueda.anio));
    filtros.push(`l.anio = $${values.length}`);
  }
  if (filtrosBusqueda.asunto) {
    values.push(`%${filtrosBusqueda.asunto}%`);
    filtros.push(`e.asunto ILIKE $${values.length}`);
  }
  if (filtrosBusqueda.fechaInicio) {
    values.push(filtrosBusqueda.fechaInicio);
    filtros.push(`l.fechamov >= $${values.length}`);
  }
  if (filtrosBusqueda.fechaFin) {
    values.push(filtrosBusqueda.fechaFin);
    filtros.push(`l.fechamov <= $${values.length}`);
  }

  const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

  values.push(limit);
  const limitIndex = values.length;
  values.push(offset);
  const offsetIndex = values.length;

  const dataQuery = `
    WITH latest AS (
      SELECT DISTINCT ON (TRIM(codigo::text), numero, anio)
             id,
             TRIM(codigo::text) AS codigo,
             numero,
             anio,
             fechamov,
             origen,
             destino,
             motivo,
             estado,
             movimiento,
             usuario,
             codigosector,
             codigoren,
             coddestino
      FROM movimiento
      WHERE habilitado IS NOT FALSE
      ORDER BY TRIM(codigo::text), numero, anio, movimiento DESC NULLS LAST, id DESC
    )
    SELECT l.*,
           e.codinum,
           e.asunto,
           e.tipo,
           e.beneficiario,
           e.caja,
           e.partida,
           e.fechainicio,
           e.usuario AS expediente_usuario
    FROM latest l
    JOIN expedientes e
      ON TRIM(e.codigo::text) = l.codigo
     AND e.numero::text = l.numero::text
     AND e.anio::text = l.anio::text
    WHERE l.estado = 'S'
    ${filtros.length ? `AND ${filtros.join(" AND ")}` : ""}
    ORDER BY l.movimiento DESC NULLS LAST, l.id DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;

  const countQuery = `
    WITH latest AS (
      SELECT DISTINCT ON (TRIM(codigo::text), numero, anio)
             TRIM(codigo::text) AS codigo,
             numero,
             anio,
             coddestino,
             estado
      FROM movimiento
      WHERE habilitado IS NOT FALSE
      ORDER BY TRIM(codigo::text), numero, anio, movimiento DESC NULLS LAST, id DESC
    )
    SELECT COUNT(*)::int AS total
    FROM latest l
    JOIN expedientes e
      ON TRIM(e.codigo::text) = l.codigo
     AND e.numero::text = l.numero::text
     AND e.anio::text = l.anio::text
    WHERE l.estado = 'S'
    ${filtros.length ? `AND ${filtros.join(" AND ")}` : ""}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, values),
    pool.query(countQuery, values.slice(0, values.length - 2)),
  ]);

  return {
    rows: dataResult.rows,
    total: countResult.rows[0]?.total ?? 0,
  };
}

export async function obtenerUltimasEntradas({
  codigosector,
  incluirTodos,
  limit,
  offset,
  filtrosBusqueda = {},
}) {
  const filtros = [];
  const values = [];

  if (!incluirTodos) {
    values.push(codigosector);
    filtros.push(
      `(l.codigosector::text = $${values.length}::text OR l.coddestino::text = $${values.length}::text)`
    );
  }

  if (filtrosBusqueda.codigo) {
    values.push(String(filtrosBusqueda.codigo));
    filtros.push(`l.codigo::text = $${values.length}::text`);
  }
  if (filtrosBusqueda.numero) {
    values.push(Number(filtrosBusqueda.numero));
    filtros.push(`l.numero = $${values.length}`);
  }
  if (filtrosBusqueda.anio) {
    values.push(Number(filtrosBusqueda.anio));
    filtros.push(`l.anio = $${values.length}`);
  }
  if (filtrosBusqueda.asunto) {
    values.push(`%${filtrosBusqueda.asunto}%`);
    filtros.push(`e.asunto ILIKE $${values.length}`);
  }
  if (filtrosBusqueda.fechaInicio) {
    values.push(filtrosBusqueda.fechaInicio);
    filtros.push(`l.fechamov >= $${values.length}`);
  }
  if (filtrosBusqueda.fechaFin) {
    values.push(filtrosBusqueda.fechaFin);
    filtros.push(`l.fechamov <= $${values.length}`);
  }

  const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

  values.push(limit);
  const limitIndex = values.length;
  values.push(offset);
  const offsetIndex = values.length;

  const dataQuery = `
    WITH latest AS (
      SELECT DISTINCT ON (TRIM(codigo::text), numero, anio)
             id,
             TRIM(codigo::text) AS codigo,
             numero,
             anio,
             fechamov,
             origen,
             destino,
             motivo,
             estado,
             movimiento,
             usuario,
             codigosector,
             codigoren,
             coddestino
      FROM movimiento
      WHERE habilitado IS NOT FALSE
      ORDER BY TRIM(codigo::text), numero, anio, movimiento DESC NULLS LAST, id DESC
    )
    SELECT l.*,
           e.codinum,
           e.asunto,
           e.tipo,
           e.beneficiario,
           e.caja,
           e.partida,
           e.fechainicio,
           e.usuario AS expediente_usuario
    FROM latest l
    JOIN expedientes e
      ON TRIM(e.codigo::text) = l.codigo
     AND e.numero::text = l.numero::text
     AND e.anio::text = l.anio::text
    WHERE l.estado = 'E'
    ${filtros.length ? `AND ${filtros.join(" AND ")}` : ""}
    ORDER BY l.movimiento DESC NULLS LAST, l.id DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;

  const countQuery = `
    WITH latest AS (
      SELECT DISTINCT ON (TRIM(codigo::text), numero, anio)
             TRIM(codigo::text) AS codigo,
             numero,
             anio,
             codigosector,
             coddestino,
             estado
      FROM movimiento
      WHERE habilitado IS NOT FALSE
      ORDER BY TRIM(codigo::text), numero, anio, movimiento DESC NULLS LAST, id DESC
    )
    SELECT COUNT(*)::int AS total
    FROM latest l
    JOIN expedientes e
      ON TRIM(e.codigo::text) = l.codigo
     AND e.numero::text = l.numero::text
     AND e.anio::text = l.anio::text
    WHERE l.estado = 'E'
    ${filtros.length ? `AND ${filtros.join(" AND ")}` : ""}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, values),
    pool.query(countQuery, values.slice(0, values.length - 2)),
  ]);

  return {
    rows: dataResult.rows,
    total: countResult.rows[0]?.total ?? 0,
  };
}
