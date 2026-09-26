function round1(n) {
  if (n === null || n === undefined) return null;
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

function round2(n) {
  if (n === null || n === undefined) return null;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = { round1, round2 };
