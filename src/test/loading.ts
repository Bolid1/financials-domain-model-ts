import test = require('tape-async');
import entities from './settings/entities';
import initTests from './utils/initTests';
import testRespectLoadingCycle from './utils/testRespectLoadingCycle';

test('respect loading cycle', async () => {
    Object.keys(entities).forEach(entity => {
        const actions = entities[entity];

        Object.keys(actions).forEach(action => {
            const settings = actions[action];

            test(`${entity}.${action}() should respect loading cycle`, async t => {
                const {store, clientMock, jsonParser} = initTests();
                await testRespectLoadingCycle(
                    t,
                    entity,
                    clientMock[settings.mockAction],
                    settings.makeItem(jsonParser),
                    store,
                    () => store[entity][action].call(store, ...settings.args),
                );
            });
        });
    });
});
