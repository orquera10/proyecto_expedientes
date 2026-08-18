export function normalizeArgentinePhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("54")) {
    digits = digits.slice(2);
    if (digits.startsWith("9")) digits = digits.slice(1);
  }
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 12) {
    for (let areaLength = 2; areaLength <= 4; areaLength += 1) {
      if (digits.slice(areaLength, areaLength + 2) === "15") {
        digits = `${digits.slice(0, areaLength)}${digits.slice(areaLength + 2)}`;
        break;
      }
    }
  }
  return digits.length === 10 ? `549${digits}` : "";
}
