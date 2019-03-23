import {BondModel, CurrencyModel, IssuerModel} from 'bolid1-financials-api-client-ts';
import * as test from 'tape-async';
import {IBondEntity} from '..';
import bond from './samples/bond';
import currency from './samples/currency';
import issuer from './samples/issuer';
import initTests from './utils/initTests';
import sinon = require('sinon');

test('bond.item[] props currency & issuer should be lazy loaded', async t => {
    const {store, jsonParser} = initTests();
    const currencyId = bond._links.currency.href.substr(-3);
    const issuerId = Number(bond._links.issuer.href.substr(-3));
    const model = jsonParser.jsonToResource(bond, BondModel);

    sinon.stub(model.currency, 'fetch').returns(
        Promise.resolve()
            .then(() => jsonParser.jsonToResource(currency, CurrencyModel, model.currency)),
    );
    sinon.stub(model.issuer, 'fetch').returns(
        Promise.resolve()
            .then(() => jsonParser.jsonToResource(issuer, IssuerModel, model.issuer)),
    );

    t.false(store.bond.items.has(bond.ISIN), 'bond.items should not have item on test start');
    t.false(store.currency.items.has(currencyId), 'currency items should not have currency on start');
    // @ts-ignore
    t.false(store.issuer.items.has(issuerId), 'issuer items should not have issuer on start');

    try {
        await store.bond.putItem(model);
    } catch (ex) {
        return t.error(ex);
    }

    t.true(store.bond.items.has(bond.ISIN), 'bond.items should have item after fetch');
    t.true(store.currency.items.has(currencyId), 'currency.items should have item after fetch');
    // @ts-ignore
    t.true(store.issuer.items.has(issuerId), `issuer.items should have item ${issuerId} after fetch`);

    const item = store.bond.items.get(bond.ISIN) as IBondEntity;
    if (item) {
        t.equal(
            item.currency,
            store.currency.items.get(currencyId),
            `bond.items[${item.ISIN}].currency should referred to currency.items[${currencyId}]`,
        );
        t.equal(
            item.issuer,
            // @ts-ignore
            store.issuer.items.get(issuerId),
            `bond.items[${item.ISIN}].issuer should referred to issuer.items[${issuerId}]`,
        );
    }
});
