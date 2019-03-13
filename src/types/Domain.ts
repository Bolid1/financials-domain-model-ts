import {Client} from 'bolid1-financials-api-client-ts';
import {getEnv, Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';
import IssuerDomain from './IssuerDomain';

const Domain = types
    .model('Domain', {
        issuer: IssuerDomain,
    })
    .views(
        self => ({
            get client(): Client {
                return getEnv(self).client;
            },
        }),
    )
;

export default Domain;

export type IDomain = Instance<typeof Domain>;
export type IDomainSnapshotIn = SnapshotIn<typeof Domain>;
export type IDomainSnapshotOut = SnapshotOut<typeof Domain>;
