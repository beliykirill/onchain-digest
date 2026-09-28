import { createWalletRoute } from 'shared/server/route';
import { getWalletActivity } from 'shared/server/wallet';

export default createWalletRoute('activity', getWalletActivity);
