import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { calcSplit, fmt, parseMoney } from '../split';
import { uid } from '../storage';
import ShareModal from '../components/ShareModal';

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

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.headerRow}>
        <Text style={s.title}>Chia hoá đơn</Text>
        <Pressable onPress={reset}><Text style={s.danger}>Làm lại</Text></Pressable>
      </View>

      {/* Kiểu chia */}
      <View style={s.seg}>
        {[['items', 'Theo món'], ['equal', 'Chia đều']].map(([k, label]) => (
          <Pressable key={k} style={[s.segBtn, mode === k && s.segOn]} onPress={() => patch({ mode: k })}>
            <Text style={[s.segText, mode === k && { color: '#fff' }]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Người */}
      {mode === 'equal' ? (
        <>
          <Text style={s.h2}>1. Số lượng người</Text>
          <View style={[s.row, { alignItems: 'center' }]}>
            <Pressable
              style={[s.stepBtn, equalPeopleCount <= 0 && s.stepBtnDisabled]}
              disabled={equalPeopleCount <= 0}
              onPress={() => patch({ equalCount: equalPeopleCount > 1 ? String(equalPeopleCount - 1) : '' })}
            >
              <Text style={s.stepBtnText}>−</Text>
            </Pressable>
            <TextInput
              style={[s.input, s.countInput]}
              placeholder="VD: 4"
              keyboardType="number-pad"
              value={String(equalCount)}
              onChangeText={(v) => patch({ equalCount: v.replace(/\D/g, '') })}
            />
            <Pressable
              style={s.stepBtn}
              onPress={() => patch({ equalCount: String(equalPeopleCount + 1) })}
            >
              <Text style={s.stepBtnText}>+</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={s.h2}>1. Ai đi ăn?</Text>
          <View style={s.row}>
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Tên" value={personName}
              onChangeText={setPersonName} onSubmitEditing={addPerson} returnKeyType="done" />
            <Pressable style={s.btn} onPress={addPerson}><Text style={s.btnText}>Thêm</Text></Pressable>
          </View>
          <View style={s.chips}>
            {people.map((p) => (
              <Pressable key={p.id} style={s.chip} onLongPress={() => removePerson(p.id)}>
                <Text style={s.chipText}>{p.name}</Text>
              </Pressable>
            ))}
          </View>
          {people.length > 0 && <Text style={s.hint}>Giữ lâu tên để xoá người</Text>}
        </>
      )}

      {/* Nhập tiền */}
      {mode === 'equal' ? (
        <>
          <Text style={s.h2}>2. Tổng tiền hoá đơn</Text>
          <TextInput style={s.input} placeholder="VD: 850000" keyboardType="number-pad"
            value={total} onChangeText={(v) => patch({ total: v })} />
        </>
      ) : (
        <>
          <Text style={s.h2}>2. Các món</Text>
          <View style={s.row}>
            <TextInput style={[s.input, { flex: 2 }]} placeholder="Tên món" value={itemName} onChangeText={setItemName} />
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Giá" keyboardType="number-pad" value={itemPrice} onChangeText={setItemPrice} />
            <Pressable style={s.btn} onPress={addItem}><Text style={s.btnText}>+</Text></Pressable>
          </View>
          {items.map((it) => (
            <View key={it.id} style={s.card}>
              <View style={s.cardHead}>
                <Text style={s.itemName}>{it.name} · {fmt(it.price)}</Text>
                <Pressable onPress={() => patch({ items: items.filter((x) => x.id !== it.id) })}>
                  <Text style={s.danger}>Xoá</Text>
                </Pressable>
              </View>
              <View style={s.chips}>
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
      <Text style={s.h2}>3. Thuế, tip & làm tròn</Text>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>VAT (%)</Text>
          <TextInput style={s.input} keyboardType="numeric" value={taxPct} onChangeText={(v) => patch({ taxPct: v })} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Tip / phục vụ (%)</Text>
          <TextInput style={s.input} keyboardType="numeric" value={tipPct} onChangeText={(v) => patch({ tipPct: v })} />
        </View>
      </View>
      <View style={[s.row, { justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }]}>
        <Text>Làm tròn lên 1.000đ mỗi người</Text>
        <Switch value={roundUp} onValueChange={(v) => patch({ roundUp: v })} />
      </View>

      {/* Kết quả */}
      <Text style={s.h2}>Kết quả</Text>
      <View style={s.card}>
        {mode === 'equal' ? (
          equalPeopleCount === 0 ? (
            <Text style={s.hint}>Chưa nhập số người.</Text>
          ) : (
            <View style={s.resRow}>
              <Text style={s.resName}>Mỗi người ({equalPeopleCount} người)</Text>
              <Text style={s.resAmt}>{fmt(equalAmount)}</Text>
            </View>
          )
        ) : (
          <>
            {people.length === 0 && <Text style={s.hint}>Chưa có ai.</Text>}
            {people.map((p) => (
              <View key={p.id} style={s.resRow}>
                <Text style={s.resName}>{p.name}</Text>
                <View style={s.resRight}>
                  <Text style={s.resAmt}>{fmt(result.totals[p.id])}</Text>
                  <Pressable style={s.qrBtn} disabled={!result.totals[p.id]}
                    onPress={() => setShare({ title: p.name, amount: result.totals[p.id], note: `Chia hoa don ${p.name}` })}>
                    <Text style={s.qrText}>QR</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}
        <View style={[s.resRow, s.totalRow]}>
          <Text style={s.resName}>Tổng thu</Text>
          <Text style={s.resAmt}>{fmt(result.grand)}</Text>
        </View>
      </View>

      {mode === 'equal' && (
        <Pressable style={[s.btn, s.bigBtn, !equalAmount && { opacity: 0.4 }]} disabled={!equalAmount}
          onPress={() => setShare({ title: `Mỗi người (${equalPeopleCount} người)`, amount: equalAmount, note: 'Chia hoa don' })}>
          <Text style={s.btnText}>Chia sẻ hoá đơn · {fmt(equalAmount)}/người</Text>
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
  container: { padding: 16, paddingBottom: 48 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800' },
  danger: { color: '#d33', fontWeight: '600' },
  seg: { flexDirection: 'row', backgroundColor: '#e8eaee', borderRadius: 10, padding: 3, marginTop: 14 },
  segBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  segOn: { backgroundColor: '#2563eb' },
  segText: { fontWeight: '700', color: '#333' },
  h2: { fontSize: 16, fontWeight: '700', marginTop: 22, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e1e4e8', fontSize: 15 },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  btn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 13, borderRadius: 10 },
  bigBtn: { marginTop: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  stepBtn: { backgroundColor: '#2563eb', width: 46, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepBtnDisabled: { opacity: 0.35 },
  stepBtnText: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 22 },
  countInput: { flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#e8eaee' },
  chipOn: { backgroundColor: '#2563eb' },
  chipText: { color: '#333', fontWeight: '500' },
  hint: { color: '#888', fontSize: 12, marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#e1e4e8' },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontWeight: '600', flex: 1 },
  resRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  resRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  totalRow: { borderTopWidth: 1, borderColor: '#e1e4e8', marginTop: 6, paddingTop: 10 },
  resName: { fontSize: 16 },
  resAmt: { fontSize: 16, fontWeight: '700' },
  qrBtn: { backgroundColor: '#e8f0fe', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  qrText: { color: '#2563eb', fontWeight: '800' },
});
