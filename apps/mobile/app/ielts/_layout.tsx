import { Slot } from "expo-router";

import { Protected } from "@/components/protected";

export default function IeltsLayout() {
  return <Protected><Slot /></Protected>;
}
