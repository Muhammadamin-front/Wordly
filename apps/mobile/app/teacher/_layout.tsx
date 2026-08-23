import { Slot } from "expo-router";

import { Protected } from "@/components/protected";

export default function TeacherLayout() {
  return <Protected><Slot /></Protected>;
}
