import Decimal from "decimal.js";

export interface Entry {
  name: string;
  quantity: string;
  vat: string;
  vatTotal: Decimal;
  total: Decimal;
}

export interface Invoice {
  month: number;
  year: number;
  quantityTotal: Decimal;
  vat: string;
  vatTotal: Decimal;
  services: Entry;
  products: Entry;
  total: Decimal;
}
