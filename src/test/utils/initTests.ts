import {Client} from 'bolid1-financials-api-client-ts';
import {createStubInstance, SinonStubbedInstance} from 'sinon';
import {createDefault, IDomain} from '../..';

const baseURL = 'http://financials.test';

export default function initTests(): { store: IDomain, clientMock: SinonStubbedInstance<Client>, client: Client } {
    const clientMock = createStubInstance(Client);

    return {
        store: createDefault({
            linkToApi: baseURL,
            env: {
                client: clientMock,
            },
        }),
        clientMock,
        client: new Client(baseURL),
    };
}
