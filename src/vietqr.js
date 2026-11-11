// Tạo chuỗi VietQR (chuẩn EMVCo / NAPAS 247) hoàn toàn offline.
// Quét bằng app ngân hàng sẽ tự điền số tài khoản, ngân hàng, số tiền, nội dung.

const tlv = (id, value) => id + String(value.length).padStart(2, '0') + value;

// CRC16-CCITT (poly 0x1021, init 0xFFFF)
export function crc16(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function removeAccents(s = '') {
  return String(s)
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Nội dung CK: không dấu, chỉ chữ/số/khoảng trắng, tối đa 25 ký tự cho an toàn
export function cleanNote(s = '') {
  return removeAccents(s).replace(/[^A-Za-z0-9 ]/g, '').trim().slice(0, 25);
}

export function buildVietQR({ bin, account, amount, note }) {
  const bank = tlv('00', bin) + tlv('01', account);
  const merchant = tlv('00', 'A000000727') + tlv('01', bank) + tlv('02', 'QRIBFTTA');
  const hasAmount = amount > 0;

  let p = tlv('00', '01') + tlv('01', hasAmount ? '12' : '11') + tlv('38', merchant) + tlv('53', '704');
  if (hasAmount) p += tlv('54', String(Math.round(amount)));
  p += tlv('58', 'VN');
  const n = cleanNote(note);
  if (n) p += tlv('62', tlv('08', n));
  p += '6304';
  return p + crc16(p);
}
