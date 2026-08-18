import crypto from "node:crypto";

function keysMatch(received, expected) {
  const receivedBuffer = Buffer.from(String(received || ""));
  const expectedBuffer = Buffer.from(String(expected || ""));
  return (
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export function verificarBotApiKey(req, res, next) {
  const expected = process.env.EXPEDIENTES_BOT_API_KEY;
  if (!expected) {
    return res.status(503).json({ error: "API del bot no configurada" });
  }
  if (!keysMatch(req.header("x-api-key"), expected)) {
    return res.status(401).json({ error: "API key invalida" });
  }
  next();
}
