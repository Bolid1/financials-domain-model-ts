// tslint:disable-next-line
import {IHalResource} from 'hal-rest-client/dist/hal-resource-interface';
import {SinonStub} from 'sinon';
import * as tape from 'tape-async';
import {IDomain} from '../..';

export default async function testRespectLoadingCycle(
    t: tape.Test,
    entity: string,
    clientMockAction: SinonStub,
    item: IHalResource,
    store: IDomain,
    action: () => Promise<any>,
) {
    clientMockAction.returns(
        Promise.resolve(item)
            .then(data => {
                t.true(store[entity].loading, `${entity}.loading is in process`);

                return data;
            }),
    );

    t.false(store[entity].loading, `${entity}.loading is not started yet`);
    await action();
    t.false(store[entity].loading, `${entity}.loading is finished`);
}
