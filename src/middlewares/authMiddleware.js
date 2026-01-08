import jwt from "jsonwebtoken";
import { isRevoked } from "../utils/tokenStore.js";

export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no provisto" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (isRevoked(payload.jti)) {
      return res.status(401).json({ error: "Token revocado" });
    }

    req.user = payload;
    req.auth = { jti: payload.jti, exp: payload.exp, user: payload };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}
