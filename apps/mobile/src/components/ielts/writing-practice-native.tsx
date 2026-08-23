import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, G, Line, Path, Polyline, Rect, Text as SvgText } from "react-native-svg";

import { ApiError, request, type IeltsWritingScore, type IeltsWritingTask } from "@/api/client";
import { BackButton, Button } from "@/components/ui";
import type { Locale } from "@/i18n";
import {
  getIeltsResources,
  getIeltsSkill,
  type IeltsGuideSection,
} from "@/ielts/content";
import { colors, fonts } from "@/theme/tokens";

type TaskType = "task1" | "task2";
type ChartSeries = { name: string; values: number[] };
type PieSlice = { name: string; value: number };
type MapFeature = {
  name: string;
  kind: "water" | "road" | "building" | "green";
  x: number;
  y: number;
  width: number;
  height: number;
};
type WritingVisual = {
  kind: "bar" | "line" | "table" | "process" | "pie-pair" | "map-pair" | "bar-line" | "bar-pie";
  title: string;
  y_label?: string;
  categories: string[];
  series: ChartSeries[];
  pie?: PieSlice[];
  pies?: { title: string; slices: PieSlice[] }[];
  maps?: { title: string; features: MapFeature[] }[];
  secondary?: {
    title: string;
    y_label?: string;
    categories: string[];
    series: ChartSeries[];
  };
};

const CHART_COLORS = [colors.teal, colors.rust, colors.brand300, colors.sage, colors.rustDark, colors.brand600];
const WRITING_SECTIONS: Record<TaskType, Set<string>> = {
  task1: new Set(["task-1-visuals", "task-1-process", "score-analysis"]),
  task2: new Set(["task-2-opinion", "task-2-discussion", "task-2-problems", "score-analysis"]),
};

const copy = {
  uz: {
    back: "IELTS markazi",
    deskEyebrow: "Writing amaliyot stoli",
    deskTitle: "Vazifani tanlang, so'ng aniq reja bilan yozing",
    task1Helper: "Academic hisobot · 150 so'z",
    task2Helper: "Insho · 250 so'z",
    loadingTitle: "Writing topshirig'i tayyorlanmoqda…",
    loadingBody: "Task 1 vizuali va savoli birga yuklanmoqda.",
    loadErrorTitle: "Writing topshiriqlarini yuklab bo'lmadi",
    loadErrorBody: "Ulanishni tekshiring va qayta urinib ko'ring.",
    retry: "Qayta urinish",
    task1: "Task 1",
    task2: "Task 2",
    newPrompt: "Yangi topshiriq",
    visual: "Topshiriq vizuali",
    studyVisual: "Vizualni tahlil qiling",
    writingPlaceholder: "Javobingizni shu yerga yozing…",
    words: "so'z",
    min: "kamida",
    getBand: "Band bahosini olish",
    quotaOut: "Bugungi bepul AI amallarini ishlatib bo'ldingiz. Premiumga o'ting.",
    notConfigured: "AI mashqi bu serverda hali sozlanmagan.",
    error: "Nimadir xato ketdi. Qayta urinib ko'ring.",
    taskCriterion: "Vazifa",
    coherence: "Bog'lanish",
    lexical: "Lug'at",
    grammar: "Grammatika",
    yourBand: "Sizning band",
    feedback: "Fikr-mulohaza",
    strengthsTitle: "Yaxshi chiqqan tomonlari",
    errorsTitle: "Xatolar va tuzatishlar",
    improved: "Namunaviy javob (Band 8)",
    hideImproved: "Namunani yopish",
    tryAgain: "Yana urinish",
    xp: "XP olindi",
    stepByStep: "Bosqichma-bosqich",
    modelExample: "Model misol",
    vocabulary: "Muhim lug'at",
    traps: "Ko'p uchraydigan xatolar",
    vocabularyNext: "Keyingi lug'at mashqi",
    continueVocabulary: "IELTS lug'atini davom ettiring",
    open: "Ochish",
    series: "Qator",
  },
  ru: {
    back: "Центр IELTS",
    deskEyebrow: "Практика Writing",
    deskTitle: "Выберите задание и пишите по чёткому плану",
    task1Helper: "Academic отчёт · 150 слов",
    task2Helper: "Эссе · 250 слов",
    loadingTitle: "Готовим задание Writing…",
    loadingBody: "Визуал и вопрос Task 1 загружаются вместе.",
    loadErrorTitle: "Не удалось загрузить задания Writing",
    loadErrorBody: "Проверьте соединение и попробуйте снова.",
    retry: "Повторить",
    task1: "Task 1",
    task2: "Task 2",
    newPrompt: "Новое задание",
    visual: "Визуал задания",
    studyVisual: "Изучите визуал",
    writingPlaceholder: "Напишите ваш ответ здесь…",
    words: "слов",
    min: "мин.",
    getBand: "Получить band",
    quotaOut: "Вы использовали сегодняшние бесплатные действия ИИ. Оформите Premium.",
    notConfigured: "Практика с ИИ ещё не настроена на этом сервере.",
    error: "Что-то пошло не так. Попробуйте снова.",
    taskCriterion: "Задание",
    coherence: "Связность",
    lexical: "Лексика",
    grammar: "Грамматика",
    yourBand: "Ваш band",
    feedback: "Обратная связь",
    strengthsTitle: "Что получилось хорошо",
    errorsTitle: "Ошибки и исправления",
    improved: "Образцовый ответ (Band 8)",
    hideImproved: "Скрыть образец",
    tryAgain: "Ещё раз",
    xp: "XP получено",
    stepByStep: "По шагам",
    modelExample: "Пример",
    vocabulary: "Полезная лексика",
    traps: "Частые ошибки",
    vocabularyNext: "Следующая практика словаря",
    continueVocabulary: "Продолжить словарь IELTS",
    open: "Открыть",
    series: "Ряд",
  },
  en: {
    back: "IELTS hub",
    deskEyebrow: "Writing practice desk",
    deskTitle: "Choose a task, then write with a clear plan",
    task1Helper: "Academic report · 150 words",
    task2Helper: "Essay · 250 words",
    loadingTitle: "Preparing your writing prompt…",
    loadingBody: "Your Task 1 visual and question are loading together.",
    loadErrorTitle: "Writing prompts could not be loaded",
    loadErrorBody: "Check your connection and try again.",
    retry: "Try again",
    task1: "Task 1",
    task2: "Task 2",
    newPrompt: "New prompt",
    visual: "Task visual",
    studyVisual: "Study the visual",
    writingPlaceholder: "Write your response here…",
    words: "words",
    min: "min",
    getBand: "Get band score",
    quotaOut: "You've used today's free AI actions. Upgrade to Premium for unlimited.",
    notConfigured: "AI practice isn't set up on this server yet.",
    error: "Something went wrong. Please try again.",
    taskCriterion: "Task",
    coherence: "Coherence",
    lexical: "Vocabulary",
    grammar: "Grammar",
    yourBand: "Your band",
    feedback: "Feedback",
    strengthsTitle: "What you did well",
    errorsTitle: "Corrections",
    improved: "Model answer (Band 8)",
    hideImproved: "Hide model answer",
    tryAgain: "Try another",
    xp: "XP earned",
    stepByStep: "Step by step",
    modelExample: "Model example",
    vocabulary: "Vocabulary highlight",
    traps: "Common traps",
    vocabularyNext: "Vocabulary next",
    continueVocabulary: "Continue your IELTS vocabulary",
    open: "Open",
    series: "Series",
  },
} as const;

function isVisual(value: unknown): value is WritingVisual {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<WritingVisual>;
  return typeof item.kind === "string" && typeof item.title === "string" && Array.isArray(item.categories) && Array.isArray(item.series);
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function chartMax(series: ChartSeries[]) {
  const value = Math.max(1, ...series.flatMap((item) => item.values));
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

function piePath(startAngle: number, endAngle: number, radius = 70) {
  const point = (angle: number) => ({
    x: 90 + radius * Math.cos((angle * Math.PI) / 180),
    y: 90 + radius * Math.sin((angle * Math.PI) / 180),
  });
  const start = point(startAngle);
  const end = point(endAngle);
  return `M 90 90 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`;
}

function Legend({ series }: { series: ChartSeries[] }) {
  return (
    <View accessibilityLabel="Chart legend" style={styles.legend}>
      {series.map((item, index) => (
        <View key={item.name} style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }]} />
          <Text style={styles.legendText}>{item.name}</Text>
        </View>
      ))}
    </View>
  );
}

function AxisLines({ maximum, left, top, width, height }: { maximum: number; left: number; top: number; width: number; height: number }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((tick) => {
        const y = top + height - (height / 4) * tick;
        return (
          <G key={tick}>
            <Line x1={left} x2={left + width} y1={y} y2={y} stroke={colors.brown} strokeOpacity={0.14} />
            <SvgText x={left - 7} y={y + 3} textAnchor="end" fontFamily={fonts.uiMedium} fontSize="8" fill={colors.muted}>
              {formatNumber((maximum / 4) * tick)}
            </SvgText>
          </G>
        );
      })}
    </>
  );
}

function LineChart({ visual }: { visual: Pick<WritingVisual, "title" | "categories" | "series" | "y_label"> }) {
  const left = 38;
  const top = 18;
  const width = 274;
  const height = 140;
  const maximum = chartMax(visual.series);
  const pointX = (index: number) => left + (visual.categories.length > 1 ? (width / (visual.categories.length - 1)) * index : width / 2);
  const pointY = (value: number) => top + height - (value / maximum) * height;
  return (
    <>
      <Svg accessibilityLabel={visual.title} viewBox="0 0 330 194" style={styles.chart}>
        <AxisLines maximum={maximum} left={left} top={top} width={width} height={height} />
        <Line x1={left} x2={left} y1={top} y2={top + height} stroke={colors.brown} strokeOpacity={0.3} />
        <Line x1={left} x2={left + width} y1={top + height} y2={top + height} stroke={colors.brown} strokeOpacity={0.3} />
        {visual.series.map((series, seriesIndex) => {
          const points = series.values.map((value, index) => `${pointX(index)},${pointY(value)}`).join(" ");
          return (
            <G key={series.name}>
              <Polyline points={points} fill="none" stroke={CHART_COLORS[seriesIndex % CHART_COLORS.length]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {series.values.map((value, index) => <Circle key={`${series.name}-${index}`} cx={pointX(index)} cy={pointY(value)} r="3.3" fill={CHART_COLORS[seriesIndex % CHART_COLORS.length]} />)}
            </G>
          );
        })}
        {visual.categories.map((label, index) => (
          <SvgText key={`${label}-${index}`} x={pointX(index)} y={top + height + 19} textAnchor="middle" fontFamily={fonts.uiMedium} fontSize="7.5" fill={colors.muted}>
            {label.length > 10 ? `${label.slice(0, 9)}…` : label}
          </SvgText>
        ))}
      </Svg>
      {visual.y_label ? <Text style={styles.axisLabel}>{visual.y_label}</Text> : null}
      <Legend series={visual.series} />
    </>
  );
}

function BarChart({ visual }: { visual: Pick<WritingVisual, "title" | "categories" | "series" | "y_label"> }) {
  const left = 38;
  const top = 24;
  const width = 274;
  const height = 138;
  const maximum = chartMax(visual.series);
  const groupWidth = width / Math.max(visual.categories.length, 1);
  const innerWidth = groupWidth * 0.76;
  const barWidth = innerWidth / Math.max(visual.series.length, 1);
  return (
    <>
      <Svg accessibilityLabel={visual.title} viewBox="0 0 330 202" style={styles.chart}>
        <AxisLines maximum={maximum} left={left} top={top} width={width} height={height} />
        <Line x1={left} x2={left} y1={top} y2={top + height} stroke={colors.brown} strokeOpacity={0.3} />
        <Line x1={left} x2={left + width} y1={top + height} y2={top + height} stroke={colors.brown} strokeOpacity={0.3} />
        {visual.categories.map((label, categoryIndex) => (
          <G key={`${label}-${categoryIndex}`}>
            {visual.series.map((series, seriesIndex) => {
              const value = series.values[categoryIndex] ?? 0;
              const barHeight = (value / maximum) * height;
              const x = left + categoryIndex * groupWidth + (groupWidth - innerWidth) / 2 + seriesIndex * barWidth;
              return (
                <G key={series.name}>
                  <Rect x={x} y={top + height - barHeight} width={Math.max(barWidth - 2, 2)} height={barHeight} rx="2" fill={CHART_COLORS[seriesIndex % CHART_COLORS.length]} />
                  <SvgText x={x + Math.max(barWidth - 2, 2) / 2} y={Math.max(top + height - barHeight - 4, 10)} textAnchor="middle" fontFamily={fonts.uiBold} fontSize="7" fill={colors.ink}>{formatNumber(value)}</SvgText>
                </G>
              );
            })}
            <SvgText x={left + categoryIndex * groupWidth + groupWidth / 2} y={top + height + 17} textAnchor="middle" fontFamily={fonts.uiMedium} fontSize="7.5" fill={colors.muted}>
              {label.length > 11 ? `${label.slice(0, 10)}…` : label}
            </SvgText>
          </G>
        ))}
      </Svg>
      {visual.y_label ? <Text style={styles.axisLabel}>{visual.y_label}</Text> : null}
      <Legend series={visual.series} />
    </>
  );
}

function Pie({ title, slices }: { title: string; slices: PieSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  let angle = -90;
  return (
    <View style={styles.pieCard}>
      <Text style={styles.pieTitle}>{title}</Text>
      <Svg accessibilityLabel={title} viewBox="0 0 180 180" style={styles.pie}>
        {slices.map((slice, index) => {
          const next = angle + (slice.value / total) * 360;
          const path = piePath(angle, next);
          angle = next;
          return <Path key={slice.name} d={path} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke={colors.raised} strokeWidth="2" />;
        })}
        <Circle cx="90" cy="90" r="35" fill={colors.cream} />
        <SvgText x="90" y="95" textAnchor="middle" fontFamily={fonts.uiBold} fontSize="14" fill={colors.ink}>{title}</SvgText>
      </Svg>
      <View style={styles.pieLegend}>
        {slices.map((slice, index) => (
          <View key={slice.name} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }]} />
            <Text style={styles.pieLegendText}>{slice.name} {slice.value}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function DataTable({ visual, seriesLabel }: { visual: WritingVisual; seriesLabel: string }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScroll}>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableHeadText, styles.tableSeries]}>{seriesLabel}</Text>
          {visual.categories.map((category, index) => <Text key={`${category}-${index}`} style={styles.tableHeadText}>{category}</Text>)}
        </View>
        {visual.series.map((series) => (
          <View key={series.name} style={styles.tableRow}>
            <Text style={[styles.tableCellStrong, styles.tableSeries]}>{series.name}</Text>
            {series.values.map((value, index) => <Text key={`${series.name}-${index}`} style={styles.tableCell}>{formatNumber(value)}</Text>)}
          </View>
        ))}
        {visual.y_label ? <Text style={styles.tableNote}>{visual.y_label}</Text> : null}
      </View>
    </ScrollView>
  );
}

function ProcessDiagram({ categories }: { categories: string[] }) {
  return (
    <View style={styles.processList}>
      {categories.map((stage, index) => (
        <View key={`${stage}-${index}`} style={styles.processRow}>
          <View style={styles.processNumber}><Text style={styles.processNumberText}>{index + 1}</Text></View>
          <Text style={styles.processText}>{stage}</Text>
          {index < categories.length - 1 ? <Ionicons name="arrow-down" size={16} color={colors.rust} /> : <Ionicons name="checkmark-circle" size={18} color={colors.teal} />}
        </View>
      ))}
    </View>
  );
}

const mapColors = {
  water: { fill: "#C9DDDA", stroke: colors.teal },
  road: { fill: "#E6D0AE", stroke: colors.muted },
  building: { fill: "#E8C99A", stroke: colors.rust },
  green: { fill: "#C3D1B8", stroke: "#5B735A" },
};

function MapPair({ maps, title }: { maps: NonNullable<WritingVisual["maps"]>; title: string }) {
  return (
    <View style={styles.mapList}>
      {maps.map((map) => (
        <View key={map.title} style={styles.mapCard}>
          <Text style={styles.pieTitle}>{map.title}</Text>
          <Svg accessibilityLabel={`${title}: ${map.title}`} viewBox="0 0 100 100" style={styles.map}>
            {map.features.map((feature) => {
              const tone = mapColors[feature.kind] ?? mapColors.building;
              return (
                <G key={feature.name}>
                  <Rect x={feature.x} y={feature.y} width={feature.width} height={feature.height} rx={feature.kind === "road" ? 0 : 2} fill={tone.fill} stroke={tone.stroke} strokeWidth="0.7" />
                  <SvgText x={feature.x + feature.width / 2} y={feature.y + feature.height / 2 + 1.5} textAnchor="middle" fontFamily={fonts.uiBold} fontSize="3.2" fill={colors.ink}>{feature.name}</SvgText>
                </G>
              );
            })}
          </Svg>
        </View>
      ))}
    </View>
  );
}

function WritingTaskVisual({ visual, locale }: { visual: WritingVisual; locale: Locale }) {
  const t = copy[locale];
  return (
    <View style={styles.visualCard}>
      <View style={styles.visualHeading}>
        <View style={styles.flexOne}>
          <Text style={styles.eyebrow}>{t.visual}</Text>
          <Text style={styles.visualTitle}>{visual.title}</Text>
        </View>
        <View style={styles.visualBadge}><Text style={styles.visualBadgeText}>{t.studyVisual}</Text></View>
      </View>
      {visual.kind === "line" ? <LineChart visual={visual} /> : null}
      {visual.kind === "bar" ? <BarChart visual={visual} /> : null}
      {visual.kind === "table" ? <DataTable visual={visual} seriesLabel={t.series} /> : null}
      {visual.kind === "process" ? <ProcessDiagram categories={visual.categories} /> : null}
      {visual.kind === "pie-pair" ? <View style={styles.pieList}>{visual.pies?.map((pie) => <Pie key={pie.title} title={pie.title} slices={pie.slices} />)}</View> : null}
      {visual.kind === "map-pair" && visual.maps ? <MapPair maps={visual.maps} title={visual.title} /> : null}
      {visual.kind === "bar-line" ? (
        <View style={styles.combinedCharts}>
          <View style={styles.subChart}><BarChart visual={visual} /></View>
          {visual.secondary ? <View style={styles.subChart}><Text style={styles.subChartTitle}>{visual.secondary.title}</Text><LineChart visual={visual.secondary} /></View> : null}
        </View>
      ) : null}
      {visual.kind === "bar-pie" ? (
        <View style={styles.combinedCharts}>
          <View style={styles.subChart}><BarChart visual={visual} /></View>
          {visual.pie ? <Pie title="USA" slices={visual.pie} /> : null}
        </View>
      ) : null}
    </View>
  );
}

export function WritingPracticeNative({ locale, token, onBack }: { locale: Locale; token: string | null; onBack: () => void }) {
  const t = copy[locale];
  const content = getIeltsSkill(locale, "writing");
  const resources = getIeltsResources(locale);
  const [taskType, setTaskType] = useState<TaskType>("task1");
  const [taskIndex, setTaskIndex] = useState(0);
  const [essay, setEssay] = useState("");
  const [score, setScore] = useState<IeltsWritingScore | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const tasksQuery = useQuery({
    queryKey: ["ielts-writing-tasks", token],
    queryFn: () => request<Record<TaskType, IeltsWritingTask[]>>("/ielts/writing/tasks", { token }),
    enabled: Boolean(token),
  });
  const scoreMutation = useMutation({
    mutationFn: ({ prompt, response }: { prompt: string; response: string }) => request<IeltsWritingScore>("/ielts/writing/score", {
      method: "POST",
      token,
      body: { task_type: taskType, prompt, essay: response, lang: locale },
    }),
    onSuccess: (result) => {
      setScore(result);
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(error instanceof ApiError && error.status === 429 ? t.quotaOut : error instanceof ApiError && error.status === 503 ? t.notConfigured : t.error);
    },
  });

  const currentTasks = tasksQuery.data?.[taskType] ?? [];
  const currentTask = currentTasks[taskIndex];
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const minimum = taskType === "task1" ? 150 : 250;
  const sections = useMemo(() => content.sections.filter((section) => WRITING_SECTIONS[taskType].has(section.id)), [content.sections, taskType]);

  function reset(type: TaskType, index = 0) {
    setTaskType(type);
    setTaskIndex(index);
    setEssay("");
    setScore(null);
    setSubmitError(null);
    scoreMutation.reset();
  }

  return (
    <>
      <BackButton label={t.back} onPress={onBack} />

      <View style={styles.hero}>
        <Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.watermark}>WRITING</Text>
        <View style={styles.heroLabel}>
          <Ionicons name="create-outline" size={16} color={colors.teal} />
          <Text style={styles.heroLabelText}>{content.eyebrow}</Text>
        </View>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.description}>{content.description}</Text>
        <View style={styles.stats}>
          {content.stats.map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.practiceHeading}>
        <Text style={styles.eyebrow}>{t.deskEyebrow}</Text>
        <Text style={styles.practiceTitle}>{t.deskTitle}</Text>
      </View>

      <View accessibilityRole="tablist" style={styles.taskTabs}>
        {(["task1", "task2"] as const).map((type) => {
          const selected = taskType === type;
          return (
            <Pressable key={type} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => reset(type)} style={({ pressed }) => [styles.taskTab, selected && styles.taskTabActive, pressed && styles.pressed]}>
              <Text style={[styles.taskTabTitle, selected && styles.taskTabTitleActive]}>{type === "task1" ? t.task1 : t.task2}</Text>
              <Text style={[styles.taskTabHelper, selected && styles.taskTabHelperActive]}>{type === "task1" ? t.task1Helper : t.task2Helper}</Text>
            </Pressable>
          );
        })}
      </View>

      {tasksQuery.isPending ? (
        <View style={styles.statusCard}>
          <ActivityIndicator color={colors.rust} />
          <View style={styles.flexOne}><Text style={styles.statusTitle}>{t.loadingTitle}</Text><Text style={styles.statusBody}>{t.loadingBody}</Text></View>
        </View>
      ) : null}
      {tasksQuery.isError ? (
        <View style={styles.statusCard}>
          <Ionicons name="cloud-offline-outline" size={24} color={colors.rust} />
          <View style={styles.flexOne}><Text style={styles.statusTitle}>{t.loadErrorTitle}</Text><Text style={styles.statusBody}>{t.loadErrorBody}</Text></View>
          <Pressable accessibilityRole="button" onPress={() => void tasksQuery.refetch()} style={styles.smallButton}><Text style={styles.smallButtonText}>{t.retry}</Text></Pressable>
        </View>
      ) : null}

      {currentTask ? (
        <View style={styles.promptCard}>
          <View style={styles.promptHeading}>
            <Text style={styles.promptTitle}>{currentTask.title}</Text>
            {currentTasks.length > 1 ? (
              <Pressable accessibilityRole="button" onPress={() => reset(taskType, (taskIndex + 1) % currentTasks.length)} style={styles.newPromptButton}>
                <Ionicons name="refresh" size={14} color={colors.rustDark} />
                <Text style={styles.newPromptText}>{t.newPrompt} ({taskIndex + 1}/{currentTasks.length})</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.promptText}>{currentTask.prompt}</Text>
          {isVisual(currentTask.visual) ? <WritingTaskVisual visual={currentTask.visual} locale={locale} /> : null}
        </View>
      ) : null}

      {submitError ? (
        <View accessibilityRole="alert" style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text style={styles.errorText}>{submitError}</Text>
        </View>
      ) : null}

      {!score ? (
        <View style={styles.editorBlock}>
          <TextInput
            accessibilityLabel={t.writingPlaceholder}
            multiline
            maxLength={6000}
            onChangeText={setEssay}
            placeholder={t.writingPlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.editor}
            textAlignVertical="top"
            value={essay}
          />
          <View style={styles.editorFooter}>
            <View style={styles.wordCountRow}>
              <Ionicons name={wordCount >= minimum ? "checkmark-circle" : "time-outline"} size={17} color={wordCount >= minimum ? colors.teal : colors.muted} />
              <Text style={[styles.wordCount, wordCount >= minimum && styles.wordCountDone]}>{wordCount} {t.words} · {t.min} {minimum}</Text>
            </View>
            <Button loading={scoreMutation.isPending} disabled={!currentTask || wordCount < 20 || !token} onPress={() => currentTask && scoreMutation.mutate({ prompt: currentTask.prompt, response: essay })}>{t.getBand}</Button>
          </View>
        </View>
      ) : <ScoreCard score={score} locale={locale} onRetry={() => reset(taskType, taskIndex)} />}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionNav}>
        {sections.map((section) => <View key={section.id} style={styles.sectionPill}><Text style={styles.sectionPillText}>{section.title}</Text></View>)}
      </ScrollView>
      <View style={styles.guideList}>{sections.map((section) => <GuideSection key={section.id} section={section} locale={locale} />)}</View>

      <View style={styles.resourceHeading}>
        <View style={styles.resourceIcon}><Ionicons name="bookmarks-outline" size={20} color={colors.teal} /></View>
        <View style={styles.flexOne}><Text style={styles.eyebrow}>{t.vocabularyNext}</Text><Text style={styles.resourceTitle}>{t.continueVocabulary}</Text></View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.resourceList}>
        {resources.map((resource) => (
          <Pressable key={resource.slug} accessibilityRole="link" onPress={() => router.push(`/ielts/resource/${resource.slug}`)} style={({ pressed }) => [styles.resourceCard, pressed && styles.pressed]}>
            <Text style={styles.resourceEyebrow}>{resource.eyebrow}</Text>
            <Text style={styles.resourceCardTitle}>{resource.title}</Text>
            <View style={styles.resourceOpen}><Text style={styles.resourceOpenText}>{t.open}</Text><Ionicons name="arrow-forward" size={16} color={colors.rustDark} /></View>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

function ScoreCard({ score, locale, onRetry }: { score: IeltsWritingScore; locale: Locale; onRetry: () => void }) {
  const t = copy[locale];
  const [showImproved, setShowImproved] = useState(false);
  const criteria = [
    [t.taskCriterion, score.task],
    [t.coherence, score.coherence],
    [t.lexical, score.lexical],
    [t.grammar, score.grammar],
  ] as const;
  const emojis: Record<string, string> = { grammar: "📐", vocabulary: "📚", spelling: "🔤", punctuation: "✒️", style: "🎨" };
  return (
    <View style={styles.scoreList}>
      <View style={styles.scoreCard}>
        <View style={styles.scoreTop}>
          <View style={styles.bandCircle}><Text style={styles.bandLabel}>{t.yourBand}</Text><Text style={styles.bandValue}>{score.band_overall.toFixed(1)}</Text></View>
          <View style={styles.criteria}>
            {criteria.map(([label, criterion]) => (
              <View key={label} style={styles.criterion}>
                <View style={styles.criterionHeading}><Text style={styles.criterionLabel}>{label}</Text><Text style={styles.criterionBand}>{criterion.band.toFixed(1)}</Text></View>
                {criterion.comment ? <Text style={styles.criterionComment}>{criterion.comment}</Text> : null}
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.scoreEyebrow}>{t.feedback}</Text>
        <Text style={styles.feedback}>{score.feedback}</Text>
        {score.strengths.length ? (
          <View style={styles.strengthBlock}>
            <Text style={styles.scoreEyebrow}>💪 {t.strengthsTitle}</Text>
            {score.strengths.map((strength, index) => <View key={`${strength}-${index}`} style={styles.strengthRow}><Ionicons name="checkmark" size={16} color={colors.teal} /><Text style={styles.strengthText}>{strength}</Text></View>)}
          </View>
        ) : null}
        <View style={styles.xpBadge}><Ionicons name="sparkles" size={14} color={colors.teal} /><Text style={styles.xpText}>+{score.reward.xp_gained} {t.xp}</Text></View>
      </View>

      {score.errors.length ? (
        <View style={styles.scoreCard}>
          <Text style={styles.scoreSectionTitle}>🔍 {t.errorsTitle} ({score.errors.length})</Text>
          <View style={styles.errorList}>
            {score.errors.map((error, index) => (
              <View key={`${error.quote}-${index}`} style={styles.correctionCard}>
                <Text style={styles.correctionLine}><Text>{emojis[error.type] ?? "✏️"} </Text><Text style={styles.wrongText}>{error.quote}</Text><Text style={styles.arrowText}> → </Text><Text style={styles.fixText}>{error.fix}</Text></Text>
                {error.note ? <Text style={styles.correctionNote}>{error.note}</Text> : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {score.improved ? (
        <View style={styles.scoreCard}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showImproved }} onPress={() => setShowImproved((value) => !value)} style={styles.improvedHeading}>
            <Text style={styles.scoreSectionTitle}>⭐ {showImproved ? t.hideImproved : t.improved}</Text>
            <Ionicons name={showImproved ? "chevron-up" : "chevron-down"} size={20} color={colors.rustDark} />
          </Pressable>
          {showImproved ? <Text style={styles.improvedText}>{score.improved}</Text> : null}
        </View>
      ) : null}
      <Button onPress={onRetry} icon="refresh">{t.tryAgain}</Button>
    </View>
  );
}

function GuideSection({ section, locale }: { section: IeltsGuideSection; locale: Locale }) {
  const t = copy[locale];
  return (
    <View style={styles.guide}>
      <Text style={styles.guideEyebrow}>{section.eyebrow}</Text>
      <Text style={styles.guideTitle}>{section.title}</Text>
      <Text style={styles.guideDescription}>{section.description}</Text>
      {section.steps?.length ? <DetailBlock icon="list-outline" title={t.stepByStep}>{section.steps.map((step, index) => <View key={`${step}-${index}`} style={styles.stepRow}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View><Text style={styles.detailText}>{step}</Text></View>)}</DetailBlock> : null}
      {section.example ? <DetailBlock icon="chatbox-ellipses-outline" title={t.modelExample} tone="teal"><Text style={styles.exampleText}>{section.example}</Text></DetailBlock> : null}
      {section.vocabulary?.length ? <DetailBlock icon="sparkles-outline" title={t.vocabulary}><View style={styles.chips}>{section.vocabulary.map((item) => <Text key={item} style={styles.chip}>{item}</Text>)}</View></DetailBlock> : null}
      {section.traps?.length ? <DetailBlock icon="warning-outline" title={t.traps} tone="rust">{section.traps.map((trap) => <View key={trap} style={styles.stepRow}><Ionicons name="radio-button-on" size={13} color={colors.rust} style={styles.trapIcon} /><Text style={styles.detailText}>{trap}</Text></View>)}</DetailBlock> : null}
    </View>
  );
}

function DetailBlock({ icon, title, tone, children }: { icon: keyof typeof Ionicons.glyphMap; title: string; tone?: "teal" | "rust"; children: React.ReactNode }) {
  return <View style={[styles.detailBlock, tone === "teal" && styles.tealBlock, tone === "rust" && styles.rustBlock]}><View style={styles.detailHeading}><Ionicons name={icon} size={17} color={tone === "rust" ? colors.rust : colors.teal} /><Text style={styles.detailTitle}>{title}</Text></View>{children}</View>;
}

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  pressed: { opacity: 0.72, transform: [{ translateY: 1 }] },
  hero: { position: "relative", gap: 14, overflow: "hidden", padding: 19, borderWidth: 1.5, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.17, shadowRadius: 0, shadowOffset: { width: 4, height: 5 }, elevation: 3 },
  watermark: { position: "absolute", right: -9, top: -10, fontFamily: fonts.display, fontSize: 72, letterSpacing: 1, color: "rgba(185,78,40,0.07)" },
  heroLabel: { alignSelf: "flex-start", minHeight: 32, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.teal, borderRadius: 8, backgroundColor: "rgba(70,120,120,0.10)" },
  heroLabelText: { flexShrink: 1, fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.65, textTransform: "uppercase", color: colors.brand800 },
  title: { maxWidth: 315, fontFamily: fonts.display, fontSize: 36, lineHeight: 40, letterSpacing: 0.45, textTransform: "uppercase", color: colors.ink },
  description: { maxWidth: 320, fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.muted },
  stats: { flexDirection: "row", gap: 7, marginTop: 2, padding: 7, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.cream },
  stat: { flex: 1, minHeight: 72, alignItems: "center", justifyContent: "center", padding: 7, borderRadius: 9, backgroundColor: colors.raised },
  statValue: { fontFamily: fonts.display, fontSize: 28, lineHeight: 31, letterSpacing: 0.4, color: colors.ink },
  statLabel: { marginTop: 2, fontFamily: fonts.uiBold, fontSize: 8.5, lineHeight: 12, textAlign: "center", textTransform: "uppercase", color: colors.muted },
  practiceHeading: { gap: 5, marginTop: 2 },
  eyebrow: { fontFamily: fonts.uiBold, fontSize: 10, lineHeight: 14, letterSpacing: 0.75, textTransform: "uppercase", color: colors.teal },
  practiceTitle: { fontFamily: fonts.display, fontSize: 28, lineHeight: 31, letterSpacing: 0.35, color: colors.ink },
  taskTabs: { flexDirection: "row", gap: 5, padding: 5, borderWidth: 1.5, borderColor: colors.line, borderRadius: 16, backgroundColor: "rgba(255,248,234,0.84)" },
  taskTab: { flex: 1, minHeight: 63, alignItems: "center", justifyContent: "center", gap: 3, padding: 8, borderRadius: 12 },
  taskTabActive: { backgroundColor: colors.rust, shadowColor: colors.brown, shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  taskTabTitle: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.brown },
  taskTabTitleActive: { color: colors.raised },
  taskTabHelper: { fontFamily: fonts.uiMedium, fontSize: 8.5, textAlign: "center", color: colors.brown },
  taskTabHelperActive: { color: colors.brand100 },
  statusCard: { minHeight: 96, flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream },
  statusTitle: { fontFamily: fonts.uiBold, fontSize: 13, lineHeight: 18, color: colors.ink },
  statusBody: { marginTop: 3, fontFamily: fonts.ui, fontSize: 11.5, lineHeight: 17, color: colors.muted },
  smallButton: { minHeight: 36, justifyContent: "center", paddingHorizontal: 11, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised },
  smallButtonText: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.rustDark },
  promptCard: { gap: 12, padding: 16, borderWidth: 1.5, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.cream },
  promptHeading: { gap: 10 },
  promptTitle: { fontFamily: fonts.uiBold, fontSize: 14, lineHeight: 20, color: colors.ink },
  newPromptButton: { alignSelf: "flex-start", minHeight: 36, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.brand200, borderRadius: 9, backgroundColor: colors.raised },
  newPromptText: { fontFamily: fonts.uiBold, fontSize: 10.5, color: colors.rustDark },
  promptText: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 21, color: colors.muted },
  visualCard: { gap: 12, padding: 13, borderWidth: 1, borderColor: colors.brand200, borderRadius: 14, backgroundColor: "rgba(255,248,234,0.74)" },
  visualHeading: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  visualTitle: { marginTop: 3, fontFamily: fonts.uiBold, fontSize: 12.5, lineHeight: 18, color: colors.ink },
  visualBadge: { maxWidth: 96, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.cream },
  visualBadgeText: { fontFamily: fonts.uiBold, fontSize: 8.5, lineHeight: 11, textAlign: "center", color: colors.muted },
  chart: { width: "100%", aspectRatio: 330 / 202 },
  axisLabel: { marginTop: -9, fontFamily: fonts.uiMedium, fontSize: 9, textAlign: "center", color: colors.muted },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendSwatch: { width: 9, height: 9, borderRadius: 3 },
  legendText: { fontFamily: fonts.uiBold, fontSize: 9, color: colors.muted },
  pieList: { gap: 10 },
  pieCard: { flex: 1, alignItems: "center", padding: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.cream },
  pieTitle: { fontFamily: fonts.uiBold, fontSize: 11.5, color: colors.ink },
  pie: { width: 170, height: 170 },
  pieLegend: { width: "100%", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pieLegendText: { fontFamily: fonts.uiBold, fontSize: 8.5, color: colors.muted },
  tableScroll: { paddingVertical: 3 },
  table: { minWidth: 410, overflow: "hidden", borderWidth: 1, borderColor: colors.line, borderRadius: 10 },
  tableRow: { minHeight: 39, flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.line },
  tableHeader: { borderTopWidth: 0, backgroundColor: colors.brand100 },
  tableHeadText: { width: 75, paddingHorizontal: 8, fontFamily: fonts.uiBold, fontSize: 9, textAlign: "right", color: colors.muted },
  tableSeries: { width: 110, textAlign: "left" },
  tableCellStrong: { paddingHorizontal: 8, fontFamily: fonts.uiBold, fontSize: 9.5, color: colors.ink },
  tableCell: { width: 75, paddingHorizontal: 8, fontFamily: fonts.uiMedium, fontSize: 9.5, textAlign: "right", color: colors.ink },
  tableNote: { padding: 8, borderTopWidth: 1, borderTopColor: colors.line, fontFamily: fonts.uiMedium, fontSize: 9, color: colors.muted },
  processList: { gap: 7 },
  processRow: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderWidth: 1, borderColor: colors.brand200, borderRadius: 11, backgroundColor: colors.cream },
  processNumber: { width: 27, height: 27, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: colors.rust },
  processNumberText: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.raised },
  processText: { flex: 1, fontFamily: fonts.uiBold, fontSize: 10.5, lineHeight: 16, color: colors.ink },
  mapList: { gap: 10 },
  mapCard: { alignItems: "center", gap: 7, padding: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.cream },
  map: { width: "100%", aspectRatio: 1.35, borderRadius: 8, backgroundColor: colors.brand50 },
  combinedCharts: { gap: 12 },
  subChart: { padding: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.cream },
  subChartTitle: { fontFamily: fonts.uiBold, fontSize: 11, textAlign: "center", color: colors.ink },
  errorCard: { flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 13, borderWidth: 1, borderColor: "rgba(220,38,38,0.35)", borderRadius: 11, backgroundColor: "rgba(220,38,38,0.06)" },
  errorText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 12, lineHeight: 18, color: colors.danger },
  editorBlock: { gap: 10 },
  editor: { minHeight: 270, padding: 16, borderWidth: 1.5, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.cream, fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.ink },
  editorFooter: { gap: 12 },
  wordCountRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  wordCount: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.muted },
  wordCountDone: { color: colors.teal },
  scoreList: { gap: 13 },
  scoreCard: { gap: 13, padding: 16, borderWidth: 1.5, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.cream },
  scoreTop: { gap: 13 },
  bandCircle: { alignSelf: "center", width: 92, height: 92, alignItems: "center", justifyContent: "center", borderWidth: 5, borderColor: "rgba(70,120,120,0.32)", borderRadius: 46, backgroundColor: colors.raised },
  bandLabel: { maxWidth: 66, fontFamily: fonts.uiBold, fontSize: 8, lineHeight: 10, textAlign: "center", textTransform: "uppercase", color: colors.muted },
  bandValue: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36, color: colors.teal },
  criteria: { gap: 7 },
  criterion: { gap: 4, padding: 10, borderRadius: 10, backgroundColor: "rgba(84,37,15,0.06)" },
  criterionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  criterionLabel: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.muted },
  criterionBand: { fontFamily: fonts.uiBold, fontSize: 15, color: colors.teal },
  criterionComment: { fontFamily: fonts.ui, fontSize: 10.5, lineHeight: 16, color: colors.ink },
  scoreEyebrow: { fontFamily: fonts.uiBold, fontSize: 9.5, letterSpacing: 0.65, textTransform: "uppercase", color: colors.muted },
  feedback: { marginTop: -7, fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 19, color: colors.ink },
  strengthBlock: { gap: 7 },
  strengthRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  strengthText: { flex: 1, fontFamily: fonts.ui, fontSize: 11.5, lineHeight: 18, color: colors.ink },
  xpBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(70,120,120,0.1)" },
  xpText: { fontFamily: fonts.uiBold, fontSize: 9.5, color: colors.teal },
  scoreSectionTitle: { flex: 1, fontFamily: fonts.uiBold, fontSize: 11, lineHeight: 16, letterSpacing: 0.35, textTransform: "uppercase", color: colors.ink },
  errorList: { gap: 8 },
  correctionCard: { gap: 6, padding: 11, borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.raised },
  correctionLine: { fontFamily: fonts.ui, fontSize: 11.5, lineHeight: 18, color: colors.ink },
  wrongText: { color: colors.danger, textDecorationLine: "line-through" },
  arrowText: { color: colors.muted },
  fixText: { fontFamily: fonts.uiBold, color: colors.teal },
  correctionNote: { fontFamily: fonts.ui, fontSize: 10.5, lineHeight: 16, color: colors.muted },
  improvedHeading: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 8 },
  improvedText: { padding: 12, borderRadius: 10, backgroundColor: "rgba(70,120,120,0.07)", fontFamily: fonts.ui, fontSize: 12, lineHeight: 20, color: colors.ink },
  sectionNav: { gap: 7, paddingVertical: 2 },
  sectionPill: { maxWidth: 230, justifyContent: "center", paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: "rgba(255,248,234,0.66)" },
  sectionPillText: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.muted },
  guideList: { gap: 13 },
  guide: { gap: 11, padding: 17, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.13, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 },
  guideEyebrow: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.7, textTransform: "uppercase", color: colors.teal },
  guideTitle: { fontFamily: fonts.display, fontSize: 26, lineHeight: 29, letterSpacing: 0.35, color: colors.ink },
  guideDescription: { fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 21, color: colors.muted },
  detailBlock: { gap: 10, padding: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.raised },
  tealBlock: { borderColor: "rgba(70,120,120,0.42)", backgroundColor: "rgba(70,120,120,0.07)" },
  rustBlock: { borderColor: "rgba(185,78,40,0.38)", backgroundColor: "rgba(185,78,40,0.07)" },
  detailHeading: { flexDirection: "row", alignItems: "center", gap: 7 },
  detailTitle: { flex: 1, fontFamily: fonts.uiBold, fontSize: 10.5, letterSpacing: 0.55, textTransform: "uppercase", color: colors.ink },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepNumber: { width: 24, height: 24, alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: "rgba(185,78,40,0.12)" },
  stepNumberText: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.brand600 },
  trapIcon: { marginTop: 3, marginHorizontal: 5 },
  detailText: { flex: 1, fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 19, color: colors.muted },
  exampleText: { paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: "rgba(70,120,120,0.42)", fontFamily: fonts.uiMedium, fontSize: 12.5, lineHeight: 20, color: colors.ink },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { paddingHorizontal: 9, paddingVertical: 7, borderWidth: 1, borderColor: colors.brand200, borderRadius: 7, backgroundColor: "rgba(185,78,40,0.08)", fontFamily: fonts.uiBold, fontSize: 10.5, lineHeight: 15, color: colors.ink },
  resourceHeading: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: 4 },
  resourceIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.cream },
  resourceTitle: { marginTop: 2, fontFamily: fonts.display, fontSize: 24, lineHeight: 27, color: colors.ink },
  resourceList: { gap: 10, paddingBottom: 8 },
  resourceCard: { width: 190, minHeight: 155, justifyContent: "space-between", padding: 15, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.13, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 },
  resourceEyebrow: { fontFamily: fonts.uiBold, fontSize: 9, letterSpacing: 0.6, textTransform: "uppercase", color: colors.teal },
  resourceCardTitle: { marginTop: 9, fontFamily: fonts.display, fontSize: 22, lineHeight: 25, color: colors.ink },
  resourceOpen: { flexDirection: "row", alignItems: "center", gap: 5 },
  resourceOpenText: { fontFamily: fonts.uiBold, fontSize: 10.5, color: colors.rustDark },
});
