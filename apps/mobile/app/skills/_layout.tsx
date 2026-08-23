import { Slot } from "expo-router";

import { Protected } from "@/components/protected";

export default function SkillsLayout() {
  return <Protected><Slot /></Protected>;
}
