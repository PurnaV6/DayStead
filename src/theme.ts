export const colors = {
  ink: '#102A43',
  muted: '#5B7088',
  bg: '#F6F8FB',
  panel: '#FFFFFF',
  line: '#E1E8F0',
  accent: '#1E6FD9',
  accentTint: '#EAF3FF',
  accentLine: '#CFE3FB',
  ok: '#17803D',
  watch: '#9A5B00',
  risk: '#C0352B',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 32,
};

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.ink },
  subtitle: { fontSize: 15, color: colors.muted },
  hero: { fontSize: 36, fontWeight: '800' as const, color: colors.ink },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: colors.ink },
  body: { fontSize: 15, color: colors.ink },
  label: { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 13, color: colors.muted },
};
