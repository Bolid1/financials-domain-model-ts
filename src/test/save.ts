import test = require('tape-async');
import entities from './settings/entities';
import initTests from './utils/initTests';

test(`save()`, async () => {
    Object.keys(entities).forEach(entity => {
        const actions = entities[entity];
        ['create', 'update', 'save'].forEach(action => {
            if (!actions.hasOwnProperty(action)) {
                return;
            }

            const settings = actions[action];

            test(`${entity}.${action}() must ${action} ${entity}`, async t => {
                const {store, clientMock, jsonParser} = initTests();
                clientMock[settings.mockAction].withArgs(settings.data).returns(
                    Promise.resolve(settings.makeItem(jsonParser)),
                );

                // @ts-ignore
                t.false(store[entity].items.has(settings.id), `${entity}.items should not have item on test start`);

                await store[entity][action](settings.data);

                // @ts-ignore
                t.true(store[entity].items.has(settings.id), `${entity}.items should have item after save`);
            });
        });
    });
});
