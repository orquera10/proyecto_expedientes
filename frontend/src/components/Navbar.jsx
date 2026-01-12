import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef(null);
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  useEffect(() => {
    function handleClick(event) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClick, true);
    return () => document.removeEventListener("mousedown", handleClick, true);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-moss text-sm font-semibold text-white shadow-sm">
            SE
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-ink">
              Expedientes
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">
              Panel principal
            </p>
          </div>
        </Link>

        <div className="relative ml-auto" ref={menuRef}>
          <button
            type="button"
            onClick={() => setAbierto((prev) => !prev)}
            className="flex items-center gap-4 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-moss/40 hover:shadow-md"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-spice/20 text-sm font-semibold text-spice">
              {(usuario?.nombre || "U").slice(0, 1)}
            </span>
            <span className="hidden text-left md:block">
              <span className="block text-xs text-ink/50">Usuario</span>
              <span className="block">
                {usuario?.nombre || usuario?.usuario || "Sin nombre"}
              </span>
            </span>
            <span className="text-xs text-ink/50">▾</span>
          </button>

          {abierto && (
            <div
              className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-ink/10 bg-white p-2 text-sm shadow-haze"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Link
                to="/perfil"
                className="block w-full rounded-xl px-3 py-2 text-left font-medium text-ink/80 transition hover:bg-ink/5"
                onClick={() => setAbierto(false)}
              >
                Perfil
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl px-3 py-2 text-left font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                Cerrar sesion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
