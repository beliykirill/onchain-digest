const readNumber = (name: string, fallback: number): number => {
  const raw = process.env[name];

  if (raw == null || raw.trim() === '') return fallback;

  const value = Number(raw);

  return Number.isFinite(value) && value >= 0 ? value : fallback;
};

export interface IServerEnv {
  zerionApiKey: string | undefined;
  useMocks: boolean;
  cacheTtlMs: number;
  requestsPerSecond: number;
  requestTimeoutMs: number;
  mockLatencyMs: number;
  mockFail: string;
}

export const getServerEnv = (): IServerEnv => ({
  zerionApiKey: process.env.ZERION_API_KEY?.trim() || undefined,
  useMocks: process.env.USE_MOCKS === 'true',
  cacheTtlMs: readNumber('ZERION_CACHE_TTL_SECONDS', 300) * 1000,
  requestsPerSecond: Math.max(readNumber('ZERION_RPS', 1), 0.1),
  requestTimeoutMs: readNumber('ZERION_TIMEOUT_MS', 20_000),
  mockLatencyMs: readNumber('MOCK_LATENCY_MS', 500),
  mockFail: process.env.MOCK_FAIL ?? '',
});
