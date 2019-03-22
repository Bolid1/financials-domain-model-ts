import test = require('tape-async');
import entities from './settings/entities';
import initTests from './utils/initTests';
import {makeList} from './utils/makeLists';

test('fetch()', async () => {
    Object.keys(entities).forEach(entity => {
        const actions = entities[entity];
        const settings = actions.fetch;
        const basePath = settings.basePath;

        test(`${entity}.fetch() #Check if default page is 1`, async t => {
            const {store, clientMock, jsonParser} = initTests();
            const list = makeList(jsonParser, settings.model, {basePath, page: 1});

            clientMock[settings.mockAction]
                .withArgs({page: 1})
                .returns(Promise.resolve(list));

            await store[entity].fetch();
            t.equal(store[entity].page, 1, `${entity}.fetch() must load the first page of ${entity}[]`);
        });

        test(`${entity}.fetch() must parse all items`, async t => {
            const expectedItems = settings.data._embedded.item;

            const {store, clientMock, jsonParser} = initTests();
            const list = makeList(jsonParser, settings.model, {
                basePath,
                item: expectedItems,
            });

            clientMock[settings.mockAction].returns(Promise.resolve(list));

            await store[entity].fetch();
            t.equal(store[entity].items.size, expectedItems.length, `${entity}.items must contain all items from list`);
            expectedItems.forEach(expected => {
                const identifier = expected[actions.find.identifier];
                // @ts-ignore
                const item = store[entity].items.get(identifier);
                t.notEqual(item, undefined, `${entity}.items must contain expected with id = ${identifier}`);

                if (!item) {
                    return;
                }

                Object.keys(expected).forEach(key => {
                    if (key === '_links') {
                        return;
                    }

                    const msg = `${entity}.item[${identifier}].${key} should be equal to "${expected[key]}"`;
                    if (item[key] instanceof Date) {
                        return t.equal(Number(item[key]), Number(new Date(expected[key])), msg);
                    }
                    t.equal(item[key], expected[key], msg);
                });
            });
        });
    });
});
