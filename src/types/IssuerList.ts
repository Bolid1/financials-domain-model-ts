import {IssuerListQueryParams, IssuerModel, IssuersList} from 'bolid1-financials-api-client-ts';
import {getParent, Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';
import {IDomain, IIssuer} from '..';
import IssuerEntity from './IssuerEntity';

const IssuerList = types
    .model('IssuerList', {
        loadedPages: types.array(types.number),
        page: types.number,
        totalPages: types.number,
        totalItems: types.number,
        itemsPerPage: types.number,
        totalItemsChanged: types.boolean,

        items: types.array(IssuerEntity),
    })
    .views(
        self => ({
            get domain(): IDomain {
                return getParent(self, 2);
            },
        }),
    )
    .actions(
        self => ({
            add(issuer: IIssuer) {
                self.items.push(issuer);
            },

            extractPageInfo(list: IssuersList) {
                self.loadedPages.push(list.page);
                self.page = list.page;
                if (list.last) {
                    self.totalPages = list.last.page;
                }

                self.itemsPerPage = list.itemsPerPage;
                self.totalItemsChanged = self.totalItems !== 0 && self.totalItems !== list.totalItems;
                self.totalItems = list.totalItems;
            },

            unSerialize(issuers: IssuerModel[]): IIssuer[] {
                return issuers.map(item => ({
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    bonds: [],
                }));
            },
        }),
    )
    .actions(
        self => ({
            parse(list: IssuersList) {
                if (list.items) {
                    const unSerialized = self.unSerialize(list.items);

                    unSerialized.map(self.add, self);
                }

                self.extractPageInfo(list);
            },
        }),
    )
    .actions(
        self => ({
                async fetchAll() {
                    let list = await self.domain.client.fetchIssuers();
                    let next;

                    do {
                        self.parse(list);
                        next = list.next;
                        if (next) {
                            list = await next.fetch();
                        }
                    } while (next);
                },

                async fetch(query: IssuerListQueryParams = {}) {
                    const list = await self.domain.client.fetchIssuers(query);
                    self.parse(list);
                },
            }
        ))
    .actions(
        self => ({
            async fetchNext(query: IssuerListQueryParams = {}) {
                const nextPage = self.page + 1;
                if (nextPage > self.totalPages) {
                    return Promise.resolve();
                }

                return self.fetch({...query, page: nextPage});
            },
        }),
    )
;

export default IssuerList;

export type IIssuerList = Instance<typeof IssuerList>;
export type IIssuerListSnapshotIn = SnapshotIn<typeof IssuerList>;
export type IIssuerListSnapshotOut = SnapshotOut<typeof IssuerList>;
