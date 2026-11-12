import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { calcSplit, fmt, parseMoney } from '../split';
import { uid } from '../storage';
import ShareModal from '../components/ShareModal';
import { C, avatarColor, cardStyle, labelStyle } from '../theme';

const Avatar = ({ name, color, size = 32 }) => (
  <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
    <Text style={[s.avatarText, { fontSize: size * 0.42 }]}>{(name || '?').trim().charAt(0).toUpperCase()}</Text>
  </View>
);

export default function SplitScreen({ data, patch, accounts, defaultId, goAccounts }) {
  const { people, items, mode, total, equalCount = '', taxPct, tipPct, roundUp } = data;
  const [personName, setPersonName] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [share, setShare] = useState(null); // {title, amount, note}

  const result = useMemo(() => calcSplit(data), [data]);

  const addPerson = () => {
    const name = personName.trim();
    if (!name) return;
    patch({ people: [...people, { id: uid(), name }] });
    setPersonName('');
  };

  const removePerson = (id) =>
    patch({
      people: people.filter((p) => p.id !== id),
      items: items.map((i) => ({ ...i, sharedBy: i.sharedBy.filter((x) => x !== id) })),
    });

  const addItem = () => {
    const name = itemName.trim();
    const price = parseMoney(itemPrice);
    if (!name || !price) return Alert.alert('Thiếu thông tin', 'Nhập tên món và giá.');
    if (!people.length) return Alert.alert('Chưa có người', 'Thêm người trước nhé.');
    patch({ items: [...items, { id: uid(), name, price, sharedBy: people.map((p) => p.id) }] });
    setItemName(''); setItemPrice('');
  };

  const toggleShare = (itemId, pid) =>
    patch({
      items: items.map((i) =>
        i.id !== itemId ? i : {
          ...i,
          sharedBy: i.sharedBy.includes(pid) ? i.sharedBy.filter((x) => x !== pid) : [...i.sharedBy, pid],
        }
      ),
    });

  const reset = () =>
    Alert.alert('Xoá hết?', 'Làm lại từ đầu (tài khoản ngân hàng vẫn giữ).', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: () => patch({ people: [], items: [], total: '', equalCount: '', taxPct: '0', tipPct: '0' }) },
    ]);

  const equalPeopleCount = result.count;
  const equalAmount = result.perPerson;
  const rate = 1 + ((Number(taxPct) || 0) + (Number(tipPct) || 0)) / 100;
  const baseTotal = parseMoney(total);
  const withTax = Math.round(baseTotal * rate);
  const extras = (Number(taxPct) || 0) + (Number(tipPct) || 0) > 0;

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.headerRow}>
        <Text style={s.title}>Chia hoá đơn</Text>
        <Pressable style={s.resetBtn} onPress={reset}><Text style={s.resetText}>Làm lại</Text></Pressable>
      </View>

      {/* Kiểu chia */}
      <View style={s.seg}>
        {[['items', 'Theo món'], ['equal', 'Chia đều']].map(([k, label]) => (
          <Pressable key={k} style={[s.segBtn, mode === k && s.segOn]} onPress={() => patch({ mode: k })}>
            <Text style={[s.segText, mode === k && s.segTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {mode === 'equal' ? (
        <>
          {/* Hero */}
          <View style={s.hero}>
            <Text style={s.heroLabel}>Mỗi người trả</Text>
            <Text style={s.heroAmount}>{fmt(equalAmount)}</Text>
            <Text style={s.heroSub}>
              {equalPeopleCount > 0 && baseTotal > 0
                ? `${fmt(baseTotal)}${extras ? ` + thuế/tip = ${fmt(withTax)}` : ''} · ${equalPeopleCount} người`
                : 'Nhập số người và tổng tiền'}
            </Text>
          </View>

          <View style={s.card}>
            <Text style={s.label}>Số người</Text>
            <View style={s.stepRow}>
              <Pressable
                style={[s.stepOut, equalPeopleCount <= 0 && { opacity: 0.35 }]}
                disabled={equalPeopleCount <= 0}
                onPress={() => patch({ equalCount: equalPeopleCount > 1 ? String(equalPeopleCount - 1) : '' })}
              >
                <Text style={[s.stepText, { color: C.ink }]}>−</Text>
              </Pressable>
              <TextInput
                style={s.countInput}
                placeholder="4"
                placeholderTextColor={C.faint}
                keyboardType="number-pad"
                value={String(equalCount)}
                onChangeText={(v) => patch({ equalCount: v.replace(/\D/g, '') })}
              />
              <Pressable style={s.stepIn} onPress={() => patch({ equalCount: String(equalPeopleCount + 1) })}>
                <Text style={[s.stepText, { color: '#fff' }]}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.label}>Tổng tiền hoá đơn</Text>
            <View style={s.moneyRow}>
              <TextInput style={s.moneyInput} placeholder="850000" placeholderTextColor={C.faint}
                keyboardType="number-pad" value={total} onChangeText={(v) => patch({ total: v })} />
              <Text style={s.unit}>đ</Text>
            </View>
          </View>
        </>
      ) : (
        <>
          <Text style={s.h2}>Ai đi ăn?</Text>
          <View style={s.addRow}>
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Tên" placeholderTextColor={C.faint}
              value={personName} onChangeText={setPersonName} onSubmitEditing={addPerson} returnKeyType="done" />
            <Pressable style={s.addBtn} onPress={addPerson}><Text style={s.addBtnText}>Thêm</Text></Pressable>
          </View>
          <View style={s.wrap}>
            {people.map((p, i) => (
              <Pressable key={p.id} style={s.person} onLongPress={() => removePerson(p.id)}>
                <Avatar name={p.name} color={avatarColor(i)} />
                <Text style={s.personText}>{p.name}</Text>
              </Pressable>
            ))}
          </View>
          {people.length > 0 && <Text style={s.hint}>Giữ lâu tên để xoá người</Text>}

          <Text style={s.h2}>Các món</Text>
          <View style={s.addRow}>
            <TextInput style={[s.input, { flex: 2 }]} placeholder="Tên món" placeholderTextColor={C.faint}
              value={itemName} onChangeText={setItemName} />
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Giá" placeholderTextColor={C.faint}
              keyboardType="number-pad" value={itemPrice} onChangeText={setItemPrice} />
            <Pressable style={s.addSquare} onPress={addItem}><Text style={s.addSquareText}>+</Text></Pressable>
          </View>
          {items.map((it) => (
            <View key={it.id} style={s.card}>
              <View style={s.itemHead}>
                <Text style={s.itemName}>{it.name}</Text>
                <Text style={s.itemPrice}>{fmt(it.price)}</Text>
                <Pressable onPress={() => patch({ items: items.filter((x) => x.id !== it.id) })} hitSlop={8}>
                  <Text style={s.del}>Xoá</Text>
                </Pressable>
              </View>
              <View style={s.wrap}>
                {people.map((p) => {
                  const on = it.sharedBy.includes(p.id);
                  return (
                    <Pressable key={p.id} onPress={() => toggleShare(it.id, p.id)} style={[s.chip, on && s.chipOn]}>
                      <Text style={[s.chipText, on && { color: '#fff' }]}>{p.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </>
      )}

      {/* Thuế / tip */}
      <View style={s.twoCol}>
        {[['VAT', taxPct, 'taxPct'], ['Tip / phục vụ', tipPct, 'tipPct']].map(([l, v, k]) => (
          <View key={k} style={[s.card, { flex: 1 }]}>
            <Text style={s.label}>{l}</Text>
            <View style={s.moneyRow}>
              <TextInput style={s.pctInput} keyboardType="numeric" value={v} onChangeText={(t) => patch({ [k]: t })} />
              <Text style={s.unit}>%</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={[s.card, s.toggleRow]}>
        <Text style={s.toggleText}>Làm tròn lên 1.000đ mỗi người</Text>
        <Switch value={roundUp} onValueChange={(v) => patch({ roundUp: v })}
          trackColor={{ true: C.accent, false: '#D5D3CA' }} />
      </View>

      {/* Kết quả */}
      {mode === 'items' && (
        <>
          <Text style={s.h2}>Kết quả</Text>
          <View style={s.card}>
            {people.length === 0 && <Text style={s.hint}>Chưa có ai.</Text>}
            {people.map((p, i) => (
              <View key={p.id} style={s.resRow}>
                <Avatar name={p.name} color={avatarColor(i)} size={34} />
                <Text style={s.resName}>{p.name}</Text>
                <Text style={s.resAmt}>{fmt(result.totals[p.id])}</Text>
                <Pressable style={s.qrBtn} disabled={!result.totals[p.id]}
                  onPress={() => setShare({ title: p.name, amount: result.totals[p.id], note: `Chia hoa don ${p.name}` })}>
                  <Text style={s.qrText}>QR</Text>
                </Pressable>
              </View>
            ))}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Tổng thu</Text>
              <Text style={s.totalAmt}>{fmt(result.grand)}</Text>
            </View>
          </View>
        </>
      )}

      {mode === 'equal' && (
        <Pressable style={[s.cta, !equalAmount && { opacity: 0.4 }]} disabled={!equalAmount}
          onPress={() => setShare({ title: `Mỗi người (${equalPeopleCount} người)`, amount: equalAmount, note: 'Chia hoa don' })}>
          <Text style={s.ctaText}>Chia sẻ hoá đơn · {fmt(equalAmount)}/người</Text>
        </Pressable>
      )}

      <ShareModal
        visible={!!share}
        onClose={() => setShare(null)}
        accounts={accounts}
        defaultId={defaultId}
        title={share?.title}
        amount={share?.amount || 0}
        note={share?.note}
        onGoAccounts={() => { setShare(null); goAccounts(); }}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  resetBtn: { backgroundColor: C.dangerBg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  resetText: { color: C.danger, fontSize: 13, fontWeight: '700' },

  seg: { flexDirection: 'row', backgroundColor: C.seg, borderRadius: 14, padding: 4 },
  segBtn: { flex: 1, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  segText: { fontSize: 14, fontWeight: '700', color: C.muted },
  segTextOn: { color: C.ink },

  hero: { backgroundColor: C.hero, borderRadius: 24, padding: 22 },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' },
  heroAmount: { color: '#fff', fontSize: 44, fontWeight: '800', letterSpacing: -1.5, marginVertical: 2 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' },

  card: { ...cardStyle },
  label: { ...labelStyle },
  h2: { fontSize: 15, fontWeight: '800', color: C.ink, marginTop: 4 },
  hint: { color: C.faint, fontSize: 12 },

  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepOut: { width: 46, height: 46, borderRadius: 14, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  stepIn: { width: 46, height: 46, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 24, fontWeight: '700', lineHeight: 26 },
  countInput: { flex: 1, textAlign: 'center', fontSize: 28, fontWeight: '800', color: C.ink },

  moneyRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  moneyInput: { flex: 1, fontSize: 26, fontWeight: '800', color: C.ink, padding: 0 },
  pctInput: { flex: 1, fontSize: 22, fontWeight: '800', color: C.ink, padding: 0 },
  unit: { fontSize: 16, fontWeight: '700', color: C.muted },

  addRow: { flexDirection: 'row', gap: 10 },
  input: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, height: 48, paddingHorizontal: 14, fontSize: 15, color: C.ink },
  addBtn: { backgroundColor: C.accent, borderRadius: 14, paddingHorizontal: 18, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  addSquare: { backgroundColor: C.accent, borderRadius: 14, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  addSquareText: { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 26 },

  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingVertical: 5, paddingLeft: 5, paddingRight: 14 },
  personText: { fontSize: 14, fontWeight: '700', color: C.ink },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800' },

  itemHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  itemName: { flex: 1, fontSize: 16, fontWeight: '800', color: C.ink },
  itemPrice: { fontSize: 15, fontWeight: '700', color: C.muted },
  del: { color: C.danger, fontWeight: '600', fontSize: 13 },
  chip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, backgroundColor: C.chipOff },
  chipOn: { backgroundColor: C.accent },
  chipText: { color: C.muted, fontSize: 13, fontWeight: '700' },

  twoCol: { flexDirection: 'row', gap: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  toggleText: { fontSize: 15, fontWeight: '600', color: C.ink, flex: 1 },

  resRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderColor: '#F0EEE6' },
  resName: { flex: 1, fontSize: 16, fontWeight: '700', color: C.ink },
  resAmt: { fontSize: 17, fontWeight: '800', color: C.ink },
  qrBtn: { backgroundColor: C.soft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  qrText: { color: C.accentText, fontWeight: '800', fontSize: 13 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: C.muted },
  totalAmt: { fontSize: 18, fontWeight: '800', color: C.ink },

  cta: { backgroundColor: C.accent, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
