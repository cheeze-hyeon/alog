export interface Customer {
  id: number;
  created_at: Date | string;
  name: string | null;
  phone: string | null;
  kakao_id: string | null;
  gender: string | null; // USER-DEFINED type
  birth_date: Date | string | null;
}
