import type { NextApiHandler } from 'next';
import { normalizeAddress } from 'shared/lib';
import { API_ERROR_CODES, type ApiErrorCode, type Period } from 'shared/types';
import { getServerEnv } from '../env';
import { AppError, toAppError } from '../errors';

export type WalletRouteName = 'summary' | 'movers' | 'chart' | 'activity';

const PERIOD_ALIASES: Record<string, Period> = { '1d': '1d', day: '1d', '7d': '7d', week: '7d' };

const readQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const parsePeriod = (value: string | undefined): Period => {
  if (value == null || value === '') return '1d';

  const period = PERIOD_ALIASES[value];

  if (!period) throw new AppError('INVALID_PARAMS', { message: 'period must be 1d or 7d.' });

  return period;
};

const throwMockFailure = (route: WalletRouteName) => {
  const { useMocks, mockFail } = getServerEnv();

  if (!useMocks || !mockFail) return;

  const rule = mockFail
    .split(',')
    .map((entry) => entry.trim().split(':'))
    .find(([name]) => name === route || name === '*');
  const code = rule?.[1] as ApiErrorCode | undefined;

  if (code && API_ERROR_CODES.includes(code)) {
    throw new AppError(code, { retryAfterSeconds: code === 'RATE_LIMITED' ? 3 : undefined });
  }
};

export const createWalletRoute =
  <T>(
    route: WalletRouteName,
    load: (address: string, period: Period) => Promise<T>,
  ): NextApiHandler =>
  async (req, res) => {
    try {
      if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        throw new AppError('METHOD_NOT_ALLOWED');
      }

      const address = normalizeAddress(readQueryValue(req.query.address) ?? '');

      if (!address) throw new AppError('INVALID_ADDRESS');

      const period = parsePeriod(readQueryValue(req.query.period));

      throwMockFailure(route);

      const data = await load(address, period);

      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json(data);
    } catch (error) {
      const appError = toAppError(error);

      if (appError.code === 'INTERNAL') console.error(`[api/${route}]`, error);
      if (appError.retryAfterSeconds != null) {
        res.setHeader('Retry-After', String(Math.ceil(appError.retryAfterSeconds)));
      }

      res.status(appError.status).json(appError.toBody());
    }
  };
