import {JSONParser} from 'hal-rest-client';
// tslint:disable-next-line
import {IHalResource, IHalResourceConstructor} from 'hal-rest-client/dist/hal-resource-interface';

function linkToPage(basePath: string, page: number): string {
    return `${basePath}?page=${page}`;
}

export function makeList<T extends IHalResource>(
    jsonParser: JSONParser,
    c: IHalResourceConstructor<T>,
    options: {
        basePath: string,
        page?: number,
        totalItems?: number,
        itemsPerPage?: number,
        item?: any[],
    }): T {
    const basePath = options.basePath;
    const page = options.page || 1;
    const list = {
        _links: {
            self: {
                href: linkToPage(basePath, page),
            },
        },
        itemsPerPage: options.itemsPerPage || 30,
        totalItems: options.totalItems || (options.item ? options.item.length : 0),
    };

    if (options.item) {
        Object.assign(list, {
            _embedded: {
                item: options.item,
            },
        });
    }

    if (list.totalItems > 0) {
        const maxPage = Math.ceil(list.totalItems / list.itemsPerPage);
        Object.assign(list._links, {
            first: {
                href: linkToPage(basePath, 1),
            },
            last: {
                href: linkToPage(basePath, maxPage),
            },
        });

        if (page > 1) {
            Object.assign(list._links, {
                prev: {
                    href: linkToPage(basePath, page - 1),
                },
            });
        }

        if (page < maxPage) {
            Object.assign(list._links, {
                next: {
                    href: linkToPage(basePath, page + 1),
                },
            });
        }
    }

    return jsonParser.jsonToResource(list, c);
}

export function makeLists<T extends IHalResource>(
    jsonParser: JSONParser,
    c: IHalResourceConstructor<T>,
    basePath: string,
    maxPage?: number,
): T[] {
    const lists = [] as T[];
    const pagesCount = maxPage || 8;
    const options = {
        basePath,
        itemsPerPage: 30,
        totalItems: 30 * pagesCount,
    };

    for (let page = 1; page <= pagesCount; ++page) {
        lists[page - 1] = makeList(jsonParser, c, {page, ...options});
    }

    return lists;
}
