import { Slot } from "expo-router";

import { Protected } from "@/components/protected";

export default function MultiplayerLayout() {
  return <Protected><Slot /></Protected>;
}
