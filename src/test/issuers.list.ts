import {AxiosError} from 'axios';
import {Client, IssuerModel, IssuersList} from 'bolid1-financials-api-client-ts';
import {URI} from 'hal-rest-client';
import * as test from 'tape-async';
import {IIssuerEntity} from '../';
import initTests from './utils/initTests';

function makeLists(client: Client): { maxPage: number, lists: IssuersList[] } {
    const maxPage = 8;
    const lists = new Array(maxPage);

    for (let page = 1; page <= maxPage; ++page) {
        lists[page - 1] = new IssuersList(client, new URI('/issuers?page=' + page));
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

test('fetch issuers list', async t => {
    const {store, clientMock, client} = initTests();
    const issuers = {
        _links: {
            self: {
                href: '/issuers?page=3',
            },
            first: {
                href: '/issuers?page=1',
            },
            last: {
                href: '/issuers?page=8',
            },
            prev: {
                href: '/issuers?page=2',
            },
            next: {
                href: '/issuers?page=4',
            },
            item: [
                {
                    href: '/issuers/469',
                },
                {
                    href: '/issuers/470',
                },
                {
                    href: '/issuers/471',
                },
                {
                    href: '/issuers/472',
                },
                {
                    href: '/issuers/473',
                },
            ],
        },
        totalItems: 234,
        itemsPerPage: 30,
        _embedded: {
            item: [
                {
                    _links: {
                        self: {
                            href: '/issuers/469',
                        },
                        bonds: [
                            {
                                href: '/bonds/SU52002RMFS1',
                            },
                            {
                                href: '/bonds/SU52001RMFS3',
                            },
                            {
                                href: '/bonds/SU46023RMFS6',
                            },
                        ],
                    },
                    id: 469,
                    name: 'Министерство Финансов Российской Федерации',
                    type: 1,
                },
                {
                    _links: {
                        self: {
                            href: '/issuers/470',
                        },
                        bonds: [
                            {
                                href: '/bonds/RU000A1002Z3',
                            },
                            {
                                href: '/bonds/RU000A1000P8',
                            },
                            {
                                href: '/bonds/RU000A0ZZWR6',
                            },
                        ],
                    },
                    id: 470,
                    name: 'Центральный Банк Российской Федерации',
                    type: 1,
                },
                {
                    _links: {
                        self: {
                            href: '/issuers/471',
                        },
                    },
                    id: 471,
                    name: 'РЖД',
                    type: 3,
                },
                {
                    _links: {
                        self: {
                            href: '/issuers/472',
                        },
                    },
                    id: 472,
                    name: 'Ижсталь',
                    type: 3,
                },
                {
                    _links: {
                        self: {
                            href: '/issuers/473',
                        },
                    },
                    id: 473,
                    name: 'Открытое акционерное общество Белон',
                    type: 3,
                },
            ],
        },
    };

    const issuersList = new IssuersList(client, new URI(issuers._links.self.href));

    const links = [
        'first',
        'last',
        'prev',
        'next',
    ];

    links.forEach(link => {
        issuersList.prop(link, new IssuersList(client, new URI(issuers._links[link].href)));
    });

    issuersList.prop('totalItems', issuers.totalItems);
    issuersList.prop('itemsPerPage', issuers.itemsPerPage);

    issuersList.prop('items', issuers._embedded.item.map(issuer => {
        const issuerModel = new IssuerModel(client);

        issuerModel.prop('id', issuer.id);
        issuerModel.prop('name', issuer.name);
        issuerModel.prop('type', issuer.type);

        issuerModel.isLoaded = true;
        issuerModel.onInitEnded();

        return issuerModel;
    }));

    issuersList.isLoaded = true;
    issuersList.onInitEnded();

    clientMock
        .fetchIssuers
        .returns(Promise.resolve(issuersList))
    ;

    await store.issuer.fetch({page: 3});

    t.strictEquals(store.issuer.items.size, issuers._embedded.item.length, 'not missed any issuer');

    store.issuer.items.forEach((item: IIssuerEntity) => {
        t.test('Check item ' + item.id, async t1 => {
            const issuer = issuers._embedded.item.find(({id}) => id === item.id) || null;
            t1.true(issuer !== null, 'issuer found by id');
            if (issuer) {
                t1.strictEqual(item.id, issuer.id, 'id should be equal');
                t1.strictEqual(item.name, issuer.name, 'name should be equal');
                t1.strictEqual(item.type, issuer.type, 'type should be equal');
            }
        });
    });

    t.equals(store.issuer.error, undefined, 'The error must be empty');
    t.equals(store.issuer.loadedPages.join('.'), [3].join('.'), 'loadedPages should be equal');
    t.strictEquals(store.issuer.page, 3, 'page should be equal');
    t.strictEquals(store.issuer.totalPages, 8, 'totalPages should be equal');
    t.strictEquals(store.issuer.totalItems, issuers.totalItems, 'totalItems should be equal');
    t.strictEquals(store.issuer.itemsPerPage, issuers.itemsPerPage, 'itemsPerPage should be equal');
    t.strictEquals(store.issuer.totalItemsChanged, false, 'totalItemsChanged should be equal');
});

test('fetch all', async t => {
    const {store, clientMock, client} = initTests();
    const {lists} = makeLists(client);

    clientMock
        .fetchIssuers
        .returns(Promise.resolve(lists[0]))
    ;

    await store.issuer.fetchAll();

    const pageRange = lists.map((v, k) => (k + 1));
    t.equals(store.issuer.error, undefined, 'The error must be empty');
    t.equals(store.issuer.loadedPages.join('.'), pageRange.join('.'), 'loadedPages should be equal');
});

test('fetch next', async t => {
    const {store, clientMock, client} = initTests();
    const {maxPage, lists} = makeLists(client);

    const list = store.issuer;

    clientMock
        .fetchIssuers
        .returns(Promise.resolve(lists[0]))
    ;

    await list.fetch();
    const loadedPages = [1];
    t.equals(store.issuer.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');

    for (let page = 2; page < maxPage + 5; ++page) {
        clientMock
            .fetchIssuers
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
    const issuersList = new IssuersList(client, new URI('/issuers?page=1'));
    const issuersIds = [1, 2];

    issuersList.prop('totalItems', 2);
    issuersList.prop('itemsPerPage', 30);
    issuersList.prop('items', issuersIds.map(id => {
        const issuerModel = new IssuerModel(client);

        issuerModel.prop('id', id);
        issuerModel.prop('name', `issuer 1`);
        issuerModel.prop('type', 1);

        issuerModel.isLoaded = true;
        issuerModel.onInitEnded();

        return issuerModel;
    }));
    issuersList.isLoaded = true;
    issuersList.onInitEnded();

    const list = store.issuer;

    const stub = clientMock.fetchIssuers.returns(Promise.resolve(issuersList));

    const loadedPages = [1];

    await list.fetch();
    t.equals(store.issuer.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');
    t.equals(list.items.size, issuersIds.length, 'Must load issuers');
    list.items.forEach((issuer: IIssuerEntity) => {
        t.true(issuersIds.indexOf(issuer.id) !== -1, `Issuer ${issuer.id} must exist in ids`);
    });

    await list.fetch();
    t.equals(store.issuer.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');
    t.equals(list.items.size, issuersIds.length, 'Issuers count does\'t changed');
    list.items.forEach((issuer: IIssuerEntity) => {
        t.true(issuersIds.indexOf(issuer.id) !== -1, `Issuer ${issuer.id} must exist in ids`);
    });

    t.true(stub.calledOnce, 'not load page twice');
});

test('clear', async t => {
    const {store, clientMock, client} = initTests();
    const issuersList = new IssuersList(client, new URI('/issuers?page=1'));
    const issuersIds = [1, 2];

    issuersList.prop('totalItems', 2);
    issuersList.prop('itemsPerPage', 30);
    issuersList.prop('items', issuersIds.map(id => {
        const issuerModel = new IssuerModel(client);

        issuerModel.prop('id', id);
        issuerModel.prop('name', `issuer 1`);
        issuerModel.prop('type', 1);

        issuerModel.isLoaded = true;
        issuerModel.onInitEnded();

        return issuerModel;
    }));
    issuersList.isLoaded = true;
    issuersList.onInitEnded();

    const list = store.issuer;

    const stub = clientMock.fetchIssuers.returns(Promise.resolve(issuersList));

    const loadedPages = [1];

    await list.fetch();
    t.equals(store.issuer.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');
    t.equals(list.items.size, issuersIds.length, 'Must load issuers');
    list.items.forEach((issuer: IIssuerEntity) => {
        t.true(issuersIds.indexOf(issuer.id) !== -1, `Issuer ${issuer.id} must exist in ids`);
    });

    list.clear();
    t.equals(list.loadedPages.length, 0, 'loadedPages should be cleared');
    t.equals(list.items.size, 0, 'Issuers should be cleared');

    await list.fetch();
    t.equals(store.issuer.error, undefined, 'The error must be empty');
    t.equals(list.loadedPages.join('.'), loadedPages.join('.'), 'loadedPages should be equal');
    t.equals(list.items.size, issuersIds.length, 'Issuers count does\'t changed');
    list.items.forEach((issuer: IIssuerEntity) => {
        t.true(issuersIds.indexOf(issuer.id) !== -1, `Issuer ${issuer.id} must exist in ids`);
    });

    t.equal(stub.callCount, 2, 'Reloaded page after clean');
});

test('map', async t => {
    const {store, clientMock, client} = initTests();
    const issuersList = new IssuersList(client, new URI('/issuers?page=1'));
    const issuersIds = [1, 2];

    issuersList.prop('totalItems', 2);
    issuersList.prop('itemsPerPage', 30);
    issuersList.prop('items', issuersIds.map(id => {
        const issuerModel = new IssuerModel(client);

        issuerModel.prop('id', id);
        issuerModel.prop('name', `issuer 1`);
        issuerModel.prop('type', 1);

        issuerModel.isLoaded = true;
        issuerModel.onInitEnded();

        return issuerModel;
    }));
    issuersList.isLoaded = true;
    issuersList.onInitEnded();

    const list = store.issuer;

    clientMock.fetchIssuers.returns(Promise.resolve(issuersList));

    await list.fetch();
    t.equals(store.issuer.error, undefined, 'The error must be empty');
    t.deepEquals(list.map((issuer: IIssuerEntity) => issuer.id), issuersIds, 'must be mapped');
});

test('loading', async t => {
    const {store, clientMock, client} = initTests();
    const issuersList = new IssuersList(client, new URI('/issuers?page=1'));

    issuersList.prop('totalItems', 2);
    issuersList.prop('itemsPerPage', 30);
    issuersList.isLoaded = true;
    issuersList.onInitEnded();

    const list = store.issuer;

    clientMock.fetchIssuers.returns(
        Promise.resolve(issuersList)
            .then(issuers => {
                // Load in progress
                t.true(list.loading);

                return issuers;
            }),
    );

    t.false(list.loading);
    await list.fetch();
    t.equals(store.issuer.error, undefined, 'The error must be empty');
    t.false(list.loading);
});

test('error handling', async t => {
    const {store, clientMock, client} = initTests();
    const list = store.issuer;
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

    clientMock.fetchIssuers.returns(Promise.reject(error));

    await list.fetch();
    t.true(Boolean(list.error), 'error must exist');
    if (list.error) {
        t.equals(list.error.status, error.response.status);
        t.equals(list.error.statusText, error.response.statusText);
        t.equals(list.error.message, error.response.data);
    }

    const issuersList = new IssuersList(client, new URI('/issuers?page=1'));

    issuersList.prop('totalItems', 2);
    issuersList.prop('itemsPerPage', 30);
    issuersList.isLoaded = true;
    issuersList.onInitEnded();

    clientMock.fetchIssuers.returns(
        Promise.resolve(issuersList)
            .then(issuers => {
                // Load in progress
                t.true(list.loading);

                return issuers;
            }),
    );

    await list.fetch();
    t.false(Boolean(list.error), 'error must be empty');
});
