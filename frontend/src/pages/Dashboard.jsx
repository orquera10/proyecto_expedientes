import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Dashboard() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [numero, setNumero] = useState("");
  const [anio, setAnio] = useState("");
  const [expediente, setExpediente] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [estado, setEstado] = useState("idle");
  const [error, setError] = useState("");
  const [seccionActiva, setSeccionActiva] = useState(null);
  const [listadoFiltros, setListadoFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    caja: "",
    beneficiario: "",
    asunto: "",
  });
  const [listadoResultados, setListadoResultados] = useState([]);
  const [listadoEstado, setListadoEstado] = useState("idle");
  const [listadoError, setListadoError] = useState("");
  const [modificacionKey, setModificacionKey] = useState({
    codigo: "",
    numero: "",
    anio: "",
  });
  const [modificacionData, setModificacionData] = useState({
    fechainicio: "",
    iniciador: "",
    asunto: "",
    beneficiario: "",
    fojas: "",
    cajainterna: "",
    caja: "",
  });
  const [modificacionEstado, setModificacionEstado] = useState("idle");
  const [modificacionError, setModificacionError] = useState("");
  const [modificacionMensaje, setModificacionMensaje] = useState("");
  const [modificacionEncontrado, setModificacionEncontrado] = useState(false);

  async function fetchExpediente(codigoValue, numeroValue, anioValue) {
    setEstado("loading");
    setError("");
    setExpediente(null);
    setMovimientos([]);

    const token = localStorage.getItem("token");
    if (!token) {
      setEstado("error");
      setError("No hay sesion activa.");
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const expedienteResp = await fetch(
        `${API_BASE}/api/expedientes/${codigoValue}/${numeroValue}/${anioValue}`,
        { headers }
      );
      const expedienteData = await expedienteResp.json();
      if (expedienteResp.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }
      if (!expedienteResp.ok) {
        throw new Error(
          expedienteData?.error || "No se pudo obtener el expediente"
        );
      }

      const movimientosResp = await fetch(
        `${API_BASE}/api/movimientos/expediente/${codigoValue}/${numeroValue}/${anioValue}`,
        { headers }
      );
      const movimientosData = await movimientosResp.json();
      if (movimientosResp.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }
      if (!movimientosResp.ok) {
        throw new Error(
          movimientosData?.error || "No se pudieron obtener los movimientos"
        );
      }

      setExpediente(expedienteData);
      setMovimientos(movimientosData);
      setEstado("success");
    } catch (err) {
      setEstado("error");
      setError(err.message);
    }
  }

  async function handleBuscar(event) {
    event.preventDefault();
    await fetchExpediente(codigo, numero, anio);
  }

  async function handleListado(event) {
    event.preventDefault();
    setListadoEstado("loading");
    setListadoError("");
    setListadoResultados([]);

    const token = localStorage.getItem("token");
    if (!token) {
      setListadoEstado("error");
      setListadoError("No hay sesion activa.");
      return;
    }

    const tieneFiltros =
      listadoFiltros.fecha_inicio ||
      listadoFiltros.fecha_fin ||
      listadoFiltros.caja ||
      listadoFiltros.beneficiario ||
      listadoFiltros.asunto;

    if (!tieneFiltros) {
      setListadoEstado("error");
      setListadoError("Ingresa al menos un filtro para buscar.");
      return;
    }

    try {
      const params = new URLSearchParams();
      if (listadoFiltros.fecha_inicio)
        params.set("fecha_inicio", listadoFiltros.fecha_inicio);
      if (listadoFiltros.fecha_fin)
        params.set("fecha_fin", listadoFiltros.fecha_fin);
      if (listadoFiltros.caja) params.set("caja", listadoFiltros.caja);
      if (listadoFiltros.beneficiario)
        params.set("beneficiario", listadoFiltros.beneficiario);
      if (listadoFiltros.asunto) params.set("asunto", listadoFiltros.asunto);

      const response = await fetch(
        `${API_BASE}/api/expedientes?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const payload = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(payload?.error || "No se pudo obtener el listado");
      }

      setListadoResultados(payload);
      setListadoEstado("success");
    } catch (err) {
      setListadoEstado("error");
      setListadoError(err.message);
    }
  }

  async function buscarParaModificar(codigoValue, numeroValue, anioValue) {
    setModificacionEstado("loading");
    setModificacionError("");
    setModificacionMensaje("");
    setModificacionEncontrado(false);

    const token = localStorage.getItem("token");
    if (!token) {
      setModificacionEstado("error");
      setModificacionError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/expedientes/${codigoValue}/${numeroValue}/${anioValue}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const payload = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(payload?.error || "No se pudo encontrar el expediente");
      }

      setModificacionData({
        fechainicio: payload.fechainicio ? payload.fechainicio.slice(0, 10) : "",
        iniciador: payload.iniciador || "",
        asunto: payload.asunto || "",
        beneficiario: payload.beneficiario || "",
        fojas: payload.fojas ? String(payload.fojas) : "",
        cajainterna: payload.cajainterna || "",
        caja: payload.caja || "",
      });
      setModificacionEncontrado(true);
      setModificacionEstado("idle");
    } catch (err) {
      setModificacionEstado("error");
      setModificacionError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-stone text-ink">
      <Navbar />
      <main className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-haze">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-ink/60">
            Menu principal
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            {[
              "Registrar Expedientes x 1 vez",
              "Entrada de Expedientes",
              "Salida de Expedientes",
              "Salida de Expedientes Grupales",
              "Listado de Expedientes",
              "Modificacion de Expedientes",
              "Consulta de Expedientes",
            ].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setSeccionActiva(label)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold shadow-sm transition ${
                  seccionActiva === label
                    ? "border-moss/60 bg-moss/10 text-moss"
                    : label === "Entrada de Expedientes"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300"
                      : label === "Salida de Expedientes"
                        ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300"
                        : "border-ink/15 bg-white text-ink hover:border-moss/40 hover:bg-moss/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-8">
          {![
            "Consulta de Expedientes",
            "Listado de Expedientes",
            "Modificacion de Expedientes",
          ].includes(seccionActiva) && (
            <div className="rounded-[32px] border border-ink/10 bg-white/80 p-8 shadow-haze">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <div className="h-24 w-24 rounded-full border border-ink/10 bg-white/90" />
              <div className="space-y-3">
                <p className="font-display text-2xl font-semibold text-ink md:text-3xl">
                  Ministerio de Desarrollo Social
                </p>
                <p className="text-sm text-ink/70 md:text-base">
                  Secretaria de Niñez, Adolescencia y Familia
                  <br />
                  Provincia de Jujuy
                </p>
              </div>
              <div className="rounded-3xl border border-moss/20 bg-moss/10 px-6 py-4 text-sm font-semibold text-moss">
                Seguimiento Interno de Expedientes
              </div>
            </div>
          </div>
          )}

          {seccionActiva === "Consulta de Expedientes" && (
            <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">
                  Consulta de Expedientes
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Ingresa codigo, numero y año para buscar el expediente.
                </p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-stone px-4 py-2 text-xs font-semibold text-ink/60">
                Resultado inmediato
              </div>
            </div>

            <form
              onSubmit={handleBuscar}
              className="mt-6 grid gap-4 md:grid-cols-3"
            >
              <label className="space-y-2 text-sm font-medium text-ink/70">
                Codigo
                <input
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                  value={codigo}
                  onChange={(event) => setCodigo(event.target.value)}
                  placeholder="Ej: 769"
                  required
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/70">
                Numero
                <input
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                  value={numero}
                  onChange={(event) => setNumero(event.target.value)}
                  placeholder="Ej: 254"
                  required
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-ink/70">
                Año
                <input
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                  value={anio}
                  onChange={(event) => setAnio(event.target.value)}
                  placeholder="Ej: 2025"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={estado === "loading"}
                className="md:col-span-3 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
              >
                {estado === "loading" ? "Buscando..." : "Buscar expediente"}
              </button>
              <button
                type="button"
                className="md:col-span-3 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink"
                onClick={() => {
                  setCodigo("");
                  setNumero("");
                  setAnio("");
                  setExpediente(null);
                  setMovimientos([]);
                  setEstado("idle");
                  setError("");
                }}
              >
                Limpiar
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
          )}

          {seccionActiva === "Modificacion de Expedientes" && (
            <div className="space-y-6">
              <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      Modificacion de Expedientes
                    </h2>
                    <p className="mt-1 text-sm text-ink/60">
                      Busca el expediente y luego actualiza los campos.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-stone px-4 py-2 text-xs font-semibold text-ink/60">
                    Resultado inmediato
                  </div>
                </div>

                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setModificacionEstado("loading");
                    setModificacionError("");
                    setModificacionMensaje("");

                    const token = localStorage.getItem("token");
                    if (!token) {
                      setModificacionEstado("error");
                      setModificacionError("No hay sesion activa.");
                      return;
                    }

                    await buscarParaModificar(
                      modificacionKey.codigo,
                      modificacionKey.numero,
                      modificacionKey.anio
                    );
                  }}
                  className="mt-6 grid gap-4 md:grid-cols-3"
                >
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Codigo
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={modificacionKey.codigo}
                      onChange={(event) =>
                        setModificacionKey((prev) => ({
                          ...prev,
                          codigo: event.target.value,
                        }))
                      }
                      placeholder="Ej: 769"
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Numero
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={modificacionKey.numero}
                      onChange={(event) =>
                        setModificacionKey((prev) => ({
                          ...prev,
                          numero: event.target.value,
                        }))
                      }
                      placeholder="Ej: 254"
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Anio
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={modificacionKey.anio}
                      onChange={(event) =>
                        setModificacionKey((prev) => ({
                          ...prev,
                          anio: event.target.value,
                        }))
                      }
                      placeholder="Ej: 2025"
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={modificacionEstado === "loading"}
                    className="md:col-span-3 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {modificacionEstado === "loading"
                      ? "Buscando..."
                      : "Buscar expediente"}
                  </button>
                  <button
                    type="button"
                    className="md:col-span-3 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink"
                    onClick={() => {
                      setModificacionKey({ codigo: "", numero: "", anio: "" });
                      setModificacionData({
                        fechainicio: "",
                        iniciador: "",
                        asunto: "",
                        beneficiario: "",
                        fojas: "",
                        cajainterna: "",
                        caja: "",
                      });
                      setModificacionEncontrado(false);
                      setModificacionEstado("idle");
                      setModificacionError("");
                      setModificacionMensaje("");
                    }}
                  >
                    Limpiar
                  </button>
                </form>
              </div>

              {modificacionEncontrado && (
                <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                  <h3 className="font-display text-xl font-semibold text-ink">
                    Resultado y cambios
                  </h3>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-1">
                      Fecha de inicio
                      <input
                        type="date"
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={modificacionData.fechainicio}
                        onChange={(event) =>
                          setModificacionData((prev) => ({
                            ...prev,
                            fechainicio: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-2">
                      Iniciado por
                      <input
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={modificacionData.iniciador}
                        onChange={(event) =>
                          setModificacionData((prev) => ({
                            ...prev,
                            iniciador: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                      Asunto
                      <textarea
                        rows={2}
                        className="w-full resize-none rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={modificacionData.asunto}
                        onChange={(event) =>
                          setModificacionData((prev) => ({
                            ...prev,
                            asunto: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                      Beneficiario
                      <input
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={modificacionData.beneficiario}
                        onChange={(event) =>
                          setModificacionData((prev) => ({
                            ...prev,
                            beneficiario: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/70">
                      Fojas
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={modificacionData.fojas}
                        onChange={(event) =>
                          setModificacionData((prev) => ({
                            ...prev,
                            fojas: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/70">
                      Caja interna
                      <input
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={modificacionData.cajainterna}
                        onChange={(event) =>
                          setModificacionData((prev) => ({
                            ...prev,
                            cajainterna: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/70">
                      Caja archivo
                      <input
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={modificacionData.caja}
                        onChange={(event) =>
                          setModificacionData((prev) => ({
                            ...prev,
                            caja: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={async () => {
                      setModificacionEstado("loading");
                      setModificacionError("");
                      setModificacionMensaje("");

                      const token = localStorage.getItem("token");
                      if (!token) {
                        setModificacionEstado("error");
                        setModificacionError("No hay sesion activa.");
                        return;
                      }

                      try {
                        const response = await fetch(
                          `${API_BASE}/api/expedientes/${modificacionKey.codigo}/${modificacionKey.numero}/${modificacionKey.anio}`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              fechainicio: modificacionData.fechainicio || null,
                              iniciador: modificacionData.iniciador || null,
                              asunto: modificacionData.asunto || null,
                              beneficiario: modificacionData.beneficiario || null,
                              fojas: modificacionData.fojas
                                ? Number(modificacionData.fojas)
                                : null,
                              cajainterna: modificacionData.cajainterna || null,
                              caja: modificacionData.caja || null,
                            }),
                          }
                        );
                        const payload = await response.json();
                        if (response.status === 401) {
                          localStorage.removeItem("token");
                          localStorage.removeItem("usuario");
                          navigate("/login", { replace: true });
                          return;
                        }
                        if (!response.ok) {
                          throw new Error(
                            payload?.error ||
                              "No se pudo actualizar el expediente"
                          );
                        }

                        setModificacionMensaje("Expediente actualizado.");
                        setModificacionEstado("success");
                        setModificacionKey({
                          codigo: "",
                          numero: "",
                          anio: "",
                        });
                        setModificacionData({
                          fechainicio: "",
                          iniciador: "",
                          asunto: "",
                          beneficiario: "",
                          fojas: "",
                          cajainterna: "",
                          caja: "",
                        });
                        setModificacionEncontrado(false);
                      } catch (err) {
                        setModificacionEstado("error");
                        setModificacionError(err.message);
                      }
                    }}
                      className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-ink px-10 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {modificacionEstado === "loading"
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              )}

              {modificacionError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {modificacionError}
                </div>
              )}
              {modificacionMensaje && (
                <div className="rounded-2xl border border-moss/20 bg-moss/10 px-4 py-3 text-sm text-moss">
                  {modificacionMensaje}
                </div>
              )}
            </div>
          )}
          {seccionActiva === "Listado de Expedientes" && (
            <div className="space-y-6">
              <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      Listado de Expedientes
                    </h2>
                    <p className="mt-1 text-sm text-ink/60">
                      Filtra por fecha, caja, beneficiario o asunto.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-stone px-4 py-2 text-xs font-semibold text-ink/60">
                    Filtros combinados
                  </div>
                </div>

                <form
                  onSubmit={handleListado}
                  className="mt-6 grid gap-4 md:grid-cols-2"
                >
                <label className="space-y-2 text-sm font-medium text-ink/70">
                  Fecha inicio
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                    value={listadoFiltros.fecha_inicio}
                    onChange={(event) =>
                      setListadoFiltros((prev) => ({
                        ...prev,
                        fecha_inicio: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/70">
                  Fecha fin
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                    value={listadoFiltros.fecha_fin}
                    onChange={(event) =>
                      setListadoFiltros((prev) => ({
                        ...prev,
                        fecha_fin: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/70">
                  Caja
                  <input
                    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                    value={listadoFiltros.caja}
                    onChange={(event) =>
                      setListadoFiltros((prev) => ({
                        ...prev,
                        caja: event.target.value,
                      }))
                    }
                    placeholder="Ej: 3"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/70">
                  Beneficiario
                  <input
                    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                    value={listadoFiltros.beneficiario}
                    onChange={(event) =>
                      setListadoFiltros((prev) => ({
                        ...prev,
                        beneficiario: event.target.value,
                      }))
                    }
                    placeholder="Apellido o nombre"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/70">
                  Asunto
                  <input
                    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                    value={listadoFiltros.asunto}
                    onChange={(event) =>
                      setListadoFiltros((prev) => ({
                        ...prev,
                        asunto: event.target.value,
                      }))
                    }
                    placeholder="Palabra clave"
                  />
                </label>

                <button
                  type="submit"
                  disabled={listadoEstado === "loading"}
                  className="md:col-span-2 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {listadoEstado === "loading" ? "Buscando..." : "Filtrar"}
                </button>
                <button
                  type="button"
                  className="md:col-span-2 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink"
                  onClick={() => {
                    setListadoFiltros({
                      fecha_inicio: "",
                      fecha_fin: "",
                      caja: "",
                      beneficiario: "",
                      asunto: "",
                    });
                    setListadoResultados([]);
                    setListadoEstado("idle");
                    setListadoError("");
                  }}
                >
                  Limpiar
                </button>
                </form>
              </div>

              <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <h3 className="font-display text-xl font-semibold text-ink">
                  Resultados
                </h3>

                {listadoError && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {listadoError}
                  </div>
                )}

                <div className="mt-6 max-h-[420px] w-full max-w-[900px] overflow-x-auto overflow-y-auto rounded-2xl border border-ink/10 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white text-xs uppercase tracking-[0.2em] text-ink/50">
                      <tr>
                        <th className="px-4 py-3">Expediente</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Caja</th>
                        <th className="px-4 py-3">Beneficiario</th>
                        <th className="px-4 py-3">Asunto</th>
                        <th className="px-4 py-3">Accion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listadoResultados.length === 0 && (
                        <tr>
                          <td
                            className="px-4 py-4 text-ink/60"
                            colSpan={6}
                          >
                            {listadoEstado === "loading"
                              ? "Cargando..."
                              : "Sin resultados"}
                          </td>
                        </tr>
                      )}
                      {listadoResultados.map((item) => (
                        <tr
                          key={item.codinum}
                          className="border-t border-ink/10"
                        >
                          <td className="px-4 py-3 font-semibold text-ink">
                            {item.codigo}-{item.numero}-{item.anio}
                          </td>
                          <td className="px-4 py-3 text-ink/60">
                            {item.fechainicio
                              ? new Date(item.fechainicio).toLocaleDateString()
                              : "N/D"}
                          </td>
                          <td className="px-4 py-3 text-ink/60">
                            {item.caja || "N/D"}
                          </td>
                          <td className="px-4 py-3 text-ink/60">
                            {item.beneficiario || "N/D"}
                          </td>
                          <td className="px-4 py-3 text-ink/60">
                            {item.asunto || "N/D"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label="Ver expediente"
                                title="Ver expediente"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-moss/30 bg-moss/10 text-base font-semibold text-moss transition hover:bg-moss/20"
                                onClick={() => {
                                  setSeccionActiva("Consulta de Expedientes");
                                  setCodigo(item.codigo ?? "");
                                  setNumero(String(item.numero ?? ""));
                                  setAnio(String(item.anio ?? ""));
                                  fetchExpediente(
                                    item.codigo ?? "",
                                    String(item.numero ?? ""),
                                    String(item.anio ?? "")
                                  );
                                }}
                              >
                                →
                              </button>
                              <button
                                type="button"
                                aria-label="Modificar expediente"
                                title="Modificar expediente"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-ink/15 bg-white text-base font-semibold text-ink transition hover:border-moss/40 hover:bg-moss/5"
                                onClick={() => {
                                  const codigoSel = item.codigo ?? "";
                                  const numeroSel = String(item.numero ?? "");
                                  const anioSel = String(item.anio ?? "");
                                  setSeccionActiva(
                                    "Modificacion de Expedientes"
                                  );
                                  setModificacionKey({
                                    codigo: codigoSel,
                                    numero: numeroSel,
                                    anio: anioSel,
                                  });
                                  buscarParaModificar(
                                    codigoSel,
                                    numeroSel,
                                    anioSel
                                  );
                                }}
                              >
                                ✎
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === "Consulta de Expedientes" &&
            (expediente || movimientos.length > 0) && (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
              {expediente && (
                <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                  <h3 className="font-display text-xl font-semibold text-ink">
                    Expediente
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-ink/70">
                    <p>
                      <span className="font-semibold text-ink">Asunto:</span>{" "}
                      {expediente.asunto || "Sin detalle"}
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Iniciador:</span>{" "}
                      {expediente.iniciador || "Sin detalle"}
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Estado:</span>{" "}
                      {expediente.estado || "N/D"}
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Beneficiario:</span>{" "}
                      {expediente.beneficiario || "N/D"}
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Fecha inicio:</span>{" "}
                      {expediente.fechainicio
                        ? new Date(expediente.fechainicio).toLocaleDateString()
                        : "N/D"}
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <h3 className="font-display text-xl font-semibold text-ink">
                  Movimientos
                </h3>
                <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-2">
                  {movimientos.length === 0 && (
                    <p className="text-sm text-ink/60">
                      No hay movimientos para este expediente.
                    </p>
                  )}
                  {movimientos.filter((mov) => mov.habilitado).map((mov) => (
                    <div
                      key={mov.id}
                      className={`rounded-2xl border px-4 py-3 text-sm text-ink/70 ${
                        mov.estado === "E"
                          ? "border-emerald-200 bg-emerald-50"
                          : mov.estado === "S"
                            ? "border-red-200 bg-red-50"
                            : "border-ink/10 bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/50">
                        <span>
                          {mov.fechamov
                            ? new Date(mov.fechamov).toLocaleDateString()
                            : "Sin fecha"}
                        </span>
                        <span>
                          Estado:{" "}
                          {mov.estado === "E"
                            ? "Entrada"
                            : mov.estado === "S"
                              ? "Salida"
                              : mov.estado || "N/D"}
                        </span>
                      </div>
                      <p className="mt-2 font-semibold text-ink">
                        {mov.origen || "Origen N/D"} →{" "}
                        {mov.destino || "Destino N/D"}
                      </p>
                      <p className="text-xs text-ink/50">
                        Usuario: {mov.usuario || "N/D"} · Movimiento:{" "}
                        {mov.movimiento || "N/D"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
