import {Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';
import BondEntity from './BondEntity';

const AmortizationEntity = types
    .model('AmortizationEntity', {
        id: types.identifierNumber,
        bond: types.safeReference(types.late(() => BondEntity)),
        date: types.Date,
        value: types.number,
    });

export type IAmortizationEntity = Instance<typeof AmortizationEntity>;
export type IAmortizationEntitySnapshotIn = SnapshotIn<typeof AmortizationEntity>;
export type IAmortizationEntitySnapshotOut = SnapshotOut<typeof AmortizationEntity>;

export default AmortizationEntity;
