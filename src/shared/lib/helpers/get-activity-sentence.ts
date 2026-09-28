import type { IActivityItem, IApproval, ITransfer, Nullable } from 'shared/types';
import { shortenAddress } from './address';
import { formatTokenAmount } from './format-number';

const describeTransfer = ({ asset, nftName, amount }: ITransfer) => {
  if (nftName) return nftName;

  return `${formatTokenAmount(amount)} ${asset?.symbol ?? 'tokens'}`;
};

const describeTransfers = (transfers: ITransfer[]) => {
  const [first, second] = transfers;

  if (!first) return null;
  if (transfers.length === 1) return describeTransfer(first);
  if (transfers.length === 2 && second) {
    return `${describeTransfer(first)} + ${describeTransfer(second)}`;
  }

  return `${describeTransfer(first)} + ${transfers.length - 1} more`;
};

const describeApproval = ({ asset, amount, isUnlimited }: IApproval) => {
  const symbol = asset?.symbol ?? 'tokens';

  if (isUnlimited) return `unlimited ${symbol}`;

  return amount > 0 ? `${formatTokenAmount(amount)} ${symbol}` : symbol;
};

const counterparty = (address: Nullable<string>) => (address ? shortenAddress(address) : null);

const isBridge = (dappName: Nullable<string>) =>
  dappName != null &&
  /bridge|across|stargate|hop protocol|wormhole|layerzero|relay|orbiter|synapse|celer|socket/i.test(
    dappName,
  );

export const getActivitySentence = (item: IActivityItem): string => {
  const { type, transfers, approvals, dapp, chain } = item;
  const outgoing = describeTransfers(transfers.filter(({ direction }) => direction === 'out'));
  const incoming = describeTransfers(transfers.filter(({ direction }) => direction === 'in'));
  const dappName = dapp?.name ?? null;
  const onDapp = dappName ? ` on ${dappName}` : '';

  if (isBridge(dappName) && (type === 'send' || type === 'execute' || type === 'trade')) {
    return outgoing ? `Bridged ${outgoing} via ${dappName}` : `Bridged assets via ${dappName}`;
  }

  switch (type) {
    case 'trade':
      if (outgoing && incoming) return `Swapped ${outgoing} → ${incoming}${onDapp}`;

      return `Swapped ${outgoing ?? incoming ?? 'tokens'}${onDapp}`;
    case 'send': {
      const to = counterparty(
        transfers.find(({ direction }) => direction === 'out')?.recipient ?? item.sentTo,
      );

      return `Sent ${outgoing ?? 'tokens'}${to ? ` to ${to}` : ''}`;
    }
    case 'receive': {
      const from = counterparty(
        transfers.find(({ direction }) => direction === 'in')?.sender ?? item.sentFrom,
      );

      return `Received ${incoming ?? 'tokens'}${from ? ` from ${from}` : ''}`;
    }
    case 'deposit':
      return `Deposited ${outgoing ?? 'assets'} into ${dappName ?? 'a protocol'}`;
    case 'withdraw':
      return `Withdrew ${incoming ?? 'assets'} from ${dappName ?? 'a protocol'}`;
    case 'claim':
      return `Claimed ${incoming ?? 'rewards'}${dappName ? ` from ${dappName}` : ''}`;
    case 'approve': {
      const spender = dappName ?? counterparty(item.sentTo);
      const approval = approvals[0];

      return `Approved ${approval ? describeApproval(approval) : 'tokens'}${spender ? ` for ${spender}` : ''}`;
    }
    case 'revoke': {
      const spender = dappName ?? counterparty(item.sentTo);

      return `Revoked ${approvals[0]?.asset?.symbol ?? 'a token'} approval${spender ? ` for ${spender}` : ''}`;
    }
    case 'mint':
      return `Minted ${incoming ?? 'tokens'}${onDapp}`;
    case 'burn':
      return `Burned ${outgoing ?? 'tokens'}${onDapp}`;
    case 'bid':
      return `Placed a bid${onDapp}`;
    case 'delegate':
      return `Delegated votes${onDapp}`;
    case 'revoke_delegation':
      return `Revoked a delegation${onDapp}`;
    case 'deploy':
      return `Deployed a contract on ${chain.name}`;
    case 'execute':
      return dappName ? `Interacted with ${dappName}` : `Contract interaction on ${chain.name}`;
    default:
      return `Transaction on ${chain.name}`;
  }
};
