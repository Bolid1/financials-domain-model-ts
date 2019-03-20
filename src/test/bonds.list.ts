/*

function makeLists(client: Client): { maxPage: number, lists: BondsList[] } {
    const maxPage = 8;
    const lists = new Array(maxPage);

    for (let page = 1; page <= maxPage; ++page) {
        lists[page - 1] = new BondsList(client, new URI('/bonds?page=' + page));
        lists[page - 1].prop('totalItems', 30 * 8);
        lists[page - 1].prop('itemsPerPage', 30);
    }

    for (let i = 0; i < maxPage; ++i) {
        lists[i].prop('first', lists[0]);
        lists[i].prop('last', lists[maxPage - 1]);
        if (lists[i - 1]) {
            lists[i].prop('prev', lists[i - 1]);
        }
        if (lists[i + 1]) {
            lists[i].prop('next', lists[i + 1]);
        }
    }

    lists.forEach(l => {
        l.isLoaded = true;
        l.onInitEnded();
    });

    return {maxPage, lists};
}

test('fetch bonds list', async t => {
    const {store, clientMock, client, jsonParser} = initTests();

    const bondsList = jsonParser.jsonToResource(bonds, BondsList);
    const issuerModel = jsonParser.jsonToResource(issuer, IssuerModel);
    const currencyModel = jsonParser.jsonToResource(currency, CurrencyModel);

    const links = [
        'first',
        'last',
        'prev',
        'next',
    ];

    links.forEach(link => {
        bondsList.prop(link, new BondsList(client, new URI(bonds._links[link].href)));
    });

    clientMock
        .fetchBonds
        .returns(Promise.resolve(bondsList))
    ;

    await store.bond.fetch({page: 2});
    t.equals(store.bond.error, undefined, 'The error must be empty');

    t.strictEquals(store.bond.items.size, bonds._embedded.item.length, 'not missed any bond');

    store.bond.items.forEach((item: IBondEntity) => {
        t.test('Check item ' + item.ISIN, async t1 => {
            const bond = bonds._embedded.item.find(({ISIN}) => ISIN === item.ISIN) || null;
            t1.true(bond !== null, 'bond found by ISIN');
            if (bond) {
                t1.strictEqual(item.ISIN, bond.ISIN, 'ISIN should be equal');
                t1.strictEqual(item.name, bond.name, 'name should be equal');
                t1.strictEqual(item.offerEnd, bond.offerEnd, 'offerEnd should be equal');
                t1.strictEqual(item.maturity, bond.maturity, 'maturity should be equal');
                t1.strictEqual(item.faceValue, bond.faceValue, 'faceValue should be equal');
                t1.strictEqual(item.quantity, bond.quantity, 'quantity should be equal');
            }
        });
    });

    t.equals(store.bond.loadedPages.join('.'), [2].join('.'), 'loadedPages should be equal');
    t.strictEquals(store.bond.page, 2, 'page should be equal');
    t.strictEquals(store.bond.totalItems, bonds.totalItems, 'totalItems should be equal');
    t.strictEquals(store.bond.itemsPerPage, bonds.itemsPerPage, 'itemsPerPage should be equal');
});

test('fetch all', async t => {
    const {store, clientMock, client} = initTests();
    const {lists} = makeLists(client);

    clientMock
        .fetchBonds
        .returns(Promise.resolve(lists[0]))
    ;

    await store.bond.fetchAll();

    const pageRange = lists.map((v, k) => (k + 1));
    t.equals(store.bond.error, undefined, 'The error must be empty');
    t.equals(store.bond.loadedPages.join('.'), pageRange.join('.'), 'loadedPages should be equal');
});

test('fetch next', async t => {
    const {store, clientMock, client} = initTests();
    const {maxPage, lists} = makeLists(client);

    const list = store.bond;

    clientMock
        .fetchBonds
        .returns(Promise.resolve(lists[0]))
    ;

    await list.fetch();
    const loadedPages = [1];
    t.equals(store.bond.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');

    for (let page = 2; page < maxPage + 5; ++page) {
        clientMock
            .fetchBonds
            .withArgs({page: Math.min(page, maxPage)})
            .returns(Promise.resolve(lists[page - 1]))
        ;

        await list.fetchNext();
        if (page <= maxPage) {
            loadedPages.push(page);
        }

        t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be ' + loadedPages.join(', '));
    }
});

test('each item in list must exist as single instance', async t => {
    const {store, clientMock, client} = initTests();
    const bondsList = new BondsList(client, new URI('/bonds?page=1'));
    const bondsISINs = ['ISIN1', 'ISIN2'];

    bondsList.prop('totalItems', 2);
    bondsList.prop('itemsPerPage', 30);
    bondsList.prop('items', bondsISINs.map(ISIN => {
        const bondModel = new BondModel(client);

        bondModel.prop('ISIN', ISIN);
        bondModel.prop('name', `ISIN: ${name}`);
        bondModel.prop('offerEnd', new Date());
        bondModel.prop('maturity', new Date());
        bondModel.prop('faceValue', 2131);
        bondModel.prop('quantity', 5432);

        bondModel.isLoaded = true;
        bondModel.onInitEnded();

        return bondModel;
    }));
    bondsList.isLoaded = true;
    bondsList.onInitEnded();

    const list = store.bond;

    const stub = clientMock.fetchBonds.returns(Promise.resolve(bondsList));

    const loadedPages = [1];

    await list.fetch();
    t.equals(store.bond.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');
    t.equals(list.items.size, bondsISINs.length, 'Must load bonds');
    list.items.forEach((bond: IBondEntity) => {
        t.true(bondsISINs.indexOf(bond.ISIN) !== -1, `Bond ${bond.ISIN} must exist in ids`);
    });

    await list.fetch();
    t.equals(store.bond.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');
    t.equals(list.items.size, bondsISINs.length, 'Bonds count does\'t changed');
    list.items.forEach((bond: IBondEntity) => {
        t.true(bondsISINs.indexOf(bond.ISIN) !== -1, `Bond ${bond.ISIN} must exist in ids`);
    });

    t.true(stub.calledOnce, 'not load page twice');
});

test('clear', async t => {
    const {store, clientMock, client} = initTests();
    const bondsList = new BondsList(client, new URI('/bonds?page=1'));
    const bondsIds = [1, 2];

    bondsList.prop('totalItems', 2);
    bondsList.prop('itemsPerPage', 30);
    bondsList.prop('items', bondsIds.map(ISIN => {
        const bondModel = new BondModel(client);

        bondModel.prop('ISIN', ISIN);
        bondModel.prop('name', `ISIN: ${name}`);
        bondModel.prop('offerEnd', new Date());
        bondModel.prop('maturity', new Date());
        bondModel.prop('faceValue', 2131);
        bondModel.prop('quantity', 5432);

        bondModel.isLoaded = true;
        bondModel.onInitEnded();

        return bondModel;
    }));
    bondsList.isLoaded = true;
    bondsList.onInitEnded();

    const list = store.bond;

    const stub = clientMock.fetchBonds.returns(Promise.resolve(bondsList));

    const loadedPages = [1];

    await list.fetch();
    t.equals(store.bond.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');
    t.equals(list.items.size, bondsIds.length, 'Must load bonds');
    list.items.forEach((bond: IBondEntity) => {
        t.true(bondsIds.indexOf(bond.ISIN) !== -1, `Bond ${bond.ISIN} must exist in ids`);
    });

    list.clear();
    t.equals(list.loadedPages.length, 0, 'loadedPages should be cleared');
    t.equals(list.items.size, 0, 'Bonds should be cleared');

    await list.fetch();
    t.equals(store.bond.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');
    t.equals(list.items.size, bondsIds.length, 'Bonds count does\'t changed');
    list.items.forEach((bond: IBondEntity) => {
        t.true(bondsIds.indexOf(bond.ISIN) !== -1, `Bond ${bond.ISIN} must exist in ids`);
    });

    t.equal(stub.callCount, 2, 'Reloaded page after clean');
});

test('map', async t => {
    const {store, clientMock, client} = initTests();
    const bondsList = new BondsList(client, new URI('/bonds?page=1'));
    const bondsIds = [1, 2];

    bondsList.prop('totalItems', 2);
    bondsList.prop('itemsPerPage', 30);
    bondsList.prop('items', bondsIds.map(ISIN => {
        const bondModel = new BondModel(client);

        bondModel.prop('ISIN', ISIN);
        bondModel.prop('name', `ISIN: ${name}`);
        bondModel.prop('offerEnd', new Date());
        bondModel.prop('maturity', new Date());
        bondModel.prop('faceValue', 2131);
        bondModel.prop('quantity', 5432);

        bondModel.isLoaded = true;
        bondModel.onInitEnded();

        return bondModel;
    }));
    bondsList.isLoaded = true;
    bondsList.onInitEnded();

    const list = store.bond;

    clientMock.fetchBonds.returns(Promise.resolve(bondsList));

    await list.fetch();
    t.equals(store.bond.error, undefined, 'The error must be empty');
    t.deepEquals(list.map((bond: IBondEntity) => bond.ISIN), bondsIds, 'must be mapped');
});

test('loading', async t => {
    const {store, clientMock, client} = initTests();
    const bondsList = new BondsList(client, new URI('/bonds?page=1'));

    bondsList.prop('totalItems', 2);
    bondsList.prop('itemsPerPage', 30);
    bondsList.isLoaded = true;
    bondsList.onInitEnded();

    const list = store.bond;

    clientMock.fetchBonds.returns(
        Promise.resolve(bondsList)
            .then(bonds => {
                // Load in progress
                t.true(list.loading);

                return bonds;
            }),
    );

    t.false(list.loading);
    await list.fetch();
    t.equals(store.bond.error, undefined, 'The error must be empty');
    t.false(list.loading);
});

test('error handling', async t => {
    const {store, clientMock, client} = initTests();
    const list = store.bond;
    const message = 'message';
    const error = new Error(message) as AxiosError;
    error.config = {url: 'foo'};
    error.response = {
        data: 'Proxy error: Could not proxy request (ECONNREFUSED).',
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
            date: 'Fri, 15 Mar 2019 19:33:54 GMT',
        },
        config: error.config,
    };

    clientMock.fetchBonds.returns(Promise.reject(error));

    await list.fetch();
    t.true(Boolean(list.error), 'error must exist');
    if (list.error) {
        t.equals(list.error.status, error.response.status);
        t.equals(list.error.statusText, error.response.statusText);
        t.equals(list.error.message, error.response.data);
    }

    const bondsList = new BondsList(client, new URI('/bonds?page=1'));

    bondsList.prop('totalItems', 2);
    bondsList.prop('itemsPerPage', 30);
    bondsList.isLoaded = true;
    bondsList.onInitEnded();

    clientMock.fetchBonds.returns(
        Promise.resolve(bondsList)
            .then(bonds => {
                // Load in progress
                t.true(list.loading);

                return bonds;
            }),
    );

    await list.fetch();
    t.false(Boolean(list.error), 'error must be empty');
});
*/
