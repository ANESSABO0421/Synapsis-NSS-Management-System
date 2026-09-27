import { Suspense } from "react";
import VerifyOtp from "@/features/VerifyOtp";

export default function Page() {
  return (
    <Suspense>
      <VerifyOtp />
    </Suspense>
  );
}
