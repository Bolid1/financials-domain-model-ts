import {Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';
import AmortizationEntity from './AmortizationEntity';
import CouponEntity from './CouponEntity';
import CurrencyEntity from './CurrencyEntity';
import IssuerEntity from './IssuerEntity';

const BondEntity = types
    .model('BondEntity', {
        ISIN: types.identifier,
        issuer: types.safeReference(IssuerEntity),
        currency: types.safeReference(CurrencyEntity),
        name: types.string,
            offerEnd: types.maybeNull(types.Date),
        maturity: types.Date,
        faceValue: types.number,
        quantity: types.number,
        amortizations: types.array(types.late(() => AmortizationEntity)),
        coupons: types.array(types.late(() => CouponEntity)),
    });

export type IBondEntity = Instance<typeof BondEntity>;
export type IBondEntitySnapshotIn = SnapshotIn<typeof BondEntity>;
export type IBondEntitySnapshotOut = SnapshotOut<typeof BondEntity>;

export default BondEntity;
