import { Slot } from "expo-router";
import { Protected } from "@/components/protected";
export default function LibraryLayout() { return <Protected><Slot /></Protected>; }
