import {Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';
import IssuerList from './IssuerList';

const IssuerDomain = types
    .model('IssuerDomain', {
        list: IssuerList,
    });

export default IssuerDomain;

export type IIssuerDomain = Instance<typeof IssuerDomain>;
export type IIssuerDomainSnapshotIn = SnapshotIn<typeof IssuerDomain>;
export type IIssuerDomainSnapshotOut = SnapshotOut<typeof IssuerDomain>;
