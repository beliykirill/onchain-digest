import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getServerEnv } from '../env';
import { AppError } from '../errors';
import { sleep } from '../zerion/throttle';
import type { ZerionTransport } from '../zerion/transport';

const FIXTURE_WALLETS = ['up', 'down', 'active', 'quiet'] as const;
type FixtureWallet = (typeof FIXTURE_WALLETS)[number];

interface IFixtureMeta {
  address: string;
  capturedAt: number;
}

interface IRawChart {
  data: { attributes: { begin_at?: string; end_at?: string; points: [number, number][] } };
}

interface IRawList {
  data: { attributes: { mined_at: string } }[];
}

const DATA_DIR = path.join(process.cwd(), 'src/shared/server/fixtures/data');
const files = new Map<string, Promise<unknown>>();

const readJson = <T>(relativePath: string): Promise<T> => {
  if (!files.has(relativePath)) {
    const content = readFile(path.join(DATA_DIR, relativePath), 'utf8').then(
      (text) => JSON.parse(text) as unknown,
    );

    content.catch(() => files.delete(relativePath));
    files.set(relativePath, content);
  }

  return files.get(relativePath)!.then((value) => structuredClone(value) as T);
};

const readMeta = (wallet: FixtureWallet) => readJson<IFixtureMeta>(`${wallet}/meta.json`);

const pickWallet = async (address: string): Promise<FixtureWallet> => {
  const metas = await Promise.all(FIXTURE_WALLETS.map(readMeta));
  const index = metas.findIndex((meta) => meta.address.toLowerCase() === address.toLowerCase());

  if (index >= 0) return FIXTURE_WALLETS[index]!;

  const hash = [...address].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);

  return FIXTURE_WALLETS[hash % FIXTURE_WALLETS.length]!;
};

const shiftIso = (value: string | undefined, shiftMs: number) =>
  value ? new Date(Date.parse(value) + shiftMs).toISOString() : value;

const rebaseChart = (chart: IRawChart, shiftMs: number): IRawChart => {
  const { attributes } = chart.data;

  attributes.begin_at = shiftIso(attributes.begin_at, shiftMs);
  attributes.end_at = shiftIso(attributes.end_at, shiftMs);
  attributes.points = attributes.points.map(([seconds, value]) => [
    seconds + Math.round(shiftMs / 1000),
    value,
  ]);

  return chart;
};

const rebaseTransactions = (list: IRawList, shiftMs: number, minMinedAt: number): IRawList => {
  list.data = list.data
    .map((item) => {
      item.attributes.mined_at = shiftIso(item.attributes.mined_at, shiftMs)!;

      return item;
    })
    .filter((item) => Date.parse(item.attributes.mined_at) >= minMinedAt);

  return list;
};

const findFungibleChart = async (fungibleId: string): Promise<IRawChart> => {
  for (const wallet of FIXTURE_WALLETS) {
    try {
      const [chart, meta] = await Promise.all([
        readJson<IRawChart>(`${wallet}/fungible-week-${fungibleId}.json`),
        readMeta(wallet),
      ]);

      return rebaseChart(chart, Date.now() - meta.capturedAt);
    } catch {
      continue;
    }
  }

  throw new AppError('UPSTREAM_ERROR', { message: `No fixture for fungible ${fungibleId}.` });
};

export const mockTransport: ZerionTransport = async ({ path: requestPath, params = {} }) => {
  const { mockLatencyMs } = getServerEnv();

  await sleep(mockLatencyMs * (0.6 + Math.random() * 0.8));

  if (requestPath === '/chains/') return readJson('chains.json');

  const fungible = requestPath.match(/^\/fungibles\/([^/]+)\/charts\/week$/);

  if (fungible) return findFungibleChart(decodeURIComponent(fungible[1]!));

  const wallet = requestPath.match(/^\/wallets\/([^/]+)\/(.+)$/);

  if (!wallet) throw new AppError('UPSTREAM_ERROR', { message: `No fixture for ${requestPath}.` });

  const name = await pickWallet(wallet[1]!);
  const shiftMs = Date.now() - (await readMeta(name)).capturedAt;

  switch (wallet[2]) {
    case 'portfolio':
      return readJson(`${name}/portfolio.json`);
    case 'positions/':
      return readJson(`${name}/positions.json`);
    case 'charts/day':
      return rebaseChart(await readJson<IRawChart>(`${name}/chart-day.json`), shiftMs);
    case 'charts/week':
      return rebaseChart(await readJson<IRawChart>(`${name}/chart-week.json`), shiftMs);
    case 'transactions/':
      return rebaseTransactions(
        await readJson<IRawList>(`${name}/transactions.json`),
        shiftMs,
        Number(params['filter[min_mined_at]'] ?? 0),
      );
    default:
      throw new AppError('UPSTREAM_ERROR', { message: `No fixture for ${requestPath}.` });
  }
};
