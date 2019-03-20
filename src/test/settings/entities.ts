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
import currency from '../samples/currency';
import issuer from '../samples/issuer';
import {makeList} from '../utils/makeLists';

export default {
    issuer: {
        fetch: {
            mockAction: 'fetchIssuers',
            makeItem: (jsonParser: JSONParser) => makeList(jsonParser, IssuersList, {basePath: '/issuers'}),
            args: [],
        },
        find: {
            mockAction: 'fetchIssuer',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(issuer, IssuerModel),
            args: [issuer.id],
        },
        save: {
            mockAction: 'saveIssuer',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(issuer, IssuerModel),
            args: [issuer],
        },
    },
    currency: {
        fetch: {
            mockAction: 'fetchCurrencies',
            makeItem: (jsonParser: JSONParser) => makeList(jsonParser, CurrenciesList, {basePath: '/currencies'}),
            args: [],
        },
        find: {
            mockAction: 'fetchCurrency',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(currency, CurrencyModel),
            args: [currency.id],
        },
        save: {
            mockAction: 'saveCurrency',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(currency, CurrencyModel),
            args: [currency],
        },
    },
    bond: {
        fetch: {
            mockAction: 'fetchBonds',
            makeItem: (jsonParser: JSONParser) => makeList(jsonParser, BondsList, {basePath: '/bonds'}),
            args: [],
        },
        find: {
            mockAction: 'fetchBond',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(bond, BondModel),
            args: [bond.ISIN],
        },
        save: {
            mockAction: 'saveBond',
            makeItem: (jsonParser: JSONParser) => jsonParser.jsonToResource(bond, BondModel),
            args: [bond],
        },
    },
};
