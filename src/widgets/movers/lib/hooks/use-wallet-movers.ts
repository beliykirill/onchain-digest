import { useQuery } from '@tanstack/react-query';
import { walletAPI } from 'shared/lib/api';
import { useWalletParams } from 'shared/lib/hooks';

export const useWalletMovers = () => {
  const { address, period } = useWalletParams();

  return useQuery({
    queryKey: ['wallet', address, 'movers', period],
    queryFn: ({ signal }) => walletAPI.getMovers({ address: address ?? '' }, { period }, signal),
    enabled: Boolean(address),
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === address ? previous : undefined,
  });
};
