// Matches the web dashboard's design tokens (web/src/index.css) so the two
// platforms read as one product, not two different apps.
export const colors = {
  ink: '#1f2a22',
  muted: '#6b7566',
  bg: '#f4f5ee',
  panel: '#FFFFFF',
  line: '#e3e4d8',
  accent: '#2f4a3c',
  accentTint: '#e7ede4',
  accentLine: '#cdd9c9',
  ok: '#2f6b3e',
  watch: '#9a7a2b',
  risk: '#a8402f',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 32,
};

export const radius = {
  card: 20,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#1f2a22',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
};

export const typography = {
  title: { fontSize: 26, fontWeight: '800' as const, color: colors.ink },
  subtitle: { fontSize: 15, color: colors.muted },
  hero: { fontSize: 34, fontWeight: '800' as const, color: colors.ink },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: colors.ink },
  body: { fontSize: 15, color: colors.ink },
  label: { fontSize: 13, fontWeight: '600' as const },
  eyebrow: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1, color: colors.muted },
  caption: { fontSize: 13, color: colors.muted },
};
