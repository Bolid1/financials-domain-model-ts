import test = require('tape-async');
import entities from './settings/entities';
import initTests from './utils/initTests';
import {makeLists} from './utils/makeLists';

test('fetchNext() will load next page each time', async () => {
    Object.keys(entities).forEach(entity => {
        const actions = entities[entity];
        const settings = actions.fetch;
        const basePath = settings.basePath;

        test(`${entity}.fetchNext()`, async t => {
            const {store, clientMock, jsonParser} = initTests();
            const lists = makeLists(jsonParser, settings.model, basePath, 3);

            lists.forEach(list => {
                // @ts-ignore
                clientMock[settings.mockAction].withArgs({page: list.page}).returns(Promise.resolve(list));
            });

            await store[entity].fetchNext();
            // @ts-ignore
            t.equal(store[entity].page, lists[0].page, `Firstly ${entity}.fetchNext() should load the first page`);

            await store[entity].fetchNext();
            // @ts-ignore
            t.equal(store[entity].page, lists[1].page, `Than ${entity}.fetchNext() should load page 2`);

            await store[entity].fetchNext();
            // @ts-ignore
            t.equal(store[entity].page, lists[2].page, `Finally ${entity}.fetchNext() should load the next page (3)`);
        });
    });
});
