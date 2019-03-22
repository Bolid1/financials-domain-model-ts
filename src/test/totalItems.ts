import test = require('tape-async');
import entities from './settings/entities';
import initTests from './utils/initTests';
import {makeList} from './utils/makeLists';

test('fetch() read totalItems from list', async () => {
    Object.keys(entities).forEach(entity => {
        const actions = entities[entity];
        const settings = actions.fetch;

        test(`${entity}.fetch() read totalItems from list`, async t => {
            const totalItems = 123456;
            const {store, clientMock, jsonParser} = initTests();
            const list = makeList(jsonParser, settings.model, {basePath: settings.basePath, totalItems});

            clientMock[settings.mockAction].returns(Promise.resolve(list));

            await store[entity].fetch.call(store);
            t.equal(store[entity].totalItems, totalItems, `${entity}.totalItems should be equal to "${totalItems}"`);
        });
    });
});
