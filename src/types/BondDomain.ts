import {AxiosError} from 'axios';
import {BondModel, BondsList, IBond, IBondsListQueryParams} from 'bolid1-financials-api-client-ts';
import {getParent, Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';
import BondEntity, {IBondEntity} from './BondEntity';
import {IDomain} from './Domain';
import ErrorModel, {fromAxios, IErrorModel} from './ErrorModel';

const BondDomain = types
    .model('BondDomain', {
        page: types.number,
        totalItems: types.number,

        items: types.map(BondEntity),

        loading: types.boolean,
        error: types.maybe(ErrorModel),
    })
    .views(self => ({
            get domain(): IDomain {
                return getParent(self);
            },

            map(callbackfn: (value: IBondEntity, index: number, array: IBondEntity[]) => any[], thisArg?: any) {
                return Array.from(self.items.values()).map(callbackfn, thisArg);
            },
        }),
    )
    .actions(self => ({
        setLoading(loading: boolean) {
            self.loading = Boolean(loading);
        },

        setError(error?: IErrorModel) {
            self.error = error || undefined;
        },

        setPage(page) {
            self.page = page;
        },
        setTotalItems(totalItems) {
            self.totalItems = totalItems;
        },
    }))
    .actions(self => ({
        handleError(ex) {
            if (ex.config && (ex as AxiosError)) {
                self.setError(fromAxios(ex));
            } else {
                throw ex;
            }
        },
    }))
    .actions(self => {
            // Work with items
            function unSerialize(bonds: BondModel[]): IBondEntity[] {
                return bonds.map(item => ({
                    ISIN: item.ISIN,
                    issuer: item.issuer.id,
                    currency: item.currency.id,
                    name: item.name,
                    offerEnd: item.offerEnd,
                    maturity: item.maturity,
                    faceValue: item.faceValue,
                    quantity: item.quantity,
                    amortizations: [],
                    coupons: [],
                }));
            }

            function put(...bonds: IBond[]): void {
                bonds.forEach(bond => self.items.put(bond));
            }

            return {
                putItem(...bonds: BondModel[]): void {
                    put(...unSerialize(bonds));
                },

                clear() {
                    self.page = 0;
                    self.totalItems = 0;
                    self.items.clear();
                },
            };
        },
    )
    .actions(self => {
        // Work with list
        function extractPageInfo(list: BondsList) {
            self.setPage(list.page);
            self.setTotalItems(list.totalItems);
        }

        function handleList(list: BondsList) {
            if (list.items) {
                self.putItem(...list.items);
            }

            extractPageInfo(list);
        }

        return {
            async fetch(query: IBondsListQueryParams = {}) {
                const page = query.page || 1;

                self.setError();
                self.setLoading(true);
                try {
                    const bondsList = await self.domain.client.fetchBonds({...query, page});
                    handleList(bondsList);
                } catch (ex) {
                    self.handleError(ex);
                }
                self.setLoading(false);
            },
        };
    })
    .actions(self => ({
            fetchNext(query: IBondsListQueryParams = {}) {
                const nextPage = self.page + 1;

                return self.fetch({...query, page: nextPage});
            },
        }),
    )
    .actions(self => ({
        // Work with single item
        async find(ISIN: string) {
            self.setError();
            if (!self.items.has(ISIN)) {
                self.setLoading(true);
                try {
                    self.putItem(await self.domain.client.fetchBond(ISIN));
                } catch (ex) {
                    self.handleError(ex);
                }
                self.setLoading(false);
            }
        },

        async save(bond: IBond) {
            self.setError();
            self.setLoading(true);
            try {
                self.putItem(await self.domain.client.saveBond(bond));
            } catch (ex) {
                self.handleError(ex);
            }
            self.setLoading(false);
        },
    }))
;

export default BondDomain;

export type IBondDomain = Instance<typeof BondDomain>;
export type IBondDomainSnapshotIn = SnapshotIn<typeof BondDomain>;
export type IBondDomainSnapshotOut = SnapshotOut<typeof BondDomain>;
