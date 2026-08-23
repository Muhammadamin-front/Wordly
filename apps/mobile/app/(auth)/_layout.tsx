import { Slot } from "expo-router";
import { GuestOnly } from "@/components/protected";
export default function AuthLayout() { return <GuestOnly><Slot /></GuestOnly>; }
