import { Response, Request } from 'express';

import { Items, AddItemRequest } from '../models/models';
import { items, lokiDB } from '../utils/database';

export const setItems = async (req: Request, res: Response) => {
  try {
    const itemObj: AddItemRequest = req.body;
    // Validate request
    if (!itemObj.username || !itemObj.item_id || !itemObj.price) {
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
    const item: (LokiObj & Items) | null = itemCollections.findOne({
      item_id: { $eq: itemObj.item_id },
    });

    if (item) {
      const requestBody: Items = req.body;
      itemCollections.findAndUpdate(
        { item_id: { $eq: itemObj.item_id } },
        (item: Items) => {
          item.price = requestBody.price
        }
      );
      return res.status(200).json({ message: 'Item Price Updated Successfully!!' });
    }
    else {
      itemObj.inventory = 0;
      const data: (Items & LokiObj) | undefined = items.insertOne(itemObj);
      return res.status(200).json({ message: 'Item Inserted Successfully!!', data: data });
    }
  } catch (error) {
    return res.status(500).send({ Error: error });
  }
};
