# AGENT_BRAIN - Chia Hoá Đơn (`share-bill`)

## 1. Overview
- **Project**: `chia-hoa-don` (v1.1.0 in `package.json`, v1.0.0 in `app.json`)
- **Stack**: React Native (`0.86.3`), Expo (`^57.0.0`), React (`19.2.3`), `AsyncStorage`, `react-native-qrcode-svg`, `react-native-view-shot`, `expo-sharing`, `react-native-safe-area-context`.
- **Purpose**: Split bills (by item or equally), apply VAT/tip/rounding, and generate offline VietQR payment cards as shareable PNG images.

## 2. Entry & Navigation
- `index.js`: Expo root entry (not read yet; standard Expo entry).
- `App.js`:
  - Loads persisted state via `loadData()` (`src/storage.js`) on mount, saves via `saveData(data)` on changes.
  - Manages two bottom tabs (`tab` state): `'split'` (`SplitScreen`) and `'accounts'` (`AccountsScreen`).
  - `INITIAL` state (lines 9-13): `people`, `items`, `mode` (`'items'` | `'equal'`), `total`, `equalCount`, `taxPct`, `tipPct`, `roundUp`, `accounts`, `defaultId`.

## 3. Routing / Screen Map
| Tab / Modal | Component | File | Purpose |
| :--- | :--- | :--- | :--- |
| `split` | `SplitScreen` | `src/screens/SplitScreen.js` | Manage people/items/total, tax/tip/rounding, view split results, open QR share modal |
| `accounts` | `AccountsScreen` | `src/screens/AccountsScreen.js` | Add, delete, and set default receiving bank accounts |
| Modal (from `SplitScreen`) | `ShareModal` | `src/components/ShareModal.js` | Select receiving account, preview `BillCard`, capture PNG & share |
| Modal (from `AccountsScreen`) | `BankPicker` | `src/components/BankPicker.js` | Pick Vietnamese bank + BIN from `src/banks.js` |

## 4. Core Modules
- `src/split.js`:
  - `parseMoney(s)`: Strips non-digits and parses integer VND amount.
  - `fmt(n)`: Formats rounded number using `'vi-VN'` locale + `'đ'`.
  - `calcSplit({ people, items, mode, total, equalCount, taxPct, tipPct, roundUp })`: Computes per-person totals and `grand` total after tax/tip rate and optional 1,000đ ceiling rounding (`equal` mode divides by `equalCount`; `items` mode divides each item by `people` in `sharedBy`).
- `src/vietqr.js`:
  - `crc16(str)`, `removeAccents(s)`, `cleanNote(s)`, `buildVietQR({ bin, account, amount, note })`: Offline EMVCo/NAPAS 247 VietQR payload builder.
- `src/storage.js`:
  - `loadData()`, `saveData(data)` using AsyncStorage key `'chia-hoa-don:v2'`, plus `uid()`.
- `src/components/BillCard.js`:
  - Forward-ref card rendered for `captureRef` PNG export containing QR code, amount, bank, holder, account number, and transfer note.

