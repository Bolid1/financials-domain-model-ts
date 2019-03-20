import test = require('tape-async');
import entities from './settings/entities';
import initTests from './utils/initTests';
import testDoesNotProduceError from './utils/testDoesNotProduceError';
import testSaveAxiosError from './utils/testSaveAxiosError';

test('Error handling', async () => {
    Object.keys(entities).forEach(entity => {
        const actions = entities[entity];

        Object.keys(actions).forEach(action => {
            const settings = actions[action];

            test(`${entity}.${action}() does not produce error`, async t => {
                const {store, clientMock, jsonParser} = initTests();
                await testDoesNotProduceError(
                    t,
                    entity,
                    clientMock[settings.mockAction],
                    settings.makeItem(jsonParser),
                    store,
                    () => store[entity][action].call(store, ...settings.args),
                );
            });

            test(`${entity}.${action}() save axios error, but cleanup it after before next fetch`, async t => {
                const {store, clientMock, jsonParser} = initTests();
                await testSaveAxiosError(
                    t,
                    entity,
                    clientMock[settings.mockAction],
                    settings.makeItem(jsonParser),
                    store,
                    () => store[entity][action].call(store, ...settings.args),
                );
            });

            test(`${entity}.${action}() throw unknown error`, async t => {
                const {store, clientMock} = initTests();

                const error = new Error('message');
                clientMock[settings.mockAction].returns(Promise.reject(error));

                try {
                    await store[entity][action].call(store, ...settings.args);
                    t.fail(`${entity}.${action}() does\'t thrown error`);
                } catch (ex) {
                    t.equal(store[entity].error, undefined, 'Store error should be empty');
                    t.equal(String(ex), String(error), `${entity}.${action}() should throw unchanged error`);
                    t.pass(`${entity}.${action}() thrown error`);
                }
            });
        });
    });
});
