const revokedTokens = new Map();

export function isRevoked(jti) {
  if (!jti) return false;
  const exp = revokedTokens.get(jti);
  if (!exp) return false;
  // Limpieza simple: si ya expiró el token, removerlo y permitir paso
  if (exp * 1000 < Date.now()) {
    revokedTokens.delete(jti);
    return false;
  }
  return true;
}

export function revokeToken(jti, exp) {
  if (!jti) return;
  revokedTokens.set(jti, exp ?? 0);
}
