import { Slot } from "expo-router";
import { Protected } from "@/components/protected";
export default function OnboardingLayout() { return <Protected requireOnboarding={false} redirectIfOnboarded><Slot /></Protected>; }
