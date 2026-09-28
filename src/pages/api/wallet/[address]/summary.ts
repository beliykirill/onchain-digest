import { createWalletRoute } from 'shared/server/route';
import { getWalletSummary } from 'shared/server/wallet';

export default createWalletRoute('summary', getWalletSummary);
