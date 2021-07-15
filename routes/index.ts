import express from 'express';
import itemRoute from './item.route';
import inventoryRoute from './inventory.route';
import cartRoute from './cart.route';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/item',
    route: itemRoute,
  },
  {
    path: '/inventory',
    route: inventoryRoute,
  },
  {
    path: '/cart',
    route: cartRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
