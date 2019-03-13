import {Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';
import BondEntity from './BondEntity';

const IssuerEntity = types
    .model('IssuerEntity', {
        id: types.identifierNumber,
        name: types.string,
        type: types.number,
        bonds: types.array(types.late(() => BondEntity)),
    });

export type IIssuerEntity = Instance<typeof IssuerEntity>;
export type IIssuerEntitySnapshotIn = SnapshotIn<typeof IssuerEntity>;
export type IIssuerEntitySnapshotOut = SnapshotOut<typeof IssuerEntity>;

export default IssuerEntity;
