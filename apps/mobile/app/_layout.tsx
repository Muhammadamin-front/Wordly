import * as WebBrowser from "expo-web-browser";
import { Stack } from "expo-router";
import { AppShell } from "@/components/app-shell";
WebBrowser.maybeCompleteAuthSession();
export default function RootLayout() { return <AppShell><Stack screenOptions={{ headerShown:false, animation:"fade" }} /></AppShell>; }
