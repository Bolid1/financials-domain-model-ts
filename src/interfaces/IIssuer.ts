import {IBond} from './IBond';

export interface IIssuer {
    id: number;
    name: string;
    type: number;
    bonds: IBond[];
}
