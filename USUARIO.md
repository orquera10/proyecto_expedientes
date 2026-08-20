# Manual de Usuario - Sistema de Expedientes

Este documento describe las funciones principales del sistema, los flujos de
trabajo y ejemplos de uso. Incluye recomendaciones, criterios y ejemplos
practicos para el trabajo diario.

## Acceso

- Inicie sesion con su nombre de usuario y contrasena.
- Si su sesion expira, el sistema lo redirigira al inicio de sesion.
- Mantenga abierta una sola sesion por usuario para evitar conflictos.

## Menu principal

El menu lateral contiene las secciones principales:

- Registrar Expedientes x 1 vez
- Entrada de Expedientes
- Salida de Expedientes
- Listado de Expedientes
- Modificacion de Expedientes
- Consulta de Expedientes

Los botones de Entrada y Salida se resaltan segun la seccion activa. Use el
menu para cambiar de tareas sin perder el trabajo actual.

## Registrar Expedientes x 1 vez (carga inicial)

Sirve para cargar un expediente por primera vez y crear su movimiento inicial.
Se usa unicamente cuando el expediente no existe.

Campos principales:

- Codigo, Numero, Anio (el anio debe tener 4 digitos, ej: 2024).
- Fechas: carga, inicio, entrada.
- Asunto, Iniciador, Beneficiario.
- Fojas, Caja Interna, Caja Archivo.
- Partida (seleccion desde el modal de partidas).
- Origen y Destino (seleccion desde sector).
- Motivo (si corresponde).

Notas:

- La combinacion Codigo + Numero + Anio no se puede repetir.
- El campo Anio se valida con 4 digitos.
- Si deja fechas vacias, el sistema usa la fecha actual.

Sugerencia:

- Escriba el Asunto y el Beneficiario en mayuscula si se requiere consistencia.

## Entrada de Expedientes

Muestra expedientes cuyo ultimo movimiento es de salida (S) y estan dirigidos a
su sector. Desde aqui puede registrar la entrada.

Funciones:

- Buscar por Codigo, Numero, Anio, Asunto y rango de fechas.
- Ver el detalle del expediente.
- Registrar la entrada (boton de flecha verde).

Al registrar entrada:

- El origen y destino quedan en su sector.
- Se registra el movimiento con estado "E".
- Puede actualizar fojas y cajas si corresponde.

## Salida de Expedientes

Muestra expedientes cuyo ultimo movimiento es de entrada (E) y estan en su
sector (segun codigosector del movimiento).

Funciones:

- Buscar por Codigo, Numero, Anio, Asunto y rango de fechas.
- Ver el detalle del expediente.
- Registrar la salida (boton de flecha roja).

Al registrar salida:

- El origen es su sector y el destino se selecciona.
- Se registra el movimiento con estado "S".
- Puede actualizar fojas y cajas si corresponde.
- Se abre una vista previa del remito PDF para que pueda imprimirlo o guardarlo
  en la computadora. El sistema no lo descarga automaticamente.
- La seccion "Remitos" permite buscar cualquier salida vinculada con su sector y
  volver a abrir, imprimir o guardar el remito.

## Consulta de Expedientes

Permite ver un expediente y su historial de movimientos.

Pasos:

1) Ingrese Codigo, Numero y Anio.
2) Presione Buscar.
3) Se muestran datos generales y movimientos ordenados por numero de movimiento.

En esta seccion, si aplica, puede aparecer el boton de Dar Entrada o Dar Salida
segun el ultimo movimiento y su sector.

Interpretacion de estados:

- E = Entrada
- S = Salida

## Listado de Expedientes

Permite generar listados filtrados (por fecha, caja, beneficiario, asunto).

Funciones:

- Buscar con filtros.
- Ver expediente desde la columna de accion.
- Acceder a la seccion de Consulta con los datos precargados.

Recomendacion:

- Use filtros para evitar resultados masivos.

## Modificacion de Expedientes

Permite modificar campos del expediente.

Pasos:

1) Ingrese Codigo, Numero y Anio y busque.
2) Modifique campos habilitados.
3) Guarde los cambios.

Si no encuentra un expediente, verifique:

- Codigo, Numero y Anio correctos.
- Que el expediente no este deshabilitado.

## Asistente (IA)

Puede consultar al asistente desde el boton flotante.

Ejemplos:

- "Ultimos expedientes dirigidos a mi sector"
- "Ultimos expedientes en mi sector"
- "Expediente 769 83 2024"
- "Expedientes relacionados con informatica"
- "Expedientes relacionados con vehiculos que van a mi sector"

Comandos utiles:

- "solo numeros" (devuelve solo codigo-numero-anio del ultimo listado).

Si el asistente no entiende:

- Pruebe con una frase mas concreta.
- Indique el tema del asunto (ej: "teclados", "vehiculos").

## Recomendaciones

- Verifique que su sesion este activa antes de operar.
- Use filtros para evitar listados muy grandes.
- Si un expediente no aparece donde espera, revise el ultimo movimiento.
- Mantenga consistencia en mayusculas para asuntos y beneficiarios.
## API de consulta para el bot de WhatsApp

Configura `EXPEDIENTES_BOT_API_KEY` en el backend y realiza las consultas con:

```http
GET /api/bot/expedientes/:codigo/:numero/:anio?limite=5
X-API-Key: <EXPEDIENTES_BOT_API_KEY>
```

El endpoint es de solo lectura, devuelve el expediente habilitado y hasta diez de sus movimientos habilitados. La API responde `401` si la clave es incorrecta, `404` si el expediente no existe y `503` si la variable no fue configurada.

Antes de permitir una consulta, el bot verifica el telefono con:

```http
GET /api/bot/usuarios/telefono/:telefono
X-API-Key: <EXPEDIENTES_BOT_API_KEY>
```

Solo autoriza telefonos asociados a usuarios habilitados. Los numeros se guardan normalizados en formato argentino internacional (`549...`) y no pueden repetirse entre usuarios.
