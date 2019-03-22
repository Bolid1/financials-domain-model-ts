import {BondModel, BondsList} from 'bolid1-financials-api-client-ts';
import * as test from 'tape-async';
import bond from './samples/bond';
import bonds from './samples/bonds';
import initTests from './utils/initTests';
import {makeList, makeLists} from './utils/makeLists';

const basePath = '/bonds';

test('bond.fetch() #Check if default page is 1', async t => {
    const {store, clientMock, jsonParser} = initTests();
    const bondsList = makeList(jsonParser, BondsList, {basePath, page: 1});

    clientMock.fetchBonds
        .withArgs({page: 1})
        .returns(Promise.resolve(bondsList));

    await store.bond.fetch();
    t.equal(store.bond.page, 1, 'bond.fetch() must load the first page of bonds');
});

test('bond.fetch() must parse all items', async t => {
    const expectedItems = bonds._embedded.item;

    const {store, clientMock, jsonParser} = initTests();
    const bondsList = makeList(jsonParser, BondsList, {
        basePath,
        item: expectedItems,
    }) as BondsList;

    clientMock.fetchBonds.returns(Promise.resolve(bondsList));

    await store.bond.fetch();
    t.equal(store.bond.items.size, expectedItems.length, `bond.items must contain all items from list`);
    expectedItems.forEach(expected => {
        const identifier = expected.ISIN;
        const item = store.bond.items.get(identifier);
        t.notEqual(item, undefined, `bond.items must contain expected with id = ${identifier}`);

        if (!item) {
            return;
        }

        Object.keys(expected).forEach(key => {
            if (key === '_links') {
                return;
            }
            const msg = `bond.item[${identifier}].${key} should be equal to "${expected[key]}"`;
            if (item[key] instanceof Date) {
                return t.equal(Number(item[key]), Number(new Date(expected[key])), msg);
            }

            t.equal(item[key], expected[key], msg);
        });
    });
});

test('bond.fetch() read totalItems from list', async t => {
    const totalItems = 123456;
    const {store, clientMock, jsonParser} = initTests();
    const bondsList = makeList(jsonParser, BondsList, {basePath, totalItems});

    clientMock.fetchBonds.returns(Promise.resolve(bondsList));

    await store.bond.fetch();
    t.equal(store.bond.totalItems, totalItems, `bond.totalItems should be equal to "${totalItems}"`);
});

test('bond.fetchNext() will load next page each time', async t => {
    const {store, clientMock, jsonParser} = initTests();
    const lists = makeLists(jsonParser, BondsList, basePath, 3) as BondsList[];

    lists.forEach(list => {
        clientMock.fetchBonds.withArgs({page: list.page}).returns(Promise.resolve(list));
    });

    await store.bond.fetchNext();
    t.equal(store.bond.page, lists[0].page, 'Firstly bond.fetchNext() should load the first page');

    await store.bond.fetchNext();
    t.equal(store.bond.page, lists[1].page, 'Than bond.fetchNext() should load page 2');

    await store.bond.fetchNext();
    t.equal(store.bond.page, lists[2].page, 'Finally bond.fetchNext() should load the next page (3)');
});

test('bond.find() must fetch bond by id, but only when it does not in collection', async t => {
    const {store, clientMock, jsonParser} = initTests();
    clientMock.fetchBond.withArgs(bond.ISIN).returns(Promise.resolve(jsonParser.jsonToResource(bond, BondModel)));

    t.false(store.bond.items.has(bond.ISIN), 'bond.items should not have item on test start');

    await store.bond.find(bond.ISIN);

    t.true(store.bond.items.has(bond.ISIN), 'bond.items should have item after fetch');

    await store.bond.find(bond.ISIN);
    t.true(clientMock.fetchBond.calledOnce, 'fetchBond must be called only once');
});

test('bond.save() must create bond', async t => {
    const {store, clientMock, jsonParser} = initTests();
    const toSave = {...bond, maturity: new Date(bond.maturity)};
    clientMock.saveBond.withArgs(toSave).returns(Promise.resolve(jsonParser.jsonToResource(bond, BondModel)));

    t.false(store.bond.items.has(bond.ISIN), 'bond.items should not have item on test start');

    await store.bond.save(toSave);

    t.true(store.bond.items.has(bond.ISIN), 'bond.items should have item after save');
});

test('bond.map() must map bond.items', async t => {
    const expectedItems = bonds._embedded.item;

    const {store, jsonParser} = initTests();
    const bondsList = makeList(jsonParser, BondsList, {
        basePath,
        item: expectedItems,
    }) as BondsList;

    await store.bond.putItem(...bondsList.items as BondModel[]);

    t.deepEqual(
        store.bond.map(item => item.ISIN),
        expectedItems.map(item => item.ISIN),
        'bond.map() should produce bond identifier',
    );
});
