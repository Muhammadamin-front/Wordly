import { Slot } from "expo-router";

import { Protected } from "@/components/protected";

export default function PublicProfileLayout() {
  return <Protected><Slot /></Protected>;
}
