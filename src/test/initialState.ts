import test = require('tape-async');
import entities from './settings/entities';
import checkIfDomainInInitialState from './utils/checkIfDomainInInitialState';
import initTests from './utils/initTests';

test('Ensure that initial state in each test is like expected', async () => {
    Object.keys(entities).forEach(entity => {
        test(`${entity} #Ensure that initial state in each test is like expected`, async t => {
            const {store} = initTests();

            checkIfDomainInInitialState(t, store, entity);
        });
    });
});
