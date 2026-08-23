import { Slot } from "expo-router";

import { Protected } from "@/components/protected";

export default function GamesLayout() {
  return <Protected><Slot /></Protected>;
}
