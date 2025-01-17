import { AugErgoTx } from '@ergolabs/ergo-sdk';
import { AmmDexOperation } from 'ergo-dex-sdk-custom';
import { map, Observable, of } from 'rxjs';

import networkHistory from '../../../../../services/networkHistory';
import { getAddresses } from '../../addresses/addresses';

export const toDexOperation = (
  tx: AugErgoTx | undefined,
): Observable<AmmDexOperation | undefined> => {
  if (!tx) {
    return of(undefined);
  }

  return getAddresses().pipe(
    map((addresses) => networkHistory['parseOp'](tx, true, addresses)),
  );
};
