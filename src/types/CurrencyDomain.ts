import {AxiosError} from 'axios';
import {CurrenciesList, CurrencyModel, ICurrenciesListQueryParams, ICurrency} from 'bolid1-financials-api-client-ts';
import {getParent, Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';
import CurrencyEntity, {ICurrencyEntity} from './CurrencyEntity';
import {IDomain} from './Domain';
import ErrorModel, {fromAxios, IErrorModel} from './ErrorModel';

const CurrencyDomain = types
    .model('CurrencyDomain', {
        page: types.number,
        totalItems: types.number,

        items: types.map(CurrencyEntity),

        loading: types.boolean,
        error: types.maybe(ErrorModel),
    })
    .views(self => ({
            get domain(): IDomain {
                return getParent(self);
            },

        map(callbackfn: (
            value: ICurrencyEntity, index: number, array: ICurrencyEntity[]) => any,
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
    }))
    .actions(self => ({
        put(...currencies: ICurrency[]): void {
            currencies.forEach(currency => self.items.put(currency));
        },
    }))
    .actions(self => {
            // Work with items
            function unSerialize(currencies: CurrencyModel[]): ICurrencyEntity[] {
                return currencies.map(item => ({
                    id: item.id,
                    sign: item.sign,
                }));
            }

            return {
                async putItem(...currencies: CurrencyModel[]) {
                    self.put(...unSerialize(
                        await Promise.all(
                            currencies
                                .filter(item => item)
                                .filter((item, index, array) => array.indexOf(item) === index)
                                .map(item => item.fetch()),
                        ),
                    ));
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
        function extractPageInfo(list: CurrenciesList) {
            self.setPage(list.page);
            self.setTotalItems(list.totalItems);
        }

        async function handleList(list: CurrenciesList) {
            if (list.items) {
                await self.putItem(...list.items);
            }

            extractPageInfo(list);
        }

        return {
            async fetch(query: ICurrenciesListQueryParams = {}) {
                const page = query.page || 1;

                self.setError();
                self.setLoading(true);
                try {
                    const currenciesList = await self.domain.client.fetchCurrencies({...query, page});
                    await handleList(currenciesList);
                } catch (ex) {
                    self.handleError(ex);
                }
                self.setLoading(false);
            },
        };
    })
    .actions(self => ({
            fetchNext(query: ICurrenciesListQueryParams = {}) {
                const nextPage = self.page + 1;

                return self.fetch({...query, page: nextPage});
            },
        }),
    )
    .actions(self => {
        let inLoad = [] as string[];

        return {
            // Work with single item
            async find(id: string) {
                self.setError();
                if (!self.items.has(id) && inLoad.indexOf(id) === -1) {
                    self.setLoading(true);
                    inLoad.push(id);
                    try {
                        await self.putItem(await self.domain.client.fetchCurrency(id));
                    } catch (ex) {
                        self.handleError(ex);
                    }
                    inLoad = inLoad.filter(i => i !== id);
                    self.setLoading(false);
                }
            },
        };
    })
    .actions(self => ({
        async save(currency: ICurrency) {
            self.setError();
            self.setLoading(true);
            try {
                await self.putItem(await self.domain.client.saveCurrency(currency));
            } catch (ex) {
                self.handleError(ex);
            }
            self.setLoading(false);
        },
    }))
;

export default CurrencyDomain;

export type ICurrencyDomain = Instance<typeof CurrencyDomain>;
export type ICurrencyDomainSnapshotIn = SnapshotIn<typeof CurrencyDomain>;
export type ICurrencyDomainSnapshotOut = SnapshotOut<typeof CurrencyDomain>;
