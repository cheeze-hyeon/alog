import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase-client";

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const { error } = await supabaseServerClient
      .from("product")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "상품 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "상품 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

