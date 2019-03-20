/*

function makeLists(client: Client): { maxPage: number, lists: CurrenciesList[] } {
    const maxPage = 8;
    const lists = new Array(maxPage);

    for (let page = 1; page <= maxPage; ++page) {
        lists[page - 1] = new CurrenciesList(client, new URI('/currencies?page=' + page));
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

    lists.forEach(list => {
        list.isLoaded = true;
        list.onInitEnded();
    });

    return {maxPage, lists};
}

test('fetch currencies list', async t => {
    const {store, clientMock, client} = initTests();
    const currencies = {
        _links: {
            self: {
                href: '/currencies?page=3',
            },
            first: {
                href: '/currencies?page=1',
            },
            last: {
                href: '/currencies?page=4',
            },
            prev: {
                href: '/currencies?page=2',
            },
            next: {
                href: '/currencies?page=4',
            },
            item: [
                {
                    href: '/currencies/RUB',
                },
                {
                    href: '/currencies/USD',
                },
            ],
        },
        totalItems: 2,
        itemsPerPage: 30,
        _embedded: {
            item: [
                {
                    _links: {
                        self: {
                            href: '/currencies/RUB',
                        },
                    },
                    id: 'RUB',
                    sign: '₽',
                },
                {
                    _links: {
                        self: {
                            href: '/currencies/USD',
                        },
                    },
                    id: 'USD',
                    sign: '$',
                },
            ],
        },
    };

    const currenciesList = new CurrenciesList(client, new URI(currencies._links.self.href));

    const links = [
        'first',
        'last',
        'prev',
        'next',
    ];

    links.forEach(link => {
        currenciesList.prop(link, new CurrenciesList(client, new URI(currencies._links[link].href)));
    });

    currenciesList.prop('totalItems', currencies.totalItems);
    currenciesList.prop('itemsPerPage', currencies.itemsPerPage);

    currenciesList.prop('items', currencies._embedded.item.map(currency => {
        const currencyModel = new CurrencyModel(client);

        currencyModel.prop('id', currency.id);
        currencyModel.prop('sign', currency.sign);

        currencyModel.isLoaded = true;
        currencyModel.onInitEnded();

        return currencyModel;
    }));

    currenciesList.isLoaded = true;
    currenciesList.onInitEnded();

    clientMock
        .fetchCurrencies
        .returns(Promise.resolve(currenciesList))
    ;

    await store.currency.fetch({page: 3});

    t.strictEquals(store.currency.items.size, currencies._embedded.item.length, 'not missed any currency');

    store.currency.items.forEach((item: ICurrencyEntity) => {
        t.test('Check item ' + item.id, async t1 => {
            const currency = currencies._embedded.item.find(({id}) => id === item.id) || null;
            t1.true(currency !== null, 'currency found by id');
            if (currency) {
                t1.strictEqual(item.id, currency.id, 'id should be equal');
                t1.strictEqual(item.sign, currency.sign, 'sign should be equal');
            }
        });
    });

    t.equals(store.currency.error, undefined, 'The error must be empty');
    t.equals(store.currency.loadedPages.join('.'), [3].join('.'), 'loadedPages should be equal');
    t.strictEquals(store.currency.page, 3, 'page should be equal');
    t.strictEquals(store.currency.totalItems, currencies.totalItems, 'totalItems should be equal');
    t.strictEquals(store.currency.itemsPerPage, currencies.itemsPerPage, 'itemsPerPage should be equal');
});

test('fetch all', async t => {
    const {store, clientMock, client} = initTests();
    const {lists} = makeLists(client);

    clientMock
        .fetchCurrencies
        .returns(Promise.resolve(lists[0]))
    ;

    await store.currency.fetchAll();

    const pageRange = lists.map((v, k) => (k + 1));
    t.equals(store.currency.error, undefined, 'The error must be empty');
    t.equals(store.currency.loadedPages.join('.'), pageRange.join('.'), 'loadedPages should be equal');
});

test('fetch next', async t => {
    const {store, clientMock, client} = initTests();
    const {maxPage, lists} = makeLists(client);

    const list = store.currency;

    clientMock
        .fetchCurrencies
        .returns(Promise.resolve(lists[0]))
    ;

    await list.fetch();
    const loadedPages = [1];
    t.equals(store.currency.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');

    for (let page = 2; page < maxPage + 5; ++page) {
        clientMock
            .fetchCurrencies
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
    const currenciesList = new CurrenciesList(client, new URI('/currencies?page=1'));
    const currenciesIds = ['RUB', 'USD'];

    currenciesList.prop('totalItems', 2);
    currenciesList.prop('itemsPerPage', 30);
    currenciesList.prop('items', currenciesIds.map(id => {
        const currencyModel = new CurrencyModel(client);

        currencyModel.prop('id', id);
        currencyModel.prop('sign', `currency 1`);

        currencyModel.isLoaded = true;
        currencyModel.onInitEnded();

        return currencyModel;
    }));
    currenciesList.isLoaded = true;
    currenciesList.onInitEnded();

    const list = store.currency;

    const stub = clientMock.fetchCurrencies.returns(Promise.resolve(currenciesList));

    const loadedPages = [1];

    await list.fetch();
    t.equals(store.currency.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');
    t.equals(list.items.size, currenciesIds.length, 'Must load currencies');
    list.items.forEach((currency: ICurrencyEntity) => {
        t.true(currenciesIds.indexOf(currency.id) !== -1, `Currency ${currency.id} must exist in ids`);
    });

    await list.fetch();
    t.equals(store.currency.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');
    t.equals(list.items.size, currenciesIds.length, 'Currencies count does\'t changed');
    list.items.forEach((currency: ICurrencyEntity) => {
        t.true(currenciesIds.indexOf(currency.id) !== -1, `Currency ${currency.id} must exist in ids`);
    });

    t.true(stub.calledOnce, 'not load page twice');
});

test('clear', async t => {
    const {store, clientMock, client} = initTests();
    const currenciesList = new CurrenciesList(client, new URI('/currencies?page=1'));
    const currenciesIds = ['RUB', 'USD'];

    currenciesList.prop('totalItems', 2);
    currenciesList.prop('itemsPerPage', 30);
    currenciesList.prop('items', currenciesIds.map(id => {
        const currencyModel = new CurrencyModel(client);

        currencyModel.prop('id', id);
        currencyModel.prop('sign', `currency 1`);

        currencyModel.isLoaded = true;
        currencyModel.onInitEnded();

        return currencyModel;
    }));
    currenciesList.isLoaded = true;
    currenciesList.onInitEnded();

    const list = store.currency;

    const stub = clientMock.fetchCurrencies.returns(Promise.resolve(currenciesList));

    const loadedPages = [1];

    await list.fetch();
    t.equals(store.currency.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');
    t.equals(list.items.size, currenciesIds.length, 'Must load currencies');
    list.items.forEach((currency: ICurrencyEntity) => {
        t.true(currenciesIds.indexOf(currency.id) !== -1, `Currency ${currency.id} must exist in ids`);
    });

    list.clear();
    t.equals(list.loadedPages.length, 0, 'loadedPages should be cleared');
    t.equals(list.items.size, 0, 'Currencies should be cleared');

    await list.fetch();
    t.equals(store.currency.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');
    t.equals(list.items.size, currenciesIds.length, 'Currencies count does\'t changed');
    list.items.forEach((currency: ICurrencyEntity) => {
        t.true(currenciesIds.indexOf(currency.id) !== -1, `Currency ${currency.id} must exist in ids`);
    });

    t.equal(stub.callCount, 2, 'Reloaded page after clean');
});

test('map', async t => {
    const {store, clientMock, client} = initTests();
    const currenciesList = new CurrenciesList(client, new URI('/currencies?page=1'));
    const currenciesIds = ['RUB', 'USD'];

    currenciesList.prop('totalItems', 2);
    currenciesList.prop('itemsPerPage', 30);
    currenciesList.prop('items', currenciesIds.map(id => {
        const currencyModel = new CurrencyModel(client);

        currencyModel.prop('id', id);
        currencyModel.prop('sign', `currency 1`);

        currencyModel.isLoaded = true;
        currencyModel.onInitEnded();

        return currencyModel;
    }));
    currenciesList.isLoaded = true;
    currenciesList.onInitEnded();

    const list = store.currency as ICurrencyDomain;

    clientMock.fetchCurrencies.returns(Promise.resolve(currenciesList));

    await list.fetch();
    t.equals(store.currency.error, undefined, 'The error must be empty');
    t.deepEquals(list.map((currency: ICurrencyEntity) => currency.id), currenciesIds, 'must be mapped');
});

test('loading', async t => {
    const {store, clientMock, client} = initTests();
    const currenciesList = new CurrenciesList(client, new URI('/currencies?page=1'));

    currenciesList.prop('totalItems', 2);
    currenciesList.prop('itemsPerPage', 30);
    currenciesList.isLoaded = true;
    currenciesList.onInitEnded();

    const list = store.currency;

    clientMock.fetchCurrencies.returns(
        Promise.resolve(currenciesList)
            .then(currencies => {
                // Load in progress
                t.true(list.loading);

                return currencies;
            }),
    );

    t.false(list.loading);
    await list.fetch();
    t.equals(store.currency.error, undefined, 'The error must be empty');
    t.false(list.loading);
});

test('error handling', async t => {
    const {store, clientMock, client} = initTests();
    const list = store.currency;
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

    clientMock.fetchCurrencies.returns(Promise.reject(error));

    await list.fetch();
    t.true(Boolean(list.error), 'error must exist');
    if (list.error) {
        t.equals(list.error.status, error.response.status);
        t.equals(list.error.statusText, error.response.statusText);
        t.equals(list.error.message, error.response.data);
    }

    const currenciesList = new CurrenciesList(client, new URI('/currencies?page=1'));

    currenciesList.prop('totalItems', 2);
    currenciesList.prop('itemsPerPage', 30);
    currenciesList.isLoaded = true;
    currenciesList.onInitEnded();

    clientMock.fetchCurrencies.returns(
        Promise.resolve(currenciesList)
            .then(currencies => {
                // Load in progress
                t.true(list.loading);

                return currencies;
            }),
    );

    await list.fetch();
    t.false(Boolean(list.error), 'error must be empty');
});
*/
