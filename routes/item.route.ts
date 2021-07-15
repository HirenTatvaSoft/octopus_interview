
import express from 'express';
import {setItems} from '../controllers/item.controller';

const router = express.Router();
router.post('/set', setItems);
export default router;