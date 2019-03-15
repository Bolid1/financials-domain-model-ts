import {Client} from 'bolid1-financials-api-client-ts';
import Domain, {IDomain} from './types/Domain';

interface ICreateDefaultArguments {
    linkToApi: string;
    env?: object;
}

export function getDefaults(args: ICreateDefaultArguments) {
    return {
        snapshot: {
            issuer: {
                list: {
                    loadedPages: [],
                    page: 0,
                    totalPages: 0,
                    totalItems: 0,
                    itemsPerPage: 30,
                    totalItemsChanged: false,
                    items: {},
                    loading: false,
                },
            },
        },
        env: {
            client: new Client(args.linkToApi), ...args.env,
        },
    };
}

export function createDefault(args: ICreateDefaultArguments): IDomain {
    const {snapshot, env} = getDefaults(args);

    return Domain.create(snapshot, env);
}
