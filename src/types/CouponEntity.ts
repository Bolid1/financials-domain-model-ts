import {Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';
import BondEntity from './BondEntity';

const CouponEntity = types
    .model('CouponEntity', {
        id: types.identifierNumber,
        bond: types.safeReference(types.late(() => BondEntity)),
        date: types.Date,
        value: types.number,
    });

export type ICouponEntity = Instance<typeof CouponEntity>;
export type ICouponEntitySnapshotIn = SnapshotIn<typeof CouponEntity>;
export type ICouponEntitySnapshotOut = SnapshotOut<typeof CouponEntity>;

export default CouponEntity;
