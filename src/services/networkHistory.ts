import { NetworkHistory } from 'ergo-dex-sdk-custom';

import { ordersParser, poolsInfoParser } from './amm';
import { explorer } from './explorer';

const networkHistory = new NetworkHistory(
  explorer,
  ordersParser,
  poolsInfoParser,
);

export default networkHistory;
