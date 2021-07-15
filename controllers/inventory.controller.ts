import { Response, Request } from 'express';

import { Items, UpdateInventoryRequest, GetInventoryRequest } from '../models/models';
import { lokiDB } from '../utils/database';

export const updateInventoryByID = async (req: Request, res: Response) => {
    try {
        const itemObj: UpdateInventoryRequest = req.body;

        // Validate request
        if (!itemObj.username || !itemObj.item_id || (!itemObj.amount && !itemObj.add)) {
            res.status(400).send({
                message: "Content can not be empty!"
            });
            return;
        }
        // Validate user name
        if (itemObj.username != "admin") {
            res.status(401).send({
                message: "Invaild User"
            });
            return;
        }
        const itemCollections: Collection<Items> =
            lokiDB.getCollection<Items>('items');
        const item: (LokiObj & Items) | null = itemCollections.findOne({ 'item_id': { '$eq': itemObj.item_id } });
        if (item) {
            itemCollections.findAndUpdate({ 'item_id': { '$eq': itemObj.item_id } },
                (item: Items) => {
                    if (itemObj.add && itemObj.add > 0) {
                        item.inventory += itemObj.add;
                    }
                    else if (itemObj.amount && itemObj.amount > 0) {
                        item.inventory = itemObj.amount;
                    }
                }
            );
            const result: (LokiObj & Items) | null = itemCollections.findOne({ 'item_id': { '$eq': itemObj.item_id } });
            return res.status(200).json({ message: 'Inventory Updated Successfully!!', result });
        } else {
            return res.status(400).json({ message: 'Item Not Found!!' });
        }
    } catch (error) {
        return res.status(500).send({ Error: error });
    }
};

export const getInventory = async (req: Request, res: Response) => {
    try {
        const itemObj: GetInventoryRequest = req.body;

        // Validate request
        if (!itemObj.username) {
            res.status(400).send({
                message: "Content can not be empty!"
            });
            return;
        }
        // Validate user name
        if (itemObj.username != "admin") {
            res.status(401).send({
                message: "Invaild User"
            });
            return;
        }
        const itemCollection = lokiDB.getCollection<Items>('items');
        if (itemObj.items && itemObj.items.length > 0) {
            const result = itemCollection.where((item: Items) => {
                if (itemObj.items && itemObj.items.length > 0) {
                    return itemObj.items.filter((requestItem: Items) => {
                        return item.item_id == requestItem.item_id;
                    }).length > 0;
                }
                return false;
            });

            return res.status(200).json({
                items: result
            });
        }
        else {
            const result = itemCollection.chain().data({
            });
            return res.status(200).json({
                items: result
            });
        }
    } catch (error) {
        return res.status(500).send({ Error: error });
    }
};
