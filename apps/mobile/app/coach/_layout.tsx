import { Slot } from "expo-router";

import { Protected } from "@/components/protected";

export default function CoachLayout() {
  return <Protected><Slot /></Protected>;
}
