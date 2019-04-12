import {Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';

const CurrencyEntity = types
    .model('CurrencyEntity', {
        code: types.identifier,
        sign: types.maybe(types.string),
    });

export type ICurrencyEntity = Instance<typeof CurrencyEntity>;
export type ICurrencyEntitySnapshotIn = SnapshotIn<typeof CurrencyEntity>;
export type ICurrencyEntitySnapshotOut = SnapshotOut<typeof CurrencyEntity>;

export default CurrencyEntity;
