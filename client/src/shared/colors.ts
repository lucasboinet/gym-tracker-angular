export function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return { r, g, b };
}

export function rgbToHex(r: number, g: number, b: number) {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getLuminance(color: string) {
  const { r, g, b } = hexToRgb(color);

  const [rs, gs, bs] = [r, g, b].map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function lightenColor(color: string, percent = 20) {
  const { r, g, b } = hexToRgb(color);
  const amount = percent / 100;

  const nr = r + (255 - r) * amount;
  const ng = g + (255 - g) * amount;
  const nb = b + (255 - b) * amount;

  return rgbToHex(nr, ng, nb);
}

export function darkenColor(color: string, percent = 20) {
  const { r, g, b } = hexToRgb(color);
  const amount = percent / 100;

  const nr = r * (1 - amount);
  const ng = g * (1 - amount);
  const nb = b * (1 - amount);

  return rgbToHex(nr, ng, nb);
}

export function getContrastColor(color: string, percent = 40) {
  const luminance = getLuminance(color);

  if (luminance < 0.5) {
    return lightenColor(color, percent);
  } else {
    return darkenColor(color, percent);
  }
}
