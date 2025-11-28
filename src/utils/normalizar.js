function normalizarParametro(raw = "") {
  return raw.replace(/-/g, " ").trim();
}
module.exports = { normalizarParametro };