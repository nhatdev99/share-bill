import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import BankPicker from '../components/BankPicker';
import { removeAccents } from '../vietqr';
import { uid } from '../storage';
import { C, cardStyle, labelStyle } from '../theme';

export default function AccountsScreen({ accounts, defaultId, setAccounts, setDefaultId }) {
  const [bank, setBank] = useState(null);
  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [picking, setPicking] = useState(false);

  const add = () => {
    const num = number.replace(/\s/g, '');
    if (!bank) return Alert.alert('Chọn ngân hàng');
    if (!/^\d{6,19}$/.test(num)) return Alert.alert('Số tài khoản không hợp lệ', 'Chỉ gồm 6–19 chữ số.');
    if (!holder.trim()) return Alert.alert('Nhập tên chủ tài khoản');

    const acc = {
      id: uid(), bin: bank.bin, bankName: bank.name, number: num,
      holder: removeAccents(holder).toUpperCase().trim(),
    };
    setAccounts([...accounts, acc]);
    if (!defaultId) setDefaultId(acc.id);
    setBank(null); setNumber(''); setHolder('');
  };

  const remove = (id) =>
    Alert.alert('Xoá tài khoản?', '', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá', style: 'destructive',
        onPress: () => {
          const rest = accounts.filter((a) => a.id !== id);
          setAccounts(rest);
          if (defaultId === id) setDefaultId(rest[0]?.id || null);
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Tài khoản nhận tiền</Text>

      <View style={s.card}>
        <Text style={s.label}>Thêm tài khoản</Text>
        <Pressable style={s.input} onPress={() => setPicking(true)}>
          <Text style={{ color: bank ? C.ink : C.faint, fontSize: 15 }}>{bank ? bank.name : 'Chọn ngân hàng'}</Text>
          <Text style={s.chev}>›</Text>
        </Pressable>
        <TextInput style={s.input} placeholder="Số tài khoản" placeholderTextColor={C.faint}
          keyboardType="number-pad" value={number} onChangeText={setNumber} />
        <TextInput style={s.input} placeholder="Tên chủ tài khoản" placeholderTextColor={C.faint}
          autoCapitalize="characters" value={holder} onChangeText={setHolder} />
        <Pressable style={s.btn} onPress={add}><Text style={s.btnText}>Lưu tài khoản</Text></Pressable>
      </View>

      <Text style={s.h2}>Đã lưu</Text>
      {accounts.length === 0 && <Text style={s.hint}>Chưa có tài khoản nào.</Text>}
      {accounts.map((a) => {
        const isDefault = a.id === defaultId;
        return (
          <View key={a.id} style={[s.card, s.acc, isDefault && s.accDefault]}>
            <View style={{ flex: 1 }}>
              <View style={s.bankRow}>
                <Text style={s.bank}>{a.bankName}</Text>
                {isDefault && <View style={s.badge}><Text style={s.badgeText}>Mặc định</Text></View>}
              </View>
              <Text style={s.num}>{a.number}</Text>
              <Text style={s.holder}>{a.holder}</Text>
            </View>
            <View style={s.actions}>
              {!isDefault && (
                <Pressable onPress={() => setDefaultId(a.id)} hitSlop={8}><Text style={s.link}>Đặt mặc định</Text></Pressable>
              )}
              <Pressable onPress={() => remove(a.id)} hitSlop={8}><Text style={s.del}>Xoá</Text></Pressable>
            </View>
          </View>
        );
      })}

      <BankPicker visible={picking} onClose={() => setPicking(false)} onPick={(b) => { setBank(b); setPicking(false); }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48, gap: 12 },
  title: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.5, marginBottom: 4 },
  h2: { fontSize: 15, fontWeight: '800', color: C.ink, marginTop: 8 },
  card: { ...cardStyle, gap: 10 },
  label: { ...labelStyle, marginBottom: 0 },
  input: {
    backgroundColor: C.bg, borderRadius: 14, borderWidth: 1, borderColor: C.line, height: 48,
    paddingHorizontal: 14, fontSize: 15, color: C.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  chev: { color: C.faint, fontSize: 22 },
  btn: { backgroundColor: C.accent, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hint: { color: C.faint },
  acc: { flexDirection: 'row', gap: 12 },
  accDefault: { borderColor: C.accent, borderWidth: 1.5 },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bank: { fontSize: 15, fontWeight: '800', color: C.ink },
  badge: { backgroundColor: C.soft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { color: C.accentText, fontSize: 11, fontWeight: '800' },
  num: { fontSize: 20, fontWeight: '800', color: C.ink, marginTop: 4, letterSpacing: 0.5 },
  holder: { color: C.muted, marginTop: 2, fontSize: 13 },
  actions: { justifyContent: 'space-between', alignItems: 'flex-end' },
  link: { color: C.accent, fontWeight: '700', fontSize: 13 },
  del: { color: C.danger, fontWeight: '600', fontSize: 13 },
});
