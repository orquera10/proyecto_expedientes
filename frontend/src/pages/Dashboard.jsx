import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import logo from "../assets/logo.svg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Dashboard() {
  const navigate = useNavigate();
  const usuarioInfo = (() => {
    const stored = localStorage.getItem("usuario");
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  })();
  const todayISO = () => new Date().toISOString().slice(0, 10);
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
  const [entradaResultados, setEntradaResultados] = useState([]);
  const [entradaEstado, setEntradaEstado] = useState("idle");
  const [entradaError, setEntradaError] = useState("");
  const [entradaPage, setEntradaPage] = useState(1);
  const [entradaTotal, setEntradaTotal] = useState(0);
  const [entradaLimit] = useState(10);
  const [entradaFiltros, setEntradaFiltros] = useState({
    codigo: "",
    numero: "",
    anio: "",
    asunto: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [entradaModalOpen, setEntradaModalOpen] = useState(false);
  const [entradaDetalle, setEntradaDetalle] = useState(null);
  const [entradaForm, setEntradaForm] = useState({
    fechaentrada: "",
    motivo: "",
    fojas: "",
    cajainterna: "",
    caja: "",
  });
  const [entradaGuardarEstado, setEntradaGuardarEstado] = useState("idle");
  const [entradaGuardarError, setEntradaGuardarError] = useState("");
  const [entradaGuardarMensaje, setEntradaGuardarMensaje] = useState("");
  const [salidaResultados, setSalidaResultados] = useState([]);
  const [salidaEstado, setSalidaEstado] = useState("idle");
  const [salidaError, setSalidaError] = useState("");
  const [salidaPage, setSalidaPage] = useState(1);
  const [salidaTotal, setSalidaTotal] = useState(0);
  const [salidaLimit] = useState(10);
  const [salidaFiltros, setSalidaFiltros] = useState({
    codigo: "",
    numero: "",
    anio: "",
    asunto: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [salidaModalOpen, setSalidaModalOpen] = useState(false);
  const [salidaDetalle, setSalidaDetalle] = useState(null);
  const [salidaForm, setSalidaForm] = useState({
    fechasalida: "",
    motivo: "",
    destino: "",
    fojas: "",
    cajainterna: "",
    caja: "",
  });
  const [salidaGuardarEstado, setSalidaGuardarEstado] = useState("idle");
  const [salidaGuardarError, setSalidaGuardarError] = useState("");
  const [salidaGuardarMensaje, setSalidaGuardarMensaje] = useState("");
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
  const [partidas, setPartidas] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [reparticiones, setReparticiones] = useState([]);
  const sectorActual = sectores.find(
    (sector) =>
      String(sector.codigosector) === String(usuarioInfo?.codigosector || "")
  );
  const [partidaModalOpen, setPartidaModalOpen] = useState(false);
  const [partidaQuery, setPartidaQuery] = useState("");
  const [mostrarCrearPartida, setMostrarCrearPartida] = useState(false);
  const [partidaNueva, setPartidaNueva] = useState({
    numero: "",
    nombre: "",
  });
  const [partidaCrearEstado, setPartidaCrearEstado] = useState("idle");
  const [partidaCrearError, setPartidaCrearError] = useState("");
  const [cargaData, setCargaData] = useState({
    codigo: "",
    numero: "",
    anio: "",
    fechainicio: "",
    fechaentrada: "",
    fechacarga: "",
    asunto: "",
    iniciador: "",
    beneficiario: "",
    fojas: "",
    cajainterna: "",
    caja: "",
    partida: "",
    partidaNombre: "",
    reposicion: false,
    nacion: false,
    motivo: "",
    origen: "",
    destino: "",
  });
  const [cargaEstado, setCargaEstado] = useState("idle");
  const [cargaError, setCargaError] = useState("");
  const [cargaMensaje, setCargaMensaje] = useState("");
  const [consultaActiva, setConsultaActiva] = useState(null);
  const movimientoActual = movimientos.find((mov) => mov.habilitado !== false);
  const puedeEntrada =
    !!movimientoActual &&
    movimientoActual.estado === "S" &&
    (usuarioInfo?.nivel === "S" ||
      String(usuarioInfo?.codigosector || "") === "1" ||
      String(movimientoActual.coddestino || "") ===
        String(usuarioInfo?.codigosector || ""));
  const puedeSalida =
    !!movimientoActual &&
    movimientoActual.estado === "E" &&
    (usuarioInfo?.nivel === "S" ||
      String(usuarioInfo?.codigosector || "") === "1" ||
      String(movimientoActual.codigosector || "") ===
        String(usuarioInfo?.codigosector || ""));

  useEffect(() => {
    if (!cargaMensaje) return;
    const timeout = setTimeout(() => setCargaMensaje(""), 4000);
    return () => clearTimeout(timeout);
  }, [cargaMensaje]);

  useEffect(() => {
    if (!cargaError) return;
    const timeout = setTimeout(() => setCargaError(""), 5000);
    return () => clearTimeout(timeout);
  }, [cargaError]);

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    if (!listadoError) return;
    const timeout = setTimeout(() => setListadoError(""), 5000);
    return () => clearTimeout(timeout);
  }, [listadoError]);

  useEffect(() => {
    if (!entradaError) return;
    const timeout = setTimeout(() => setEntradaError(""), 5000);
    return () => clearTimeout(timeout);
  }, [entradaError]);

  useEffect(() => {
    if (!entradaGuardarError) return;
    const timeout = setTimeout(() => setEntradaGuardarError(""), 5000);
    return () => clearTimeout(timeout);
  }, [entradaGuardarError]);

  useEffect(() => {
    if (!entradaGuardarMensaje) return;
    const timeout = setTimeout(() => setEntradaGuardarMensaje(""), 4000);
    return () => clearTimeout(timeout);
  }, [entradaGuardarMensaje]);

  useEffect(() => {
    if (!salidaError) return;
    const timeout = setTimeout(() => setSalidaError(""), 5000);
    return () => clearTimeout(timeout);
  }, [salidaError]);

  useEffect(() => {
    if (!salidaGuardarError) return;
    const timeout = setTimeout(() => setSalidaGuardarError(""), 5000);
    return () => clearTimeout(timeout);
  }, [salidaGuardarError]);

  useEffect(() => {
    if (!salidaGuardarMensaje) return;
    const timeout = setTimeout(() => setSalidaGuardarMensaje(""), 4000);
    return () => clearTimeout(timeout);
  }, [salidaGuardarMensaje]);

  useEffect(() => {
    if (!modificacionError) return;
    const timeout = setTimeout(() => setModificacionError(""), 5000);
    return () => clearTimeout(timeout);
  }, [modificacionError]);

  useEffect(() => {
    if (!modificacionMensaje) return;
    const timeout = setTimeout(() => setModificacionMensaje(""), 4000);
    return () => clearTimeout(timeout);
  }, [modificacionMensaje]);

  useEffect(() => {
    if (seccionActiva !== "Registrar Expedientes x 1 vez") return;
    setCargaData((prev) => ({
      ...prev,
      origen: prev.origen || usuarioInfo?.codigosector || "",
      fechaentrada: prev.fechaentrada || todayISO(),
      fechainicio: prev.fechainicio || todayISO(),
      fechacarga: prev.fechacarga || todayISO(),
    }));
  }, [seccionActiva, usuarioInfo?.codigosector]);

  useEffect(() => {
    if (seccionActiva !== "Entrada de Expedientes") return;
    fetchEntradas(entradaPage);
  }, [seccionActiva, entradaPage]);

  useEffect(() => {
    if (!entradaModalOpen) return;
    setEntradaForm((prev) => ({
      ...prev,
      fechaentrada: prev.fechaentrada || todayISO(),
    }));
    cargarSectores();
  }, [entradaModalOpen]);

  useEffect(() => {
    if (seccionActiva !== "Salida de Expedientes") return;
    fetchSalidas(salidaPage);
  }, [seccionActiva, salidaPage]);

  useEffect(() => {
    if (!salidaModalOpen) return;
    setSalidaForm((prev) => ({
      ...prev,
      fechasalida: prev.fechasalida || todayISO(),
    }));
    cargarSectores();
  }, [salidaModalOpen]);

  async function fetchEntradas(page) {
    setEntradaEstado("loading");
    setEntradaError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setEntradaEstado("error");
      setEntradaError("No hay sesion activa.");
      return;
    }

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(entradaLimit),
      });
      if (entradaFiltros.codigo) params.set("codigo", entradaFiltros.codigo);
      if (entradaFiltros.numero) params.set("numero", entradaFiltros.numero);
      if (entradaFiltros.anio) params.set("anio", entradaFiltros.anio);
      if (entradaFiltros.asunto) params.set("asunto", entradaFiltros.asunto);
      if (entradaFiltros.fecha_inicio)
        params.set("fecha_inicio", entradaFiltros.fecha_inicio);
      if (entradaFiltros.fecha_fin)
        params.set("fecha_fin", entradaFiltros.fecha_fin);

      const response = await fetch(
        `${API_BASE}/api/movimientos/salidas/entrada?${params.toString()}`,
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
        throw new Error(payload?.error || "No se pudo cargar la entrada");
      }

      setEntradaResultados(payload.data || []);
      setEntradaTotal(payload.total || 0);
      setEntradaEstado("success");
    } catch (err) {
      setEntradaEstado("error");
      setEntradaError(err.message);
    }
  }

  async function abrirModalEntrada(item) {
    setEntradaGuardarError("");
    setEntradaGuardarMensaje("");
    setEntradaDetalle(null);
    setEntradaModalOpen(true);
    setEntradaForm({
      fechaentrada: todayISO(),
      motivo: "",
      fojas: "",
      cajainterna: "",
      caja: "",
    });

    const token = localStorage.getItem("token");
    if (!token) {
      setEntradaGuardarError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/expedientes/${item.codigo}/${item.numero}/${item.anio}`,
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
        throw new Error(payload?.error || "No se pudo cargar el expediente");
      }

      setEntradaDetalle(payload);
      setEntradaForm((prev) => ({
        ...prev,
        fojas: payload.fojas ? String(payload.fojas) : "",
        cajainterna: payload.cajainterna || "",
        caja: payload.caja || "",
      }));
    } catch (err) {
      setEntradaGuardarError(err.message);
    }
  }

  function handleBuscarEntrada(event) {
    event.preventDefault();
    setEntradaPage(1);
    fetchEntradas(1);
  }

  async function guardarEntrada(event) {
    event.preventDefault();
    if (!entradaDetalle) return;

    setEntradaGuardarEstado("loading");
    setEntradaGuardarError("");
    setEntradaGuardarMensaje("");

    const token = localStorage.getItem("token");
    if (!token) {
      setEntradaGuardarEstado("error");
      setEntradaGuardarError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/movimientos/entrada`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          codigo: entradaDetalle.codigo,
          numero: entradaDetalle.numero,
          anio: entradaDetalle.anio,
          fechaentrada: entradaForm.fechaentrada || todayISO(),
          motivo: entradaForm.motivo || null,
          fojas: entradaForm.fojas ? Number(entradaForm.fojas) : null,
          cajainterna: entradaForm.cajainterna || null,
          caja: entradaForm.caja || null,
        }),
      });
      const payload = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(payload?.error || "No se pudo registrar la entrada");
      }

      setEntradaGuardarMensaje("Entrada registrada correctamente.");
      setEntradaGuardarEstado("success");
      setEntradaModalOpen(false);
      setEntradaDetalle(null);
      await fetchEntradas(entradaPage);
      if (consultaActiva) {
        await fetchExpediente(
          consultaActiva.codigo,
          consultaActiva.numero,
          consultaActiva.anio
        );
      }
    } catch (err) {
      setEntradaGuardarEstado("error");
      setEntradaGuardarError(err.message);
    }
  }

  async function fetchSalidas(page) {
    setSalidaEstado("loading");
    setSalidaError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setSalidaEstado("error");
      setSalidaError("No hay sesion activa.");
      return;
    }

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(salidaLimit),
      });
      if (salidaFiltros.codigo) params.set("codigo", salidaFiltros.codigo);
      if (salidaFiltros.numero) params.set("numero", salidaFiltros.numero);
      if (salidaFiltros.anio) params.set("anio", salidaFiltros.anio);
      if (salidaFiltros.asunto) params.set("asunto", salidaFiltros.asunto);
      if (salidaFiltros.fecha_inicio)
        params.set("fecha_inicio", salidaFiltros.fecha_inicio);
      if (salidaFiltros.fecha_fin)
        params.set("fecha_fin", salidaFiltros.fecha_fin);

      const response = await fetch(
        `${API_BASE}/api/movimientos/entradas/salida?${params.toString()}`,
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
        throw new Error(payload?.error || "No se pudo cargar la salida");
      }

      setSalidaResultados(payload.data || []);
      setSalidaTotal(payload.total || 0);
      setSalidaEstado("success");
    } catch (err) {
      setSalidaEstado("error");
      setSalidaError(err.message);
    }
  }

  function handleBuscarSalida(event) {
    event.preventDefault();
    setSalidaPage(1);
    fetchSalidas(1);
  }

  async function abrirModalSalida(item) {
    setSalidaGuardarError("");
    setSalidaGuardarMensaje("");
    setSalidaDetalle(null);
    setSalidaModalOpen(true);
    setSalidaForm({
      fechasalida: todayISO(),
      motivo: "",
      destino: "",
      fojas: "",
      cajainterna: "",
      caja: "",
    });

    const token = localStorage.getItem("token");
    if (!token) {
      setSalidaGuardarError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/expedientes/${item.codigo}/${item.numero}/${item.anio}`,
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
        throw new Error(payload?.error || "No se pudo cargar el expediente");
      }

      setSalidaDetalle(payload);
      setSalidaForm((prev) => ({
        ...prev,
        fojas: payload.fojas ? String(payload.fojas) : "",
        cajainterna: payload.cajainterna || "",
        caja: payload.caja || "",
      }));
    } catch (err) {
      setSalidaGuardarError(err.message);
    }
  }

  async function guardarSalida(event) {
    event.preventDefault();
    if (!salidaDetalle) return;

    setSalidaGuardarEstado("loading");
    setSalidaGuardarError("");
    setSalidaGuardarMensaje("");

    const token = localStorage.getItem("token");
    if (!token) {
      setSalidaGuardarEstado("error");
      setSalidaGuardarError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/movimientos/salida`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          codigo: salidaDetalle.codigo,
          numero: salidaDetalle.numero,
          anio: salidaDetalle.anio,
          fechasalida: salidaForm.fechasalida || todayISO(),
          motivo: salidaForm.motivo || null,
          destino: salidaForm.destino || null,
          fojas: salidaForm.fojas ? Number(salidaForm.fojas) : null,
          cajainterna: salidaForm.cajainterna || null,
          caja: salidaForm.caja || null,
        }),
      });
      const payload = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(payload?.error || "No se pudo registrar la salida");
      }

      setSalidaGuardarMensaje("Salida registrada correctamente.");
      setSalidaGuardarEstado("success");
      setSalidaModalOpen(false);
      setSalidaDetalle(null);
      await fetchSalidas(salidaPage);
      if (consultaActiva) {
        await fetchExpediente(
          consultaActiva.codigo,
          consultaActiva.numero,
          consultaActiva.anio
        );
      }
    } catch (err) {
      setSalidaGuardarEstado("error");
      setSalidaGuardarError(err.message);
    }
  }

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
    setConsultaActiva({ codigo, numero, anio });
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

  async function cargarPartidas() {
    if (partidas.length > 0) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const response = await fetch(`${API_BASE}/api/partidas`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      navigate("/login", { replace: true });
      return;
    }
    const payload = await response.json();
    if (response.ok) {
      setPartidas(payload.filter((item) => item.habilitado !== false));
    }
  }

  async function cargarSectores() {
    if (sectores.length > 0) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const response = await fetch(`${API_BASE}/api/sectores`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      navigate("/login", { replace: true });
      return;
    }
    const payload = await response.json();
    if (response.ok) {
      setSectores(payload.filter((item) => item.habilitado !== false));
    }
  }

  async function crearPartida(event) {
    event.preventDefault();
    setPartidaCrearEstado("loading");
    setPartidaCrearError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setPartidaCrearEstado("error");
      setPartidaCrearError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/partidas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          numero: partidaNueva.numero,
          nombre: partidaNueva.nombre,
          habilitado: true,
        }),
      });
      const payload = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(payload?.error || "No se pudo crear la partida");
      }

      setPartidas((prev) => [payload, ...prev]);
      setCargaData((prev) => ({
        ...prev,
        partida: payload.numero,
        partidaNombre: payload.nombre,
      }));
      setPartidaNueva({ numero: "", nombre: "" });
      setMostrarCrearPartida(false);
      setPartidaModalOpen(false);
      setPartidaCrearEstado("idle");
    } catch (err) {
      setPartidaCrearEstado("error");
      setPartidaCrearError(err.message);
    }
  }

  async function cargarReparticiones() {
    if (reparticiones.length > 0) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const response = await fetch(`${API_BASE}/api/reparticiones`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      navigate("/login", { replace: true });
      return;
    }
    const payload = await response.json();
    if (response.ok) {
      setReparticiones(payload.filter((item) => item.habilitado !== false));
    }
  }

  async function handleCargarExpediente(event) {
    event.preventDefault();
    setCargaEstado("loading");
    setCargaError("");
    setCargaMensaje("");

    const token = localStorage.getItem("token");
    if (!token) {
      setCargaEstado("error");
      setCargaError("No hay sesion activa.");
      return;
    }

    try {
      const fechaEntradaFinal = cargaData.fechaentrada || todayISO();
      const fechaInicioFinal = cargaData.fechainicio || todayISO();
      const fechaCargaFinal = cargaData.fechacarga || todayISO();
      const existenteResp = await fetch(
        `${API_BASE}/api/expedientes/${cargaData.codigo}/${cargaData.numero}/${cargaData.anio}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (existenteResp.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }
      if (existenteResp.ok) {
        setCargaEstado("error");
        setCargaError(
          "Ya existe un expediente con el mismo codigo, numero y anio."
        );
        return;
      }
      if (existenteResp.status !== 404) {
        const existentePayload = await existenteResp.json();
        throw new Error(
          existentePayload?.error || "No se pudo validar el expediente"
        );
      }

      const response = await fetch(`${API_BASE}/api/expedientes/cargar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          codigo: cargaData.codigo,
          numero: cargaData.numero,
          anio: cargaData.anio,
          fechainicio: fechaInicioFinal,
          fechaentrada: fechaEntradaFinal,
          fechacarga: fechaCargaFinal,
          asunto: cargaData.asunto || null,
          iniciador: cargaData.iniciador || null,
          beneficiario: cargaData.beneficiario || null,
          fojas: cargaData.fojas ? Number(cargaData.fojas) : null,
          cajainterna: cargaData.cajainterna || null,
          caja: cargaData.caja || null,
          partida: cargaData.partida || null,
          reposicion: cargaData.reposicion,
          nacion: cargaData.nacion,
          motivo: cargaData.motivo || null,
          origen: cargaData.origen,
          destino: cargaData.destino,
        }),
      });
      const payload = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(payload?.error || "No se pudo cargar el expediente");
      }

      setCargaMensaje("Expediente cargado correctamente.");
      setCargaEstado("success");
      setCargaData({
        codigo: "",
        numero: "",
        anio: "",
        fechainicio: fechaInicioFinal,
        fechaentrada: fechaEntradaFinal,
        fechacarga: fechaCargaFinal,
        asunto: "",
        iniciador: "",
        beneficiario: "",
        fojas: "",
        cajainterna: "",
        caja: "",
        partida: "",
        partidaNombre: "",
        reposicion: false,
        nacion: false,
        motivo: "",
        origen: usuarioInfo?.codigosector || "",
        destino: "",
      });
    } catch (err) {
      setCargaEstado("error");
      setCargaError(err.message);
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
              "Listado de Expedientes",
              "Modificacion de Expedientes",
              "Consulta de Expedientes",
            ].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setSeccionActiva(label);
                  if (label === "Registrar Expedientes x 1 vez") {
                    cargarPartidas();
                    cargarSectores();
                    cargarReparticiones();
                  }
                  if (label === "Entrada de Expedientes") {
                    setEntradaPage(1);
                  }
                  if (label === "Salida de Expedientes") {
                    setSalidaPage(1);
                  }
                }}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold shadow-sm transition ${
                  seccionActiva === label
                    ? label === "Salida de Expedientes"
                      ? "border-red-400 bg-red-500 text-white"
                      : label === "Entrada de Expedientes"
                        ? "border-emerald-400 bg-emerald-500 text-white"
                        : "border-black bg-black text-white"
                    : label === "Entrada de Expedientes"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300"
                      : label === "Salida de Expedientes"
                          ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300"
                          : "border-ink/20 bg-white text-ink hover:border-ink/40 hover:bg-black hover:text-white"
                } cursor-pointer`}
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
            "Registrar Expedientes x 1 vez",
            "Entrada de Expedientes",
            "Salida de Expedientes",
          ].includes(seccionActiva) && (
            <div className="rounded-[32px] border border-ink/10 bg-white/80 p-8 shadow-haze">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <img
                src={logo}
                alt="Logo Expedientes"
                className="h-24 w-24 rounded-3xl border border-ink/10 bg-white/90 object-cover shadow-sm"
              />
              <div className="space-y-3">
                <p className="font-display text-2xl font-semibold text-ink md:text-3xl">
                  Ministerio de Desarrollo Humano
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
              <div className="md:col-span-3 flex flex-wrap items-center gap-3">
                {puedeEntrada && (
                  <button
                    type="button"
                    onClick={() =>
                      abrirModalEntrada({
                        codigo: expediente?.codigo,
                        numero: expediente?.numero,
                        anio: expediente?.anio,
                      })
                    }
                    className="w-full inline-flex cursor-pointer items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 transition hover:border-emerald-300"
                  >
                    Dar entrada
                  </button>
                )}
                {puedeSalida && (
                  <button
                    type="button"
                    onClick={() =>
                      abrirModalSalida({
                        codigo: expediente?.codigo,
                        numero: expediente?.numero,
                        anio: expediente?.anio,
                      })
                    }
                    className="w-full inline-flex cursor-pointer items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-700 transition hover:border-red-300"
                  >
                    Dar salida
                  </button>
                )}
              </div>
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
          {seccionActiva === "Registrar Expedientes x 1 vez" && (
            <div className="space-y-6">
              <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      Carga de Expedientes
                    </h2>
                    <p className="mt-1 text-sm text-ink/60">
                      Registra el expediente y genera el primer movimiento.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleCargarExpediente}
                  className="mt-6 grid gap-4 md:grid-cols-3"
                >
                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-2">
                    Usuario
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={usuarioInfo?.nombre || usuarioInfo?.usuario || ""}
                      disabled
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Fecha carga
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20 disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/50 disabled:shadow-none disabled:ring-0"
                      value={cargaData.fechacarga}
                      disabled
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Codigo
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={cargaData.codigo}
                      onChange={(event) =>
                        setCargaData((prev) => ({
                          ...prev,
                          codigo: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Numero
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={cargaData.numero}
                      onChange={(event) =>
                        setCargaData((prev) => ({
                          ...prev,
                          numero: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Anio
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={cargaData.anio}
                      onChange={(event) =>
                        setCargaData((prev) => ({
                          ...prev,
                          anio: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <div className="grid gap-4 md:col-span-3 md:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-ink/70">
                      Fecha entrada
                      <input
                        type="date"
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={cargaData.fechaentrada}
                        onChange={(event) =>
                          setCargaData((prev) => ({
                            ...prev,
                            fechaentrada: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/70">
                      Fecha inicio
                      <input
                        type="date"
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={cargaData.fechainicio}
                        onChange={(event) =>
                          setCargaData((prev) => ({
                            ...prev,
                            fechainicio: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-6 md:col-span-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-ink/70">
                      <input
                        type="checkbox"
                        checked={cargaData.reposicion}
                        onChange={(event) =>
                          setCargaData((prev) => ({
                            ...prev,
                            reposicion: event.target.checked,
                          }))
                        }
                      />
                      Marcar reposicion
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-ink/70">
                      <input
                        type="checkbox"
                        checked={cargaData.nacion}
                        onChange={(event) =>
                          setCargaData((prev) => ({
                            ...prev,
                            nacion: event.target.checked,
                          }))
                        }
                      />
                      Marcar nacion
                    </label>
                  </div>

                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                    Iniciado por
                    <select
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={cargaData.iniciador}
                      onChange={(event) =>
                        setCargaData((prev) => ({
                          ...prev,
                          iniciador: event.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Seleccionar</option>
                      {reparticiones.map((reparticion) => (
                        <option
                          key={reparticion.codigoreparticion}
                          value={reparticion.reparticion}
                        >
                          {reparticion.codigoreparticion} -{" "}
                          {reparticion.reparticion}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                    Asunto
                    <textarea
                      rows={2}
                      className="w-full resize-none rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={cargaData.asunto}
                      onChange={(event) =>
                        setCargaData((prev) => ({
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
                      value={cargaData.beneficiario}
                      onChange={(event) =>
                        setCargaData((prev) => ({
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
                      value={cargaData.fojas}
                      onChange={(event) =>
                        setCargaData((prev) => ({
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
                      value={cargaData.cajainterna}
                      onChange={(event) =>
                        setCargaData((prev) => ({
                          ...prev,
                          cajainterna: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Caja archivo{" "}
                    <span className="text-xs font-semibold text-red-500">
                      (Solo Inf. Contable)
                    </span>
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={cargaData.caja}
                      onChange={(event) =>
                        setCargaData((prev) => ({
                          ...prev,
                          caja: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                    Partida
                    <div className="flex gap-2">
                      <input
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={
                          cargaData.partida
                            ? `${cargaData.partida} - ${cargaData.partidaNombre}`
                            : ""
                        }
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPartidaModalOpen(true);
                          setPartidaQuery("");
                          cargarPartidas();
                        }}
                        className="rounded-2xl border border-ink/20 bg-white px-4 text-sm font-semibold text-ink/70 transition hover:border-moss/40 hover:text-ink"
                      >
                        Buscar
                      </button>
                    </div>
                  </label>

                  <div className="rounded-2xl border border-ink/10 bg-stone/60 p-4 md:col-span-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                        Movimiento inicial
                      </span>
                      {/* <span className="text-xs text-ink/40">
                        Origen, destino y motivo
                      </span> */}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-2">
                        Motivo
                        <textarea
                          rows={2}
                          className="w-full resize-none rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                          value={cargaData.motivo}
                          onChange={(event) =>
                            setCargaData((prev) => ({
                              ...prev,
                              motivo: event.target.value,
                            }))
                          }
                        />
                      </label>
                    <label className="space-y-2 text-sm font-medium text-ink/70">
                      Origen
                      <select
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20 disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/50 disabled:shadow-none disabled:ring-0"
                        value={cargaData.origen}
                        onChange={(event) =>
                          setCargaData((prev) => ({
                            ...prev,
                            origen: event.target.value,
                          }))
                        }
                        disabled={usuarioInfo?.nivel !== "S"}
                        required
                      >
                          <option value="">Seleccionar</option>
                          {sectores.map((sector) => (
                            <option
                              key={sector.codigosector}
                              value={sector.codigosector}
                            >
                              {sector.codigosector} - {sector.sector}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm font-medium text-ink/70">
                        Destino
                        <select
                          className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                          value={cargaData.destino}
                          onChange={(event) =>
                            setCargaData((prev) => ({
                              ...prev,
                              destino: event.target.value,
                            }))
                          }
                          required
                        >
                          <option value="">Seleccionar</option>
                          {sectores.map((sector) => (
                            <option
                              key={sector.codigosector}
                              value={sector.codigosector}
                            >
                              {sector.codigosector} - {sector.sector}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={cargaEstado === "loading"}
                    className="md:col-span-3 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {cargaEstado === "loading"
                      ? "Guardando..."
                      : "Guardar expediente"}
                  </button>
                </form>

                {cargaError && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {cargaError}
                  </div>
                )}
                {cargaMensaje && (
                  <div className="mt-4 rounded-2xl border border-moss/20 bg-moss/10 px-4 py-3 text-sm text-moss">
                    {cargaMensaje}
                  </div>
                )}
              </div>
            </div>
          )}

          {seccionActiva === "Entrada de Expedientes" && (
            <div className="space-y-6">
              <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      Entrada de Expedientes
                    </h2>
                    <p className="mt-1 text-sm text-ink/60">
                      {usuarioInfo?.nivel === "S"
                        ? "Ultimas salidas registradas."
                        : "Ultimas salidas dirigidas a tu sector."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-stone px-4 py-2 text-xs font-semibold text-ink/60">
                    Pagina {entradaPage}
                  </div>
                </div>

                <form
                  onSubmit={handleBuscarEntrada}
                  className="mt-6 grid gap-4 md:grid-cols-3"
                >
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Codigo
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={entradaFiltros.codigo}
                      onChange={(event) =>
                        setEntradaFiltros((prev) => ({
                          ...prev,
                          codigo: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Numero
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={entradaFiltros.numero}
                      onChange={(event) =>
                        setEntradaFiltros((prev) => ({
                          ...prev,
                          numero: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Anio
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={entradaFiltros.anio}
                      onChange={(event) =>
                        setEntradaFiltros((prev) => ({
                          ...prev,
                          anio: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                    Asunto
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={entradaFiltros.asunto}
                      onChange={(event) =>
                        setEntradaFiltros((prev) => ({
                          ...prev,
                          asunto: event.target.value,
                        }))
                      }
                      placeholder="Palabra clave"
                    />
                  </label>
                  <div className="grid gap-4 md:col-span-3 md:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-ink/70">
                      Fecha inicio
                      <input
                        type="date"
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={entradaFiltros.fecha_inicio}
                        onChange={(event) =>
                          setEntradaFiltros((prev) => ({
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
                        value={entradaFiltros.fecha_fin}
                        onChange={(event) =>
                          setEntradaFiltros((prev) => ({
                            ...prev,
                            fecha_fin: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-3 md:col-span-3">
                    <button
                      type="submit"
                      className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss"
                    >
                      Buscar
                    </button>
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink"
                      onClick={() => {
                        setEntradaFiltros({
                          codigo: "",
                          numero: "",
                          anio: "",
                          asunto: "",
                          fecha_inicio: "",
                          fecha_fin: "",
                        });
                        setEntradaPage(1);
                        fetchEntradas(1);
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                </form>

                {entradaError && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {entradaError}
                  </div>
                )}

                <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10">
                  <div className="max-h-[420px] overflow-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-white text-ink/60">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Codigo</th>
                          <th className="px-4 py-3 font-semibold">Numero</th>
                          <th className="px-4 py-3 font-semibold">Anio</th>
                          <th className="px-4 py-3 font-semibold">Asunto</th>
                          <th className="px-4 py-3 font-semibold">Destino</th>
                          <th className="px-4 py-3 font-semibold">Fecha</th>
                          <th className="px-4 py-3 font-semibold">Accion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/10">
                        {entradaEstado === "loading" && (
                          <tr>
                            <td className="px-4 py-4 text-ink/60" colSpan={7}>
                              Cargando...
                            </td>
                          </tr>
                        )}
                        {entradaEstado !== "loading" &&
                          entradaResultados.length === 0 && (
                            <tr>
                              <td
                                className="px-4 py-4 text-ink/60"
                                colSpan={7}
                              >
                                No hay expedientes para mostrar.
                              </td>
                            </tr>
                          )}
                        {entradaResultados.map((item) => (
                          <tr key={`${item.codigo}-${item.numero}-${item.anio}`}>
                            <td className="px-4 py-3 font-semibold text-ink">
                              {item.codigo || "N/D"}
                            </td>
                            <td className="px-4 py-3">{item.numero || "N/D"}</td>
                            <td className="px-4 py-3">{item.anio || "N/D"}</td>
                            <td className="px-4 py-3">
                              {item.asunto || "Sin asunto"}
                            </td>
                            <td className="px-4 py-3">
                              {item.destino || "N/D"}
                            </td>
                            <td className="px-4 py-3">
                              {item.fechamov
                                ? new Date(item.fechamov).toLocaleDateString()
                                : "N/D"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => abrirModalEntrada(item)}
                                  aria-label="Dar entrada"
                                  title="Dar entrada"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:border-emerald-300"
                                >
                                  <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 4v10" />
                                    <path d="M8 10l4 4 4-4" />
                                    <path d="M4 20h16" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  aria-label="Ver expediente"
                                  title="Ver expediente"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition hover:border-moss/40 hover:bg-moss/5"
                                  onClick={() => {
                                    setSeccionActiva("Consulta de Expedientes");
                                    setCodigo(item.codigo ?? "");
                                    setNumero(String(item.numero ?? ""));
                                    setAnio(String(item.anio ?? ""));
                                    setConsultaActiva({
                                      codigo: item.codigo ?? "",
                                      numero: String(item.numero ?? ""),
                                      anio: String(item.anio ?? ""),
                                    });
                                    fetchExpediente(
                                      item.codigo ?? "",
                                      String(item.numero ?? ""),
                                      String(item.anio ?? "")
                                    );
                                  }}
                                >
                                  <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="M21 21l-4.3-4.3" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink/60">
                  <span>
                    Total: {entradaTotal} registros
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEntradaPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={entradaPage === 1 || entradaEstado === "loading"}
                      className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/70 transition hover:border-moss/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const totalPages = Math.max(
                          Math.ceil(entradaTotal / entradaLimit),
                          1
                        );
                        setEntradaPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        );
                      }}
                      disabled={
                        entradaEstado === "loading" ||
                        entradaPage >=
                          Math.ceil(entradaTotal / entradaLimit || 1)
                      }
                      className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/70 transition hover:border-moss/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === "Salida de Expedientes" && (
            <div className="space-y-6">
              <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      Salida de Expedientes
                    </h2>
                    <p className="mt-1 text-sm text-ink/60">
                      {usuarioInfo?.nivel === "S"
                        ? "Ultimas entradas registradas."
                        : "Expedientes en tu sector listos para salida."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-stone px-4 py-2 text-xs font-semibold text-ink/60">
                    Pagina {salidaPage}
                  </div>
                </div>

                <form
                  onSubmit={handleBuscarSalida}
                  className="mt-6 grid gap-4 md:grid-cols-3"
                >
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Codigo
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={salidaFiltros.codigo}
                      onChange={(event) =>
                        setSalidaFiltros((prev) => ({
                          ...prev,
                          codigo: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Numero
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={salidaFiltros.numero}
                      onChange={(event) =>
                        setSalidaFiltros((prev) => ({
                          ...prev,
                          numero: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Anio
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={salidaFiltros.anio}
                      onChange={(event) =>
                        setSalidaFiltros((prev) => ({
                          ...prev,
                          anio: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                    Asunto
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={salidaFiltros.asunto}
                      onChange={(event) =>
                        setSalidaFiltros((prev) => ({
                          ...prev,
                          asunto: event.target.value,
                        }))
                      }
                      placeholder="Palabra clave"
                    />
                  </label>
                  <div className="grid gap-4 md:col-span-3 md:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-ink/70">
                      Fecha inicio
                      <input
                        type="date"
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={salidaFiltros.fecha_inicio}
                        onChange={(event) =>
                          setSalidaFiltros((prev) => ({
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
                        value={salidaFiltros.fecha_fin}
                        onChange={(event) =>
                          setSalidaFiltros((prev) => ({
                            ...prev,
                            fecha_fin: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-3 md:col-span-3">
                    <button
                      type="submit"
                      className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss"
                    >
                      Buscar
                    </button>
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink"
                      onClick={() => {
                        setSalidaFiltros({
                          codigo: "",
                          numero: "",
                          anio: "",
                          asunto: "",
                          fecha_inicio: "",
                          fecha_fin: "",
                        });
                        setSalidaPage(1);
                        fetchSalidas(1);
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                </form>

                {salidaError && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {salidaError}
                  </div>
                )}

                <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10">
                  <div className="max-h-[420px] overflow-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-white text-ink/60">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Codigo</th>
                          <th className="px-4 py-3 font-semibold">Numero</th>
                          <th className="px-4 py-3 font-semibold">Anio</th>
                          <th className="px-4 py-3 font-semibold">Asunto</th>
                          <th className="px-4 py-3 font-semibold">Origen</th>
                          <th className="px-4 py-3 font-semibold">Fecha</th>
                          <th className="px-4 py-3 font-semibold">Accion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/10">
                        {salidaEstado === "loading" && (
                          <tr>
                            <td className="px-4 py-4 text-ink/60" colSpan={7}>
                              Cargando...
                            </td>
                          </tr>
                        )}
                        {salidaEstado !== "loading" &&
                          salidaResultados.length === 0 && (
                            <tr>
                              <td
                                className="px-4 py-4 text-ink/60"
                                colSpan={7}
                              >
                                No hay expedientes para mostrar.
                              </td>
                            </tr>
                          )}
                        {salidaResultados.map((item) => (
                          <tr key={`${item.codigo}-${item.numero}-${item.anio}`}>
                            <td className="px-4 py-3 font-semibold text-ink">
                              {item.codigo || "N/D"}
                            </td>
                            <td className="px-4 py-3">{item.numero || "N/D"}</td>
                            <td className="px-4 py-3">{item.anio || "N/D"}</td>
                            <td className="px-4 py-3">
                              {item.asunto || "Sin asunto"}
                            </td>
                            <td className="px-4 py-3">
                              {item.origen || "N/D"}
                            </td>
                            <td className="px-4 py-3">
                              {item.fechamov
                                ? new Date(item.fechamov).toLocaleDateString()
                                : "N/D"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => abrirModalSalida(item)}
                                  aria-label="Dar salida"
                                  title="Dar salida"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:border-red-300"
                                >
                                  <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 20V10" />
                                    <path d="M8 14l4-4 4 4" />
                                    <path d="M4 4h16" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  aria-label="Ver expediente"
                                  title="Ver expediente"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition hover:border-moss/40 hover:bg-moss/5"
                                  onClick={() => {
                                    setSeccionActiva("Consulta de Expedientes");
                                    setCodigo(item.codigo ?? "");
                                    setNumero(String(item.numero ?? ""));
                                    setAnio(String(item.anio ?? ""));
                                    setConsultaActiva({
                                      codigo: item.codigo ?? "",
                                      numero: String(item.numero ?? ""),
                                      anio: String(item.anio ?? ""),
                                    });
                                    fetchExpediente(
                                      item.codigo ?? "",
                                      String(item.numero ?? ""),
                                      String(item.anio ?? "")
                                    );
                                  }}
                                >
                                  <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="M21 21l-4.3-4.3" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink/60">
                  <span>
                    Total: {salidaTotal} registros
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSalidaPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={salidaPage === 1 || salidaEstado === "loading"}
                      className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/70 transition hover:border-moss/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const totalPages = Math.max(
                          Math.ceil(salidaTotal / salidaLimit),
                          1
                        );
                        setSalidaPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        );
                      }}
                      disabled={
                        salidaEstado === "loading" ||
                        salidaPage >= Math.ceil(salidaTotal / salidaLimit || 1)
                      }
                      className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/70 transition hover:border-moss/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
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
                <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-2">
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
                          <span className="line-clamp-2 block">
                            {item.asunto || "N/D"}
                          </span>
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
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold text-ink">
                      Expediente
                    </h3>
                  </div>
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
                      <p className="mt-1 text-xs text-ink/60">
                        Motivo: {mov.motivo || "N/D"}
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
        {entradaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-haze">
              <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
                <h3 className="font-display text-xl font-semibold text-ink">
                  Dar entrada al expediente
                </h3>
                <button
                  type="button"
                  onClick={() => setEntradaModalOpen(false)}
                  className="rounded-full px-3 py-1 text-sm text-ink/60 hover:bg-ink/5"
                >
                  Cerrar
                </button>
              </div>
              <div className="max-h-[calc(90vh-84px)] overflow-y-auto px-6 pb-6">
                {entradaGuardarError && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {entradaGuardarError}
                  </div>
                )}
                {entradaGuardarMensaje && (
                  <div className="mt-4 rounded-2xl border border-moss/20 bg-moss/10 px-4 py-3 text-sm text-moss">
                    {entradaGuardarMensaje}
                  </div>
                )}

                <form onSubmit={guardarEntrada} className="mt-6 grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-2">
                  Usuario
                  <input
                    className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                    value={usuarioInfo?.nombre || usuarioInfo?.usuario || ""}
                    disabled
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/70">
                  Fecha entrada
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                    value={entradaForm.fechaentrada}
                    onChange={(event) =>
                      setEntradaForm((prev) => ({
                        ...prev,
                        fechaentrada: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-ink/70">
                  Codigo
                  <input
                    className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                    value={entradaDetalle?.codigo || ""}
                    disabled
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/70">
                  Numero
                  <input
                    className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                    value={entradaDetalle?.numero || ""}
                    disabled
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/70">
                  Anio
                  <input
                    className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                    value={entradaDetalle?.anio || ""}
                    disabled
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-2">
                  Partida
                  <input
                    className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                    value={entradaDetalle?.partida || ""}
                    disabled
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/70">
                  Fecha inicio
                  <input
                    className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                    value={
                      entradaDetalle?.fechainicio
                        ? entradaDetalle.fechainicio.slice(0, 10)
                        : ""
                    }
                    disabled
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                  Iniciado por
                  <input
                    className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                    value={entradaDetalle?.iniciador || ""}
                    disabled
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                  Asunto
                  <textarea
                    rows={2}
                    className="w-full resize-none rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                    value={entradaDetalle?.asunto || ""}
                    disabled
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                  Beneficiario
                  <input
                    className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                    value={entradaDetalle?.beneficiario || ""}
                    disabled
                  />
                </label>

                <div className="md:col-span-3 mt-2 rounded-2xl border border-ink/10 bg-stone/60 p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                    Datos modificables
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="space-y-2 text-sm font-medium text-ink/70">
                      Fojas
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={entradaForm.fojas}
                        onChange={(event) =>
                          setEntradaForm((prev) => ({
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
                        value={entradaForm.cajainterna}
                        onChange={(event) =>
                          setEntradaForm((prev) => ({
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
                        value={entradaForm.caja}
                        onChange={(event) =>
                          setEntradaForm((prev) => ({
                            ...prev,
                            caja: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                      Motivo
                      <textarea
                        rows={2}
                        className="w-full resize-none rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={entradaForm.motivo}
                        onChange={(event) =>
                          setEntradaForm((prev) => ({
                            ...prev,
                            motivo: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="md:col-span-3 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="submit"
                    disabled={entradaGuardarEstado === "loading"}
                    className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {entradaGuardarEstado === "loading"
                      ? "Guardando..."
                      : "Registrar entrada"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntradaModalOpen(false)}
                    className="rounded-2xl border border-ink/20 bg-white px-6 py-3 text-sm font-semibold text-ink/70 transition hover:border-moss/40 hover:text-ink"
                  >
                    Cancelar
                  </button>
                </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {salidaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-haze">
              <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
                <h3 className="font-display text-xl font-semibold text-ink">
                  Dar salida al expediente
                </h3>
                <button
                  type="button"
                  onClick={() => setSalidaModalOpen(false)}
                  className="rounded-full px-3 py-1 text-sm text-ink/60 hover:bg-ink/5"
                >
                  Cerrar
                </button>
              </div>
              <div className="max-h-[calc(90vh-84px)] overflow-y-auto px-6 pb-6">
                {salidaGuardarError && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {salidaGuardarError}
                  </div>
                )}
                {salidaGuardarMensaje && (
                  <div className="mt-4 rounded-2xl border border-moss/20 bg-moss/10 px-4 py-3 text-sm text-moss">
                    {salidaGuardarMensaje}
                  </div>
                )}

                <form onSubmit={guardarSalida} className="mt-6 grid gap-4 md:grid-cols-3">
                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-2">
                    Usuario
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                      value={usuarioInfo?.nombre || usuarioInfo?.usuario || ""}
                      disabled
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Fecha salida
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={salidaForm.fechasalida}
                      onChange={(event) =>
                        setSalidaForm((prev) => ({
                          ...prev,
                          fechasalida: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Codigo
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                      value={salidaDetalle?.codigo || ""}
                      disabled
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Numero
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                      value={salidaDetalle?.numero || ""}
                      disabled
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Anio
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                      value={salidaDetalle?.anio || ""}
                      disabled
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-2">
                    Partida
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                      value={salidaDetalle?.partida || ""}
                      disabled
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Fecha inicio
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                      value={
                        salidaDetalle?.fechainicio
                          ? salidaDetalle.fechainicio.slice(0, 10)
                          : ""
                      }
                      disabled
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                    Iniciado por
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                      value={salidaDetalle?.iniciador || ""}
                      disabled
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                    Asunto
                    <textarea
                      rows={2}
                      className="w-full resize-none rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                      value={salidaDetalle?.asunto || ""}
                      disabled
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                    Beneficiario
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                      value={salidaDetalle?.beneficiario || ""}
                      disabled
                    />
                  </label>

                  <div className="md:col-span-3 rounded-2xl border border-ink/10 bg-stone/60 p-4">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                      Datos modificables
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="space-y-2 text-sm font-medium text-ink/70">
                        Fojas
                        <input
                          type="number"
                          className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                          value={salidaForm.fojas}
                          onChange={(event) =>
                            setSalidaForm((prev) => ({
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
                          value={salidaForm.cajainterna}
                          onChange={(event) =>
                            setSalidaForm((prev) => ({
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
                          value={salidaForm.caja}
                          onChange={(event) =>
                            setSalidaForm((prev) => ({
                              ...prev,
                              caja: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-3">
                        Motivo
                        <textarea
                          rows={2}
                          className="w-full resize-none rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                          value={salidaForm.motivo}
                          onChange={(event) =>
                            setSalidaForm((prev) => ({
                              ...prev,
                              motivo: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-3 grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-ink/70">
                      Origen
                      <input
                        className="w-full rounded-2xl border border-ink/15 bg-ink/5 px-4 py-3 text-sm text-ink/50"
                        value={
                          sectorActual
                            ? `${sectorActual.codigosector} - ${sectorActual.sector}`
                            : usuarioInfo?.codigosector || ""
                        }
                        disabled
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/70">
                      Destino
                      <select
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={salidaForm.destino}
                        onChange={(event) =>
                          setSalidaForm((prev) => ({
                            ...prev,
                            destino: event.target.value,
                          }))
                        }
                        required
                      >
                        <option value="">Seleccionar</option>
                        {sectores.map((sector) => (
                          <option
                            key={sector.codigosector}
                            value={sector.codigosector}
                          >
                            {sector.codigosector} - {sector.sector}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="md:col-span-3 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="submit"
                      disabled={salidaGuardarEstado === "loading"}
                      className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {salidaGuardarEstado === "loading"
                        ? "Guardando..."
                        : "Registrar salida"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSalidaModalOpen(false)}
                      className="rounded-2xl border border-ink/20 bg-white px-6 py-3 text-sm font-semibold text-ink/70 transition hover:border-moss/40 hover:text-ink"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {partidaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-haze">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-ink">
                Seleccionar partida
              </h3>
              <button
                type="button"
                onClick={() => setPartidaModalOpen(false)}
                className="rounded-full px-3 py-1 text-sm text-ink/60 hover:bg-ink/5"
              >
                Cerrar
              </button>
            </div>
            <div className="mt-4">
              <input
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                placeholder="Buscar por numero o nombre"
                value={partidaQuery}
                onChange={(event) => setPartidaQuery(event.target.value)}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setMostrarCrearPartida((prev) => !prev);
                  setPartidaCrearError("");
                }}
                className="rounded-2xl border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink/70 transition hover:border-moss/40 hover:text-ink"
              >
                Agregar partida
              </button>
              {partidaCrearEstado === "error" && (
                <span className="text-sm text-red-600">{partidaCrearError}</span>
              )}
            </div>
            {mostrarCrearPartida && (
              <form onSubmit={crearPartida} className="mt-4 grid gap-3 md:grid-cols-3">
                <input
                  className="rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                  placeholder="Numero"
                  value={partidaNueva.numero}
                  onChange={(event) =>
                    setPartidaNueva((prev) => ({
                      ...prev,
                      numero: event.target.value,
                    }))
                  }
                  required
                />
                <input
                  className="md:col-span-2 rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                  placeholder="Nombre de partida"
                  value={partidaNueva.nombre}
                  onChange={(event) =>
                    setPartidaNueva((prev) => ({
                      ...prev,
                      nombre: event.target.value,
                    }))
                  }
                  required
                />
                <div className="md:col-span-3 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={partidaCrearEstado === "loading"}
                    className="inline-flex items-center justify-center rounded-2xl bg-ink px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {partidaCrearEstado === "loading" ? "Guardando..." : "Guardar partida"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarCrearPartida(false)}
                    className="rounded-2xl border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink/70 transition hover:border-moss/40 hover:text-ink"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
            <div className="mt-4 max-h-[360px] overflow-y-auto rounded-2xl border border-ink/10">
              <ul className="divide-y divide-ink/10 text-sm">
                {partidas
                  .filter((item) => {
                    const q = partidaQuery.toLowerCase();
                    return (
                      String(item.numero).toLowerCase().includes(q) ||
                      String(item.nombre).toLowerCase().includes(q)
                    );
                  })
                  .map((item) => (
                    <li key={item.numero}>
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-moss/10"
                        onClick={() => {
                          setCargaData((prev) => ({
                            ...prev,
                            partida: item.numero,
                            partidaNombre: item.nombre,
                          }));
                          setPartidaModalOpen(false);
                        }}
                      >
                        <span className="font-semibold text-ink">
                          {item.numero}
                        </span>
                        <span className="ml-2 text-ink/60">{item.nombre}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

</main>
    </div>
  );
}

export default Dashboard;
