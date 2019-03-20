import {Client} from 'bolid1-financials-api-client-ts';
import {JSONParser} from 'hal-rest-client';
import {createStubInstance, SinonStubbedInstance} from 'sinon';
import {createDefault, IDomain} from '../..';

const baseURL = 'http://financials.test';

export default function initTests(): {
    store: IDomain,
    clientMock: SinonStubbedInstance<Client>,
    client: Client,
    jsonParser: JSONParser,
} {
    const clientMock = createStubInstance(Client);
    const client = new Client(baseURL);

    return {
        store: createDefault({
            linkToApi: baseURL,
            env: {
                client: clientMock,
            },
        }),
        clientMock,
        client,
        jsonParser: new JSONParser(client),
    };
}
