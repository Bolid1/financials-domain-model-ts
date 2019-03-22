import test = require('tape-async');
import entities from './settings/entities';
import initTests from './utils/initTests';
import {makeList} from './utils/makeLists';

const butOnlyMsg = `but only when it does not in collection`;
test(`find() must fetch by id, ${butOnlyMsg}`, async () => {
    Object.keys(entities).forEach(entity => {
        const actions = entities[entity];

        test(`${entity}.map() must map ${entity}.items`, async t => {
            const expectedItems = actions.fetch.data._embedded.item;
            const basePath = actions.fetch.basePath;

            const {store, jsonParser} = initTests();
            const list = makeList(jsonParser, actions.fetch.model, {
                basePath,
                item: expectedItems,
            });

            // @ts-ignore
            if (!Array.isArray(list.items)) {
                return t.fail('');
            }

            // @ts-ignore
            await store[entity].putItem(...list.items);

            t.deepEqual(
                store[entity].map(item => item[actions.find.identifier]),
                expectedItems.map(item => item[actions.find.identifier]),
                `${entity}.map() should produce ${entity} ${actions.find.identifier}[]`,
            );
        });
    });
});
