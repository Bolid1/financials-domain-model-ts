import test = require('tape-async');
import entities from './settings/entities';
import initTests from './utils/initTests';

const butOnlyMsg = `but only when it does not in collection`;
test(`find() must fetch by id, ${butOnlyMsg}`, async () => {
    Object.keys(entities).forEach(entity => {
        const actions = entities[entity];
        const settings = actions.find;

        test(`${entity}.find() must fetch ${entity} by ${settings.identifier}, ${butOnlyMsg}`, async t => {
            const {store, clientMock, jsonParser} = initTests();
            clientMock[settings.mockAction].withArgs(settings.id).returns(
                Promise.resolve(settings.makeItem(jsonParser)),
            );

            // @ts-ignore
            t.false(store[entity].items.has(settings.id), `${entity}.items should not have item on test start`);

            await store[entity].find(settings.id);

            // @ts-ignore
            t.true(store[entity].items.has(settings.id), `${entity}.items should have item after fetch`);

            await store[entity].find(settings.id);
            t.true(clientMock[settings.mockAction].calledOnce, `${settings.mockAction} must be called only once`);
        });
    });
});
