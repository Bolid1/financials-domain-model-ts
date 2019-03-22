import test = require('tape-async');
import entities from './settings/entities';
import initTests from './utils/initTests';

test(`save()`, async () => {
    Object.keys(entities).forEach(entity => {
        const actions = entities[entity];
        const settings = actions.save;

        test(`${entity}.save() must create ${entity}`, async t => {
            const {store, clientMock, jsonParser} = initTests();
            clientMock[settings.mockAction].withArgs(settings.data).returns(
                Promise.resolve(settings.makeItem(jsonParser)),
            );

            // @ts-ignore
            t.false(store[entity].items.has(settings.id), `${entity}.items should not have item on test start`);

            await store[entity].save(settings.data);

            // @ts-ignore
            t.true(store[entity].items.has(settings.id), `${entity}.items should have item after save`);
        });
    });
});
