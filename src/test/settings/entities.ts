import {
    BondModel,
    BondsList,
    CurrenciesList,
    CurrencyModel,
    IssuerModel,
    IssuersList,
} from 'bolid1-financials-api-client-ts';
import {JSONParser} from 'hal-rest-client';
import bond from '../samples/bond';
import bonds from '../samples/bonds';
import currencies from '../samples/currencies';
import currency from '../samples/currency';
import issuer from '../samples/issuer';
import issuers from '../samples/issuers';
import {makeList} from '../utils/makeLists';

export default {
    bond: {
        fetch: {
            mockAction: 'fetchBonds',
            makeItem: (jsonParser: JSONParser) => makeList(jsonParser, BondsList, {basePath: '/bonds'}),
            args: [],

            basePath: '/bonds',
            data: bonds,
            model: BondsList,
        },
        find: {
            mockAction: 'fetchBond',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(bond, BondModel),
            args: [bond.ISIN],

            data: bond,
            id: bond.ISIN,
            identifier: 'ISIN',
            model: BondModel,
        },
        create: {
            mockAction: 'createBond',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(bond, BondModel),
            args: [bond],

            data: bond,
            id: bond.ISIN,
            model: BondModel,
        },
        update: {
            mockAction: 'updateBond',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(bond, BondModel),
            args: [bond],

            data: bond,
            id: bond.ISIN,
            model: BondModel,
        },
    },
    currency: {
        fetch: {
            mockAction: 'fetchCurrencies',
            makeItem: (jsonParser: JSONParser) => makeList(jsonParser, CurrenciesList, {basePath: '/currencies'}),
            args: [],

            basePath: '/currencies',
            data: currencies,
            model: CurrenciesList,
        },
        find: {
            mockAction: 'fetchCurrency',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(currency, CurrencyModel),
            args: [currency.code],

            data: currency,
            id: currency.code,
            identifier: 'code',
            model: CurrencyModel,
        },
        create: {
            mockAction: 'createCurrency',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(currency, CurrencyModel),
            args: [currency],

            data: currency,
            id: currency.code,
            model: CurrencyModel,
        },
        update: {
            mockAction: 'updateCurrency',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(currency, CurrencyModel),
            args: [currency],

            data: currency,
            id: currency.code,
            model: CurrencyModel,
        },
    },
    issuer: {
        fetch: {
            mockAction: 'fetchIssuers',
            makeItem: (jsonParser: JSONParser) => makeList(jsonParser, IssuersList, {basePath: '/issuers'}),
            args: [],

            basePath: '/issuers',
            data: issuers,
            model: IssuersList,
        },
        find: {
            mockAction: 'fetchIssuer',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(issuer, IssuerModel),
            args: [issuer.id],

            data: issuer,
            id: issuer.id,
            identifier: 'id',
            model: IssuerModel,
        },
        save: {
            mockAction: 'saveIssuer',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(issuer, IssuerModel),
            args: [issuer],

            data: issuer,
            id: issuer.id,
            model: IssuerModel,
        },
    },
};
