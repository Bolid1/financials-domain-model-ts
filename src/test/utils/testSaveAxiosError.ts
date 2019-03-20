import {AxiosResponse} from 'axios';
// tslint:disable-next-line
import {IHalResource} from 'hal-rest-client/dist/hal-resource-interface';
import {SinonStub} from 'sinon';
import * as tape from 'tape-async';
import {IDomain} from '../..';
import checkAxiosError from './checkAxiosError';
import makeAxiosError from './makeAxiosError';

export default async function testSaveAxiosError(
    t: tape.Test,
    entity: string,
    clientMockAction: SinonStub,
    item: IHalResource,
    store: IDomain,
    action: () => Promise<any>,
) {
    const error = makeAxiosError();

    clientMockAction.returns(Promise.reject(error));

    t.equal(store[entity].error, undefined, `${entity}.error should be empty on test start`);
    await action();
    checkAxiosError(t, store[entity].error, entity, error.response as AxiosResponse);

    clientMockAction.returns(Promise.resolve(item));

    await action();
    t.equal(store[entity].error, undefined, `${entity}.error should be empty`);
}
