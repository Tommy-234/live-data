export type CreateOrderInput = {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price: number;
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP_LOSS = 'STOP_LOSS',
  STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
  TAKE_PROFIT = 'TAKE_PROFIT',
  TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
  LIMIT_MAKER = 'LIMIT_MAKER'
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}
