import {CurrenciesList, CurrencyModel} from 'bolid1-financials-api-client-ts';
import * as test from 'tape-async';
import currencies from './samples/currencies';
import currency from './samples/currency';
import initTests from './utils/initTests';
import {makeList, makeLists} from './utils/makeLists';

const basePath = '/currencies';

test('currency.fetch() #Check if default page is 1', async t => {
    const {store, clientMock, jsonParser} = initTests();
    const currenciesList = makeList(jsonParser, CurrenciesList, {basePath, page: 1});

    clientMock.fetchCurrencies
        .withArgs({page: 1})
        .returns(Promise.resolve(currenciesList));

    await store.currency.fetch();
    t.equal(store.currency.page, 1, 'currency.fetch() must load the first page of currencies');
});

test('currency.fetch() must parse all items', async t => {
    const expectedItems = currencies._embedded.item;

    const {store, clientMock, jsonParser} = initTests();
    const currenciesList = makeList(jsonParser, CurrenciesList, {
        basePath,
        item: expectedItems,
    });

    clientMock.fetchCurrencies.returns(Promise.resolve(currenciesList));

    await store.currency.fetch();
    t.equal(store.currency.items.size, expectedItems.length, `currency.items must contain all items from list`);
    expectedItems.forEach(expected => {
        const identifier = expected.id;
        const item = store.currency.items.get(identifier);
        t.notEqual(item, undefined, `currency.items must contain expected with id = ${identifier}`);

        if (!item) {
            return;
        }

        Object.keys(expected).forEach(key => {
            if (key !== '_links') {
                const msg = `currency.item[${identifier}].${key} should be equal to "${expected[key]}"`;
                t.equal(item[key], expected[key], msg);
            }
        });
    });
});

test('currency.fetch() read totalItems from list', async t => {
    const totalItems = 123456;
    const {store, clientMock, jsonParser} = initTests();
    const currenciesList = makeList(jsonParser, CurrenciesList, {basePath, totalItems});

    clientMock.fetchCurrencies.returns(Promise.resolve(currenciesList));

    await store.currency.fetch();
    t.equal(store.currency.totalItems, totalItems, `currency.totalItems should be equal to "${totalItems}"`);
});

test('currency.fetchNext() will load next page each time', async t => {
    const {store, clientMock, jsonParser} = initTests();
    const lists = makeLists(jsonParser, CurrenciesList, basePath, 3) as CurrenciesList[];

    lists.forEach(list => {
        clientMock.fetchCurrencies.withArgs({page: list.page}).returns(Promise.resolve(list));
    });

    await store.currency.fetchNext();
    t.equal(store.currency.page, lists[0].page, 'Firstly currency.fetchNext() should load the first page');

    await store.currency.fetchNext();
    t.equal(store.currency.page, lists[1].page, 'Than currency.fetchNext() should load page 2');

    await store.currency.fetchNext();
    t.equal(store.currency.page, lists[2].page, 'Finally currency.fetchNext() should load the next page (3)');
});

test('currency.find() must fetch currency by id, but only when it does not in collection', async t => {
    const {store, clientMock, jsonParser} = initTests();
    clientMock.fetchCurrency.withArgs(currency.id).returns(
        Promise.resolve(jsonParser.jsonToResource(currency, CurrencyModel)),
    );

    t.false(store.currency.items.has(currency.id), 'currency.items should not have item on test start');

    await store.currency.find(currency.id);

    t.true(store.currency.items.has(currency.id), 'currency.items should have item after fetch');

    await store.currency.find(currency.id);
    t.true(clientMock.fetchCurrency.calledOnce, 'fetchCurrency must be called only once');
});

test('currency.save() must create currency', async t => {
    const {store, clientMock, jsonParser} = initTests();
    clientMock.saveCurrency.withArgs(currency).returns(
        Promise.resolve(jsonParser.jsonToResource(currency, CurrencyModel)),
    );

    t.false(store.currency.items.has(currency.id), 'currency.items should not have item on test start');

    await store.currency.save(currency);

    t.true(store.currency.items.has(currency.id), 'currency.items should have item after save');
});

test('currency.map() must map currency.items', async t => {
    const expectedItems = currencies._embedded.item;

    const {store, jsonParser} = initTests();
    const currenciesList = makeList(jsonParser, CurrenciesList, {
        basePath,
        item: expectedItems,
    }) as CurrenciesList;

    await store.currency.putItem(...currenciesList.items as CurrencyModel[]);

    t.deepEqual(
        store.currency.map(item => item.id),
        expectedItems.map(item => item.id),
        'currency.map() should produce currency identifier',
    );
});
