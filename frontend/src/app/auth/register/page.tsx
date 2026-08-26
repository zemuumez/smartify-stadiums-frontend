"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/register/owner");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f3ef]">
      <div className="w-8 h-8 border-3 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
    </div>
  );
}
