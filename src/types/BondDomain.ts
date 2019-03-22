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

        map(
            callbackfn: (value: IBondEntity, index: number, array: IBondEntity[]) => any,
            thisArg?: any,
        ): any[] {
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

        put(...bonds: IBond[]): void {
            bonds.forEach(bond => self.items.put(bond));
        },
    }))
    .actions(self => {
            // Work with items
        async function unSerialize(bonds: BondModel[]): Promise<IBondEntity[]> {
            await Promise.all(
                bonds.map(item => Promise.all([
                    self.domain.currency.find(item.currency.id),
                    self.domain.issuer.find(item.issuer.id),
                ])),
            );

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

            return {
                async putItem(...bonds: BondModel[]) {
                    self.put(...await unSerialize(bonds.filter(item => item)));
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

        async function handleList(list: BondsList) {
            if (list.items) {
                await self.putItem(...list.items);
            }

            extractPageInfo(list);
        }

        return {
            async fetch(query: IBondsListQueryParams = {}) {
                const page = query.page || 1;

                self.setError();
                self.setLoading(true);
                try {
                    await handleList(await self.domain.client.fetchBonds({...query, page}));
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
    .actions(self => {
        const inLoad = [] as string[];

        return {
            // Work with single item
            async find(ISIN: string) {
                self.setError();
                if (!self.items.has(ISIN) && inLoad.indexOf(ISIN) === -1) {
                    self.setLoading(true);
                    inLoad.push(ISIN);
                    try {
                        await self.putItem(await self.domain.client.fetchBond(ISIN));
                    } catch (ex) {
                        self.handleError(ex);
                    }
                    inLoad.filter(i => i !== ISIN);
                    self.setLoading(false);
                }
            },
        };
    })
    .actions(self => ({
        async save(bond: IBond) {
            self.setError();
            self.setLoading(true);
            try {
                await self.putItem(await self.domain.client.saveBond(bond));
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
