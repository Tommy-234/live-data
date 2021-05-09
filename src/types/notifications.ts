export enum Operator {
  GREATER_THAN = 'GreaterThan',
  LESS_THAN = 'LessThan'
}

export type MarketCondition = {
  dataPath: string;
  operator: Operator;
  value: number;
}

export type MarketNotification = {
  conditions: MarketCondition[];
  callback: () => void;
}