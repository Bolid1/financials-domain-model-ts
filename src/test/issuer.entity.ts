import {IssuerModel} from 'bolid1-financials-api-client-ts';
import {URI} from 'hal-rest-client';
import * as test from 'tape-async';
import {IIssuerEntity} from '../';
import initTests from './utils/initTests';

const issuerId = 470;

const issuer = {
    _links: {
        self: {
            href: '/issuers/' + issuerId,
        },
    },
    id: issuerId,
    name: 'Центральный Банк Российской Федерации',
    type: 1,
};

const newData = {
    id: issuerId,
    name: 'Test',
    type: 3,
};

test('fetch issuer', async t => {
    const {store, clientMock, client} = initTests();

    const issuerModel = new IssuerModel(client, new URI(issuer._links.self.href));

    issuerModel.prop('id', issuer.id);
    issuerModel.prop('name', issuer.name);
    issuerModel.prop('type', issuer.type);
    issuerModel.isLoaded = true;
    issuerModel.onInitEnded();

    clientMock
        .fetchIssuer
        // @ts-ignore
        .returns(
            Promise.resolve(issuerModel)
                .then(data => {
                    // Load in progress
                    t.true(store.issuer.loading, 'loading in progress');

                    return data;
                }),
        )
    ;

    t.false(store.issuer.loading, 'loading is not started yet');
    await store.issuer.find(issuerId);
    t.false(store.issuer.loading, 'loading is finished');
    t.equals(store.issuer.error, undefined, 'The error must be empty');

    // @ts-ignore
    t.true(store.issuer.items.has(issuerId), 'issuer must exists in collection');

    // @ts-ignore
    const item = store.issuer.items.get(issuerId) as IIssuerEntity;

    if (item) {
        t.strictEquals(item.id, issuer.id, 'id should be equal');
        t.strictEquals(item.name, issuer.name, 'name should be equal');
        t.strictEquals(item.type, issuer.type, 'type should be equal');
    }
});

test('save issuer', async t => {
    const {store, clientMock, client} = initTests();

    const issuerModel = new IssuerModel(client, new URI(issuer._links.self.href));

    issuerModel.prop('id', issuer.id);
    issuerModel.prop('name', issuer.name);
    issuerModel.prop('type', issuer.type);
    issuerModel.isLoaded = true;
    issuerModel.onInitEnded();

    clientMock
        .saveIssuer
        // @ts-ignore
        .returns(Promise.resolve(issuerModel)
            .then(data => {
                // Load in progress
                t.true(store.issuer.loading, 'loading in progress');

                return data;
            }))
    ;

    t.false(store.issuer.loading, 'loading is not started yet');
    await store.issuer.save({name: issuer.name, type: issuer.type});
    t.false(store.issuer.loading, 'loading is finished');
    t.equals(store.issuer.error, undefined, 'The error must be empty');

    // @ts-ignore
    t.true(store.issuer.items.has(issuerId));

    // @ts-ignore
    const item = store.issuer.items.get(issuerId) as IIssuerEntity;

    if (item) {
        t.strictEquals(item.id, issuer.id, 'new id should be equal');
        t.strictEquals(item.name, issuer.name, 'new name should be equal');
        t.strictEquals(item.type, issuer.type, 'new type should be equal');
    }

    const updatedModel = new IssuerModel(client, new URI(issuer._links.self.href));

    updatedModel.prop('id', newData.id);
    updatedModel.prop('name', newData.name);
    updatedModel.prop('type', newData.type);
    updatedModel.isLoaded = true;
    updatedModel.onInitEnded();

    clientMock
        .saveIssuer
        // @ts-ignore
        .returns(Promise.resolve(updatedModel)
            .then(data => {
                // Load in progress
                t.true(store.issuer.loading, 'loading in progress');

                return data;
            }))
    ;

    t.false(store.issuer.loading, 'loading is not started yet');
    await store.issuer.save(newData);
    t.false(store.issuer.loading, 'loading is finished');
    t.equals(store.issuer.error, undefined, 'The error must be empty');

    // @ts-ignore
    t.true(store.issuer.items.has(issuerId));

    // @ts-ignore
    const item = store.issuer.items.get(issuerId) as IIssuerEntity;

    if (item) {
        t.strictEquals(item.id, newData.id, 'updated id should be equal');
        t.strictEquals(item.name, newData.name, 'updated name should be equal');
        t.strictEquals(item.type, newData.type, 'updated type should be equal');
    }
});
