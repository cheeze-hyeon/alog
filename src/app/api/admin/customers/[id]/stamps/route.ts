import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id, 10);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
    }

    const body = await request.json();
    const { stampCount } = body;

    if (typeof stampCount !== 'number' || stampCount < 0) {
      return NextResponse.json({ error: "Invalid stamp count" }, { status: 400 });
    }

    // TODO: customer_stamps 테이블이 있으면 업데이트, 없으면 생성
    // 현재는 임시로 성공 응답만 반환
    // 추후 customer_stamps 테이블 생성 후 아래 코드 활성화:
    /*
    const { data, error } = await supabaseServerClient
      .from("customer_stamps")
      .upsert({
        customer_id: customerId,
        stamp_count: stampCount,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "도장 개수 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    */

    return NextResponse.json({ success: true, stampCount });
  } catch (error) {
    console.error("Error updating stamp count:", error);
    return NextResponse.json(
      { error: "도장 개수 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

