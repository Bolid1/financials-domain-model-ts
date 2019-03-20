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
                page: 0,
                totalItems: 0,
                items: {},
                loading: false,
            },
            bond: {
                page: 0,
                totalItems: 0,
                items: {},
                loading: false,
            },
            currency: {
                page: 0,
                totalItems: 0,
                items: {},
                loading: false,
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
