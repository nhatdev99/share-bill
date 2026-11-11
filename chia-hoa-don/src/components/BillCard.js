import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { buildVietQR, removeAccents } from '../vietqr';
import { fmt } from '../split';

// View này được chụp thành ảnh PNG để chia sẻ.
const BillCard = forwardRef(function BillCard({ account, amount, title, note }, ref) {
  const payload = buildVietQR({ bin: account.bin, account: account.number, amount, note });

  return (
    <View ref={ref} collapsable={false} style={s.card}>
      <Text style={s.brand}>HOÁ ĐƠN CHIA TIỀN</Text>
      {!!title && <Text style={s.title}>{title}</Text>}
      <Text style={s.amount}>{fmt(amount)}</Text>

      <View style={s.qrBox}>
        <QRCode value={payload} size={230} ecl="M" backgroundColor="#fff" />
      </View>

      <Text style={s.hint}>Quét bằng app ngân hàng · đã điền sẵn số tiền</Text>

      <View style={s.info}>
        <Row label="Ngân hàng" value={account.bankName} />
        <Row label="Chủ tài khoản" value={removeAccents(account.holder).toUpperCase()} />
        <Row label="Số tài khoản" value={account.number} bold />
        {!!note && <Row label="Nội dung" value={note} />}
      </View>
    </View>
  );
});

const Row = ({ label, value, bold }) => (
  <View style={s.row}>
    <Text style={s.label}>{label}</Text>
    <Text style={[s.value, bold && { fontWeight: '800' }]}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  card: { width: 340, backgroundColor: '#fff', padding: 20, alignItems: 'center' },
  brand: { fontSize: 12, letterSpacing: 2, color: '#888', fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  amount: { fontSize: 34, fontWeight: '800', color: '#2563eb', marginVertical: 8 },
  qrBox: { padding: 12, borderWidth: 1, borderColor: '#e1e4e8', borderRadius: 12, backgroundColor: '#fff' },
  hint: { fontSize: 11, color: '#888', marginTop: 8 },
  info: { alignSelf: 'stretch', marginTop: 14, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: 12 },
  label: { color: '#888', fontSize: 13 },
  value: { fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
});

export default BillCard;
