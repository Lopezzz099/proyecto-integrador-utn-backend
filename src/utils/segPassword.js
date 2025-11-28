function stripPassword(row) {
  if (!row) return row;
  const { password, ...rest } = row;
  return rest;
}

function stripPasswords(rows) {
  if (!Array.isArray(rows)) return rows;
  return rows.map(stripPassword);
}

module.exports = { stripPassword, stripPasswords };