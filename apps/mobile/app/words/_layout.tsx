import { Slot } from "expo-router";
import { Protected } from "@/components/protected";
export default function WordsLayout() { return <Protected><Slot /></Protected>; }
