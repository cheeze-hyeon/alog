import UsersClient from './UsersClient'
import { supabaseServerClient } from '@/lib/supabase-client'
import type { Customer } from '@/types/customer'

// 동적 렌더링 강제 (실시간 데이터를 위해)
export const dynamic = 'force-dynamic'

async function getCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabaseServerClient
      .from("customer")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return [];
    }

    return data as Customer[];
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

export default async function UsersPage() {
  const customers = await getCustomers()

  return <UsersClient initialCustomers={customers} />
}
