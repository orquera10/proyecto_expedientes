import pool from "../src/config/db.js";

export async function vincularRemitosHistoricos() {
  const client = await pool.connect();
  try {
    console.log("Iniciando vinculación de movimientos históricos a remitos múltiples...");
    await client.query("BEGIN");

    // 1. Asegurar que remito_lote permita nulls en códigos si algún movimiento histórico no los tiene
    await client.query(`
      ALTER TABLE remito_lote 
        ALTER COLUMN codigoren DROP NOT NULL,
        ALTER COLUMN coddestino DROP NOT NULL;
    `);

    // 2. Obtener grupos de salidas múltiples históricas no vinculadas
    const queryGrupos = `
      WITH candidatos AS (
        SELECT 
          m.id,
          m.movimiento,
          m.fechamov,
          m.fechahora,
          m.origen,
          m.destino,
          COALESCE(
            NULLIF(TRIM(m.codigoren), ''),
            (SELECT s.codigosector FROM sector s WHERE LOWER(TRIM(s.sector)) = LOWER(TRIM(m.origen)) LIMIT 1),
            ''
          ) AS codigoren,
          COALESCE(
            NULLIF(TRIM(m.coddestino), ''),
            (SELECT s.codigosector FROM sector s WHERE LOWER(TRIM(s.sector)) = LOWER(TRIM(m.destino)) LIMIT 1),
            (SELECT r.codigoreparticion FROM reparticion r WHERE LOWER(TRIM(r.reparticion)) = LOWER(TRIM(m.destino)) LIMIT 1),
            ''
          ) AS coddestino,
          m.usuario,
          (
            SELECT u.id 
            FROM usuarios u 
            WHERE LOWER(TRIM(u.nombre)) = LOWER(TRIM(m.usuario)) 
               OR LOWER(TRIM(u.usuario)) = LOWER(TRIM(m.usuario)) 
            LIMIT 1
          ) AS usuario_id
        FROM movimiento m
        LEFT JOIN remito_lote_movimiento rlm ON rlm.movimiento_id = m.id
        WHERE m.estado = 'S'
          AND m.movimiento IS NOT NULL
          AND rlm.remito_lote_id IS NULL
      )
      SELECT 
        movimiento,
        fechamov,
        origen,
        destino,
        codigoren,
        coddestino,
        usuario,
        usuario_id,
        MAX(fechahora) AS fechahora,
        ARRAY_AGG(id ORDER BY id ASC) AS movimiento_ids,
        COUNT(*) AS cantidad
      FROM candidatos
      GROUP BY movimiento, fechamov, origen, destino, codigoren, coddestino, usuario, usuario_id
      HAVING COUNT(*) > 1
      ORDER BY fechamov ASC, movimiento ASC;
    `;

    const result = await client.query(queryGrupos);
    const grupos = result.rows;
    console.log(`Se encontraron ${grupos.length} lotes históricos para vincular.`);

    if (grupos.length === 0) {
      console.log("No hay lotes históricos pendientes de vinculación.");
      await client.query("COMMIT");
      return { totalLotes: 0, totalMovimientos: 0 };
    }

    let totalMovimientosVinculados = 0;
    const batchSize = 500;

    for (let i = 0; i < grupos.length; i += batchSize) {
      const chunk = grupos.slice(i, i + batchSize);

      for (const grupo of chunk) {
        const fechahora = grupo.fechahora || (grupo.fechamov ? new Date(grupo.fechamov) : new Date());

        // Insertar en remito_lote
        const remitoRes = await client.query(
          `INSERT INTO remito_lote (
             fechamov, fechahora, codigoren, coddestino, origen, destino, usuario_id, usuario, habilitado
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
           RETURNING id`,
          [
            grupo.fechamov,
            fechahora,
            grupo.codigoren || null,
            grupo.coddestino || null,
            grupo.origen || null,
            grupo.destino || null,
            grupo.usuario_id || null,
            grupo.usuario || null,
          ]
        );

        const remitoId = remitoRes.rows[0].id;
        const movIds = grupo.movimiento_ids;

        // Insertar en remito_lote_movimiento en bulk
        await client.query(
          `INSERT INTO remito_lote_movimiento (remito_lote_id, movimiento_id)
           SELECT $1, unnest($2::bigint[])`,
          [remitoId, movIds]
        );

        totalMovimientosVinculados += movIds.length;
      }
      console.log(`Procesados ${Math.min(i + batchSize, grupos.length)} / ${grupos.length} lotes...`);
    }

    await client.query("COMMIT");
    console.log(
      `✅ Vinculación completada con éxito: ${grupos.length} lotes creados y ${totalMovimientosVinculados} movimientos asociados.`
    );

    return { totalLotes: grupos.length, totalMovimientos: totalMovimientosVinculados };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error en la vinculación de remitos históricos:", error);
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] && process.argv[1].endsWith("vincularRemitosHistoricos.js")) {
  vincularRemitosHistoricos()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
