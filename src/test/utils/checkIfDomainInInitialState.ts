import * as tape from 'tape-async';
import {IDomain} from '../..';

export default function checkIfDomainInInitialState(t: tape.Test, store: IDomain, entity: string) {
    const expected = {
        page: 0,
        totalItems: 0,
        loading: false,
    };

    Object.keys(expected).forEach(key => {
        const msg = `Initial value for ${entity}.${key}`;
        if (typeof expected[key] === 'object') {
            t.deepEqual(store[entity][key], expected[key], msg);
        } else {
            t.equal(store[entity][key], expected[key], msg);
        }
    });

    t.equal(store[entity].items.size, 0, `Initial ${entity}.items map must be empty`);
}
