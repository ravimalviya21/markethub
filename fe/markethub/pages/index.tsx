import { useEffect } from "react";
import { useRouter } from "next/router";

import { getAccessToken } from "@/config/axios";
import { getDashboardForRole, getRoleFromToken } from "@/utils/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const role = getRoleFromToken(getAccessToken());
    router.replace(role ? getDashboardForRole(role) : "/auth/login");
  }, [router]);

  return null;
}
