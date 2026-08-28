import { Ionicons } from "@expo/vector-icons";
import { createContext, useContext, useRef, type ComponentProps, type ReactNode, type RefObject } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { AppBottomNav, AppHeader, BOTTOM_NAV_HEIGHT } from "@/components/app-header";
import { colors, fonts } from "@/theme/tokens";

export { Brand } from "@/components/app-header";

const ScreenScrollContext = createContext<RefObject<ScrollView | null> | null>(null);
export function useScreenScroll() { return useContext(ScreenScrollContext); }

export const Icon = (props: ComponentProps<typeof Ionicons>) => <Ionicons color={colors.ink} size={21} {...props} />;
export function Screen({ children, scroll = true, appHeader = false, appFooter = false, refreshing = false, onRefresh }: { children: ReactNode; scroll?: boolean; appHeader?: boolean; appFooter?: boolean; refreshing?: boolean; onRefresh?: () => void }) {
  const scrollRef = useRef<ScrollView>(null);
  const content = <View style={styles.content}>{children}</View>;
  const body = scroll ? (
    <ScreenScrollContext.Provider value={scrollRef}>
      <ScrollView
        ref={scrollRef}
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        contentContainerStyle={styles.scroll}
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.rust} colors={[colors.rust]} /> : undefined}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {content}
      </ScrollView>
    </ScreenScrollContext.Provider>
  ) : content;
  const edges: Edge[] = appHeader
    ? appFooter ? ["left", "right"] : ["left", "right", "bottom"]
    : appFooter ? ["top", "left", "right"] : ["top", "left", "right", "bottom"];

  return (
    <View style={styles.safe}>
      {appHeader ? <AppHeader /> : null}
      <SafeAreaView style={styles.flex} edges={edges}>
        {scroll ? body : <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>{body}</KeyboardAvoidingView>}
        {appFooter ? <AppBottomNav /> : null}
      </SafeAreaView>
    </View>
  );
}
export function BackButton({ label, onPress }: { label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}><Icon name="arrow-back" color={colors.brown}/><Text style={styles.backText}>{label}</Text></Pressable>; }
export function Heading({ children, sub }: { children: string; sub?: string }) { return <View style={styles.heading}><Text accessibilityRole="header" style={styles.h1}>{children}</Text>{sub ? <Text style={styles.sub}>{sub}</Text> : null}</View>; }
export function Stamp({ children, tone = "rust" }: { children: string; tone?: "rust" | "teal" | "ink" }) { return <View style={[styles.stamp, tone === "teal" && styles.tealStamp, tone === "ink" && styles.inkStamp]}><Text style={styles.stampText}>{children}</Text></View>; }
export function Button({ children, onPress, variant = "primary", disabled = false, loading = false, icon }: { children: string; onPress: () => void; variant?: "primary" | "secondary" | "quiet" | "danger"; disabled?: boolean; loading?: boolean; icon?: ComponentProps<typeof Ionicons>["name"] }) { const lightContent = variant === "primary" || variant === "danger"; return <Pressable accessibilityRole="button" accessibilityLabel={children} accessibilityState={{ disabled: disabled || loading, busy: loading }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, variant === "secondary" && styles.secondary, variant === "quiet" && styles.quiet, variant === "danger" && styles.danger, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>{loading ? <ActivityIndicator accessibilityLabel={children} color={lightContent ? colors.raised : colors.ink}/> : icon ? <Icon name={icon} color={lightContent ? colors.raised : colors.ink} /> : null}<Text style={[styles.buttonText, !lightContent && styles.darkText]}>{children}</Text></Pressable>; }
export function Field({ label, style, ...props }: { label: string } & ComponentProps<typeof TextInput>) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={props.accessibilityLabel ?? label} placeholderTextColor={colors.muted} {...props} style={[styles.input, style]}/></View>; }
export function Paper({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) { return <View style={[styles.paper, style]}>{children}</View>; }
export function ErrorNote({ message }: { message?: string | null }) { return message ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null; }
export function Loader({ label = "Loading" }: { label?: string }) { return <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityLiveRegion="polite" style={styles.loader}><ActivityIndicator importantForAccessibility="no" color={colors.rust}/><Text style={styles.loaderText}>{label}</Text></View>; }
export function ErrorState({ title, body, retryLabel, onRetry, appHeader = false }: { title: string; body: string; retryLabel: string; onRetry: () => void; appHeader?: boolean }) { return <Screen appHeader={appHeader}><Heading>{title}</Heading><Paper><Text style={styles.statusBody}>{body}</Text></Paper><Button icon="refresh" onPress={onRetry}>{retryLabel}</Button></Screen>; }

const buttonShadow = Platform.select({
  web: { boxShadow: "4px 5px 0 rgba(84, 37, 15, 0.75)" },
  default: { shadowColor: colors.brown, shadowOpacity: 0.75, shadowRadius: 0, shadowOffset: { width: 4, height: 5 }, elevation: 4 },
});
const secondaryButtonShadow = Platform.select({
  web: { boxShadow: "4px 5px 0 rgba(84, 37, 15, 0.20)" },
  default: { shadowOpacity: 0.2 },
});
const dangerButtonShadow = Platform.select({
  web: { boxShadow: "4px 5px 0 rgba(84, 37, 15, 0.35)" },
  default: { shadowOpacity: 0.35 },
});
const quietButtonShadow = Platform.select({ web: { boxShadow: "none" }, default: { shadowOpacity: 0, elevation: 0 } });
const pressedButtonShadow = Platform.select({ web: { boxShadow: "2px 3px 0 rgba(84, 37, 15, 0.75)" }, default: { shadowOffset: { width: 2, height: 3 } } });
const paperShadow = Platform.select({
  web: { boxShadow: "4px 5px 0 rgba(84, 37, 15, 0.17)" },
  default: { shadowColor: colors.brown, shadowOpacity: 0.17, shadowRadius: 0, shadowOffset: { width: 4, height: 5 }, elevation: 3 },
});
export const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.paper},flex:{flex:1},scroll:{paddingBottom:BOTTOM_NAV_HEIGHT+42},content:{flex:1,width:"100%",maxWidth:760,alignSelf:"center",paddingTop:10,paddingHorizontal:20,gap:18},backButton:{alignSelf:"flex-start",minHeight:48,flexDirection:"row",alignItems:"center",gap:7,paddingRight:12},backPressed:{opacity:.65},backText:{fontFamily:fonts.uiBold,color:colors.rustDark,fontSize:13},heading:{gap:8},h1:{fontFamily:fonts.display,fontSize:32,lineHeight:36,letterSpacing:.4,color:colors.ink,textTransform:"uppercase"},sub:{fontFamily:fonts.uiMedium,fontSize:14,lineHeight:22,color:colors.muted},stamp:{alignSelf:"flex-start",borderWidth:1,borderColor:colors.brand600,borderRadius:7,paddingHorizontal:9,paddingVertical:6,backgroundColor:"rgba(185,78,40,0.10)"},tealStamp:{borderColor:colors.teal,backgroundColor:"rgba(70,120,120,0.10)"},inkStamp:{borderColor:colors.ink,backgroundColor:colors.cream},stampText:{fontFamily:fonts.uiBold,fontSize:10,letterSpacing:.8,color:colors.ink,textTransform:"uppercase"},button:{minHeight:50,borderRadius:12,borderWidth:1,borderColor:colors.brand950,backgroundColor:colors.brand600,alignItems:"center",justifyContent:"center",flexDirection:"row",gap:8,paddingHorizontal:18,...buttonShadow},secondary:{backgroundColor:colors.raised,...secondaryButtonShadow},quiet:{backgroundColor:"transparent",borderWidth:0,...quietButtonShadow},danger:{backgroundColor:colors.danger,borderColor:colors.danger,...dangerButtonShadow},buttonText:{flexShrink:1,fontFamily:fonts.uiBold,color: colors.onAccent,fontSize:14,textAlign:"center"},darkText:{color:colors.ink},disabled:{opacity:.55},pressed:{transform:[{translateX:1},{translateY:1}],...pressedButtonShadow},field:{gap:7},label:{fontFamily:fonts.uiMedium,fontSize:12,color:colors.muted},input:{minHeight:52,borderWidth:1.5,borderColor:colors.line,borderRadius:12,paddingHorizontal:14,fontFamily:fonts.ui,fontSize:16,color:colors.ink,backgroundColor:colors.raised},paper:{backgroundColor:colors.cream,borderWidth:1.5,borderColor:colors.line,borderRadius:14,padding:16,...paperShadow},error:{fontFamily:fonts.uiMedium,color:colors.danger,fontSize:13,lineHeight:19},loader:{flex:1,alignItems:"center",justifyContent:"center",gap:10,padding:32},loaderText:{fontFamily:fonts.uiMedium,color:colors.muted,fontSize:13},statusBody:{fontFamily:fonts.ui,color:colors.muted,fontSize:15,lineHeight:23}
});
