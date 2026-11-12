import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import BillCard from './BillCard';
import { C } from '../theme';

export default function ShareModal({ visible, onClose, accounts, defaultId, title, amount, note, onGoAccounts }) {
  const ref = useRef(null);
  const [accId, setAccId] = useState(defaultId);

  useEffect(() => { if (visible) setAccId(defaultId || accounts[0]?.id); }, [visible, defaultId, accounts]);

  const account = accounts.find((a) => a.id === accId) || accounts[0];

  const share = async () => {
    try {
      const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
      if (!(await Sharing.isAvailableAsync())) return Alert.alert('Không hỗ trợ chia sẻ trên thiết bị này');
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Chia sẻ hoá đơn' });
    } catch (e) {
      Alert.alert('Lỗi', String(e?.message || e));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.safe}>
        <View style={s.head}>
          <Text style={s.h1}>Chia sẻ hoá đơn</Text>
          <Pressable onPress={onClose}><Text style={s.close}>Đóng</Text></Pressable>
        </View>

        {!account ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>Chưa có tài khoản nhận tiền.</Text>
            <Pressable style={s.btn} onPress={onGoAccounts}><Text style={s.btnText}>Thêm tài khoản</Text></Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.body}>
            {accounts.length > 1 && (
              <View style={s.chips}>
                {accounts.map((a) => (
                  <Pressable key={a.id} onPress={() => setAccId(a.id)} style={[s.chip, a.id === account.id && s.chipOn]}>
                    <Text style={[s.chipText, a.id === account.id && { color: '#fff' }]}>
                      {a.bankName} · {a.number.slice(-4)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            <View style={s.shadow}>
              <BillCard ref={ref} account={account} amount={amount} title={title} note={note} />
            </View>
            <Pressable style={[s.btn, { marginTop: 20, alignSelf: 'stretch' }]} onPress={share}>
              <Text style={s.btnText}>Chia sẻ ảnh</Text>
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  h1: { fontSize: 22, fontWeight: '800', color: C.ink },
  close: { color: C.accent, fontWeight: '700', fontSize: 15 },
  body: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 48 },
  empty: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyText: { color: C.muted },
  shadow: { borderRadius: 28, overflow: 'hidden', elevation: 6, shadowColor: C.hero, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  btn: { backgroundColor: C.accent, height: 56, paddingHorizontal: 24, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' },
  chip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, backgroundColor: C.chipOff },
  chipOn: { backgroundColor: C.accent },
  chipText: { fontWeight: '700', fontSize: 13, color: C.muted },
});
