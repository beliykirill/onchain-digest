const usd = (options: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...options });

const usdCompact = usd({ notation: 'compact', maximumFractionDigits: 2 });
const usdWhole = usd({ maximumFractionDigits: 0 });
const usdCents = usd({ minimumFractionDigits: 2, maximumFractionDigits: 2 });

const plain = (options: Intl.NumberFormatOptions) => new Intl.NumberFormat('en-US', options);

const tokenCompact = plain({ notation: 'compact', maximumFractionDigits: 2 });
const tokenWhole = plain({ maximumFractionDigits: 0 });
const tokenLarge = plain({ maximumFractionDigits: 2 });
const tokenMedium = plain({ maximumFractionDigits: 4 });
const tokenSmall = plain({ maximumSignificantDigits: 4 });

const percentFine = plain({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
const percentMedium = plain({ minimumFractionDigits: 1, maximumFractionDigits: 1 });
const percentCoarse = plain({ maximumFractionDigits: 0 });

interface ISignOptions {
  signed?: boolean;
}

const withSign = (value: number, body: string, signed: boolean) => {
  if (value < 0) return `\u2212${body}`;
  if (signed && value > 0) return `+${body}`;

  return body;
};

export const formatUsd = (value: number, { signed = false }: ISignOptions = {}): string => {
  const abs = Math.abs(value);

  if (!Number.isFinite(value) || abs === 0) return '$0.00';
  if (abs < 0.01) return withSign(value, '<$0.01', signed);
  if (abs < 1000) return withSign(value, usdCents.format(abs), signed);
  if (abs < 1_000_000) return withSign(value, usdWhole.format(abs), signed);

  return withSign(value, usdCompact.format(abs), signed);
};

export const formatPercent = (value: number, { signed = true }: ISignOptions = {}): string => {
  const abs = Math.abs(value);

  if (!Number.isFinite(value) || abs === 0) return '0%';
  if (abs < 0.01) return withSign(value, '<0.01%', signed);
  if (abs < 1) return withSign(value, `${percentFine.format(abs)}%`, signed);
  if (abs < 100) return withSign(value, `${percentMedium.format(abs)}%`, signed);

  return withSign(value, `${percentCoarse.format(abs)}%`, signed);
};

export const formatTokenAmount = (value: number): string => {
  const abs = Math.abs(value);

  if (!Number.isFinite(value) || abs === 0) return '0';
  if (abs < 0.0001) return withSign(value, '<0.0001', false);
  if (abs < 1) return withSign(value, tokenSmall.format(abs), false);
  if (abs < 10) return withSign(value, tokenMedium.format(abs), false);
  if (abs < 100_000) return withSign(value, tokenLarge.format(abs), false);
  if (abs < 1_000_000) return withSign(value, tokenWhole.format(abs), false);
  if (abs < 1e15) return withSign(value, tokenCompact.format(abs), false);

  return withSign(value, abs.toExponential(1).replace('+', ''), false);
};
