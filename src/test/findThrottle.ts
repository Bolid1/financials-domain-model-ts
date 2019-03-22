import test = require('tape-async');
import entities from './settings/entities';
import initTests from './utils/initTests';

test('find() must throttle by id', async () => {
    Object.keys(entities).forEach(entity => {
        const actions = entities[entity];
        const settings = actions.find;
        const action = `${entity}.find(${settings.args.join(', ')})`;

        test(`${action} should throttle`, async t => {
            const {store, clientMock, jsonParser} = initTests();
            clientMock[settings.mockAction].returns(Promise.resolve(settings.makeItem(jsonParser)));
            await Promise.all([
                store[entity].find.call(store, ...settings.args),
                store[entity].find.call(store, ...settings.args),
                store[entity].find.call(store, ...settings.args),
                store[entity].find.call(store, ...settings.args),
                store[entity].find.call(store, ...settings.args),
            ]);

            t.true(clientMock[settings.mockAction].calledOnce, `${action} should be called only once`);
        });
    });
});
