import pool from "../config/db.js";
import { normalizeArgentinePhone } from "../utils/phone.js";

export class BotEntradaError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "BotEntradaError";
    this.status = status;
  }
}

export function usuarioPuedeDarEntrada(usuario, movimiento) {
  if (!usuario?.codigosector || !movimiento || movimiento.estado !== "S") return false;
  const sectorUsuario = String(usuario.codigosector);
  return usuario.nivel === "S" || sectorUsuario === "1" ||
    String(movimiento.coddestino || "") === sectorUsuario;
}

function validarClave({ codigo, numero, anio }) {
  const clave = {
    codigo: String(codigo || "").trim(),
    numero: Number(numero),
    anio: Number(anio),
  };
  if (!/^[a-zA-Z0-9]+$/.test(clave.codigo) ||
      !Number.isInteger(clave.numero) || clave.numero <= 0 ||
      !Number.isInteger(clave.anio) || clave.anio < 0 || clave.anio > 9999) {
    throw new BotEntradaError("Codigo, numero o anio invalidos", 400);
  }
  return clave;
}

async function buscarUsuario(telefono, db) {
  const normalizado = normalizeArgentinePhone(telefono);
  if (!normalizado) throw new BotEntradaError("Numero de telefono invalido", 400);

  const result = await db.query(
    `SELECT id, usuario, COALESCE(nombreusuario, nombre) AS nombre,
            nivel, codigosector
     FROM usuarios
     WHERE telefono = $1 AND habilitado IS NOT FALSE
     LIMIT 1`,
    [normalizado]
  );
  if (!result.rows[0]) throw new BotEntradaError("Usuario no autorizado", 403);
  return result.rows[0];
}

async function buscarUsuarioSesion(usuarioSesion, db) {
  const id = Number(usuarioSesion?.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BotEntradaError("Sesion de usuario invalida", 401);
  }
  const result = await db.query(
    `SELECT id, usuario, COALESCE(nombreusuario, nombre) AS nombre,
            nivel, codigosector
     FROM usuarios
     WHERE id = $1 AND habilitado IS NOT FALSE
     LIMIT 1`,
    [id]
  );
  if (!result.rows[0]) throw new BotEntradaError("Usuario no autorizado", 403);
  return result.rows[0];
}

async function preparar(
  { telefono, usuarioSesion, codigo, numero, anio },
  db,
  { lockExpediente = false } = {}
) {
  const clave = validarClave({ codigo, numero, anio });
  const usuario = usuarioSesion
    ? await buscarUsuarioSesion(usuarioSesion, db)
    : await buscarUsuario(telefono, db);

  const expedienteResult = await db.query(
    `SELECT codinum, TRIM(codigo::text) AS codigo, numero, anio, tipo,
            asunto, iniciador, beneficiario, fojas, caja, cajainterna
     FROM expedientes
     WHERE TRIM(codigo::text) = $1 AND numero::bigint = $2 AND anio = $3
       AND habilitado IS NOT FALSE
     ORDER BY codinum DESC
     LIMIT 1
     ${lockExpediente ? "FOR UPDATE" : ""}`,
    [clave.codigo, clave.numero, clave.anio]
  );
  const expediente = expedienteResult.rows[0];
  if (!expediente) throw new BotEntradaError("Expediente no encontrado", 404);

  const movimientoResult = await db.query(
    `SELECT id, movimiento, estado, origen, destino, codigosector, codigoren, coddestino
     FROM movimiento
     WHERE TRIM(codigo::text) = $1 AND numero::bigint = $2 AND anio = $3
       AND habilitado IS NOT FALSE
     ORDER BY movimiento DESC NULLS LAST, id DESC
     LIMIT 1`,
    [clave.codigo, clave.numero, clave.anio]
  );
  const movimientoActual = movimientoResult.rows[0];
  if (!movimientoActual || movimientoActual.estado !== "S") {
    throw new BotEntradaError("El expediente no esta disponible para dar entrada", 409);
  }
  if (!usuarioPuedeDarEntrada(usuario, movimientoActual)) {
    throw new BotEntradaError("El expediente no esta dirigido a tu sector", 403);
  }

  const sectorResult = await db.query(
    `SELECT codigosector, sector
     FROM sector
     WHERE codigosector::text = $1::text AND habilitado IS NOT FALSE
     LIMIT 1`,
    [String(usuario.codigosector)]
  );
  const sector = sectorResult.rows[0];
  if (!sector) throw new BotEntradaError("No se pudo determinar el sector de entrada", 400);

  return { usuario, expediente, movimientoActual, sector };
}

export async function prepararEntradaParaBot(data) {
  return preparar(data, pool);
}

export async function prepararEntradaParaUsuario(data, usuarioSesion) {
  return preparar({ ...data, usuarioSesion }, pool);
}

async function registrarEntrada(data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const preparada = await preparar(data, client, { lockExpediente: true });
    const fechaMovimiento = data.fechaentrada || new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaMovimiento)) {
      throw new BotEntradaError("Fecha de entrada invalida", 400);
    }
    const motivo = String(data.motivo || "").trim();
    const fojas = data.fojas !== undefined && data.fojas !== "" && data.fojas !== null
      ? Number(data.fojas)
      : null;
    if (fojas !== null && (!Number.isFinite(fojas) || fojas < 0)) {
      throw new BotEntradaError("Cantidad de fojas invalida", 400);
    }

    await client.query(
      `UPDATE expedientes
       SET fojas = COALESCE($1, fojas),
           caja = COALESCE($2, caja),
           cajainterna = COALESCE($3, cajainterna),
           fechaentrada = COALESCE($4, fechaentrada)
       WHERE TRIM(codigo::text) = $5 AND numero::bigint = $6 AND anio = $7`,
      [
        fojas,
        data.caja ?? null,
        data.cajainterna ?? null,
        fechaMovimiento,
        preparada.expediente.codigo,
        Number(preparada.expediente.numero),
        Number(preparada.expediente.anio),
      ]
    );

    const movimientoResult = await client.query(
      `INSERT INTO movimiento (
         codigo, numero, anio, fechamov, origen, destino, motivo, estado,
         usuario, codigosector, codigoren, coddestino, habilitado
       )
       VALUES ($1, $2, $3, $4, $5, $5, $6, 'E', $7, $8, $8, $8, TRUE)
       RETURNING id, movimiento, fechamov`,
      [
        preparada.expediente.codigo,
        Number(preparada.expediente.numero),
        Number(preparada.expediente.anio),
        fechaMovimiento,
        preparada.sector.sector,
        motivo ? motivo.toUpperCase() : null,
        preparada.usuario.nombre || preparada.usuario.usuario || null,
        preparada.sector.codigosector,
      ]
    );

    await client.query("COMMIT");
    return {
      ok: true,
      expediente: preparada.expediente,
      sector: preparada.sector,
      movimiento: movimientoResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function registrarEntradaParaBot(data) {
  return registrarEntrada(data);
}

export async function registrarEntradaParaUsuario(data, usuarioSesion) {
  return registrarEntrada({ ...data, usuarioSesion });
}
