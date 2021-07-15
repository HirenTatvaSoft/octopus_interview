import express from 'express';
import { updateInventoryByID, getInventory } from '../controllers/inventory.controller';


const router = express.Router();
router.put('/update', updateInventoryByID);
router.post('/get', getInventory);
export default router;