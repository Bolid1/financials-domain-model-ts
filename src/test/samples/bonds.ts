export default {
    _links: {
        self: {
            href: '/bonds?page=2',
        },
        first: {
            href: '/bonds?page=1',
        },
        last: {
            href: '/bonds?page=3',
        },
        prev: {
            href: '/bonds?page=1',
        },
        next: {
            href: '/bonds?page=3',
        },
        item: [
            {
                href: '/bonds/RU000A0ZZWR6',
            },
            {
                href: '/bonds/RU000A1000P8',
            },
            {
                href: '/bonds/RU000A1002Z3',
            },
        ],
    },
    _embedded: {
        item: [
            {
                _links: {
                    currency: {
                        href: '/currencies/RUB',
                    },
                    issuer: {
                        href: '/issuers/470',
                    },
                    self: {
                        href: '/bonds/RU000A0ZZWR6',
                    },
                },
                ISIN: 'RU000A0ZZWR6',
                name: 'КОБР-16',
                offerEnd: null,
                maturity: '2019-03-13T00:00:00+00:00',
                faceValue: 1000,
                quantity: 0,
            },
            {
                _links: {
                    self: {
                        href: '/bonds/RU000A1000P8',
                    },
                    issuer: {
                        href: '/issuers/470',
                    },
                    currency: {
                        href: '/currencies/RUB',
                    },
                },
                ISIN: 'RU000A1000P8',
                name: 'КОБР-17',
                offerEnd: null,
                maturity: '2019-04-17T00:00:00+00:00',
                faceValue: 1000,
                quantity: 0,
            },
            {
                _links: {
                    self: {
                        href: '/bonds/RU000A1002Z3',
                    },
                    issuer: {
                        href: '/issuers/470',
                    },
                    currency: {
                        href: '/currencies/RUB',
                    },
                },
                ISIN: 'RU000A1002Z3',
                name: 'КОБР-18',
                offerEnd: null,
                maturity: '2019-05-15T00:00:00+00:00',
                faceValue: 1000,
                quantity: 0,
            },
        ],
    },
    itemsPerPage: 30,
    totalItems: 41,
};
