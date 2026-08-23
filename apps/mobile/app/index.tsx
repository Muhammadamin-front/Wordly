import { Redirect } from "expo-router";
import { Loader, Screen } from "@/components/ui";
import { useAuth } from "@/providers/auth-provider";
export default function Index() { const { ready, user } = useAuth(); if (!ready) return <Screen scroll={false}><Loader/></Screen>; return <Redirect href={user ? (user.profile.onboarding_completed ? "/(tabs)" : "/onboarding") : "/(auth)"} />; }
