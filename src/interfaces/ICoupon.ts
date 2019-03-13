import {IBond} from './IBond';

export interface ICoupon {
    id: number;
    bond: IBond;
    date: Date;
    value: number;
}
