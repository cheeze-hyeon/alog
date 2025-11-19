export type ReceiptItem = {
  id: number; 
  receipt_id: number;
  product_id: number;
  purchase_quantity: number;
  purchase_unit_price: number;
  purchase_carbon_emission_base: number;
  total_carbon_emission: number;
};

export type Receipt = {
  id: number;
  customer_id: number | null;
  visit_date: Date | string | null;
  total_amount: number | null;
};
