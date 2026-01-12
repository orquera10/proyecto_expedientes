import pool from "../src/config/db.js";

const reparticiones = [
  { codigoreparticion: "1", reparticion: "SECRETARIA DE NIÑEZ, ADOLESCENCIA Y FAMILIA" },
  { codigoreparticion: "2", reparticion: "DIR. PROV. DE PROT. INT. DE NIÑEZ, ADOL Y FLI" },
  { codigoreparticion: "3", reparticion: "DIRECCION DE ADULTOS MAYORES" },
  { codigoreparticion: "4", reparticion: "D.G.A. (MINISTERIO DE DESARROLLO)" },
  { codigoreparticion: "5", reparticion: "MINISTERIO DE DESARROLLO" },
  { codigoreparticion: "6", reparticion: "DIRECCION DE PERSONAL DE LA PROVINCIA" },
  { codigoreparticion: "7", reparticion: "DIRECCION DE TRAMITES Y ARCHIVO (C. GOBIERNO)" },
  { codigoreparticion: "8", reparticion: "CONTADURIA DE LA PROVINCIA" },
  { codigoreparticion: "9", reparticion: "DIRECCION PROVINCIAL DE PRESUPUESTOS" },
  { codigoreparticion: "10", reparticion: "DIRECCION PROVINCIAL DE LA JUVENTUD" },
  { codigoreparticion: "11", reparticion: "COORDINACION DEL PLAN INTEGRAL" },
  { codigoreparticion: "12", reparticion: "DIRECCION PROV. DE DISP. DE CUIDADOS" },
  { codigoreparticion: "13", reparticion: "COORDINACION OPD" },
  { codigoreparticion: "14", reparticion: "COORDINACION DE LOS DISP. DE CUIDADOS" },
  { codigoreparticion: "15", reparticion: "COORDINACION GESTION ADMINISTRATIVA" },
];

async function seed() {
  try {
    const values = reparticiones.flatMap((r) => [
      r.codigoreparticion,
      r.reparticion,
    ]);
    const valuesWithState = [];
    for (let i = 0; i < values.length; i += 2) {
      valuesWithState.push(values[i], values[i + 1], true);
    }
    const placeholdersWithState = reparticiones
      .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
      .join(", ");
    const sqlWithState = `
      INSERT INTO reparticion (codigoreparticion, reparticion, habilitado)
      VALUES ${placeholdersWithState}
      ON CONFLICT (codigoreparticion)
      DO UPDATE SET reparticion = EXCLUDED.reparticion, habilitado = EXCLUDED.habilitado
    `;
    await pool.query(sqlWithState, valuesWithState);
    console.log("Reparticiones cargadas.");
  } catch (err) {
    console.error("Error cargando reparticiones:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
