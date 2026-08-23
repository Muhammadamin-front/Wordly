import { Slot } from "expo-router";

import { Protected } from "@/components/protected";

export default function BillingLayout() {
  return <Protected><Slot /></Protected>;
}
