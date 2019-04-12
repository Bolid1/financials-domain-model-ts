export default {
    _links: {
        self: {
            href: '/currencies',
        },
        item: [
            {
                href: '/currencies/RUB',
            },
            {
                href: '/currencies/USD',
            },
        ],
    },
    totalItems: 2,
    itemsPerPage: 30,
    _embedded: {
        item: [
            {
                _links: {
                    self: {
                        href: '/currencies/RUB',
                    },
                },
                code: 'RUB',
                sign: '₽',
            },
            {
                _links: {
                    self: {
                        href: '/currencies/USD',
                    },
                },
                code: 'USD',
                sign: '$',
            },
        ],
    },
};
