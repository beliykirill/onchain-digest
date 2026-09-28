import { useRouter } from 'next/router';
import { PERIODS, type Period } from 'shared/types';
import { normalizeAddress } from '../helpers';

const readParam = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? '';

export const useWalletParams = () => {
  const router = useRouter();
  const rawAddress = readParam(router.query.address);
  const rawPeriod = readParam(router.query.period);
  const period: Period = (PERIODS as readonly string[]).includes(rawPeriod)
    ? (rawPeriod as Period)
    : '1d';

  const setPeriod = (next: Period) => {
    void router.replace(
      { pathname: router.pathname, query: { ...router.query, period: next } },
      undefined,
      { shallow: true, scroll: false },
    );
  };

  const setAddress = (next: string) => {
    void router.push(
      { pathname: router.pathname, query: { address: next, ...(period !== '1d' && { period }) } },
      undefined,
      { shallow: true, scroll: false },
    );
  };

  return {
    rawAddress,
    address: normalizeAddress(rawAddress),
    period,
    setPeriod,
    setAddress,
  };
};
