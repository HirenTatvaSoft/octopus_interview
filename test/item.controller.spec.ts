import { Response, Request, } from 'express';
import { Chance } from 'chance';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import { describe, it } from 'mocha';
import * as httpMocks from 'node-mocks-http';
import loki from "lokijs";
import { Items, AddItemRequest } from "../models/models";

const chance: Chance.Chance = new Chance();

const lokiDBMock = new loki(chance.string());
const itemsMock = lokiDBMock.addCollection<Items>("items", { autoupdate: true, disableMeta: true });

const testItemController = proxyquire('../controllers/item.controller', {
    '../utils/database': {
        items: itemsMock,
        lokiDB: lokiDBMock
    }
});

const requestMock = httpMocks.createRequest();
const responseMock = httpMocks.createResponse();

const HttpStatusCode = {
    Ok: 200,
    InternalServerError: 500,
    BadRequest: 400,
    Unauthorized: 401
};

describe('Item Controller', () => {
    let setItemsMethods: (req: Request, res: Response) => Promise<Response>;

    let itemsRequest: AddItemRequest;
    let itemsResponse: AddItemRequest & LokiObj;

    beforeEach(() => {
        setItemsMethods = testItemController.setItems;
        itemsRequest = {
            username: chance.string(),
            item_id: chance.integer().toString(),
            price: chance.integer({ min: 1, max: 10000 }),
            inventory: chance.integer({ min: 1, max: 10000 })
        } as AddItemRequest;

        itemsResponse = {
            ...itemsRequest,
            $loki: chance.integer(),
            meta: {
                created: chance.integer(),
                revision: chance.integer(),
                updated: chance.integer(),
                version: chance.integer()
            }
        } as AddItemRequest & LokiObj;
    });

    describe('Set Items', () => {
        it('Should return content empty error', async () => {
            requestMock.body = {};
            await setItemsMethods(requestMock, responseMock);
            expect(responseMock.statusCode).to.equal(HttpStatusCode.BadRequest);
        });

        it('Should return invalid user error', async () => {
            requestMock.body = itemsRequest;
            await setItemsMethods(requestMock, responseMock);
            expect(responseMock.statusCode).to.equal(HttpStatusCode.Unauthorized);
        });

        it('Should return content insert success', async () => {
            itemsMock.insertOne = (): (Items & LokiObj) => {
                return itemsResponse;
            };

            itemsRequest.username = 'admin';
            requestMock.body = itemsRequest;
            await setItemsMethods(requestMock, responseMock);
            expect(responseMock.statusCode).to.equal(HttpStatusCode.Ok);
        });

        it('Should return price update success', async () => {
            itemsMock.findOne = (): (LokiObj & Items) | null => {
                return itemsResponse;
            };

            itemsRequest.username = 'admin';
            requestMock.body = itemsRequest;
            await setItemsMethods(requestMock, responseMock);
            expect(responseMock.statusCode).to.equal(HttpStatusCode.Ok);
        });

        it('Should return internal server error', async () => {
            itemsMock.findOne = (): (LokiObj & Items) | null => {
                return null;
            };

            itemsMock.insertOne = (): (Items & LokiObj) => {
                throw new Error();
            };

            itemsRequest.username = 'admin';
            requestMock.body = itemsRequest;
            await setItemsMethods(requestMock, responseMock);
            expect(responseMock.statusCode).to.equal(HttpStatusCode.InternalServerError);
        });
    });
});