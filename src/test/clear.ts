import test = require('tape-async');
import entities from './settings/entities';
import checkIfDomainInInitialState from './utils/checkIfDomainInInitialState';
import initTests from './utils/initTests';

test('clear()', async () => {
    Object.keys(entities).forEach(entity => {
        const actions = entities[entity];

        Object.keys(actions).forEach(action => {
            const settings = actions[action];

            test(`${entity}.clear() after ${entity}.${action}()`, async t => {
                const {store, clientMock, jsonParser} = initTests();
                clientMock[settings.mockAction].returns(Promise.resolve(settings.makeItem(jsonParser)));
                await store[entity][action].call(store, ...settings.args);

                store[entity].clear();
                checkIfDomainInInitialState(t, store, entity);
            });
        });
    });
});
