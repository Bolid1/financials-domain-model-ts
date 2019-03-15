import {AxiosError} from 'axios';
import {Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';

const ErrorModel = types
    .model('ErrorModel', {
        status: types.number,
        statusText: types.string,
        message: types.string,
    });

export type IErrorModel = Instance<typeof ErrorModel>;
export type IErrorModelSnapshotIn = SnapshotIn<typeof ErrorModel>;
export type IErrorModelSnapshotOut = SnapshotOut<typeof ErrorModel>;

export default ErrorModel;

export function fromAxios(error: AxiosError): IErrorModel {
    const response = error.response;

    return {
        status: response ? response.status : Number(error.code || 0),
        statusText: response ? response.statusText : 'Unexpected error',
        message: response ? response.data : (error.code || 'Something went wrong')
    };
}
