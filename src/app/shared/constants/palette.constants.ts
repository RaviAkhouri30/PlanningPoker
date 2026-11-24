/** One avatar colour: a soft background and a dark text colour that passes WCAG AA on it. */
export interface IAvatarColour {
  readonly label: string;
  readonly background: string;
  readonly foreground: string;
}

/**
 * The six seat colours from the design (Join.dc.html). A participant stores the index, so the
 * palette can be retuned without touching data. Mirrored by the rules' colour range.
 */
/** The first swatch, and the fallback for an index out of range. */
export const DEFAULT_AVATAR_COLOUR: IAvatarColour = {
  label: 'Lilac',
  background: '#DCD8FF',
  foreground: '#2A1FA8',
};

export const AVATAR_PALETTE: readonly IAvatarColour[] = [
  DEFAULT_AVATAR_COLOUR,
  { label: 'Peach', background: '#FFE1D3', foreground: '#8A2E0B' },
  { label: 'Mint', background: '#D5F2E3', foreground: '#0B5A38' },
  { label: 'Butter', background: '#FFF0C2', foreground: '#6B4A00' },
  { label: 'Sky', background: '#D6E9FF', foreground: '#0B3D78' },
  { label: 'Rose', background: '#F6D9F0', foreground: '#7A1660' },
];
