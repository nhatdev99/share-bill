import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { buildVietQR, removeAccents } from '../vietqr';
import { fmt } from '../split';
import { C } from '../theme';

// View này được chụp thành ảnh PNG để chia sẻ.
const BillCard = forwardRef(function BillCard({ account, amount, title, note }, ref) {
  const payload = buildVietQR({ bin: account.bin, account: account.number, amount, note });

  return (
    <View ref={ref} collapsable={false} style={s.card}>
      <Text style={s.brand}>HOÁ ĐƠN CHIA TIỀN</Text>
      {!!title && <Text style={s.title}>{title}</Text>}
      <Text style={s.amount}>{fmt(amount)}</Text>

      <View style={s.qrBox}>
        <QRCode value={payload} size={220} ecl="M" backgroundColor="#fff" />
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
  card: { width: 340, backgroundColor: '#fff', paddingHorizontal: 24, paddingTop: 26, paddingBottom: 20, alignItems: 'center' },
  brand: { fontSize: 11, letterSpacing: 2.5, color: C.muted, fontWeight: '800' },
  title: { fontSize: 19, fontWeight: '800', color: C.ink, marginTop: 10 },
  amount: { fontSize: 40, fontWeight: '800', color: C.accent, letterSpacing: -1.5, marginTop: 2, marginBottom: 14 },
  qrBox: { padding: 12, borderWidth: 1, borderColor: C.line, borderRadius: 18, backgroundColor: '#fff' },
  hint: { fontSize: 12, color: C.muted, fontWeight: '600', marginTop: 10, marginBottom: 14 },
  info: { alignSelf: 'stretch', borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#D6D2C4', paddingTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, gap: 12 },
  label: { color: C.muted, fontSize: 13 },
  value: { fontSize: 14, fontWeight: '700', color: C.ink, flexShrink: 1, textAlign: 'right' },
});

export default BillCard;
