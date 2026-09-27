import { Suspense } from "react";
import SuccessDonation from "@/features/Alumni/SuccessDonation";

export default function Page() {
  return (
    <Suspense>
      <SuccessDonation />
    </Suspense>
  );
}
