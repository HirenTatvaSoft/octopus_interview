export interface Items {
  item_id: string;
  price: number;
  inventory: number;
}

export interface AddItemRequest extends Items {
  username: string;
}

export interface UpdateInventoryRequest extends AddItemRequest {
  add?: number;
  amount?: number;
}

export interface GetInventoryRequest {
  username: string;
  items?: Items[]
}

export interface Carts {
  username:string;
  item_id: string;
  quantity:number;
}