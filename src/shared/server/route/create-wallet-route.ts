import type { NextApiHandler } from 'next';
import { normalizeAddress } from 'shared/lib';
import type { Period } from 'shared/types';
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

      const data = await load(address, period);

      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json(data);
    } catch (error) {
      const appError = toAppError(error);

      if (appError.status >= 500 || appError.detail) {
        console.error(
          `[api/${route}] ${appError.code}: ${appError.detail ?? appError.message}`,
          ...(appError.cause ? [appError.cause] : []),
        );
      }
      if (appError.retryAfterSeconds != null) {
        res.setHeader('Retry-After', String(Math.ceil(appError.retryAfterSeconds)));
      }

      res.status(appError.status).json(appError.toBody());
    }
  };
