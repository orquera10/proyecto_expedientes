import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Perfil() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [estado, setEstado] = useState("idle");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [sectorNombre, setSectorNombre] = useState("");
  const rolUsuario = usuario?.tipo ?? usuario?.nivel;
  const rolLabel = rolUsuario === "S" ? "Superusuario" : "Usuario";

  useEffect(() => {
    if (!usuario?.codigosector) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    async function cargarSector() {
      try {
        const response = await fetch(`${API_BASE}/api/sectores`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) return;
        const payload = await response.json();
        const sector = payload.find(
          (item) => String(item.codigosector) === String(usuario.codigosector)
        );
        setSectorNombre(sector?.sector || "");
      } catch {
        setSectorNombre("");
      }
    }

    cargarSector();
  }, [usuario?.codigosector]);

  async function handleSubmit(event) {
    event.preventDefault();
    setEstado("loading");
    setError("");
    setMensaje("");

    const token = localStorage.getItem("token");
    if (!token) {
      setEstado("error");
      setError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password_actual: passwordActual,
          password_nueva: passwordNueva,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error || "No se pudo cambiar la contrase\u00f1a");
      }

      setMensaje("Contrase\u00f1a actualizada.");
      setPasswordActual("");
      setPasswordNueva("");
      setEstado("success");
    } catch (err) {
      setEstado("error");
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-stone text-ink">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <section className="rounded-[28px] border border-ink/10 bg-white/80 p-8 shadow-haze">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/60">
              Perfil
            </p>
            <h1 className="font-display text-3xl font-semibold text-ink">
              {usuario?.nombre || usuario?.usuario || "Usuario"}
            </h1>
            <p className="text-sm text-ink/60">
              {usuario?.email || "Sin email"}
            </p>
            <p className="text-sm text-ink/60">
              {usuario?.telefono || "Sin telefono de WhatsApp"}
            </p>
            <p className="text-sm text-ink/60">
              {sectorNombre || "Sin sector"}
            </p>
            <p className="text-sm text-ink/60">{rolLabel}</p>
          </div>

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <label className="space-y-2 text-sm font-medium text-ink/70">
              Password actual
              <input
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                value={passwordActual}
                onChange={(event) => setPasswordActual(event.target.value)}
                type="password"
                required
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-ink/70">
              Password nueva
              <input
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                value={passwordNueva}
                onChange={(event) => setPasswordNueva(event.target.value)}
                type="password"
                required
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {mensaje && (
              <div className="rounded-2xl border border-moss/20 bg-moss/10 px-4 py-3 text-sm text-moss">
                {mensaje}
              </div>
            )}

            <button
              type="submit"
              disabled={estado === "loading"}
              className="inline-flex items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
            >
              {estado === "loading" ? "Actualizando..." : "Cambiar contrase\u00f1a"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Perfil;
