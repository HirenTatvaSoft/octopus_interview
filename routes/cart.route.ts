
import express from 'express';
import {addItem,removeItem} from '../controllers/cart.controller';

const router = express.Router();
router.post('/add',addItem);
router.delete('/remove',removeItem);
export default router;