import {IssuerModel, IssuersList} from 'bolid1-financials-api-client-ts';
import * as test from 'tape-async';
import issuer from './samples/issuer';
import issuers from './samples/issuers';
import initTests from './utils/initTests';
import {makeList, makeLists} from './utils/makeLists';

const basePath = '/issuers';

test('issuer.fetch() #Check if default page is 1', async t => {
    const {store, clientMock, jsonParser} = initTests();
    const issuersList = makeList(jsonParser, IssuersList, {basePath, page: 1});

    clientMock.fetchIssuers
        .withArgs({page: 1})
        .returns(Promise.resolve(issuersList));

    await store.issuer.fetch();
    t.equal(store.issuer.page, 1, 'issuer.fetch() must load the first page of issuers');
});

test('issuer.fetch() must parse all items', async t => {
    const expectedItems = issuers._embedded.item;

    const {store, clientMock, jsonParser} = initTests();
    const issuersList = makeList(jsonParser, IssuersList, {
        basePath,
        item: expectedItems,
    });

    clientMock.fetchIssuers.returns(Promise.resolve(issuersList));

    await store.issuer.fetch();
    t.equal(store.issuer.items.size, expectedItems.length, `issuer.items must contain all items from list`);
    expectedItems.forEach(expected => {
        const identifier = expected.id;
        // @ts-ignore
        const item = store.issuer.items.get(identifier);
        t.notEqual(item, undefined, `issuer.items must contain expected with id = ${identifier}`);

        if (!item) {
            return;
        }

        Object.keys(expected).forEach(key => {
            if (key !== '_links') {
                const msg = `issuer.item[${identifier}].${key} should be equal to "${expected[key]}"`;
                t.equal(item[key], expected[key], msg);
            }
        });
    });
});

test('issuer.fetch() read totalItems from list', async t => {
    const totalItems = 123456;
    const {store, clientMock, jsonParser} = initTests();
    const issuersList = makeList(jsonParser, IssuersList, {basePath, totalItems});

    clientMock.fetchIssuers.returns(Promise.resolve(issuersList));

    await store.issuer.fetch();
    t.equal(store.issuer.totalItems, totalItems, `issuer.totalItems should be equal to "${totalItems}"`);
});

test('issuer.fetchNext() will load next page each time', async t => {
    const {store, clientMock, jsonParser} = initTests();
    const lists = makeLists(jsonParser, IssuersList, basePath, 3);

    lists.forEach(list => {
        clientMock.fetchIssuers.withArgs({page: list.page}).returns(Promise.resolve(list));
    });

    await store.issuer.fetchNext();
    t.equal(store.issuer.page, lists[0].page, 'Firstly issuer.fetchNext() should load the first page');

    await store.issuer.fetchNext();
    t.equal(store.issuer.page, lists[1].page, 'Than issuer.fetchNext() should load page 2');

    await store.issuer.fetchNext();
    t.equal(store.issuer.page, lists[2].page, 'Finally issuer.fetchNext() should load the next page (3)');
});

test('issuer.find() must fetch issuer by id, but only when it does not in collection', async t => {
    const {store, clientMock, jsonParser} = initTests();
    clientMock.fetchIssuer.withArgs(issuer.id).returns(Promise.resolve(jsonParser.jsonToResource(issuer, IssuerModel)));

    // @ts-ignore
    t.false(store.issuer.items.has(issuer.id), 'issuer.items should not have item on test start');

    await store.issuer.find(issuer.id);

    // @ts-ignore
    t.true(store.issuer.items.has(issuer.id), 'issuer.items should have item after fetch');

    await store.issuer.find(issuer.id);
    t.true(clientMock.fetchIssuer.calledOnce, 'fetchIssuer must be called only once');
});

test('issuer.save() must create issuer', async t => {
    const {store, clientMock, jsonParser} = initTests();
    clientMock.saveIssuer.withArgs(issuer).returns(Promise.resolve(jsonParser.jsonToResource(issuer, IssuerModel)));

    // @ts-ignore
    t.false(store.issuer.items.has(issuer.id), 'issuer.items should not have item on test start');

    await store.issuer.save(issuer);

    // @ts-ignore
    t.true(store.issuer.items.has(issuer.id), 'issuer.items should have item after save');
});

test('issuer.map() must map issuer.items', async t => {
    const expectedItems = issuers._embedded.item;

    const {store, jsonParser} = initTests();
    const issuersList = makeList(jsonParser, IssuersList, {
        basePath,
        item: expectedItems,
    });

    await store.issuer.putItem(...issuersList.items as IssuerModel[]);

    t.deepEqual(
        store.issuer.map(item => item.id),
        expectedItems.map(item => item.id),
        'issuer.map() should produce issuer identifier',
    );
});
