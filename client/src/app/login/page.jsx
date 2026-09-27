import { Suspense } from "react";
import Login from "@/features/Login/Login";

export default function Page() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
