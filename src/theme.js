// Design tokens: nền kem ấm, chữ xanh đen, nhấn xanh ngọc.
export const C = {
  bg: '#F5F4EF',
  card: '#FFFFFF',
  ink: '#16211D',
  muted: '#5F6B66',
  faint: '#9AA39E',
  line: '#E6E3D9',
  accent: '#0E8F6E',
  accentText: '#0B6B52',
  soft: '#E3F3EC',
  hero: '#0F3D31',
  chipOff: '#EEECE4',
  seg: '#E8E6DE',
  danger: '#B3361B',
  dangerBg: '#FBE9E4',
};

export const AVATARS = ['#0E8F6E', '#D9822B', '#4B6BDB', '#B5467A', '#7A5AC8', '#2A8CA8'];
export const avatarColor = (i) => AVATARS[i % AVATARS.length];

export const cardStyle = {
  backgroundColor: C.card,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: C.line,
  padding: 16,
};

export const labelStyle = {
  fontSize: 12,
  fontWeight: '700',
  color: C.muted,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  marginBottom: 8,
};
