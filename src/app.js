import express from "express";
import cors from "cors";
import expedienteRoutes from "./routes/expedienteRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import sectorRoutes from "./routes/sectorRoutes.js";
import reparticionRoutes from "./routes/reparticionRoutes.js";
import partidaRoutes from "./routes/partidaRoutes.js";
import movimientoRoutes from "./routes/movimientoRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import pool from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

async function ensureExpedientesTipoColumn() {
  try {
    await pool.query(
      "ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS tipo TEXT"
    );
  } catch (err) {
    console.error("Error asegurando columna tipo:", err);
  }
}

async function ensureExpedientesCodinumSequence() {
  try {
    const seqResult = await pool.query(
      "SELECT pg_get_serial_sequence('expedientes', 'codinum') AS seq"
    );
    let seqName = seqResult.rows[0]?.seq;
    if (!seqName) {
      seqName = "expedientes_codinum_seq";
      await pool.query(
        "CREATE SEQUENCE IF NOT EXISTS expedientes_codinum_seq"
      );
      await pool.query(
        "ALTER TABLE expedientes ALTER COLUMN codinum SET DEFAULT nextval('expedientes_codinum_seq')"
      );
    }
    await pool.query(
      "SELECT setval($1::regclass, COALESCE((SELECT MAX(codinum) FROM expedientes), 0) + 1, false)",
      [seqName]
    );
  } catch (err) {
    console.error("Error asegurando secuencia de codinum:", err);
  }
}

ensureExpedientesTipoColumn();
ensureExpedientesCodinumSequence();

// Rutas de la API
app.use("/api/expedientes", expedienteRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sectores", sectorRoutes);
app.use("/api/reparticiones", reparticionRoutes);
app.use("/api/partidas", partidaRoutes);
app.use("/api/movimientos", movimientoRoutes);
app.use("/api/ai", aiRoutes);

// Salud general del servicio
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Prueba de conexión a base de datos
app.get("/health/db", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    next(err);
  }
});

// Manejador 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejador de errores
// Si hay un error no controlado en controladores/modelos, se captura aquí.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

export default app;
