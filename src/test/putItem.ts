import sinon = require('sinon');
import test = require('tape-async');
import entities from './settings/entities';
import initTests from './utils/initTests';

test(`putItem()`, async () => {
    Object.keys(entities).forEach(entity => {
        const actions = entities[entity];

        test(`${entity}.putItem() should add item to collection`, async t => {
            const settings = actions.find;
            const {store, jsonParser} = initTests();
            const item = settings.makeItem(jsonParser);

            // @ts-ignore
            t.false(store[entity].items.has(settings.id), `${entity}.items should not have item on test start`);

            await store[entity].putItem(item);

            // @ts-ignore
            t.true(store[entity].items.has(settings.id), `${entity}.items should have item after putItem`);
        });

        test(`${entity}.putItem() should fetch item before put it`, async t => {
            const settings = actions.find;
            const {store, clientMock, jsonParser} = initTests();
            const item = new settings.model(clientMock);

            sinon.stub(item, 'fetch').returns(
                Promise
                    .resolve()
                    .then(() => jsonParser.jsonToResource(settings.data, settings.model, item)),
            );

            // @ts-ignore
            t.false(store[entity].items.has(settings.id), `${entity}.items should not have item on test start`);

            await store[entity].putItem(item, item, item, item);

            // @ts-ignore
            t.true(store[entity].items.has(settings.id), `${entity}.items should have item after putItem`);
            t.true(item.fetch.calledOnce, `${entity}Model.fetch() must be called only once`);
        });
    });
});
