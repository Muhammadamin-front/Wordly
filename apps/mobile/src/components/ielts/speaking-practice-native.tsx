import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, Vibration, View } from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

import {
  SPEAKING_PRACTICE_TOPICS,
  sampleAnswer,
  speakingTopicsByPart,
  type SpeakingPart,
  type SpeakingTopic,
} from "@/ielts/speaking/speaking-practice";
import type { Locale } from "@/i18n";
import { colors, fonts } from "@/theme/tokens";

type Rating = "needs-work" | "good" | "strong";
type WheelPick = { topic: SpeakingTopic; question: string };

const WHEEL_SEGMENTS = 8;
const TICK_WAV = "data:audio/wav;base64,UklGRmQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUABAACAm6mjjXBbWGiDnaihiW5bWmuGnqeehmxbXG6Jn6abg2pbX3KMoKWYgGhcYXWOoKOVfWddZHiQoKGSe2ZeZnuSoJ+PeGVfaX2ToJ2MdmVkcYWWnZaEcWVmc4eXnJOCcGZodoiXmpGAb2ZqeIqXmY9+bmdseouWl418bmhufIyWlYp7bmpwfo2Vk4h5bmtygI6UkoZ4bmx0go6TkIV3bm52g46SjoN3b3B4hI6RjIF2cHF6hY6QioB2cXN7ho2OiX92cnV9ho2Nh352c3Z+h4yMhn12dHh/h4uKhH13dXmAh4qJg3x3d3qBhomHgnx4eHyBhoiGgXx5eX2ChoeFgXx6e36ChYWDgH17fH+ChISCgH18fX+Cg4OCgH59foCBgoKBgH9/f4CBgYGAgICAgA==";

function sampleTopics(topics: SpeakingTopic[], count: number) {
  const copy = [...topics];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

const copy = {
  uz: { eyebrow: "IELTS Speaking amaliyoti", title: "Haqiqiy IELTS mavzularida aniq gapiring.", intro: "Part 1, Part 2 cue cardlar va Part 3 muhokama savollari o'zbek o'quvchilari uchun: lug'at, iboralar, namuna javoblar, xatolar va amaliy maslahatlar bitta oqimda.", completed: "Tugatilgan mavzular", progressHint: "Savollarni mashq qilib, lug'atni ko'rib chiqqach mavzuni yakunlang.", random: "Tasodifiy savol", randomHint: "Imtihondagidek — savolni oldindan bilmaysiz. Aylantiring va darhol javob berishga urining.", spin: "Aylantirish", spinAgain: "Yana aylantirish", open: "Mavzuni ochish", mute: "Tovushni o'chirish", sound: "Tovushni yoqish", questions: "{count} ta savol", cueBadge: "cue card + taymer", back: "Mavzularga qaytish", save: "Saqlash", saved: "Saqlandi", complete: "Yakunlash", done: "Yakunlandi", question: "Savol {current} / {total}", speakFor: "25–40 soniya gapiring", answerShape: "Tabiiy javob bering: to'g'ridan-to'g'ri javob → sabab → misol → qisqa yakuniy fikr.", previous: "Oldingi", next: "Keyingi", showSample: "Namuna javobni ko'rsatish", hideSample: "Namuna javobni yashirish", model: "Namuna javob", study: "Tuzilmani o'rganing — yodlamang", vocabulary: "Foydali lug'at", phrases: "Foydali iboralar", starting: "Boshlash", extending: "Kengaytirish", concluding: "Yakunlash", tips: "Speaking maslahatlari", mistakes: "Keng tarqalgan xatolar", cueInstruction: "Cue card topshirig'i", shouldSay: "Quyidagilarni aytishingiz kerak:", followUps: "Qo'shimcha savollar", planning: "Tayyorgarlik eslatmalari", planningHint: "Bular imtihon savollari emas — bir daqiqalik tayyorgarlik uchun ishlating.", timer: "Part 2 taymeri", ready: "Tayyor", preparation: "Tayyorgarlik", speaking: "Gapirish", finished: "Tugadi", prepare: "tayyorlaning", speak: "gapiring", timerHint: "Bir daqiqa reja tuzing, so'ng ikki daqiqa gapiring.", startPrep: "Tayyorgarlikni boshlash", pause: "Pauza", resume: "Davom etish", reset: "Qayta boshlash", finish: "Tugatish", rate: "Urinishingizni baholang", needsWork: "Mashq kerak", good: "Yaxshi", strong: "Kuchli" },
  ru: { eyebrow: "Практика IELTS Speaking", title: "Говорите уверенно на реальных темах IELTS.", intro: "Part 1, cue cards Part 2 и вопросы Part 3: лексика, фразы, модели, ошибки и советы в одном потоке.", completed: "Завершённые темы", progressHint: "Практикуйте вопросы, изучайте лексику и завершайте тему.", random: "Случайный вопрос", randomHint: "Как на экзамене: прокрутите колесо и ответьте сразу.", spin: "Крутить", spinAgain: "Ещё раз", open: "Открыть тему", mute: "Выключить звук", sound: "Включить звук", questions: "{count} вопросов", cueBadge: "cue card + таймер", back: "К темам", save: "Сохранить", saved: "Сохранено", complete: "Завершить", done: "Завершено", question: "Вопрос {current} / {total}", speakFor: "говорите 25–40 секунд", answerShape: "Ответ → причина → пример → короткий вывод.", previous: "Назад", next: "Далее", showSample: "Показать пример", hideSample: "Скрыть пример", model: "Пример ответа", study: "Изучайте структуру — не заучивайте", vocabulary: "Полезная лексика", phrases: "Полезные фразы", starting: "Начало", extending: "Развитие", concluding: "Вывод", tips: "Советы", mistakes: "Частые ошибки", cueInstruction: "Задание cue card", shouldSay: "Вам следует сказать:", followUps: "Дополнительные вопросы", planning: "Заметки для подготовки", planningHint: "Это не вопросы экзамена, а подсказки для минуты подготовки.", timer: "Таймер Part 2", ready: "Готово", preparation: "Подготовка", speaking: "Ответ", finished: "Готово", prepare: "готовьтесь", speak: "говорите", timerHint: "Одна минута на план, затем две минуты ответа.", startPrep: "Начать подготовку", pause: "Пауза", resume: "Продолжить", reset: "Сбросить", finish: "Закончить", rate: "Оцените попытку", needsWork: "Нужна практика", good: "Хорошо", strong: "Сильно" },
  en: { eyebrow: "IELTS Speaking practice", title: "Speak clearly on real IELTS topics.", intro: "Part 1, Part 2 cue cards, and Part 3 discussion questions with vocabulary, phrases, models, mistakes, and practical coaching.", completed: "Completed topics", progressHint: "Practise the questions, review the vocabulary, then complete the topic.", random: "Random question", randomHint: "Just like the exam: spin and respond without knowing the question first.", spin: "Spin", spinAgain: "Spin again", open: "Open topic", mute: "Mute sound", sound: "Turn sound on", questions: "{count} questions", cueBadge: "cue card + timer", back: "Back to topics", save: "Save", saved: "Saved", complete: "Complete", done: "Completed", question: "Question {current} / {total}", speakFor: "speak for 25–40 seconds", answerShape: "Answer naturally: direct answer → reason → example → brief closing thought.", previous: "Previous", next: "Next", showSample: "Show model answer", hideSample: "Hide model answer", model: "Model answer", study: "Study the structure — do not memorise", vocabulary: "Useful vocabulary", phrases: "Useful phrases", starting: "Starting", extending: "Extending", concluding: "Concluding", tips: "Speaking tips", mistakes: "Common mistakes", cueInstruction: "Cue card task", shouldSay: "You should say:", followUps: "Follow-up questions", planning: "Preparation notes", planningHint: "These are not exam questions — use them for your one-minute preparation.", timer: "Part 2 timer", ready: "Ready", preparation: "Preparation", speaking: "Speaking", finished: "Finished", prepare: "prepare", speak: "speak", timerHint: "Plan for one minute, then speak for two minutes.", startPrep: "Start preparation", pause: "Pause", resume: "Resume", reset: "Reset", finish: "Finish", rate: "Rate your attempt", needsWork: "Needs work", good: "Good", strong: "Strong" },
} as const;

const partLabels: Record<SpeakingPart, string> = { part1: "Part 1", part2: "Part 2", part3: "Part 3" };

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

function slicePath(cx: number, cy: number, radius: number, start: number, end: number) {
  const first = polar(cx, cy, radius, end);
  const second = polar(cx, cy, radius, start);
  return `M ${cx} ${cy} L ${first.x} ${first.y} A ${radius} ${radius} 0 0 0 ${second.x} ${second.y} Z`;
}

export function SpeakingPracticeNative({ locale, scope, onBack }: { locale: Locale; scope: string; onBack: () => void }) {
  const t = copy[locale];
  const [activePart, setActivePart] = useState<SpeakingPart>("part1");
  const [selected, setSelected] = useState<SpeakingTopic | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Promise.all([AsyncStorage.getItem(`vocora-speaking-completed:${scope}`), AsyncStorage.getItem(`vocora-speaking-saved:${scope}`)]).then(([done, bookmarks]) => {
      try { setCompleted(done ? JSON.parse(done) as string[] : []); } catch { setCompleted([]); }
      try { setSaved(bookmarks ? JSON.parse(bookmarks) as string[] : []); } catch { setSaved([]); }
      setReady(true);
    });
  }, [scope]);

  const persist = (key: string, value: string[]) => { void AsyncStorage.setItem(`${key}:${scope}`, JSON.stringify(value)); };
  const toggleSaved = (slug: string) => { const next = saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug]; setSaved(next); persist("vocora-speaking-saved", next); };
  const complete = (slug: string) => { if (completed.includes(slug)) return; const next = [...completed, slug]; setCompleted(next); persist("vocora-speaking-completed", next); };

  if (!ready) return <View style={styles.loading}><View style={styles.loadingLine} /><View style={styles.loadingLineSmall} /></View>;
  if (selected) return <ScrollView contentContainerStyle={styles.detailScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}><TopicDetail locale={locale} scope={scope} topic={selected} saved={saved.includes(selected.slug)} completed={completed.includes(selected.slug)} onBack={() => setSelected(null)} onSave={() => toggleSaved(selected.slug)} onComplete={() => complete(selected.slug)} /></ScrollView>;

  const topics = speakingTopicsByPart(activePart);
  return (
    <FlatList
      data={topics}
      keyExtractor={(topic) => topic.slug}
      initialNumToRender={7}
      maxToRenderPerBatch={6}
      updateCellsBatchingPeriod={40}
      windowSize={5}
      removeClippedSubviews={Platform.OS === "android"}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.topicSeparator} />}
      ListHeaderComponent={<View style={styles.listHeader}><BackControl label="IELTS" onPress={onBack} /><View style={styles.hero}><View style={styles.heroLabel}><Ionicons name="mic-outline" size={15} color={colors.rust} /><Text style={styles.heroLabelText}>{t.eyebrow}</Text></View><Text style={styles.heroTitle}>{t.title}</Text><Text style={styles.heroBody}>{t.intro}</Text><View style={styles.progressCard}><View style={styles.progressTop}><View><Text style={styles.progressLabel}>{t.completed}</Text><Text style={styles.progressValue}>{completed.length}<Text style={styles.progressTotal}>/{SPEAKING_PRACTICE_TOPICS.length}</Text></Text></View><View style={styles.target}><Ionicons name="locate-outline" size={22} color={colors.rust} /></View></View><View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${completed.length / SPEAKING_PRACTICE_TOPICS.length * 100}%`}]} /></View><Text style={styles.progressHint}>{t.progressHint}</Text></View></View><View accessibilityRole="tablist" style={styles.tabs}>{(["part1","part2","part3"] as SpeakingPart[]).map((part)=><Pressable key={part} accessibilityRole="tab" accessibilityState={{selected:activePart===part}} onPress={()=>setActivePart(part)} style={[styles.tab,activePart===part&&styles.tabActive]}><Text style={[styles.tabText,activePart===part&&styles.tabTextActive]}>{partLabels[part]}</Text></Pressable>)}</View><QuestionWheel key={activePart} topics={topics} locale={locale} scope={scope} onOpen={setSelected} /></View>}
      renderItem={({item:topic})=><Pressable accessibilityRole="button" accessibilityLabel={topic.title} onPress={()=>setSelected(topic)} style={({pressed})=>[styles.topicCard,pressed&&styles.pressed]}><View style={[styles.topicIcon,completed.includes(topic.slug)&&styles.topicIconDone]}><Ionicons name={completed.includes(topic.slug)?"checkmark":"mic-outline"} size={20} color={completed.includes(topic.slug)?colors.raised:colors.brand600} /></View><View style={styles.topicCopy}><View style={styles.topicTitleRow}><Text style={styles.topicTitle}>{topic.title}</Text>{saved.includes(topic.slug)?<Ionicons name="bookmark" size={15} color={colors.teal}/>:null}</View><Text style={styles.topicBody}>{topic.description}</Text><Text style={styles.topicBadge}>{topic.part==="part2"?t.cueBadge:t.questions.replace("{count}",String(topic.questions.length))}</Text></View><Ionicons name="chevron-forward" size={19} color={colors.muted}/></Pressable>}
    />
  );
}

function QuestionWheel({topics,locale,scope,onOpen}:{topics:SpeakingTopic[];locale:Locale;scope:string;onOpen:(topic:SpeakingTopic)=>void}){
  const t = copy[locale];
  const { width } = useWindowDimensions();
  const wheelSize = Math.max(238, Math.min(286, width - 82));
  const [wheelTopics, setWheelTopics] = useState(() => sampleTopics(topics, WHEEL_SEGMENTS));
  const [result, setResult] = useState<WheelPick | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);
  const tickPlayer = useAudioPlayer(TICK_WAV, { updateInterval: 250 });

  useEffect(() => {
    void Promise.all([
      AsyncStorage.getItem(`vocora-speaking-wheel-sound:${scope}`),
      AccessibilityInfo.isReduceMotionEnabled(),
    ]).then(([storedSound, reduced]) => {
      setSoundOn(storedSound !== "0");
      setReduceMotion(reduced);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, [scope]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    void AsyncStorage.setItem(`vocora-speaking-wheel-sound:${scope}`, next ? "1" : "0");
  };

  const tick = () => {
    if (!soundOn || reduceMotion) return;
    void tickPlayer.seekTo(0).then(() => tickPlayer.play()).catch(() => undefined);
    Vibration.vibrate(8);
  };

  const spin = () => {
    if (spinning || !topics.length) return;
    const next = sampleTopics(topics, WHEEL_SEGMENTS);
    const winner = Math.floor(Math.random() * next.length);
    const question = next[winner].questions[Math.floor(Math.random() * next[winner].questions.length)];
    const step = 360 / next.length;
    const from = currentRotation.current;
    const normalised = ((from % 360) + 360) % 360;
    const target = from + 360 * (reduceMotion ? 1 : 4) + (360 - normalised) - winner * step;
    let lastBoundary = Math.floor(from / step);
    let lastTickAt = 0;

    setWheelTopics(next);
    setResult(null);
    setSpinning(true);
    const listener = rotation.addListener(({ value }) => {
      const boundary = Math.floor(value / step);
      const now = Date.now();
      if (boundary !== lastBoundary && now - lastTickAt > 55) {
        tick();
        lastBoundary = boundary;
        lastTickAt = now;
      }
    });
    Animated.timing(rotation, {
      toValue: target,
      duration: reduceMotion ? 500 : 4200,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    }).start(({ finished }) => {
      rotation.removeListener(listener);
      currentRotation.current = target;
      setSpinning(false);
      if (finished) {
        setResult({ topic: next[winner], question });
        if (!reduceMotion && soundOn) Vibration.vibrate(18);
      }
    });
  };

  const rotate = rotation.interpolate({ inputRange: [-100000, 100000], outputRange: ["-100000deg", "100000deg"] });
  const step = 360 / wheelTopics.length;
  return <View style={styles.wheelCard}><View style={styles.wheelHeading}><View style={styles.wheelHeadingCopy}><Text style={styles.sectionLabel}>{t.random}</Text><Text style={styles.wheelHint}>{t.randomHint}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={soundOn?t.mute:t.sound} accessibilityState={{checked:soundOn}} onPress={toggleSound} style={styles.soundButton}><Ionicons name={soundOn?"volume-high-outline":"volume-mute-outline"} size={18} color={colors.ink}/></Pressable></View><View style={[styles.wheelWrap,{width:wheelSize,height:wheelSize}]}><View pointerEvents="none" style={styles.wheelPointer}/><Animated.View style={{transform:[{rotate}]}}><Svg width={wheelSize} height={wheelSize} viewBox="0 0 270 270"><G>{wheelTopics.map((topic,index)=>{const start=index*step-step/2,end=start+step,mid=index*step,pos=polar(135,135,91,mid);const angle=((mid%360)+360)%360;const flipped=angle>=90&&angle<=270;return <G key={`${topic.slug}-${index}`}><Path d={slicePath(135,135,126,start,end)} fill={index%2?colors.brown:colors.rust} stroke={colors.ink} strokeWidth={2}/><SvgText x={pos.x} y={pos.y+3} fill={colors.raised} fontSize="8" fontWeight="700" textAnchor="middle" transform={`rotate(${mid+(flipped?180:0)} ${pos.x} ${pos.y})`}>{topic.title.length>14?`${topic.title.slice(0,13)}…`:topic.title}</SvgText></G>})}<Path d="M 135 107 A 28 28 0 1 0 135.1 107" fill={colors.raised} stroke={colors.ink} strokeWidth={3}/></G></Svg></Animated.View></View>{result?<View accessibilityLiveRegion="polite" style={styles.wheelResult}><Text style={styles.wheelResultLabel}>{partLabels[result.topic.part]} · {result.topic.title}</Text><Text style={styles.wheelResultQuestion}>{result.question}</Text><Pressable accessibilityRole="button" onPress={()=>onOpen(result.topic)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>{t.open}</Text><Ionicons name="arrow-forward" size={16} color={colors.ink}/></Pressable></View>:null}<Pressable accessibilityRole="button" disabled={spinning} onPress={spin} style={({pressed})=>[styles.primaryButton,(pressed||spinning)&&styles.pressed]}><Ionicons name="sync" size={17} color={colors.raised}/><Text style={styles.primaryButtonText}>{result?t.spinAgain:t.spin}</Text></Pressable></View>;
}

function TopicDetail({locale,scope,topic,saved,completed,onBack,onSave,onComplete}:{locale:Locale;scope:string;topic:SpeakingTopic;saved:boolean;completed:boolean;onBack:()=>void;onSave:()=>void;onComplete:()=>void}){
  const t=copy[locale]; const [index,setIndex]=useState(0); const [furthest,setFurthest]=useState(0); const [showSample,setShowSample]=useState(false); const [rating,setRating]=useState<Rating|null>(null); const question=topic.questions[index]; const canComplete=topic.cueCard?rating!==null:furthest>=topic.questions.length-1;
  useEffect(()=>{void AsyncStorage.getItem(`vocora-speaking-rating:${topic.slug}:${scope}`).then(value=>{if(value==="needs-work"||value==="good"||value==="strong")setRating(value);});},[scope,topic.slug]);
  const rate=(value:Rating)=>{setRating(value);void AsyncStorage.setItem(`vocora-speaking-rating:${topic.slug}:${scope}`,value);};
  const go=(next:number)=>{setIndex(next);setFurthest(v=>Math.max(v,next));setShowSample(false);};
  return <View style={styles.page}><BackControl label={t.back} onPress={onBack}/><View style={styles.detailHero}><Text style={styles.partStamp}>{partLabels[topic.part]}</Text><Text style={styles.detailTitle}>{topic.title}</Text><Text style={styles.detailBody}>{topic.description}</Text><View style={styles.detailActions}><Pressable accessibilityRole="button" onPress={onSave} style={styles.secondaryButton}><Ionicons name={saved?"bookmark":"bookmark-outline"} size={16} color={colors.ink}/><Text style={styles.secondaryButtonText}>{saved?t.saved:t.save}</Text></Pressable><Pressable accessibilityRole="button" disabled={completed||!canComplete} onPress={onComplete} style={[styles.primaryButton,(completed||!canComplete)&&styles.disabled]}><Ionicons name="checkmark-circle-outline" size={17} color={colors.raised}/><Text style={styles.primaryButtonText}>{completed?t.done:t.complete}</Text></Pressable></View></View>{topic.cueCard?<CueCard topic={topic} locale={locale} showSample={showSample} onToggleSample={()=>setShowSample(v=>!v)}/>:<QuestionPractice topic={topic} locale={locale} index={index} question={question} showSample={showSample} onToggleSample={()=>setShowSample(v=>!v)} onPrevious={()=>go(Math.max(0,index-1))} onNext={()=>go(Math.min(topic.questions.length-1,index+1))}/>} {topic.part==="part2"?<Part2Timer locale={locale} rating={rating} onRate={rate}/>:null}<Vocabulary topic={topic} locale={locale}/><Info title={t.phrases} icon="sparkles-outline"><Phrase title={t.starting} items={topic.phrases.starting}/><Phrase title={t.extending} items={topic.phrases.extending}/><Phrase title={t.concluding} items={topic.phrases.concluding}/></Info><Info title={t.tips} icon="locate-outline">{topic.tips.map(item=><View key={item} style={styles.bulletRow}><Ionicons name="checkmark-circle-outline" size={16} color={colors.teal}/><Text style={styles.infoText}>{item}</Text></View>)}</Info><Info title={t.mistakes} icon="refresh-outline">{topic.mistakes.map(item=><View key={item} style={styles.bulletRow}><Ionicons name="close-circle-outline" size={16} color={colors.rust}/><Text style={styles.infoText}>{item}</Text></View>)}</Info></View>;
}

function QuestionPractice({topic,locale,index,question,showSample,onToggleSample,onPrevious,onNext}:{topic:SpeakingTopic;locale:Locale;index:number;question:string;showSample:boolean;onToggleSample:()=>void;onPrevious:()=>void;onNext:()=>void}){const t=copy[locale];return <View style={styles.practice}><View style={styles.practiceTop}><Text style={styles.progressLabel}>{t.question.replace("{current}",String(index+1)).replace("{total}",String(topic.questions.length))}</Text><Text style={styles.topicBadge}>{t.speakFor}</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${(index+1)/topic.questions.length*100}%`}]} /></View><View style={styles.questionPanel}><Text style={styles.questionText}>{question}</Text><Text style={styles.answerShape}>{t.answerShape}</Text></View><View style={styles.navRow}><Pressable disabled={index===0} onPress={onPrevious} style={[styles.secondaryButton,index===0&&styles.disabled]}><Ionicons name="arrow-back" size={16} color={colors.ink}/><Text style={styles.secondaryButtonText}>{t.previous}</Text></Pressable><Pressable onPress={onToggleSample} style={styles.quietButton}><Text style={styles.quietText}>{showSample?t.hideSample:t.showSample}</Text></Pressable><Pressable disabled={index===topic.questions.length-1} onPress={onNext} style={[styles.primaryButton,index===topic.questions.length-1&&styles.disabled]}><Text style={styles.primaryButtonText}>{t.next}</Text><Ionicons name="arrow-forward" size={16} color={colors.raised}/></Pressable></View>{showSample?<ModelAnswer text={sampleAnswer(topic,question)} locale={locale}/>:null}</View>}

function CueCard({topic,locale,showSample,onToggleSample}:{topic:SpeakingTopic;locale:Locale;showSample:boolean;onToggleSample:()=>void}){const t=copy[locale],cue=topic.cueCard;if(!cue)return null;return <View style={styles.practice}><Text style={styles.sectionLabel}>{t.cueInstruction}</Text><Text style={styles.cueTitle}>{cue.instruction}</Text><View style={styles.cueBox}><Text style={styles.cardTitle}>{t.shouldSay}</Text>{cue.prompts.map(item=><View key={item} style={styles.bulletRow}><Ionicons name="ellipse" size={7} color={colors.rust}/><Text style={styles.infoText}>{item}</Text></View>)}</View><Text style={styles.sectionLabel}>{t.followUps}</Text>{cue.followUps.map(item=><Text key={item} style={styles.followUp}>{item}</Text>)}{topic.planning?.length?<View><Text style={styles.sectionLabel}>{t.planning}</Text><Text style={styles.sectionBody}>{t.planningHint}</Text>{topic.planning.map(item=><View key={item.question} style={styles.plan}><Text style={styles.cardTitle}>{item.question}</Text><Text style={styles.infoText}>{item.answer}</Text></View>)}</View>:null}<Pressable onPress={onToggleSample} style={styles.quietButton}><Text style={styles.quietText}>{showSample?t.hideSample:t.showSample}</Text></Pressable>{showSample?<ModelAnswer text={sampleAnswer(topic,cue.instruction)} locale={locale}/>:null}</View>}

function ModelAnswer({text,locale}:{text:string;locale:Locale}){const t=copy[locale];return <View style={styles.model}><View style={styles.modelTop}><Text style={styles.sectionLabel}>{t.model}</Text><Text style={styles.modelBadge}>{t.study}</Text></View><Text selectable style={styles.modelText}>{text}</Text></View>}

function Part2Timer({locale,rating,onRate}:{locale:Locale;rating:Rating|null;onRate:(value:Rating)=>void}){const t=copy[locale];const [phase,setPhase]=useState<"idle"|"prep"|"speak"|"finished">("idle");const [running,setRunning]=useState(false);const [seconds,setSeconds]=useState(60);useEffect(()=>{if(!running||phase==="idle"||phase==="finished")return;const id=setInterval(()=>setSeconds(value=>{if(value>1)return value-1;if(phase==="prep"){setPhase("speak");return 120}setPhase("finished");setRunning(false);return 0}),1000);return()=>clearInterval(id)},[phase,running]);const start=()=>{setPhase("prep");setSeconds(60);setRunning(true)};const reset=()=>{setPhase("idle");setSeconds(60);setRunning(false)};const title=phase==="prep"?t.preparation:phase==="speak"?t.speaking:phase==="finished"?t.finished:t.ready;return <View style={styles.timerCard}><View style={styles.timerTop}><View><Text style={styles.sectionLabel}>{t.timer}</Text><Text style={styles.timerTitle}>{title}</Text></View><Ionicons name="timer-outline" size={21} color={colors.rust}/></View><View style={styles.timerCircle}><Text style={styles.timerValue}>{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,"0")}</Text><Text style={styles.timerPhase}>{phase==="speak"?t.speak:t.prepare}</Text></View><Text style={styles.timerHint}>{t.timerHint}</Text>{phase==="idle"||phase==="finished"?<Pressable onPress={start} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{t.startPrep}</Text></Pressable>:<View style={styles.navRow}><Pressable onPress={()=>setRunning(v=>!v)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>{running?t.pause:t.resume}</Text></Pressable><Pressable onPress={reset} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>{t.reset}</Text></Pressable><Pressable onPress={()=>{setPhase("finished");setRunning(false);setSeconds(0)}} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{t.finish}</Text></Pressable></View>}{phase==="finished"?<View style={styles.rating}><Text style={styles.progressLabel}>{t.rate}</Text><View style={styles.navRow}>{(["needs-work","good","strong"] as Rating[]).map(value=><Pressable key={value} onPress={()=>onRate(value)} style={[styles.ratingButton,rating===value&&styles.ratingActive]}><Text style={[styles.ratingText,rating===value&&styles.ratingTextActive]}>{value==="needs-work"?t.needsWork:value==="good"?t.good:t.strong}</Text></Pressable>)}</View></View>:null}</View>}

function Vocabulary({topic,locale}:{topic:SpeakingTopic;locale:Locale}){return <Info title={copy[locale].vocabulary} icon="book-outline">{topic.vocabulary.map(item=><View key={item.word} style={styles.vocab}><View style={styles.vocabTop}><Text style={styles.vocabWord}>{item.word}</Text><Text style={styles.vocabUz}>{item.uz}</Text></View><Text style={styles.infoText}>{item.definition}</Text><Text style={styles.vocabExample}>{item.example}</Text></View>)}</Info>}
function Info({title,icon,children}:{title:string;icon:keyof typeof Ionicons.glyphMap;children:React.ReactNode}){return <View style={styles.info}><View style={styles.infoTitle}><View style={styles.infoIcon}><Ionicons name={icon} size={17} color={colors.brand600}/></View><Text style={styles.infoHeading}>{title}</Text></View><View style={styles.infoContent}>{children}</View></View>}
function Phrase({title,items}:{title:string;items:string[]}){return <View style={styles.phraseGroup}><Text style={styles.progressLabel}>{title}</Text><View style={styles.chips}>{items.map(item=><Text key={item} style={styles.chip}>{item}</Text>)}</View></View>}
function BackControl({label,onPress}:{label:string;onPress:()=>void}){return <Pressable accessibilityRole="button" onPress={onPress} style={styles.back}><Ionicons name="arrow-back" size={19} color={colors.brown}/><Text style={styles.backText}>{label}</Text></Pressable>}

const styles=StyleSheet.create({page:{gap:18},listContent:{paddingBottom:112},listHeader:{gap:18,marginBottom:10},detailScroll:{gap:18,paddingBottom:112},topicSeparator:{height:10},loading:{gap:12,padding:20},loadingLine:{height:180,borderRadius:14,backgroundColor:colors.cream},loadingLineSmall:{height:80,borderRadius:14,backgroundColor:colors.cream},back:{alignSelf:"flex-start",minHeight:48,flexDirection:"row",alignItems:"center",gap:7},backText:{fontFamily:fonts.uiBold,fontSize:13,color:colors.rustDark},hero:{gap:16,padding:19,borderWidth:1.5,borderColor:colors.line,borderRadius:16,backgroundColor:colors.cream,shadowColor:colors.brown,shadowOpacity:.18,shadowRadius:0,shadowOffset:{width:4,height:5},elevation:3},heroLabel:{alignSelf:"flex-start",minHeight:31,flexDirection:"row",alignItems:"center",gap:7,paddingHorizontal:10,borderWidth:1,borderColor:colors.brand200,borderRadius:9,backgroundColor:"rgba(185,78,40,0.07)"},heroLabelText:{fontFamily:fonts.uiBold,fontSize:10,letterSpacing:.4,textTransform:"uppercase",color:colors.muted},heroTitle:{fontFamily:fonts.display,fontSize:35,lineHeight:38,letterSpacing:.45,textTransform:"uppercase",color:colors.ink},heroBody:{fontFamily:fonts.ui,fontSize:14,lineHeight:24,color:colors.muted},progressCard:{gap:11,padding:15,borderWidth:1,borderColor:colors.line,borderRadius:12,backgroundColor:colors.raised},progressTop:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},progressLabel:{fontFamily:fonts.uiBold,fontSize:9.5,letterSpacing:.55,textTransform:"uppercase",color:colors.muted},progressValue:{marginTop:4,fontFamily:fonts.ui,fontSize:29,color:colors.ink},progressTotal:{fontSize:16,color:colors.muted},target:{width:48,height:48,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:colors.line,backgroundColor:colors.cream,shadowColor:colors.brown,shadowOpacity:.14,shadowRadius:0,shadowOffset:{width:3,height:3}},progressTrack:{height:10,overflow:"hidden",borderRadius:5,backgroundColor:"rgba(84,37,15,0.12)"},progressFill:{height:"100%",borderRadius:5,backgroundColor:colors.teal},progressHint:{fontFamily:fonts.ui,fontSize:11.5,lineHeight:18,color:colors.muted},tabs:{flexDirection:"row",padding:4,borderWidth:1,borderColor:colors.line,borderRadius:24,backgroundColor:colors.raised},tab:{flex:1,minHeight:48,alignItems:"center",justifyContent:"center",borderRadius:20},tabActive:{backgroundColor:colors.rust},tabText:{fontFamily:fonts.uiMedium,fontSize:13,color:colors.muted},tabTextActive:{fontFamily:fonts.uiBold,color:colors.raised},wheelCard:{gap:14,alignItems:"center",padding:17,borderWidth:1.5,borderColor:colors.line,borderRadius:14,backgroundColor:colors.cream,shadowColor:colors.brown,shadowOpacity:.14,shadowRadius:0,shadowOffset:{width:3,height:4},elevation:2},wheelHeading:{width:"100%",flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:12},wheelHeadingCopy:{flex:1},sectionLabel:{fontFamily:fonts.uiBold,fontSize:10,letterSpacing:.6,textTransform:"uppercase",color:colors.teal},wheelHint:{maxWidth:275,marginTop:5,fontFamily:fonts.ui,fontSize:12,lineHeight:19,color:colors.muted},soundButton:{width:48,height:48,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:colors.line,borderRadius:9,backgroundColor:colors.raised},wheelWrap:{alignItems:"center",justifyContent:"center"},wheelPointer:{position:"absolute",zIndex:2,top:-2,left:"50%",marginLeft:-12,width:0,height:0,borderLeftWidth:12,borderRightWidth:12,borderTopWidth:20,borderLeftColor:"transparent",borderRightColor:"transparent",borderTopColor:colors.ink},wheelResult:{width:"100%",gap:7,padding:13,borderWidth:1,borderColor:colors.line,borderRadius:11,backgroundColor:colors.raised},wheelResultLabel:{fontFamily:fonts.uiBold,fontSize:9.5,color:colors.teal},wheelResultQuestion:{fontFamily:fonts.uiBold,fontSize:17,lineHeight:25,color:colors.ink},topicList:{gap:10},topicCard:{minHeight:112,flexDirection:"row",alignItems:"center",gap:12,padding:14,borderWidth:1.5,borderColor:colors.line,borderRadius:13,backgroundColor:colors.cream},topicIcon:{width:48,height:48,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:colors.brand200,borderRadius:10,backgroundColor:colors.brand50},topicIconDone:{borderColor:colors.teal,backgroundColor:colors.teal},topicCopy:{flex:1,gap:5},topicTitleRow:{flexDirection:"row",alignItems:"center",gap:7},topicTitle:{flexShrink:1,fontFamily:fonts.uiBold,fontSize:14,color:colors.ink},topicBody:{fontFamily:fonts.ui,fontSize:11.5,lineHeight:18,color:colors.muted},topicBadge:{alignSelf:"flex-start",paddingHorizontal:8,paddingVertical:5,borderRadius:7,backgroundColor:"rgba(185,78,40,0.09)",fontFamily:fonts.uiBold,fontSize:9,color:colors.brand700},detailHero:{gap:13,padding:18,borderWidth:1.5,borderColor:colors.line,borderRadius:15,backgroundColor:colors.cream,shadowColor:colors.brown,shadowOpacity:.16,shadowRadius:0,shadowOffset:{width:4,height:5},elevation:3},partStamp:{alignSelf:"flex-start",paddingHorizontal:9,paddingVertical:5,borderRadius:7,backgroundColor:"rgba(185,78,40,0.09)",fontFamily:fonts.uiBold,fontSize:10,color:colors.brand700},detailTitle:{fontFamily:fonts.display,fontSize:34,lineHeight:38,letterSpacing:.4,textTransform:"uppercase",color:colors.ink},detailBody:{fontFamily:fonts.ui,fontSize:13.5,lineHeight:22,color:colors.muted},detailActions:{flexDirection:"row",flexWrap:"wrap",gap:10},primaryButton:{alignSelf:"flex-start",minHeight:48,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8,paddingHorizontal:15,borderWidth:1,borderColor:colors.brand950,borderRadius:10,backgroundColor:colors.brand600,shadowColor:colors.brown,shadowOpacity:.65,shadowRadius:0,shadowOffset:{width:3,height:4},elevation:3},primaryButtonText:{fontFamily:fonts.uiBold,fontSize:12,color:colors.raised},secondaryButton:{alignSelf:"flex-start",minHeight:48,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:7,paddingHorizontal:14,borderWidth:1,borderColor:colors.line,borderRadius:9,backgroundColor:colors.raised},secondaryButtonText:{fontFamily:fonts.uiBold,fontSize:11.5,color:colors.ink},quietButton:{minHeight:48,alignItems:"center",justifyContent:"center",paddingHorizontal:10},quietText:{fontFamily:fonts.uiBold,fontSize:11,color:colors.brand600},disabled:{opacity:.45},pressed:{opacity:.72,transform:[{translateY:1}]},practice:{gap:14,padding:17,borderWidth:1.5,borderColor:colors.line,borderRadius:14,backgroundColor:colors.cream},practiceTop:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:8},questionPanel:{gap:10,padding:16,borderWidth:1,borderColor:colors.line,borderRadius:11,backgroundColor:colors.raised},questionText:{fontFamily:fonts.uiBold,fontSize:21,lineHeight:28,color:colors.ink},answerShape:{fontFamily:fonts.ui,fontSize:12.5,lineHeight:20,color:colors.muted},navRow:{flexDirection:"row",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:8},model:{gap:9,padding:14,borderWidth:1,borderColor:"rgba(70,120,120,.4)",borderRadius:10,backgroundColor:"rgba(70,120,120,.07)"},modelTop:{gap:5},modelBadge:{fontFamily:fonts.uiBold,fontSize:9.5,color:colors.muted},modelText:{fontFamily:fonts.ui,fontSize:13,lineHeight:22,color:colors.ink},cueTitle:{fontFamily:fonts.display,fontSize:28,lineHeight:32,color:colors.ink},cueBox:{gap:10,padding:15,borderWidth:1,borderColor:colors.line,borderRadius:11,backgroundColor:colors.raised},cardTitle:{fontFamily:fonts.uiBold,fontSize:13,color:colors.ink},bulletRow:{flexDirection:"row",alignItems:"flex-start",gap:9},followUp:{padding:12,borderWidth:1,borderColor:colors.line,borderRadius:9,backgroundColor:colors.raised,fontFamily:fonts.uiMedium,fontSize:12.5,lineHeight:19,color:colors.ink},sectionBody:{marginTop:4,fontFamily:fonts.ui,fontSize:11.5,lineHeight:18,color:colors.muted},plan:{gap:6,marginTop:9,padding:12,borderWidth:1,borderColor:colors.line,borderRadius:9,backgroundColor:colors.raised},timerCard:{gap:14,padding:17,borderWidth:1.5,borderColor:colors.line,borderRadius:14,backgroundColor:colors.cream},timerTop:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},timerTitle:{marginTop:3,fontFamily:fonts.display,fontSize:24,color:colors.ink},timerCircle:{alignSelf:"center",width:150,height:150,alignItems:"center",justifyContent:"center",borderWidth:10,borderColor:colors.teal,borderRadius:75,backgroundColor:colors.raised},timerValue:{fontFamily:fonts.display,fontSize:38,color:colors.ink},timerPhase:{fontFamily:fonts.uiBold,fontSize:9,textTransform:"uppercase",color:colors.muted},timerHint:{padding:11,borderRadius:9,backgroundColor:"rgba(185,78,40,.08)",fontFamily:fonts.uiMedium,fontSize:11.5,lineHeight:18,textAlign:"center",color:colors.muted},rating:{gap:9},ratingButton:{minHeight:48,justifyContent:"center",paddingHorizontal:11,borderWidth:1,borderColor:colors.line,borderRadius:24,backgroundColor:colors.raised},ratingActive:{borderColor:colors.rust,backgroundColor:colors.rust},ratingText:{fontFamily:fonts.uiBold,fontSize:10,color:colors.muted},ratingTextActive:{color:colors.raised},info:{gap:13,padding:16,borderWidth:1.5,borderColor:colors.line,borderRadius:14,backgroundColor:colors.cream},infoTitle:{flexDirection:"row",alignItems:"center",gap:9},infoIcon:{width:34,height:34,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:colors.brand200,borderRadius:8,backgroundColor:colors.brand50},infoHeading:{fontFamily:fonts.display,fontSize:23,color:colors.ink},infoContent:{gap:10},infoText:{flex:1,fontFamily:fonts.ui,fontSize:12,lineHeight:19,color:colors.muted},vocab:{gap:6,padding:12,borderWidth:1,borderColor:colors.line,borderRadius:10,backgroundColor:colors.raised},vocabTop:{flexDirection:"row",alignItems:"baseline",flexWrap:"wrap",gap:7},vocabWord:{fontFamily:fonts.uiBold,fontSize:14,color:colors.ink},vocabUz:{fontFamily:fonts.uiBold,fontSize:10,color:colors.brand700},vocabExample:{paddingTop:7,borderTopWidth:1,borderTopColor:colors.line,fontFamily:fonts.uiMedium,fontSize:11.5,lineHeight:18,color:colors.ink},phraseGroup:{gap:7},chips:{flexDirection:"row",flexWrap:"wrap",gap:7},chip:{paddingHorizontal:10,paddingVertical:7,borderWidth:1,borderColor:colors.brand200,borderRadius:15,backgroundColor:"rgba(185,78,40,.08)",fontFamily:fonts.uiBold,fontSize:10.5,lineHeight:16,color:colors.ink}});
