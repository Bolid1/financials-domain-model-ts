import {AxiosError} from 'axios';
import {IIssuer, IIssuersListQueryParams, IssuerModel, IssuersList} from 'bolid1-financials-api-client-ts';
import {getParent, Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';
import {IDomain} from './Domain';
import ErrorModel, {fromAxios, IErrorModel} from './ErrorModel';
import IssuerEntity, {IIssuerEntity} from './IssuerEntity';

const IssuerDomain = types
    .model('IssuerDomain', {
        page: types.number,
        totalItems: types.number,

        items: types.map(IssuerEntity),

        loading: types.boolean,
        error: types.maybe(ErrorModel),
    })
    .views(self => ({
            get domain(): IDomain {
                return getParent(self);
            },

        map(
            callbackfn: (value: IIssuerEntity, index: number, array: IIssuerEntity[]) => any,
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
        put(...issuers: IIssuer[]): void {
            issuers.forEach(issuer => self.items.put(issuer));
        },
    }))
    .actions(self => {
            // Work with items
            function unSerialize(issuers: IssuerModel[]): IIssuerEntity[] {
                return issuers.map(item => ({
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    bonds: [],
                }));
            }

            return {
                async putItem(...issuers: IssuerModel[]) {
                    self.put(...unSerialize(
                        await Promise.all(
                            issuers
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
        function extractPageInfo(list: IssuersList) {
            self.setPage(list.page);
            self.setTotalItems(list.totalItems);
        }

        async function handleList(list: IssuersList) {
            if (list.items) {
                await self.putItem(...list.items);
            }

            extractPageInfo(list);
        }

        return {
            async fetch(query: IIssuersListQueryParams = {}) {
                const page = query.page || 1;

                self.setError();
                self.setLoading(true);
                try {
                    await handleList(await self.domain.client.fetchIssuers({...query, page}));
                } catch (ex) {
                    self.handleError(ex);
                }
                self.setLoading(false);
            },
        };
    })
    .actions(self => ({
            fetchNext(query: IIssuersListQueryParams = {}) {
                const nextPage = self.page + 1;

                return self.fetch({...query, page: nextPage});
            },
        }),
    )
    .actions(self => {
        let inLoad = [] as number[];

        return {
            // Work with single item
            async find(id: number) {
                self.setError();
                // @ts-ignore FIXME: change typeof identifierNumber to number
                if (!self.items.has(id) && inLoad.indexOf(id) === -1) {
                    self.setLoading(true);
                    inLoad.push(id);
                    try {
                        await self.putItem(await self.domain.client.fetchIssuer(id));
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
        async save(issuer: IIssuer) {
            self.setError();
            self.setLoading(true);
            try {
                await self.putItem(await self.domain.client.saveIssuer(issuer));
            } catch (ex) {
                self.handleError(ex);
            }
            self.setLoading(false);
        },
    }))
;

export default IssuerDomain;

// noinspection JSUnusedGlobalSymbols
export type IIssuerDomain = Instance<typeof IssuerDomain>;
// noinspection JSUnusedGlobalSymbols
export type IIssuerDomainSnapshotIn = SnapshotIn<typeof IssuerDomain>;
// noinspection JSUnusedGlobalSymbols
export type IIssuerDomainSnapshotOut = SnapshotOut<typeof IssuerDomain>;
