import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [estado, setEstado] = useState("idle");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setEstado("loading");
    setError("");
    setMensaje("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "No se pudo iniciar sesi\u00f3n");
      }

      localStorage.setItem("token", payload.token);
      localStorage.setItem("usuario", JSON.stringify(payload.usuario));
      setMensaje("Sesion iniciada correctamente.");
      setEstado("success");
      navigate("/", { replace: true });
    } catch (err) {
      setEstado("error");
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-stone text-ink">
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 left-[-10%] h-72 w-72 rounded-full bg-[radial-gradient(circle,_#fbe6c6_0%,_transparent_65%)]" />
        <div className="absolute right-[-5%] top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,_#d5f0e6_0%,_transparent_70%)]" />
        <main className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
          <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="flex flex-col justify-center gap-8">
              <div className="inline-flex w-fit items-center gap-3 rounded-full border border-moss/20 bg-white/70 px-4 py-2 text-sm font-semibold text-moss shadow-haze">
                <img
                  src={logo}
                  alt="Logo Expedientes"
                  className="h-8 w-8 rounded-xl border border-ink/10 bg-white object-cover"
                />
                Sistema de Expedientes
              </div>
              <div className="space-y-4">
                <h1 className="font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
                  Acceso seguro y moderno a los expedientes
                </h1>
                <p className="max-w-xl text-base text-ink/70 md:text-lg">
                  Inicia sesion para consultar expedientes, movimientos y reportes
                  internos con datos migrados del sistema antiguo.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-ink/70">
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-full bg-spice/15 text-center leading-8 text-spice">
                    01
                  </span>
                  Validacion de usuarios
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-full bg-moss/15 text-center leading-8 text-moss">
                    02
                  </span>
                  Acceso por roles y sectores
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-full bg-ink/10 text-center leading-8 text-ink">
                    03
                  </span>
                  Seguimiento historico
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-haze backdrop-blur">
              <div className="mb-8 space-y-2">
                <h2 className="font-display text-2xl font-semibold text-ink">
                  Iniciar sesion
                </h2>
                <p className="text-sm text-ink/60">
                  Usa tu usuario y clave para continuar.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <label className="block space-y-2 text-sm font-medium text-ink/80">
                  Usuario
                  <input
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-base text-ink shadow-sm outline-none transition focus:border-moss/60 focus:ring-2 focus:ring-moss/20"
                    value={usuario}
                    onChange={(event) => setUsuario(event.target.value)}
                    placeholder="tu.usuario"
                    autoComplete="username"
                    required
                  />
                </label>

                <label className="block space-y-2 text-sm font-medium text-ink/80">
                  Clave
                  <div className="relative">
                    <input
                      className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 pr-24 text-base text-ink shadow-sm outline-none transition focus:border-moss/60 focus:ring-2 focus:ring-moss/20"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      type={mostrarPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold text-moss transition hover:bg-moss/10"
                    >
                      {mostrarPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
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
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>
                    {estado === "loading" ? "Ingresando..." : "Ingresar"}
                  </span>
                  <span className="text-lg transition group-hover:translate-x-1">→</span>
                </button>
              </form>

            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Login;
