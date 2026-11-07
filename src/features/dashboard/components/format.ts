// Docenas: hasta 1 decimal (2.5). Dinero: S/ con miles.
export const fmtDozens = (value: number) =>
  new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 }).format(value);

export const fmtMoney = (value: number) =>
  `S/ ${new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;

export const fmtMoneyShort = (value: number) =>
  value >= 1000 ? `S/ ${fmtDozens(value / 1000)}k` : `S/ ${Math.round(value)}`;
