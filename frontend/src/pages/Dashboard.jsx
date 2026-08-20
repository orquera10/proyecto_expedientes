import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import logo from "../assets/logo.svg";
import sidIcon from "../assets/sid-sloth.svg";

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
  const formatDateOnly = (value) => {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : "N/D";
  };
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
    tipo: "",
    codigo: "",
  });
  const [listadoResultados, setListadoResultados] = useState([]);
  const [listadoEstado, setListadoEstado] = useState("idle");
  const [listadoError, setListadoError] = useState("");
  const [reportesFiltros, setReportesFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    caja: "",
    beneficiario: "",
    asunto: "",
    codigo: "",
    tipo: "",
  });
  const [reportesResultados, setReportesResultados] = useState([]);
  const [reportesEstado, setReportesEstado] = useState("idle");
  const [reportesError, setReportesError] = useState("");
  const [reportesTipoActivo, setReportesTipoActivo] = useState("");
  const [adminBusqueda, setAdminBusqueda] = useState({
    codigo: "",
    numero: "",
    anio: "",
  });
  const [adminMovimientos, setAdminMovimientos] = useState([]);
  const [adminEstado, setAdminEstado] = useState("idle");
  const [adminError, setAdminError] = useState("");
  const [adminMensaje, setAdminMensaje] = useState("");
  const [adminMovimientosIncluirDeshabilitados, setAdminMovimientosIncluirDeshabilitados] =
    useState(false);
  const [adminMovimientosExpedienteHabilitado, setAdminMovimientosExpedienteHabilitado] =
    useState(null);
  const [adminExpedienteBusqueda, setAdminExpedienteBusqueda] = useState({
    codigo: "",
    numero: "",
    anio: "",
  });
  const [adminExpedienteResultados, setAdminExpedienteResultados] = useState([]);
  const [adminExpedienteSeleccionado, setAdminExpedienteSeleccionado] =
    useState(null);
  const [adminExpedienteEstado, setAdminExpedienteEstado] = useState("idle");
  const [adminExpedienteError, setAdminExpedienteError] = useState("");
  const [adminExpedienteMensaje, setAdminExpedienteMensaje] = useState("");
  const [adminUsuarioForm, setAdminUsuarioForm] = useState({
    usuario: "",
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    nivel: "U",
    codigosector: "",
  });
  const [adminUsuarioEstado, setAdminUsuarioEstado] = useState("idle");
  const [adminUsuarioError, setAdminUsuarioError] = useState("");
  const [adminUsuarioMensaje, setAdminUsuarioMensaje] = useState("");
  const [adminUsuariosQuery, setAdminUsuariosQuery] = useState("");
  const [adminUsuariosResultados, setAdminUsuariosResultados] = useState([]);
  const [adminUsuariosEstado, setAdminUsuariosEstado] = useState("idle");
  const [adminUsuariosError, setAdminUsuariosError] = useState("");
  const [adminUsuarioSeleccionado, setAdminUsuarioSeleccionado] = useState(null);
  const [adminUsuarioEdicion, setAdminUsuarioEdicion] = useState({
    usuario: "",
    nombre: "",
    email: "",
    telefono: "",
    nivel: "U",
    codigosector: "",
    habilitado: true,
  });
  const [adminUsuarioPassword, setAdminUsuarioPassword] = useState("");
  const [sidebarCompact, setSidebarCompact] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebarCompact") === "true";
  });
  const isInformatica =
    usuarioInfo?.nivel === "S" || String(usuarioInfo?.codigosector || "") === "1";
  const menuItems = [
    "Registrar Expediente",
    "Entrada de Expedientes",
    "Salida de Expedientes",
    "Remitos",
    "Listado de Expedientes",
    "Modificacion de Expedientes",
    "Consulta de Expedientes",
    ...(isInformatica ? ["Reportes", "Administracion"] : []),
  ];
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
  const [salidaRemitoId, setSalidaRemitoId] = useState(null);
  const [remitoResultados, setRemitoResultados] = useState([]);
  const [remitoEstado, setRemitoEstado] = useState("idle");
  const [remitoError, setRemitoError] = useState("");
  const [remitoPage, setRemitoPage] = useState(1);
  const [remitoTotal, setRemitoTotal] = useState(0);
  const [remitoLimit] = useState(10);
  const [remitoFiltros, setRemitoFiltros] = useState({
    codigo: "",
    numero: "",
    anio: "",
    asunto: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [remitoPreview, setRemitoPreview] = useState(null);
  const [remitoPreviewReady, setRemitoPreviewReady] = useState(false);
  const remitoIframeRef = useRef(null);
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
    tipo: "",
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
    tipo: "",
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
  const [chatAbierto, setChatAbierto] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMensajes, setChatMensajes] = useState([
    {
      role: "assistant",
      content: "Hola, soy Sid. Decime que queres buscar en expedientes.",
    },
  ]);
  const [chatEstado, setChatEstado] = useState("idle");
  const [chatError, setChatError] = useState("");
  const chatScrollRef = useRef(null);
  const chatInputRef = useRef(null);
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
      String(movimientoActual.coddestino || "") ===
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
    if (!adminError) return;
    const timeout = setTimeout(() => setAdminError(""), 5000);
    return () => clearTimeout(timeout);
  }, [adminError]);

  useEffect(() => {
    if (!adminMensaje) return;
    const timeout = setTimeout(() => setAdminMensaje(""), 4000);
    return () => clearTimeout(timeout);
  }, [adminMensaje]);

  useEffect(() => {
    if (!adminExpedienteError) return;
    const timeout = setTimeout(() => setAdminExpedienteError(""), 5000);
    return () => clearTimeout(timeout);
  }, [adminExpedienteError]);

  useEffect(() => {
    if (!adminExpedienteMensaje) return;
    const timeout = setTimeout(() => setAdminExpedienteMensaje(""), 4000);
    return () => clearTimeout(timeout);
  }, [adminExpedienteMensaje]);

  useEffect(() => {
    if (!adminUsuarioError) return;
    const timeout = setTimeout(() => setAdminUsuarioError(""), 5000);
    return () => clearTimeout(timeout);
  }, [adminUsuarioError]);

  useEffect(() => {
    if (!adminUsuarioMensaje) return;
    const timeout = setTimeout(() => setAdminUsuarioMensaje(""), 4000);
    return () => clearTimeout(timeout);
  }, [adminUsuarioMensaje]);

  useEffect(() => {
    if (!adminUsuariosError) return;
    const timeout = setTimeout(() => setAdminUsuariosError(""), 5000);
    return () => clearTimeout(timeout);
  }, [adminUsuariosError]);

  useEffect(() => {
    if (!reportesError) return;
    const timeout = setTimeout(() => setReportesError(""), 5000);
    return () => clearTimeout(timeout);
  }, [reportesError]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sidebarCompact", String(sidebarCompact));
  }, [sidebarCompact]);

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
    if (!remitoError) return;
    const timeout = setTimeout(() => setRemitoError(""), 5000);
    return () => clearTimeout(timeout);
  }, [remitoError]);

  useEffect(() => {
    const url = remitoPreview?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [remitoPreview?.url]);

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
    if (!chatError) return;
    const timeout = setTimeout(() => setChatError(""), 5000);
    return () => clearTimeout(timeout);
  }, [chatError]);

  useEffect(() => {
    if (!chatScrollRef.current) return;
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMensajes, chatEstado]);

  useEffect(() => {
    if (!chatAbierto) return;
    if (!chatInputRef.current) return;
    chatInputRef.current.focus();
  }, [chatAbierto, chatEstado]);

  useEffect(() => {
    if (seccionActiva !== "Registrar Expediente") return;
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
    if (seccionActiva !== "Administracion") return;
    if (sectores.length > 0) return;
    cargarSectores();
  }, [seccionActiva, sectores.length]);

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

  async function fetchRemitos(page, filtros = remitoFiltros) {
    setRemitoEstado("loading");
    setRemitoError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setRemitoEstado("error");
      setRemitoError("No hay sesion activa.");
      return;
    }

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(remitoLimit),
      });
      for (const [clave, valor] of Object.entries(filtros)) {
        if (valor) params.set(clave, valor);
      }

      const response = await fetch(
        `${API_BASE}/api/movimientos/remitos?${params.toString()}`,
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
        throw new Error(payload?.error || "No se pudieron cargar los remitos");
      }

      setRemitoResultados(payload.data || []);
      setRemitoTotal(payload.total || 0);
      setRemitoEstado("success");
    } catch (err) {
      setRemitoEstado("error");
      setRemitoError(err.message);
    }
  }

  function handleBuscarRemitos(event) {
    event.preventDefault();
    setRemitoPage(1);
    fetchRemitos(1);
  }

  async function abrirModalSalida(item) {
    setSalidaGuardarEstado("idle");
    setSalidaGuardarError("");
    setSalidaGuardarMensaje("");
    setSalidaDetalle(null);
    setSalidaRemitoId(null);
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
      const movimientoId = payload?.movimiento?.id;
      setSalidaRemitoId(movimientoId || null);

      let vistaPreviaAbierta = false;
      if (movimientoId) {
        try {
          await abrirVistaPreviaRemito(movimientoId, salidaDetalle);
          vistaPreviaAbierta = true;
        } catch (err) {
          setSalidaGuardarError(
            `La salida se registro, pero no se pudo abrir la vista previa: ${err.message}`
          );
        }
      } else {
        setSalidaGuardarError(
          "La salida se registro, pero no se recibio el numero necesario para generar el remito."
        );
      }

      if (vistaPreviaAbierta) {
        setSalidaModalOpen(false);
        setSalidaDetalle(null);
      }
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

  async function enviarConsultaChat(texto) {
    setChatEstado("loading");
    setChatError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setChatEstado("error");
      setChatError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: texto }),
      });
      const payload = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(payload?.error || "No se pudo consultar el asistente");
      }

      setChatMensajes((prev) => [
        ...prev,
        { role: "assistant", content: payload.answer || "Sin respuesta." },
      ]);
      setChatEstado("idle");
    } catch (err) {
      setChatEstado("error");
      setChatError(err.message);
    }
  }
  function handleEnviarChat(event) {
    if (event) event.preventDefault();
    const texto = chatInput.trim();
    if (!texto || chatEstado === "loading") return;
    setChatMensajes((prev) => [...prev, { role: "user", content: texto }]);
    setChatInput("");
    enviarConsultaChat(texto);
    if (chatInputRef.current) {
      chatInputRef.current.focus();
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
      listadoFiltros.asunto ||
      listadoFiltros.tipo ||
      listadoFiltros.codigo;

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
      if (listadoFiltros.tipo) params.set("tipo", listadoFiltros.tipo);
      if (listadoFiltros.codigo) params.set("codigo", listadoFiltros.codigo);

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

  async function handleReportes(event) {
    event.preventDefault();
    setReportesEstado("loading");
    setReportesError("");
    setReportesResultados([]);
    setReportesTipoActivo("");

    const token = localStorage.getItem("token");
    if (!token) {
      setReportesEstado("error");
      setReportesError("No hay sesion activa.");
      return;
    }

    const tieneFiltros =
      reportesFiltros.fecha_inicio ||
      reportesFiltros.fecha_fin ||
      reportesFiltros.caja ||
      reportesFiltros.beneficiario ||
      reportesFiltros.asunto ||
      reportesFiltros.codigo ||
      reportesFiltros.tipo;

    if (!tieneFiltros) {
      setReportesEstado("error");
      setReportesError("Ingresa al menos un filtro para generar reportes.");
      return;
    }

    try {
      const params = new URLSearchParams();
      if (reportesFiltros.fecha_inicio)
        params.set("fecha_inicio", reportesFiltros.fecha_inicio);
      if (reportesFiltros.fecha_fin)
        params.set("fecha_fin", reportesFiltros.fecha_fin);
      if (reportesFiltros.caja) params.set("caja", reportesFiltros.caja);
      if (reportesFiltros.beneficiario)
        params.set("beneficiario", reportesFiltros.beneficiario);
      if (reportesFiltros.asunto) params.set("asunto", reportesFiltros.asunto);
      if (reportesFiltros.codigo) params.set("codigo", reportesFiltros.codigo);
      if (reportesFiltros.tipo) params.set("tipo", reportesFiltros.tipo);

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
        throw new Error(payload?.error || "No se pudo obtener el reporte");
      }

      setReportesResultados(payload);
      setReportesEstado("success");
    } catch (err) {
      setReportesEstado("error");
      setReportesError(err.message);
    }
  }

  function escapeCsv(value) {
    const safeValue = String(value ?? "");
    if (safeValue.includes('"') || safeValue.includes(",") || safeValue.includes("\n")) {
      return `"${safeValue.replace(/"/g, '""')}"`;
    }
    return safeValue;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function exportarReportesExcel(items = reportesResultados) {
    if (items.length === 0) return;

    const rows = items.map((item) => ({
      codigo: item.codigo ?? "",
      numero: item.numero ?? "",
      anio: item.anio ?? "",
      tipo: etiquetaTipo(item.tipo),
      fechainicio: item.fechainicio
        ? new Date(item.fechainicio).toISOString().slice(0, 10)
        : "",
      caja: item.caja ?? "",
      beneficiario: item.beneficiario ?? "",
      asunto: item.asunto ?? "",
    }));

    const tableRows = rows
      .map(
        (row) => `
        <tr>
          <td>${escapeHtml(row.codigo)}</td>
          <td>${escapeHtml(row.numero)}</td>
          <td>${escapeHtml(row.anio)}</td>
          <td>${escapeHtml(row.tipo)}</td>
          <td>${escapeHtml(row.fechainicio)}</td>
          <td>${escapeHtml(row.caja)}</td>
          <td>${escapeHtml(row.beneficiario)}</td>
          <td>${escapeHtml(row.asunto)}</td>
        </tr>`
      )
      .join("");

    const html = `
      <table>
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Numero</th>
            <th>Anio</th>
            <th>Tipo</th>
            <th>Fecha inicio</th>
            <th>Caja</th>
            <th>Beneficiario</th>
            <th>Asunto</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>`;

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_expedientes_${todayISO()}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function contarPorClave(items, selector) {
    const conteo = new Map();
    items.forEach((item) => {
      const valor = selector(item);
      const clave = valor ? String(valor) : "Sin dato";
      conteo.set(clave, (conteo.get(clave) || 0) + 1);
    });
    return Array.from(conteo.entries()).sort((a, b) => b[1] - a[1]);
  }

  async function buscarMovimientosAdmin(event) {
    event.preventDefault();
    setAdminEstado("loading");
    setAdminError("");
    setAdminMensaje("");
    setAdminMovimientos([]);

    const token = localStorage.getItem("token");
    if (!token) {
      setAdminEstado("error");
      setAdminError("No hay sesion activa.");
      return;
    }

    const codigo = String(adminBusqueda.codigo || "").trim();
    const numero = String(adminBusqueda.numero || "").trim();
    const anio = String(adminBusqueda.anio || "").trim();
    if (!codigo || !numero || !anio) {
      setAdminEstado("error");
      setAdminError("Completa codigo, numero y anio.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/movimientos/expediente/${codigo}/${numero}/${anio}`,
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
        throw new Error(payload?.error || "No se pudieron cargar movimientos");
      }

      setAdminMovimientos(payload || []);
      const expedienteResp = await fetch(
        `${API_BASE}/api/expedientes/${codigo}/${numero}/${anio}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (expedienteResp.status === 404) {
        setAdminMovimientosExpedienteHabilitado(false);
      } else if (expedienteResp.ok) {
        setAdminMovimientosExpedienteHabilitado(true);
      } else {
        setAdminMovimientosExpedienteHabilitado(null);
      }
      setAdminEstado("success");
    } catch (err) {
      setAdminEstado("error");
      setAdminError(err.message);
    }
  }

  async function abrirVistaPreviaRemito(movimientoId, datosExpediente = {}) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No hay sesion activa.");

    const response = await fetch(
      `${API_BASE}/api/movimientos/${movimientoId}/remito`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      navigate("/login", { replace: true });
      throw new Error("La sesion vencio.");
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error || "No se pudo generar el remito");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const partes = [
      datosExpediente.codigo,
      datosExpediente.numero,
      datosExpediente.anio,
    ].filter((parte) => parte !== null && parte !== undefined && parte !== "");
    setRemitoPreviewReady(false);
    setRemitoPreview({
      url,
      movimientoId,
      nombreArchivo: `remito-${partes.join("-") || movimientoId}.pdf`,
      expediente: partes.join("-") || String(movimientoId),
    });
  }

  function guardarRemitoPreview() {
    if (!remitoPreview?.url) return;
    const enlace = document.createElement("a");
    enlace.href = remitoPreview.url;
    enlace.download = remitoPreview.nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
  }

  function imprimirRemitoPreview() {
    const ventanaPdf = remitoIframeRef.current?.contentWindow;
    if (!ventanaPdf) return;
    ventanaPdf.focus();
    ventanaPdf.print();
  }

  async function deshabilitarMovimientoAdmin(id, habilitar = false) {
    const accionLabel = habilitar ? "habilitar" : "deshabilitar";
    if (!window.confirm(`Deseas ${accionLabel} este movimiento?`)) {
      return;
    }
    setAdminEstado("loading");
    setAdminError("");
    setAdminMensaje("");

    const token = localStorage.getItem("token");
    if (!token) {
      setAdminEstado("error");
      setAdminError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/movimientos/${id}/${habilitar ? "habilitar" : "deshabilitar"}`,
        {
          method: "PUT",
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
        throw new Error(payload?.error || `No se pudo ${accionLabel}`);
      }

      setAdminMovimientos((prev) =>
        prev.map((mov) =>
          mov.id === id ? { ...mov, habilitado: habilitar } : mov
        )
      );
      setAdminEstado("success");
      setAdminMensaje(
        habilitar ? "Movimiento habilitado." : "Movimiento deshabilitado."
      );
    } catch (err) {
      setAdminEstado("error");
      setAdminError(err.message);
    }
  }

  async function buscarExpedienteAdmin(event) {
    event.preventDefault();
    setAdminExpedienteEstado("loading");
    setAdminExpedienteError("");
    setAdminExpedienteMensaje("");
    setAdminExpedienteResultados([]);
    setAdminExpedienteSeleccionado(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setAdminExpedienteEstado("error");
      setAdminExpedienteError("No hay sesion activa.");
      return;
    }

    const codigo = String(adminExpedienteBusqueda.codigo || "").trim();
    const numero = String(adminExpedienteBusqueda.numero || "").trim();
    const anio = String(adminExpedienteBusqueda.anio || "").trim();
    if (!codigo || !numero || !anio) {
      setAdminExpedienteEstado("error");
      setAdminExpedienteError("Completa codigo, numero y anio.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/expedientes/clave/${codigo}/${numero}/${anio}?incluir_deshabilitados=1`,
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

      setAdminExpedienteResultados(payload || []);
      if (Array.isArray(payload) && payload.length === 1) {
        setAdminExpedienteSeleccionado(payload[0]);
      }
      setAdminExpedienteEstado("success");
    } catch (err) {
      setAdminExpedienteEstado("error");
      setAdminExpedienteError(err.message);
    }
  }

  async function deshabilitarExpedienteAdmin() {
    if (!adminExpedienteSeleccionado) return;
    if (!window.confirm("Deseas deshabilitar este expediente y sus movimientos?")) {
      return;
    }
    setAdminExpedienteEstado("loading");
    setAdminExpedienteError("");
    setAdminExpedienteMensaje("");

    const token = localStorage.getItem("token");
    if (!token) {
      setAdminExpedienteEstado("error");
      setAdminExpedienteError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/expedientes/${adminExpedienteSeleccionado.codigo}/${adminExpedienteSeleccionado.numero}/${adminExpedienteSeleccionado.anio}/deshabilitar`,
        {
          method: "PUT",
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
        throw new Error(payload?.error || "No se pudo deshabilitar");
      }

      setAdminExpedienteResultados((prev) =>
        prev.map((item) =>
          item.codinum === adminExpedienteSeleccionado.codinum
            ? { ...item, habilitado: false }
            : item
        )
      );
      setAdminExpedienteSeleccionado((prev) =>
        prev ? { ...prev, habilitado: false } : prev
      );
      setAdminExpedienteEstado("success");
      setAdminExpedienteMensaje("Expediente deshabilitado.");
    } catch (err) {
      setAdminExpedienteEstado("error");
      setAdminExpedienteError(err.message);
    }
  }

  async function crearUsuarioAdmin(event) {
    event.preventDefault();
    setAdminUsuarioEstado("loading");
    setAdminUsuarioError("");
    setAdminUsuarioMensaje("");

    const token = localStorage.getItem("token");
    if (!token) {
      setAdminUsuarioEstado("error");
      setAdminUsuarioError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usuario: adminUsuarioForm.usuario || undefined,
          nombre: adminUsuarioForm.nombre.toUpperCase(),
          email: adminUsuarioForm.email || undefined,
          telefono: adminUsuarioForm.telefono || undefined,
          password: adminUsuarioForm.password,
          nivel: adminUsuarioForm.nivel,
          codigosector: adminUsuarioForm.codigosector || null,
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
        throw new Error(payload?.error || "No se pudo crear el usuario");
      }

      setAdminUsuarioEstado("success");
      setAdminUsuarioMensaje("Usuario creado.");
      setAdminUsuarioForm({
        usuario: "",
        nombre: "",
        email: "",
        telefono: "",
        password: "",
        nivel: "U",
        codigosector: "",
      });
    } catch (err) {
      setAdminUsuarioEstado("error");
      setAdminUsuarioError(err.message);
    }
  }

  async function buscarUsuariosAdmin(event) {
    event.preventDefault();
    setAdminUsuariosEstado("loading");
    setAdminUsuariosError("");
    setAdminUsuariosResultados([]);
    setAdminUsuarioSeleccionado(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setAdminUsuariosEstado("error");
      setAdminUsuariosError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/usuarios`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(payload?.error || "No se pudieron cargar usuarios");
      }

      const query = adminUsuariosQuery.trim().toLowerCase();
      const filtrados = query
        ? payload.filter((item) => {
            const usuarioVal = String(item.usuario || "").toLowerCase();
            const nombreVal = String(item.nombre || "").toLowerCase();
            const telefonoVal = String(item.telefono || "").toLowerCase();
            return usuarioVal.includes(query) || nombreVal.includes(query) || telefonoVal.includes(query);
          })
        : payload;

      setAdminUsuariosResultados(filtrados);
      setAdminUsuariosEstado("success");
    } catch (err) {
      setAdminUsuariosEstado("error");
      setAdminUsuariosError(err.message);
    }
  }

  function seleccionarUsuarioAdmin(usuario) {
    setAdminUsuarioSeleccionado(usuario);
    setAdminUsuarioEdicion({
      usuario: usuario?.usuario || "",
      nombre: usuario?.nombre || "",
      email: usuario?.email || "",
      telefono: usuario?.telefono || "",
      nivel: usuario?.nivel || "U",
      codigosector: usuario?.codigosector || "",
      habilitado: usuario?.habilitado !== false,
    });
    setAdminUsuarioPassword("");
  }

  async function actualizarUsuarioAdmin(event) {
    event.preventDefault();
    if (!adminUsuarioSeleccionado) return;
    setAdminUsuariosEstado("loading");
    setAdminUsuariosError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setAdminUsuariosEstado("error");
      setAdminUsuariosError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/usuarios/${adminUsuarioSeleccionado.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            usuario: adminUsuarioEdicion.usuario || undefined,
            nombre: adminUsuarioEdicion.nombre,
            email: adminUsuarioEdicion.email || null,
            telefono: adminUsuarioEdicion.telefono || null,
            nivel: adminUsuarioEdicion.nivel,
            codigosector: adminUsuarioEdicion.codigosector || null,
            habilitado: adminUsuarioEdicion.habilitado,
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
        throw new Error(payload?.error || "No se pudo actualizar el usuario");
      }

      setAdminUsuarioSeleccionado(payload);
      setAdminUsuariosEstado("success");
      setAdminUsuarioMensaje("Datos guardados.");
      setAdminUsuarioEdicion({
        usuario: "",
        nombre: "",
        email: "",
        telefono: "",
        nivel: "U",
        codigosector: "",
        habilitado: true,
      });
      setAdminUsuarioSeleccionado(null);
      setAdminUsuariosQuery("");
      setAdminUsuariosResultados([]);
    } catch (err) {
      setAdminUsuariosEstado("error");
      setAdminUsuariosError(err.message);
    }
  }

  async function resetPasswordAdmin(event) {
    event.preventDefault();
    if (!adminUsuarioSeleccionado) return;
    if (!adminUsuarioPassword) return;
    setAdminUsuariosEstado("loading");
    setAdminUsuariosError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setAdminUsuariosEstado("error");
      setAdminUsuariosError("No hay sesion activa.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/usuarios/${adminUsuarioSeleccionado.id}/password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password_nueva: adminUsuarioPassword }),
        }
      );
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error || "No se pudo blanquear la contrasena");
      }

      setAdminUsuarioPassword("");
      setAdminUsuariosEstado("success");
      setAdminUsuarioMensaje("Contrasena actualizada.");
    } catch (err) {
      setAdminUsuariosEstado("error");
      setAdminUsuariosError(err.message);
    }
  }

  function normalizarTipoClave(value) {
    const text = String(value ?? "").trim();
    if (!text) return "SIN DATO";
    return text.toUpperCase();
  }

  function etiquetaTipo(value) {
    const text = String(value ?? "").trim();
    return text || "Sin dato";
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
        tipo: payload.tipo || "",
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
      const anioNormalizado = String(cargaData.anio || "").trim();
      if (!/^\d{4}$/.test(anioNormalizado)) {
        setCargaEstado("error");
        setCargaError("El anio debe tener 4 digitos (formato 2014).");
        return;
      }
      if (!String(cargaData.tipo || "").trim()) {
        setCargaEstado("error");
        setCargaError("El tipo de expediente es obligatorio.");
        return;
      }

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
          tipo: cargaData.tipo || null,
          fechainicio: fechaInicioFinal,
          fechaentrada: fechaEntradaFinal,
          fechacarga: fechaCargaFinal,
          asunto: cargaData.asunto ? cargaData.asunto.toUpperCase() : null,
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
        tipo: "",
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

  const reportesTipoOpciones = [
    "Subsidios",
    "Compras/Contrataciones",
    "Anticipos",
    "Recursos Humanos",
    "Cajas Chicas",
    "Aprobacion de Proyectos",
    "Pagos/Servicios/Alquiler",
    "Viaticos",
    "Fondos/Partidas/Refuerzos",
    "Otro",
  ];
  const reportesFiltrados = reportesTipoActivo
    ? reportesResultados.filter(
        (item) => normalizarTipoClave(item.tipo) === reportesTipoActivo
      )
    : reportesResultados;
  const reportesTotal = reportesResultados.length;
  const reportesConCaja = reportesResultados.filter((item) => item.caja).length;
  const reportesConBeneficiario = reportesResultados.filter(
    (item) => item.beneficiario
  ).length;
  const reportesPorCaja = contarPorClave(reportesResultados, (item) => item.caja).slice(0, 5);
  const reportesPorBeneficiario = contarPorClave(
    reportesResultados,
    (item) => item.beneficiario
  ).slice(0, 5);
  const reportesPorAnio = contarPorClave(reportesResultados, (item) => item.anio).slice(0, 5);
  const reportesPorTipo = Array.from(
    reportesResultados.reduce((acc, item) => {
      const key = normalizarTipoClave(item.tipo);
      if (!acc.has(key)) {
        acc.set(key, { key, label: etiquetaTipo(item.tipo), total: 0 });
      }
      acc.get(key).total += 1;
      return acc;
    }, new Map())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.total - a.total);
  const maxTipo = reportesPorTipo.reduce(
    (max, item) => Math.max(max, item.total),
    0
  );
  const reportesTipoActivoLabel = reportesTipoActivo
    ? reportesPorTipo.find((item) => item.key === reportesTipoActivo)?.label ||
      "Sin dato"
    : "";
  const reportesTipoColores = [
    "bg-emerald-500/80",
    "bg-amber-500/80",
    "bg-sky-500/80",
    "bg-rose-500/80",
    "bg-lime-500/80",
    "bg-indigo-500/80",
    "bg-orange-500/80",
    "bg-teal-500/80",
    "bg-fuchsia-500/80",
    "bg-cyan-500/80",
  ];
  const sectoresMap = new Map(
    sectores.map((sector) => [
      String(sector.codigosector),
      sector.sector,
    ])
  );

  return (
    <div className="min-h-screen bg-stone text-ink">
      <Navbar />
      <main
        className={`mx-auto grid w-full max-w-6xl items-stretch gap-10 px-6 py-12 ${
          sidebarCompact ? "lg:grid-cols-[88px_1fr]" : "lg:grid-cols-[280px_1fr]"
        }`}
      >
        <aside
          className={`rounded-[28px] border border-ink/10 bg-white/80 shadow-haze ${
            sidebarCompact ? "p-3" : "p-5"
          }`}
        >
          <div
            className={`flex items-center ${
              sidebarCompact ? "justify-center" : "justify-between"
            }`}
          >
            {!sidebarCompact && (
              <h2 className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-ink/60">
                Menu principal
              </h2>
            )}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setSidebarCompact((prev) => !prev)}
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-white text-ink/70 transition hover:border-moss/40 hover:text-ink"
                aria-label={
                  sidebarCompact ? "Expandir menu" : "Compactar menu"
                }
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
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h10" />
                </svg>
              </button>
              <div className="pointer-events-none absolute right-0 top-10 z-10 hidden whitespace-nowrap rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink/70 shadow-sm group-hover:block">
                {sidebarCompact ? "Expandir menu" : "Compactar menu"}
              </div>
            </div>
          </div>
          <div className={`mt-5 flex flex-col gap-3 ${sidebarCompact ? "items-center" : ""}`}>
            {menuItems.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setSeccionActiva(label);
                  if (label === "Registrar Expediente") {
                    cargarPartidas();
                    cargarSectores();
                    cargarReparticiones();
                  }
                  if (label === "Modificacion de Expedientes") {
                    cargarReparticiones();
                  }
                  if (label === "Administracion") {
                    cargarSectores();
                  }
                  if (label === "Entrada de Expedientes") {
                    setEntradaPage(1);
                  }
                  if (label === "Salida de Expedientes") {
                    setSalidaPage(1);
                  }
                  if (label === "Remitos") {
                    setRemitoPage(1);
                    fetchRemitos(1);
                  }
                }}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition ${
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
                } ${
                  sidebarCompact
                    ? "h-12 w-12 p-0"
                    : "w-full text-left"
                } cursor-pointer`}
                title={label}
                aria-label={label}
              >
                <span
                  className={`flex items-center ${
                    sidebarCompact ? "justify-center" : "gap-3"
                  }`}
                >
                  <span className="grid h-5 w-5 place-items-center">
                    {label === "Registrar Expediente" && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    )}
                    {label === "Entrada de Expedientes" && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
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
                    )}
                    {label === "Salida de Expedientes" && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
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
                    )}
                    {label === "Listado de Expedientes" && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 6h13" />
                        <path d="M8 12h13" />
                        <path d="M8 18h13" />
                        <path d="M3 6h.01" />
                        <path d="M3 12h.01" />
                        <path d="M3 18h.01" />
                      </svg>
                    )}
                    {label === "Modificacion de Expedientes" && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    )}
                    {label === "Consulta de Expedientes" && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-3.5-3.5" />
                      </svg>
                    )}
                    {label === "Reportes" && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16v16H4z" />
                        <path d="M8 16v-5" />
                        <path d="M12 16V8" />
                        <path d="M16 16v-3" />
                      </svg>
                    )}
                    {label === "Remitos" && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 3h9l3 3v15H6z" />
                        <path d="M14 3v4h4" />
                        <path d="M9 12h6" />
                        <path d="M9 16h6" />
                      </svg>
                    )}
                    {label === "Administracion" && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1A1.6 1.6 0 0 0 10 3.6V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5h.1a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1A1.6 1.6 0 0 0 20.4 11H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
                      </svg>
                    )}
                  </span>
                  {!sidebarCompact && <span>{label}</span>}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-8 h-full">
          {![
            "Consulta de Expedientes",
            "Listado de Expedientes",
            "Modificacion de Expedientes",
            "Registrar Expediente",
            "Entrada de Expedientes",
            "Salida de Expedientes",
            "Remitos",
            "Reportes",
            "Administracion",
          ].includes(seccionActiva) && (
            <div className="flex h-full rounded-[32px] border border-ink/10 bg-white/80 p-8 shadow-haze">
              <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
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

          {seccionActiva === "Reportes" && (
            <div className="space-y-6">
              <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      Reportes de Expedientes
                    </h2>
                    <p className="mt-1 text-sm text-ink/60">
                      Genera reportes filtrados y exporta los resultados.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-stone px-4 py-2 text-xs font-semibold text-ink/60">
                    Reportes internos
                  </div>
                </div>

                <form
                  onSubmit={handleReportes}
                  className="mt-6 grid gap-4 md:grid-cols-2"
                >
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Fecha inicio
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={reportesFiltros.fecha_inicio}
                      onChange={(event) =>
                        setReportesFiltros((prev) => ({
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
                      value={reportesFiltros.fecha_fin}
                      onChange={(event) =>
                        setReportesFiltros((prev) => ({
                          ...prev,
                          fecha_fin: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Codigo
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={reportesFiltros.codigo}
                      onChange={(event) =>
                        setReportesFiltros((prev) => ({
                          ...prev,
                          codigo: event.target.value,
                        }))
                      }
                      placeholder="Ej: 769"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Tipo
                    <select
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={reportesFiltros.tipo}
                      onChange={(event) =>
                        setReportesFiltros((prev) => ({
                          ...prev,
                          tipo: event.target.value,
                        }))
                      }
                    >
                      <option value="">Todos</option>
                      {reportesTipoOpciones.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-ink/70">
                    Caja
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={reportesFiltros.caja}
                      onChange={(event) =>
                        setReportesFiltros((prev) => ({
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
                      value={reportesFiltros.beneficiario}
                      onChange={(event) =>
                        setReportesFiltros((prev) => ({
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
                      value={reportesFiltros.asunto}
                      onChange={(event) =>
                        setReportesFiltros((prev) => ({
                          ...prev,
                          asunto: event.target.value,
                        }))
                      }
                      placeholder="Palabra clave"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={reportesEstado === "loading"}
                    className="md:col-span-2 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {reportesEstado === "loading"
                      ? "Generando..."
                      : "Generar reporte"}
                  </button>
                  <button
                    type="button"
                    className="md:col-span-1 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink"
                    onClick={() => {
                      setReportesFiltros({
                        fecha_inicio: "",
                        fecha_fin: "",
                        caja: "",
                        beneficiario: "",
                        asunto: "",
                        codigo: "",
                        tipo: "",
                      });
                      setReportesResultados([]);
                      setReportesEstado("idle");
                      setReportesError("");
                      setReportesTipoActivo("");
                    }}
                  >
                    Limpiar
                  </button>
                  <button
                    type="button"
                    onClick={() => exportarReportesExcel(reportesFiltrados)}
                    disabled={reportesFiltrados.length === 0}
                    className="md:col-span-1 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-moss/30 bg-moss/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-moss transition hover:bg-moss/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Exportar Excel
                  </button>
                </form>

                {reportesError && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {reportesError}
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">
                    Total expedientes
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-ink">
                    {reportesTotal}
                  </p>
                </div>
                <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">
                    Con caja
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-ink">
                    {reportesConCaja}
                  </p>
                </div>
                <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">
                    Con beneficiario
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-ink">
                    {reportesConBeneficiario}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <h3 className="font-display text-xl font-semibold text-ink">
                  Distribucion
                </h3>
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">
                      Por caja
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-ink/70">
                      {reportesPorCaja.length === 0 && (
                        <li>Sin datos</li>
                      )}
                      {reportesPorCaja.map(([caja, total]) => (
                        <li
                          key={`caja-${caja}`}
                          className="flex items-center justify-between"
                        >
                          <span>{caja}</span>
                          <span className="font-semibold text-ink">{total}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">
                      Por beneficiario
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-ink/70">
                      {reportesPorBeneficiario.length === 0 && (
                        <li>Sin datos</li>
                      )}
                      {reportesPorBeneficiario.map(([beneficiario, total]) => (
                        <li
                          key={`benef-${beneficiario}`}
                          className="flex items-center justify-between"
                        >
                          <span className="line-clamp-1">{beneficiario}</span>
                          <span className="font-semibold text-ink">{total}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">
                      Por anio
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-ink/70">
                      {reportesPorAnio.length === 0 && <li>Sin datos</li>}
                      {reportesPorAnio.map(([anioItem, total]) => (
                        <li
                          key={`anio-${anioItem}`}
                          className="flex items-center justify-between"
                        >
                          <span>{anioItem}</span>
                          <span className="font-semibold text-ink">{total}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <h3 className="font-display text-xl font-semibold text-ink">
                  Grafico de barras por tipo
                </h3>
                <div className="mt-6 space-y-3">
                  {reportesPorTipo.length === 0 && (
                    <p className="text-sm text-ink/60">Sin datos</p>
                  )}
                  {reportesPorTipo.map((item, index) => {
                    const width = maxTipo
                      ? Math.round((item.total / maxTipo) * 100)
                      : 0;
                    const colorClass =
                      reportesTipoColores[index % reportesTipoColores.length];
                    return (
                      <button
                        type="button"
                        key={`tipo-${item.key}`}
                        onClick={() =>
                          setReportesTipoActivo((prev) =>
                            prev === item.key ? "" : item.key
                          )
                        }
                        className="w-full cursor-pointer space-y-1 rounded-2xl border border-transparent p-2 text-left transition hover:border-ink/10 hover:bg-ink/5"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-ink/70">
                          <span className="line-clamp-1">{item.label}</span>
                          <span>{item.total}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-stone">
                          <div
                            className={`h-2 rounded-full ${colorClass}`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <h3 className="font-display text-xl font-semibold text-ink">
                  Resultados del reporte
                </h3>
                {reportesTipoActivo && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-ink/15 bg-white px-3 py-1 font-semibold text-ink/70">
                      Tipo: {reportesTipoActivoLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => setReportesTipoActivo("")}
                      className="rounded-full border border-ink/10 bg-stone px-3 py-1 font-semibold text-ink/60 transition hover:border-moss/40 hover:text-ink"
                    >
                      Limpiar filtro
                    </button>
                  </div>
                )}
                {reportesResultados.length > 0 && (
                  <div className="mt-3 text-xs font-semibold text-ink/60">
                    Mostrando {reportesFiltrados.length} de {reportesResultados.length}
                  </div>
                )}

                <div className="mt-6 max-h-[420px] w-full max-w-[900px] overflow-x-auto overflow-y-auto rounded-2xl border border-ink/10 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white text-xs uppercase tracking-[0.2em] text-ink/50">
                      <tr>
                        <th className="px-4 py-3">Expediente</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Caja</th>
                        <th className="px-4 py-3">Beneficiario</th>
                        <th className="px-4 py-3">Asunto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportesFiltrados.length === 0 && (
                        <tr>
                          <td className="px-4 py-4 text-ink/60" colSpan={6}>
                            {reportesEstado === "loading"
                              ? "Cargando..."
                              : "Sin resultados"}
                          </td>
                        </tr>
                      )}
                      {reportesFiltrados.map((item) => (
                        <tr
                          key={`${item.codigo}-${item.numero}-${item.anio}`}
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
                            {etiquetaTipo(item.tipo)}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === "Administracion" && (
            <div className="space-y-6">
              <div className="flex h-full flex-col rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      Administracion
                    </h2>
                    <p className="mt-1 text-sm text-ink/60">
                      Seccion exclusiva para Informatica.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-stone px-4 py-2 text-xs font-semibold text-ink/60">
                    Operaciones sensibles
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    Eliminar movimiento
                  </h3>
                  <p className="mt-2 text-sm text-ink/60">
                    Elimina un movimiento individual por expediente y fecha.
                  </p>
                  <form
                    onSubmit={buscarMovimientosAdmin}
                    className="mt-4 grid gap-3 md:grid-cols-3"
                  >
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      placeholder="Codigo"
                      value={adminBusqueda.codigo}
                      onChange={(event) =>
                        setAdminBusqueda((prev) => ({
                          ...prev,
                          codigo: event.target.value,
                        }))
                      }
                      required
                    />
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      placeholder="Numero"
                      value={adminBusqueda.numero}
                      onChange={(event) =>
                        setAdminBusqueda((prev) => ({
                          ...prev,
                          numero: event.target.value,
                        }))
                      }
                      required
                    />
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      placeholder="Anio"
                      value={adminBusqueda.anio}
                      onChange={(event) =>
                        setAdminBusqueda((prev) => ({
                          ...prev,
                          anio: event.target.value,
                        }))
                      }
                      required
                    />
                    <div className="md:col-span-3 flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={adminEstado === "loading"}
                        className="inline-flex items-center justify-center rounded-2xl bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {adminEstado === "loading"
                          ? "Buscando..."
                          : "Buscar movimientos"}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink"
                        onClick={() => {
                          setAdminBusqueda({ codigo: "", numero: "", anio: "" });
                          setAdminMovimientos([]);
                          setAdminEstado("idle");
                          setAdminError("");
                          setAdminMensaje("");
                          setAdminMovimientosExpedienteHabilitado(null);
                        }}
                      >
                        Limpiar
                      </button>
                    </div>
                  </form>

                  {adminError && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {adminError}
                    </div>
                  )}
                  {adminMensaje && (
                    <div className="mt-4 rounded-2xl border border-moss/20 bg-moss/10 px-4 py-3 text-sm text-moss">
                      {adminMensaje}
                    </div>
                  )}

                  {adminMovimientos.length > 0 && (
                    adminMovimientosExpedienteHabilitado === false && (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                        Este expediente esta deshabilitado. No se puede habilitar
                        movimientos.
                      </div>
                    )
                  )}

                  {adminMovimientos.length > 0 && (
                    <div className="mt-4 max-h-[320px] overflow-auto rounded-2xl border border-ink/10">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-white text-ink/60">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Fecha</th>
                            <th className="px-3 py-2 font-semibold">Estado</th>
                            <th className="px-3 py-2 font-semibold">Origen</th>
                            <th className="px-3 py-2 font-semibold">Destino</th>
                            <th className="px-3 py-2 font-semibold">Motivo</th>
                            <th className="px-3 py-2 font-semibold">Usuario</th>
                            <th className="px-3 py-2 font-semibold">Habilitado</th>
                            <th className="px-3 py-2 font-semibold">Accion</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                          {adminMovimientos
                            .filter((mov) =>
                              adminMovimientosIncluirDeshabilitados
                                ? true
                                : mov.habilitado !== false
                            )
                            .map((mov) => (
                            <tr key={mov.id}>
                              <td className="px-3 py-2 text-ink/70">
                                {mov.fechamov
                                  ? new Date(mov.fechamov).toLocaleDateString()
                                  : "N/D"}
                              </td>
                              <td className="px-3 py-2 text-ink/70">
                                {mov.estado || "N/D"}
                              </td>
                              <td className="px-3 py-2 text-ink/70">
                                {mov.origen || "N/D"}
                              </td>
                              <td className="px-3 py-2 text-ink/70">
                                {mov.destino || "N/D"}
                              </td>
                              <td className="px-3 py-2 text-ink/70">
                                {mov.motivo || "N/D"}
                              </td>
                              <td className="px-3 py-2 text-ink/70">
                                {mov.usuario || "N/D"}
                              </td>
                              <td className="px-3 py-2 text-ink/70">
                                {mov.habilitado === false ? "No" : "Si"}
                              </td>
                              <td className="px-3 py-2">
                                {mov.habilitado === false ? (
                                  <button
                                    type="button"
                                    onClick={() => deshabilitarMovimientoAdmin(mov.id, true)}
                                    disabled={adminMovimientosExpedienteHabilitado === false}
                                    className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 transition hover:border-emerald-300"
                                  >
                                    Habilitar
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => deshabilitarMovimientoAdmin(mov.id, false)}
                                    className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-700 transition hover:border-red-300"
                                  >
                                    Deshabilitar
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {adminMovimientos.length > 0 && (
                    <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-ink/70">
                      <input
                        type="checkbox"
                        checked={adminMovimientosIncluirDeshabilitados}
                        onChange={(event) =>
                          setAdminMovimientosIncluirDeshabilitados(event.target.checked)
                        }
                      />
                      Mostrar movimientos deshabilitados
                    </label>
                  )}
                </div>
                <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    Eliminar expediente
                  </h3>
                  <p className="mt-2 text-sm text-ink/60">
                    Elimina el expediente completo junto con sus movimientos.
                  </p>
                  <form
                    onSubmit={buscarExpedienteAdmin}
                    className="mt-4 grid gap-3 md:grid-cols-3"
                  >
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      placeholder="Codigo"
                      value={adminExpedienteBusqueda.codigo}
                      onChange={(event) =>
                        setAdminExpedienteBusqueda((prev) => ({
                          ...prev,
                          codigo: event.target.value,
                        }))
                      }
                      required
                    />
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      placeholder="Numero"
                      value={adminExpedienteBusqueda.numero}
                      onChange={(event) =>
                        setAdminExpedienteBusqueda((prev) => ({
                          ...prev,
                          numero: event.target.value,
                        }))
                      }
                      required
                    />
                    <input
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      placeholder="Anio"
                      value={adminExpedienteBusqueda.anio}
                      onChange={(event) =>
                        setAdminExpedienteBusqueda((prev) => ({
                          ...prev,
                          anio: event.target.value,
                        }))
                      }
                      required
                    />
                    <div className="md:col-span-3 flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={adminExpedienteEstado === "loading"}
                        className="inline-flex items-center justify-center rounded-2xl bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {adminExpedienteEstado === "loading"
                          ? "Buscando..."
                          : "Buscar expediente"}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink"
                        onClick={() => {
                          setAdminExpedienteBusqueda({
                            codigo: "",
                            numero: "",
                            anio: "",
                          });
                          setAdminExpedienteResultados([]);
                          setAdminExpedienteSeleccionado(null);
                          setAdminExpedienteEstado("idle");
                          setAdminExpedienteError("");
                          setAdminExpedienteMensaje("");
                        }}
                      >
                        Limpiar
                      </button>
                    </div>
                  </form>

                  {adminExpedienteError && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {adminExpedienteError}
                    </div>
                  )}
                  {adminExpedienteMensaje && (
                    <div className="mt-4 rounded-2xl border border-moss/20 bg-moss/10 px-4 py-3 text-sm text-moss">
                      {adminExpedienteMensaje}
                    </div>
                  )}

                  {adminExpedienteResultados.length > 0 && (
                    <div className="mt-4 max-h-[220px] overflow-auto rounded-2xl border border-ink/10">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-white text-ink/60">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Codinum</th>
                            <th className="px-3 py-2 font-semibold">Estado</th>
                            <th className="px-3 py-2 font-semibold">Tipo</th>
                            <th className="px-3 py-2 font-semibold">Asunto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                          {adminExpedienteResultados.map((item) => (
                            <tr
                              key={item.codinum}
                              className={`cursor-pointer hover:bg-moss/5 ${
                                adminExpedienteSeleccionado?.codinum === item.codinum
                                  ? "bg-moss/10"
                                  : ""
                              }`}
                              onClick={() => setAdminExpedienteSeleccionado(item)}
                            >
                              <td className="px-3 py-2 font-semibold text-ink">
                                {item.codinum}
                              </td>
                              <td className="px-3 py-2 text-ink/70">
                                {item.habilitado === false ? "Deshabilitado" : "Habilitado"}
                              </td>
                              <td className="px-3 py-2 text-ink/70">
                                {etiquetaTipo(item.tipo)}
                              </td>
                              <td className="px-3 py-2 text-ink/70">
                                {item.asunto || "N/D"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {adminExpedienteSeleccionado && (
                    <div className="mt-4 rounded-2xl border border-ink/10 bg-white px-4 py-4 text-sm text-ink/70">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="font-semibold text-ink">
                          {adminExpedienteSeleccionado.codigo}-
                          {adminExpedienteSeleccionado.numero}-
                          {adminExpedienteSeleccionado.anio}
                        </div>
                        <div className="text-xs uppercase tracking-[0.2em] text-ink/50">
                          {adminExpedienteSeleccionado.habilitado === false
                            ? "Deshabilitado"
                            : "Habilitado"}
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <p>
                          <span className="font-semibold text-ink">Tipo:</span>{" "}
                          {etiquetaTipo(adminExpedienteSeleccionado.tipo)}
                        </p>
                        <p>
                          <span className="font-semibold text-ink">Asunto:</span>{" "}
                          {adminExpedienteSeleccionado.asunto || "N/D"}
                        </p>
                        <p>
                          <span className="font-semibold text-ink">
                            Beneficiario:
                          </span>{" "}
                          {adminExpedienteSeleccionado.beneficiario || "N/D"}
                        </p>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          disabled={adminExpedienteSeleccionado.habilitado === false}
                          onClick={deshabilitarExpedienteAdmin}
                          className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Deshabilitar expediente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm md:col-span-2">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    Gestion de usuarios
                  </h3>
                  <p className="mt-2 text-sm text-ink/60">
                    Alta y mantenimiento de usuarios del sistema.
                  </p>
                  <div className="mt-4 rounded-2xl border border-ink/10 bg-white p-4">
                    <h4 className="text-sm font-semibold text-ink">
                      Alta de usuario
                    </h4>
                    <form
                      onSubmit={crearUsuarioAdmin}
                      className="mt-4 grid gap-3 md:grid-cols-2"
                    >
                      <input
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        placeholder="Usuario"
                        value={adminUsuarioForm.usuario}
                        onChange={(event) =>
                          setAdminUsuarioForm((prev) => ({
                            ...prev,
                            usuario: event.target.value,
                          }))
                        }
                      />
                      <input
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        placeholder="Nombre completo"
                        value={adminUsuarioForm.nombre}
                        onChange={(event) =>
                          setAdminUsuarioForm((prev) => ({
                            ...prev,
                            nombre: event.target.value,
                          }))
                        }
                        required
                      />
                      <input
                        type="email"
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        placeholder="Email (opcional)"
                        value={adminUsuarioForm.email}
                        onChange={(event) =>
                          setAdminUsuarioForm((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                      />
                      <input
                        type="password"
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        placeholder="Password"
                        value={adminUsuarioForm.password}
                        onChange={(event) =>
                          setAdminUsuarioForm((prev) => ({
                            ...prev,
                            password: event.target.value,
                          }))
                        }
                        required
                      />
                      <input
                        type="tel"
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        placeholder="Telefono WhatsApp (ej. 388 410-4530)"
                        value={adminUsuarioForm.telefono}
                        onChange={(event) =>
                          setAdminUsuarioForm((prev) => ({
                            ...prev,
                            telefono: event.target.value,
                          }))
                        }
                      />
                      <select
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={adminUsuarioForm.nivel}
                        onChange={(event) =>
                          setAdminUsuarioForm((prev) => ({
                            ...prev,
                            nivel: event.target.value,
                          }))
                        }
                      >
                        <option value="U">Usuario</option>
                        <option value="S">Superusuario</option>
                      </select>
                      <select
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={adminUsuarioForm.codigosector}
                        onChange={(event) =>
                          setAdminUsuarioForm((prev) => ({
                            ...prev,
                            codigosector: event.target.value,
                          }))
                        }
                        required
                      >
                        <option value="">Sector</option>
                        {sectores.map((sector) => (
                          <option
                            key={sector.codigosector}
                            value={sector.codigosector}
                          >
                            {sector.codigosector} - {sector.sector}
                          </option>
                        ))}
                      </select>
                      <div className="md:col-span-2 flex flex-wrap items-center gap-2">
                        <button
                          type="submit"
                          disabled={adminUsuarioEstado === "loading"}
                          className="inline-flex items-center justify-center rounded-2xl bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {adminUsuarioEstado === "loading"
                            ? "Creando..."
                            : "Crear usuario"}
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink"
                          onClick={() => {
                            setAdminUsuarioForm({
                              usuario: "",
                              nombre: "",
                              email: "",
                              telefono: "",
                              password: "",
                              nivel: "U",
                              codigosector: "",
                            });
                            setAdminUsuarioEstado("idle");
                            setAdminUsuarioError("");
                            setAdminUsuarioMensaje("");
                          }}
                        >
                          Limpiar
                        </button>
                      </div>
                    </form>
                  </div>

                  {adminUsuarioError && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {adminUsuarioError}
                    </div>
                  )}
                  {adminUsuarioMensaje && (
                    <div className="mt-4 rounded-2xl border border-moss/20 bg-moss/10 px-4 py-3 text-sm text-moss">
                      {adminUsuarioMensaje}
                    </div>
                  )}

                  <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-4">
                    <h4 className="text-sm font-semibold text-ink">
                      Modificacion de usuario
                    </h4>
                    <form
                      onSubmit={buscarUsuariosAdmin}
                      className="mt-4 flex flex-wrap gap-3"
                    >
                      <input
                        className="flex-1 min-w-[220px] rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        placeholder="Buscar por usuario, nombre o telefono"
                        value={adminUsuariosQuery}
                        onChange={(event) => setAdminUsuariosQuery(event.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={adminUsuariosEstado === "loading"}
                        className="inline-flex items-center justify-center rounded-2xl bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {adminUsuariosEstado === "loading" ? "Buscando..." : "Buscar"}
                      </button>
                    </form>
                    {adminUsuariosError && (
                      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {adminUsuariosError}
                      </div>
                    )}
                    {adminUsuariosResultados.length > 0 && (
                      <div className="mt-4 max-h-[240px] overflow-auto rounded-2xl border border-ink/10">
                        <table className="w-full text-left text-xs">
                          <thead className="sticky top-0 bg-white text-ink/60">
                            <tr>
                              <th className="px-3 py-2 font-semibold">Usuario</th>
                              <th className="px-3 py-2 font-semibold">Nombre</th>
                              <th className="px-3 py-2 font-semibold">Telefono</th>
                              <th className="px-3 py-2 font-semibold">Sector</th>
                              <th className="px-3 py-2 font-semibold">Nivel</th>
                              <th className="px-3 py-2 font-semibold">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-ink/10">
                            {adminUsuariosResultados.map((usuarioItem) => (
                              <tr
                                key={usuarioItem.id}
                                className="cursor-pointer hover:bg-moss/5"
                                onClick={() => seleccionarUsuarioAdmin(usuarioItem)}
                              >
                                <td className="px-3 py-2 font-semibold text-ink">
                                  {usuarioItem.usuario || "N/D"}
                                </td>
                                <td className="px-3 py-2 text-ink/70">
                                  {usuarioItem.nombre || "N/D"}
                                </td>
                                <td className="px-3 py-2 text-ink/70">
                                  {usuarioItem.telefono || "N/D"}
                                </td>
                                <td className="px-3 py-2 text-ink/70">
                                  {sectoresMap.get(
                                    String(usuarioItem.codigosector || "")
                                  ) || "N/D"}
                                </td>
                                <td className="px-3 py-2 text-ink/70">
                                  {usuarioItem.nivel === "S" ? "Super" : "Usuario"}
                                </td>
                                <td className="px-3 py-2 text-ink/70">
                                  {usuarioItem.habilitado === false ? "Baja" : "Activo"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {adminUsuarioSeleccionado && (
                      <div className="mt-4 space-y-4">
                        <form
                          onSubmit={actualizarUsuarioAdmin}
                          className="grid gap-3 md:grid-cols-2"
                        >
                          <input
                            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                            placeholder="Usuario"
                            value={adminUsuarioEdicion.usuario}
                            onChange={(event) =>
                              setAdminUsuarioEdicion((prev) => ({
                                ...prev,
                                usuario: event.target.value,
                              }))
                            }
                          />
                          <input
                            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                            placeholder="Nombre completo"
                            value={adminUsuarioEdicion.nombre}
                            onChange={(event) =>
                              setAdminUsuarioEdicion((prev) => ({
                                ...prev,
                                nombre: event.target.value,
                              }))
                            }
                            required
                          />
                          <input
                            type="email"
                            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                            placeholder="Email (opcional)"
                            value={adminUsuarioEdicion.email}
                            onChange={(event) =>
                              setAdminUsuarioEdicion((prev) => ({
                                ...prev,
                                email: event.target.value,
                              }))
                            }
                          />
                          <select
                            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                            value={adminUsuarioEdicion.nivel}
                            onChange={(event) =>
                              setAdminUsuarioEdicion((prev) => ({
                                ...prev,
                                nivel: event.target.value,
                              }))
                            }
                          >
                            <option value="U">Usuario</option>
                            <option value="S">Superusuario</option>
                          </select>
                          <input
                            type="tel"
                            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                            placeholder="Telefono WhatsApp"
                            value={adminUsuarioEdicion.telefono}
                            onChange={(event) =>
                              setAdminUsuarioEdicion((prev) => ({
                                ...prev,
                                telefono: event.target.value,
                              }))
                            }
                          />
                          <select
                            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                            value={adminUsuarioEdicion.codigosector}
                            onChange={(event) =>
                              setAdminUsuarioEdicion((prev) => ({
                                ...prev,
                                codigosector: event.target.value,
                              }))
                            }
                          >
                            <option value="">Sector</option>
                            {sectores.map((sector) => (
                              <option
                                key={sector.codigosector}
                                value={sector.codigosector}
                              >
                                {sector.codigosector} - {sector.sector}
                              </option>
                            ))}
                          </select>
                          <label className="flex items-center gap-2 text-xs font-semibold text-ink/70">
                            <input
                              type="checkbox"
                              checked={adminUsuarioEdicion.habilitado}
                              onChange={(event) =>
                                setAdminUsuarioEdicion((prev) => ({
                                  ...prev,
                                  habilitado: event.target.checked,
                                }))
                              }
                            />
                            Usuario habilitado
                          </label>
                          <div className="md:col-span-2">
                            <button
                              type="submit"
                              disabled={adminUsuariosEstado === "loading"}
                              className="inline-flex items-center justify-center rounded-2xl bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              Guardar cambios
                            </button>
                          </div>
                        </form>

                        <form
                          onSubmit={resetPasswordAdmin}
                          className="grid gap-3 md:grid-cols-2"
                        >
                          <input
                            type="password"
                            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                            placeholder="Nueva contrasena"
                            value={adminUsuarioPassword}
                            onChange={(event) =>
                              setAdminUsuarioPassword(event.target.value)
                            }
                            required
                          />
                          <div className="flex items-center">
                            <button
                              type="submit"
                              disabled={adminUsuariosEstado === "loading"}
                              className="inline-flex items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              Blanquear contrasena
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                      <select
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={modificacionData.iniciador}
                        onChange={(event) =>
                          setModificacionData((prev) => ({
                            ...prev,
                            iniciador: event.target.value,
                          }))
                        }
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
                        value={modificacionData.asunto}
                        onChange={(event) =>
                          setModificacionData((prev) => ({
                            ...prev,
                            asunto: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-2">
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
                    <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-1">
                      Tipo
                      <select
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={modificacionData.tipo}
                        onChange={(event) =>
                          setModificacionData((prev) => ({
                            ...prev,
                            tipo: event.target.value,
                          }))
                        }
                      >
                        <option value="">Seleccionar</option>
                        {reportesTipoOpciones.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
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
                              tipo: modificacionData.tipo || null,
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
                          tipo: "",
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
          {seccionActiva === "Registrar Expediente" && (
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
                      placeholder="Ej: 769"
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
                      placeholder="Ej: 83"
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
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      title="Ingrese 4 digitos (ej: 2014)."
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      placeholder="Ej: 2024"
                      value={cargaData.anio}
                      onChange={(event) =>
                        setCargaData((prev) => ({
                          ...prev,
                          anio: event.target.value.replace(/\D/g, "").slice(0, 4),
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

                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-2">
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
                  <label className="space-y-2 text-sm font-medium text-ink/70 md:col-span-1">
                    Tipo
                    <select
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                      value={cargaData.tipo}
                      onChange={(event) =>
                        setCargaData((prev) => ({
                          ...prev,
                          tipo: event.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Seleccionar</option>
                      {reportesTipoOpciones.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
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
                      placeholder="Ej: 769"
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
                      placeholder="Ej: 83"
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
                      placeholder="Ej: 2024"
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
                  <div className="flex w-full flex-col items-stretch gap-3 md:col-span-3 md:flex-row">
                    <button
                      type="submit"
                      className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss md:w-1/2"
                    >
                      Buscar
                    </button>
                    <button
                      type="button"
                      className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink md:w-1/2"
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
                          <th className="px-4 py-3 font-semibold">Accion</th>
                          <th className="px-4 py-3 font-semibold">Expediente</th>
                          <th className="px-4 py-3 font-semibold">Codinum</th>
                          <th className="px-4 py-3 font-semibold">Asunto</th>
                          <th className="px-4 py-3 font-semibold">Tipo</th>
                          <th className="px-4 py-3 font-semibold">Destino</th>
                          <th className="px-4 py-3 font-semibold">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/10">
                        {entradaEstado === "loading" && (
                          <tr>
                            <td className="px-4 py-4 text-ink/60" colSpan={6}>
                              Cargando...
                            </td>
                          </tr>
                        )}
                        {entradaEstado !== "loading" &&
                          entradaResultados.length === 0 && (
                            <tr>
                              <td
                                className="px-4 py-4 text-ink/60"
                                colSpan={6}
                              >
                                No hay expedientes para mostrar.
                              </td>
                            </tr>
                          )}
                        {entradaResultados.map((item) => (
                          <tr key={`${item.codigo}-${item.numero}-${item.anio}`}>
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
                            <td className="px-4 py-3 font-semibold text-ink">
                              {item.codigo || "N/D"}-{item.numero || "N/D"}/
                              {item.anio || "N/D"}
                            </td>
                            <td className="px-4 py-3">
                              {item.codinum || "N/D"}
                            </td>
                            <td className="px-4 py-3">
                              {item.asunto || "Sin asunto"}
                            </td>
                            <td className="px-4 py-3">
                              {etiquetaTipo(item.tipo)}
                            </td>
                            <td className="px-4 py-3">
                              {item.destino || "N/D"}
                            </td>
                            <td className="px-4 py-3">
                              {item.fechamov
                                ? new Date(item.fechamov).toLocaleDateString()
                                : "N/D"}
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
                      placeholder="Ej: 769"
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
                      placeholder="Ej: 83"
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
                      placeholder="Ej: 2024"
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
                  <div className="flex w-full flex-col items-stretch gap-3 md:col-span-3 md:flex-row">
                    <button
                      type="submit"
                      className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss md:w-1/2"
                    >
                      Buscar
                    </button>
                    <button
                      type="button"
                      className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink md:w-1/2"
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
                          <th className="px-4 py-3 font-semibold">Accion</th>
                          <th className="px-4 py-3 font-semibold">Expediente</th>
                          <th className="px-4 py-3 font-semibold">Codinum</th>
                          <th className="px-4 py-3 font-semibold">Asunto</th>
                          <th className="px-4 py-3 font-semibold">Tipo</th>
                          <th className="px-4 py-3 font-semibold">Origen</th>
                          <th className="px-4 py-3 font-semibold">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/10">
                        {salidaEstado === "loading" && (
                          <tr>
                            <td className="px-4 py-4 text-ink/60" colSpan={6}>
                              Cargando...
                            </td>
                          </tr>
                        )}
                        {salidaEstado !== "loading" &&
                          salidaResultados.length === 0 && (
                            <tr>
                              <td
                                className="px-4 py-4 text-ink/60"
                                colSpan={6}
                              >
                                No hay expedientes para mostrar.
                              </td>
                            </tr>
                          )}
                        {salidaResultados.map((item) => (
                          <tr key={`${item.codigo}-${item.numero}-${item.anio}`}>
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
                            <td className="px-4 py-3 font-semibold text-ink">
                              {item.codigo || "N/D"}-{item.numero || "N/D"}/
                              {item.anio || "N/D"}
                            </td>
                            <td className="px-4 py-3">
                              {item.codinum || "N/D"}
                            </td>
                            <td className="px-4 py-3">
                              {item.asunto || "Sin asunto"}
                            </td>
                            <td className="px-4 py-3">
                              {etiquetaTipo(item.tipo)}
                            </td>
                            <td className="px-4 py-3">
                              {item.origen || "N/D"}
                            </td>
                            <td className="px-4 py-3">
                              {item.fechamov
                                ? new Date(item.fechamov).toLocaleDateString()
                                : "N/D"}
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

          {seccionActiva === "Remitos" && (
            <div className="space-y-6">
              <div className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      Remitos de expedientes
                    </h2>
                    <p className="mt-1 text-sm text-ink/60">
                      Consulta las salidas vinculadas con tu sector y vuelve a
                      imprimir o guardar sus remitos.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-stone px-4 py-2 text-xs font-semibold text-ink/60">
                    Pagina {remitoPage}
                  </div>
                </div>

                <form
                  onSubmit={handleBuscarRemitos}
                  className="mt-6 grid gap-4 md:grid-cols-3"
                >
                  {[
                    ["codigo", "Codigo", "text"],
                    ["numero", "Numero", "number"],
                    ["anio", "Anio", "number"],
                    ["asunto", "Asunto", "text"],
                    ["fecha_inicio", "Fecha desde", "date"],
                    ["fecha_fin", "Fecha hasta", "date"],
                  ].map(([campo, etiqueta, tipo]) => (
                    <label
                      key={campo}
                      className="space-y-2 text-sm font-medium text-ink/70"
                    >
                      {etiqueta}
                      <input
                        type={tipo}
                        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                        value={remitoFiltros[campo]}
                        onChange={(event) =>
                          setRemitoFiltros((prev) => ({
                            ...prev,
                            [campo]: event.target.value,
                          }))
                        }
                      />
                    </label>
                  ))}
                  <div className="flex gap-3 md:col-span-3">
                    <button
                      type="submit"
                      className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss"
                    >
                      Buscar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const filtrosVacios = {
                          codigo: "",
                          numero: "",
                          anio: "",
                          asunto: "",
                          fecha_inicio: "",
                          fecha_fin: "",
                        };
                        setRemitoFiltros(filtrosVacios);
                        setRemitoPage(1);
                        fetchRemitos(1, filtrosVacios);
                      }}
                      className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-moss/40 hover:text-ink"
                    >
                      Limpiar
                    </button>
                  </div>
                </form>

                {remitoError && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {remitoError}
                  </div>
                )}

                <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10">
                  <div className="max-h-[480px] overflow-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-white text-ink/60">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Accion</th>
                          <th className="px-4 py-3 font-semibold">Fecha</th>
                          <th className="px-4 py-3 font-semibold">Expediente</th>
                          <th className="px-4 py-3 font-semibold">Asunto</th>
                          <th className="px-4 py-3 font-semibold">Origen</th>
                          <th className="px-4 py-3 font-semibold">Destino</th>
                          <th className="px-4 py-3 font-semibold">Usuario</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/10">
                        {remitoEstado === "loading" && (
                          <tr>
                            <td className="px-4 py-4 text-ink/60" colSpan={7}>
                              Cargando remitos...
                            </td>
                          </tr>
                        )}
                        {remitoEstado !== "loading" &&
                          remitoResultados.length === 0 && (
                            <tr>
                              <td className="px-4 py-4 text-ink/60" colSpan={7}>
                                No hay remitos para mostrar.
                              </td>
                            </tr>
                          )}
                        {remitoResultados.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    setRemitoError("");
                                    await abrirVistaPreviaRemito(item.id, item);
                                  } catch (err) {
                                    setRemitoError(err.message);
                                  }
                                }}
                                className="cursor-pointer rounded-full border border-moss/30 bg-moss/10 px-3 py-2 text-xs font-semibold text-moss transition hover:bg-moss hover:text-white"
                              >
                                Vista previa
                              </button>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-ink/60">
                              {formatDateOnly(item.fechamov)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">
                              {item.codigo}-{item.numero}/{item.anio}
                            </td>
                            <td className="min-w-64 px-4 py-3">
                              {item.asunto || "Sin asunto"}
                            </td>
                            <td className="px-4 py-3">{item.origen || "N/D"}</td>
                            <td className="px-4 py-3">{item.destino || "N/D"}</td>
                            <td className="px-4 py-3">{item.usuario || "N/D"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink/60">
                  <span>Total: {remitoTotal} remitos</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const pagina = Math.max(remitoPage - 1, 1);
                        setRemitoPage(pagina);
                        fetchRemitos(pagina);
                      }}
                      disabled={remitoPage === 1 || remitoEstado === "loading"}
                      className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/70 transition hover:border-moss/40 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const paginas = Math.max(
                          Math.ceil(remitoTotal / remitoLimit),
                          1
                        );
                        const pagina = Math.min(remitoPage + 1, paginas);
                        setRemitoPage(pagina);
                        fetchRemitos(pagina);
                      }}
                      disabled={
                        remitoEstado === "loading" ||
                        remitoPage >= Math.ceil(remitoTotal / remitoLimit || 1)
                      }
                      className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/70 transition hover:border-moss/40 disabled:opacity-50"
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
                <label className="space-y-2 text-sm font-medium text-ink/70">
                  Tipo
                  <select
                    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                    value={listadoFiltros.tipo}
                    onChange={(event) =>
                      setListadoFiltros((prev) => ({
                        ...prev,
                        tipo: event.target.value,
                      }))
                    }
                  >
                    <option value="">Todos</option>
                    {reportesTipoOpciones.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-ink/70">
                  Codigo
                  <input
                    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                    value={listadoFiltros.codigo}
                    onChange={(event) =>
                      setListadoFiltros((prev) => ({
                        ...prev,
                        codigo: event.target.value,
                      }))
                    }
                    placeholder="Ej: 769"
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
                      tipo: "",
                      codigo: "",
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
                        <th className="px-4 py-3">Accion</th>
                        <th className="px-4 py-3">Expediente</th>
                        <th className="px-4 py-3">Codinum</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Caja</th>
                        <th className="px-4 py-3">Beneficiario</th>
                        <th className="px-4 py-3">Asunto</th>
                        <th className="px-4 py-3">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listadoResultados.length === 0 && (
                        <tr>
                          <td
                            className="px-4 py-4 text-ink/60"
                            colSpan={8}
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
  <td className="px-4 py-3">
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Ver expediente"
        title="Ver expediente"
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-moss/30 bg-moss/10 text-moss transition hover:bg-moss/20"
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
      <button
        type="button"
        aria-label="Modificar expediente"
        title="Modificar expediente"
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-ink/15 bg-white text-ink transition hover:border-moss/40 hover:bg-moss/5"
        onClick={() => {
          const codigoSel = item.codigo ?? "";
          const numeroSel = String(item.numero ?? "");
          const anioSel = String(item.anio ?? "");
          setSeccionActiva("Modificacion de Expedientes");
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
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
    </div>
  </td>
  <td className="px-4 py-3 font-semibold text-ink">
    {item.codigo}-{item.numero}-{item.anio}
  </td>
  <td className="px-4 py-3 text-ink/60">
    {item.codinum || "N/D"}
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
  <td className="px-4 py-3 text-ink/60">
    {etiquetaTipo(item.tipo)}
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
                    <button
                      type="button"
                      onClick={() => {
                        if (!expediente) return;
                        setSeccionActiva("Modificacion de Expedientes");
                        setModificacionKey({
                          codigo: expediente.codigo ?? "",
                          numero: String(expediente.numero ?? ""),
                          anio: String(expediente.anio ?? ""),
                        });
                        buscarParaModificar(
                          expediente.codigo ?? "",
                          String(expediente.numero ?? ""),
                          String(expediente.anio ?? "")
                        );
                      }}
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition hover:border-moss/40 hover:bg-moss/5"
                      aria-label="Modificar expediente"
                      title="Modificar expediente"
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
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-ink/70">
                    <p>
                      <span className="font-semibold text-ink">Asunto:</span>{" "}
                      {expediente.asunto || "Sin detalle"}
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Tipo:</span>{" "}
                      {etiquetaTipo(expediente.tipo)}
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
                        <span className="flex items-center gap-2">
                          Estado:{" "}
                          {mov.estado === "E"
                            ? "Entrada"
                            : mov.estado === "S"
                              ? "Salida"
                              : mov.estado || "N/D"}
                          {mov.estado === "S" && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  setError("");
                                  await abrirVistaPreviaRemito(
                                    mov.id,
                                    expediente || mov
                                  );
                                } catch (err) {
                                  setError(err.message);
                                }
                              }}
                              className="cursor-pointer rounded-full border border-red-200 bg-white px-3 py-1 font-semibold text-red-700 transition hover:bg-red-100"
                              title="Descargar remito PDF"
                              aria-label="Descargar remito PDF"
                            >
                              Ver remito
                            </button>
                          )}
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
                    {salidaRemitoId && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setSalidaGuardarError("");
                            await abrirVistaPreviaRemito(
                              salidaRemitoId,
                              salidaDetalle || {}
                            );
                            setSalidaModalOpen(false);
                            setSalidaDetalle(null);
                          } catch (err) {
                            setSalidaGuardarError(err.message);
                          }
                        }}
                        className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-moss px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-haze transition hover:bg-ink"
                      >
                        Vista previa del remito
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={
                        salidaGuardarEstado === "loading" ||
                        salidaGuardarEstado === "success"
                      }
                      className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone shadow-haze transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {salidaGuardarEstado === "loading"
                        ? "Guardando..."
                        : salidaGuardarEstado === "success"
                          ? "Salida registrada"
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
        {remitoPreview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 md:p-6">
            <div className="flex h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-haze">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">
                    Vista previa del remito
                  </h3>
                  <p className="text-xs text-ink/60">
                    Expediente {remitoPreview.expediente}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={guardarRemitoPreview}
                    className="cursor-pointer rounded-2xl border border-moss/30 bg-moss/10 px-4 py-2 text-sm font-semibold text-moss transition hover:bg-moss hover:text-white"
                  >
                    Guardar PDF
                  </button>
                  <button
                    type="button"
                    onClick={imprimirRemitoPreview}
                    disabled={!remitoPreviewReady}
                    className="cursor-pointer rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Imprimir
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemitoPreview(null)}
                    className="cursor-pointer rounded-2xl border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink/70 transition hover:border-ink/40"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 bg-ink/10 p-2 md:p-4">
                <iframe
                  ref={remitoIframeRef}
                  src={remitoPreview.url}
                  title={`Remito ${remitoPreview.expediente}`}
                  onLoad={() => setRemitoPreviewReady(true)}
                  className="h-full w-full rounded-xl border-0 bg-white"
                />
              </div>
            </div>
          </div>
        )}
        <div className="fixed bottom-6 right-6 z-40">
          {chatAbierto && (
            <div className="mb-2 w-[320px] overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-haze">
              <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <img src={sidIcon} alt="Sid" className="h-8 w-8" />
                  Sid
                </div>
                <button
                  type="button"
                  className="rounded-full px-2 py-1 text-xs text-ink/60 hover:bg-ink/5"
                  onClick={() => setChatAbierto(false)}
                >
                  Cerrar
                </button>
              </div>
              <div
                ref={chatScrollRef}
                className="max-h-64 space-y-2 overflow-y-auto px-4 py-3 text-sm"
              >
                {chatMensajes.map((msg, index) => (
                  <div
                    key={`${msg.role}-${index}`}
                    className={`rounded-2xl px-3 py-2 ${
                      msg.role === "user"
                        ? "ml-auto max-w-[85%] bg-ink text-stone"
                        : "max-w-[85%] bg-stone text-ink"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {chatEstado === "loading" && (
                  <div className="max-w-[85%] rounded-2xl bg-stone px-3 py-2 text-ink">
                    Pensando...
                  </div>
                )}
              </div>
              {chatError && (
                <div className="px-4 pb-2 text-xs text-red-600">
                  {chatError}
                </div>
              )}
              <form
                className="border-t border-ink/10 px-4 py-3"
                onSubmit={handleEnviarChat}
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={chatInputRef}
                    className="w-full rounded-full border border-ink/15 bg-white px-3 py-2 text-xs text-ink shadow-sm focus:border-moss/50 focus:outline-none focus:ring-2 focus:ring-moss/20"
                    placeholder="Escribi tu consulta..."
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    disabled={chatEstado === "loading"}
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-ink px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={chatEstado === "loading"}
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </div>
          )}
          <button
            type="button"
            onClick={() => setChatAbierto((prev) => !prev)}
            className={`flex items-center justify-center rounded-full bg-ink text-stone shadow-haze transition hover:bg-moss ${
              chatAbierto ? "h-16 w-16" : "h-20 w-20"
            }`}
            aria-label="Abrir chat con Sid"
            title="Abrir chat con Sid"
          >
            <img
              src={sidIcon}
              alt="Sid"
              className={chatAbierto ? "h-10 w-10" : "h-12 w-12"}
            />
          </button>
        </div>
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
      <footer className="border-t border-ink/10 bg-white/80 px-6 py-6 text-center text-xs text-ink/60">
        Seguimiento Interno de Expedientes · Ministerio de Desarrollo Humano ·
        Secretaria de Niñez, Adolescencia y Familia
      </footer>
    </div>
  );
}

export default Dashboard;
