import {AxiosError} from 'axios';

export default function makeAxiosError(): AxiosError {
    const error = new Error('message') as AxiosError;
    const response = {
        data: 'Proxy error: Could not proxy request (ECONNREFUSED).',
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
            date: 'Fri, 15 Mar 2019 19:33:54 GMT',
        },
        config: error.config,
    };
    Object.assign(error, {
        config: {url: 'foo'},
        response,
    });

    return error;
}
