import { Slot } from "expo-router";

import { Protected } from "@/components/protected";

export default function ClassesLayout() {
  return <Protected><Slot /></Protected>;
}
