import {IBond} from './IBond';

export interface IAmortization {
    id: number;
    bond: IBond;
    date: Date;
    value: number;
}
