import {AxiosResponse} from 'axios';
import * as tape from 'tape-async';
import {IErrorModel} from '../../types/ErrorModel';

export default function checkAxiosError(
    t: tape.Test,
    actual: IErrorModel | undefined,
    entity: string,
    response: AxiosResponse,
) {
    t.notEqual(actual, undefined, `${entity}.error must exist`);
    if (actual) {
        t.equals(
            actual.status,
            response.status,
            `${entity}.error.status should be equal ${response.status}`,
        );
        t.equals(
            actual.statusText,
            response.statusText,
            `${entity}.error.statusText should be equal ${response.statusText}`,
        );
        t.equals(
            actual.message,
            response.data,
            `${entity}.error.data should be equal ${response.data}`,
        );
    }
}
