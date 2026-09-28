import { createWalletRoute } from 'shared/server/route';
import { getWalletChart } from 'shared/server/wallet';

export default createWalletRoute('chart', getWalletChart);
