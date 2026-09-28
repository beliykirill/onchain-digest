import { createWalletRoute } from 'shared/server/route';
import { getWalletMovers } from 'shared/server/wallet';

export default createWalletRoute('movers', getWalletMovers);
