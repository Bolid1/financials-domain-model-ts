import {IAmortization} from './IAmortization';
import {ICoupon} from './ICoupon';
import {ICurrency} from './ICurrency';
import {IIssuer} from './IIssuer';

export interface IBond {
    ISIN: number;
    issuer: IIssuer;
    currency: ICurrency;
    name: string;
    offerEnd?: Date;
    maturity: Date;
    faceValue: number;
    quantity: number;
    amortizations: IAmortization[];
    coupons: ICoupon[];
}
