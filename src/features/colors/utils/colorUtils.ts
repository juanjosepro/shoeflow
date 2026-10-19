export const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

// Texto negro o blanco, el que mejor se lea encima de ese color de fondo
export const readableOn = (hex: string) => {
  if (!HEX_REGEX.test(hex)) return "#000000";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Brillo percibido: el ojo es más sensible al verde que al azul
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#1f1f1f" : "#ffffff";
};

// Colores comunes del taller: al tocarlos llenan el nombre y el código
export const COLOR_PRESETS = [
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Negro", hex: "#000000" },
  { name: "Plomo", hex: "#A9A9A9" },
  { name: "Beige", hex: "#D2B48C" },
  { name: "Café", hex: "#8B4513" },
  { name: "Dorado", hex: "#DAA520" },
  { name: "Azul acero", hex: "#483D8B" },
  { name: "Rojo", hex: "#C0392B" },
];