export type ReceiptItem = {
  id: number;
  receipt_id: number | null;
  product_id: number | null;
  "purchase_quantity (ml)": number | null;
  "purchase_unit_price (원/ml)": number | null;
  "purchase_carbon_emission_base (kg/ml)": number | null;
  "total_carbon_emission (kg)": number | null;
  // 호환성을 위한 별칭 (실제 컬럼명은 위와 같음)
  purchase_quantity_ml?: number | null;
  purchase_unit_price_원_per_ml?: number | null;
  purchase_carbon_emission_base_kg_per_ml?: number | null;
  total_carbon_emission_kg?: number | null;
};

export type Receipt = {
  id: number;
  customer_id: number | null;
  visit_date: Date | string | null;
  total_amount: number | null;
};
