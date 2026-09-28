import { formatUsd } from 'shared/lib';

export const formatAbsUsd = (value: number) => formatUsd(Math.abs(value));
