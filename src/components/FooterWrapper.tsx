"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

// Footer를 숨길 경로 목록
const HIDE_FOOTER_PATHS = [
  "/pos",
  "/pos/checkout",
  "/pos/customer",
  "/login",
  "/admin",
  "/term",
  "/privacy",
];

export default function FooterWrapper() {
  const pathname = usePathname();

  // 현재 경로가 숨김 목록에 포함되어 있는지 확인
  const shouldHideFooter = HIDE_FOOTER_PATHS.some((path) => {
    // 정확히 일치하거나 해당 경로로 시작하는지 확인
    return pathname === path || pathname.startsWith(path + "/");
  });

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}

