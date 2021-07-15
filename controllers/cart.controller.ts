import { Response, Request, NextFunction } from 'express';

import { Carts, Items } from '../models/models';
import { carts, items, lokiDB } from '../utils/database';

export const addItem = async (req: Request, res: Response) => {
    try {
        const requestObj: Carts = req.body;

        // Validate request
        if (!requestObj.username || !requestObj.item_id || !requestObj.quantity || requestObj.quantity <= 0) {
            res.status(400).send({
                message: "Content can not be empty!"
            });
            return;
        }

        if (requestObj.quantity <= 0) {
            return res.status(400).json({ message: 'Enter Vaild Item Quantity!!' });
        }


        const itemCollections: Collection<Items> =
            lokiDB.getCollection<Items>('items');
        const item: (LokiObj & Items) | null = itemCollections.findOne({ 'item_id': { '$eq': requestObj.item_id } });
        if (item) {
            if (requestObj.quantity <= item.inventory) {
                const cartCollections: Collection<Carts> =
                    lokiDB.getCollection<Carts>('carts');
                const exitUserCart: (LokiObj & Carts) | null = cartCollections.findOne({ 'item_id': { '$eq': requestObj.item_id }, 'username': { '$eq': requestObj.username } });
                if (exitUserCart) {
                    cartCollections.findAndUpdate({ 'item_id': { '$eq': requestObj.item_id }, 'username': { '$eq': requestObj.username } },
                        (cart: Carts) => {
                            cart.quantity = requestObj.quantity;
                        }
                    );
                    itemCollections.findAndUpdate({ 'item_id': { '$eq': requestObj.item_id } },
                        (item: Items) => {
                            item.inventory = item.inventory - requestObj.quantity;
                        }
                    );
                    return res.status(200).json({ message: 'Cart Item Updated Successfully!!' });
                }
                else {
                    const data = carts.insertOne(requestObj);
                    itemCollections.findAndUpdate({ 'item_id': { '$eq': requestObj.item_id } },
                        (item: Items) => {
                            item.inventory = item.inventory - requestObj.quantity;
                        }
                    );
                    return res.json({ message: 'Cart Item Inserted Successfully!!', data: data });
                }
            }
            else {
                return res.status(400).json({ message: 'Item Not Available in Inventory!!' });
            }
        }
        else {
            return res.status(400).json({ message: 'Item Not Found!!' });
        }
    } catch (error) {
        return res.status(500).send({ Error: error });
    }
};

export const removeItem = async (req: Request, res: Response) => {
    try {
        const requestObj: Carts = req.body;

        // Validate request
        if (!requestObj.username || !requestObj.item_id) {
            res.status(400).send({
                message: "Content can not be empty!"
            });
            return;
        }

        //Check user cart exit or not
        const cartCollections: Collection<Carts> =
            lokiDB.getCollection<Carts>('carts');
        const exitUserCart: (LokiObj & Carts) | null = cartCollections.findOne({ 'username': { '$eq': requestObj.username } });
        if (exitUserCart) {
            const exitItem: (LokiObj & Carts) | null = cartCollections.findOne({ 'item_id': { '$eq': requestObj.item_id }, 'username': { '$eq': requestObj.username } });
            if (exitItem) {
                const result = cartCollections.findAndRemove({ 'item_id': { '$eq': requestObj.item_id }, 'username': { '$eq': requestObj.username } });
                //update inventory
                const itemCollections: Collection<Items> =
                    lokiDB.getCollection<Items>('items');
                const item: (LokiObj & Items) | null = itemCollections.findOne({ 'item_id': { '$eq': requestObj.item_id } });
                itemCollections.findAndUpdate({ 'item_id': { '$eq': requestObj.item_id } },
                    (item: Items) => {
                        item.inventory = item.inventory + exitItem.quantity;
                    }
                );

                return res.status(200).json({ message: 'Removed Cart Item Successfully!!' });
            }
            else {
                return res.status(400).json({ message: 'item is not exit in the cart for' + requestObj.username });
            }
        }
        else {
            return res.status(400).json({ message: 'there is no cart for the ' + requestObj.username });
        }
    } catch (error) {
        return res.status(500).send({ Error: error });
    }
};

