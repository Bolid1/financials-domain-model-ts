export default {
    _links: {
        self: {
            href: '/issuers?page=3',
        },
        first: {
            href: '/issuers?page=1',
        },
        last: {
            href: '/issuers?page=8',
        },
        prev: {
            href: '/issuers?page=2',
        },
        next: {
            href: '/issuers?page=4',
        },
        item: [
            {
                href: '/issuers/469',
            },
            {
                href: '/issuers/470',
            },
            {
                href: '/issuers/471',
            },
            {
                href: '/issuers/472',
            },
            {
                href: '/issuers/473',
            },
        ],
    },
    totalItems: 234,
    itemsPerPage: 30,
    _embedded: {
        item: [
            {
                _links: {
                    self: {
                        href: '/issuers/469',
                    },
                    bonds: [
                        {
                            href: '/bonds/SU52002RMFS1',
                        },
                        {
                            href: '/bonds/SU52001RMFS3',
                        },
                        {
                            href: '/bonds/SU46023RMFS6',
                        },
                    ],
                },
                id: 469,
                name: 'Министерство Финансов Российской Федерации',
                type: 1,
            },
            {
                _links: {
                    self: {
                        href: '/issuers/470',
                    },
                    bonds: [
                        {
                            href: '/bonds/RU000A1002Z3',
                        },
                        {
                            href: '/bonds/RU000A1000P8',
                        },
                        {
                            href: '/bonds/RU000A0ZZWR6',
                        },
                    ],
                },
                id: 470,
                name: 'Центральный Банк Российской Федерации',
                type: 1,
            },
            {
                _links: {
                    self: {
                        href: '/issuers/471',
                    },
                },
                id: 471,
                name: 'РЖД',
                type: 3,
            },
            {
                _links: {
                    self: {
                        href: '/issuers/472',
                    },
                },
                id: 472,
                name: 'Ижсталь',
                type: 3,
            },
            {
                _links: {
                    self: {
                        href: '/issuers/473',
                    },
                },
                id: 473,
                name: 'Открытое акционерное общество Белон',
                type: 3,
            },
        ],
    },
};
