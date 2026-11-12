export const parseMoney = (s) => parseInt(String(s ?? '').replace(/\D/g, ''), 10) || 0;
export const fmt = (n) => Math.round(n || 0).toLocaleString('vi-VN') + 'đ';

/**
 * mode 'items': chia theo món (mỗi món chia đều cho người được chọn)
 * mode 'equal': chia đều tổng tiền cho số lượng người (equalCount)
 * Thuế/tip cộng thêm theo % lên phần của mỗi người.
 * roundUp: làm tròn lên 1.000đ cho từng người.
 */
export function calcSplit({ people, items, mode, total, equalCount, taxPct, tipPct, roundUp }) {
  const rate = 1 + ((Number(taxPct) || 0) + (Number(tipPct) || 0)) / 100;
  const roundAmt = (v) => (roundUp ? Math.ceil(v / 1000 - 1e-9) * 1000 : Math.round(v));

  if (mode === 'equal') {
    const count = parseMoney(equalCount);
    const t = parseMoney(total);
    const perPerson = count > 0 ? roundAmt((t / count) * rate) : 0;
    return { totals: {}, grand: perPerson * count, perPerson, count };
  }

  const raw = Object.fromEntries(people.map((p) => [p.id, 0]));
  for (const it of items) {
    const who = it.sharedBy.filter((id) => id in raw);
    if (!who.length || !it.price) continue;
    who.forEach((id) => (raw[id] += it.price / who.length));
  }

  const totals = {};
  let grand = 0;
  for (const id in raw) {
    totals[id] = roundAmt(raw[id] * rate);
    grand += totals[id];
  }
  return { totals, grand, perPerson: 0, count: people.length };
}
