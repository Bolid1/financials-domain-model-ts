// tslint:disable-next-line
import {IHalResource} from 'hal-rest-client/dist/hal-resource-interface';
import {SinonStub} from 'sinon';
import * as tape from 'tape-async';
import {IDomain} from '../..';

export default async function testDoesNotProduceError(
    t: tape.Test,
    entity: string,
    clientMockAction: SinonStub,
    item: IHalResource,
    store: IDomain,
    action: () => Promise<any>,
) {
    clientMockAction.returns(Promise.resolve(item));

    await action();
    t.equal(store[entity].error, undefined, `${entity}.error should be empty`);
}
