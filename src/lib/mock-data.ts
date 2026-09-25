// Mock data for design/demo purposes only. Replace with real API calls
// once the backend exists. Nothing here is persisted or fetched.

import { toPersianDigits } from "./utils";

export type ExamGroup = "تجربی" | "ریاضی" | "انسانی";

export type Mentor = {
  id: string;
  name: string;
  rank: string;
  year: string;
  school: string;
  major: string;
  group: ExamGroup;
  style: string;
  capacity: number;
  capacityTotal: number;
  rating: number;
  reviewCount: number;
  story: string;
  strengths: { subject: string; score: number }[];
  verified: boolean;
  availability?: string[];
};

export const DEFAULT_AVAILABILITY = ["شنبه ۱۸:۰۰", "دوشنبه ۱۹:۰۰", "سه‌شنبه ۲۰:۰۰", "پنجشنبه ۱۷:۰۰"];

// Platform cut of each student subscription. Benchmarks (ostadbank.com mag,
// 2026): traditional institutes take 40–60%, online tutor marketplaces
// 15–20%. Mentora/Moshaversara don't publish theirs. Change it here only.
export const PLATFORM_COMMISSION_PERCENT = 12;
export const TRADITIONAL_INSTITUTE_COMMISSION = "۴۰ تا ۶۰٪";

// Used by mentor self-registration (/mentor/apply).
export const MENTOR_STYLES = ["همراه و آرام", "داده‌محور", "انگیزشی", "تست‌محور", "پروژه‌محور"];
export const SUBJECTS_BY_GROUP: Record<ExamGroup, string[]> = {
  تجربی: ["زیست", "شیمی", "فیزیک", "ریاضی"],
  ریاضی: ["ریاضی", "فیزیک", "شیمی"],
  انسانی: ["ادبیات", "عربی", "ریاضی و آمار", "علوم اجتماعی"],
};
export const AVAILABILITY_DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه"];
export const AVAILABILITY_TIMES = ["۱۶:۰۰", "۱۷:۰۰", "۱۸:۰۰", "۱۹:۰۰", "۲۰:۰۰"];

export const mentors: Mentor[] = [
  {
    id: "sara-mohammadi",
    name: "سارا محمدی",
    rank: "رتبه ۴۴۰",
    year: "کنکور ۱۴۰۳",
    school: "دانشگاه تهران",
    major: "دانشجوی پزشکی",
    group: "تجربی",
    style: "همراه و آرام",
    capacity: 3,
    capacityTotal: 15,
    rating: 4.9,
    reviewCount: 33,
    story:
      "سال دهم شیمی برام مثل یه زبون خارجی بود. با تجزیه‌کردن مسئله‌ها به قدم‌های خیلی کوچیک، از رتبه‌ی متوسط رسیدم به ۴۴۰. حالا می‌خوام همون مسیر رو با کسی که جای من بود، دوباره برم.",
    strengths: [
      { subject: "شیمی", score: 92 },
      { subject: "زیست", score: 88 },
      { subject: "ریاضی", score: 74 },
    ],
    verified: true,
  },
  {
    id: "amirhossein-rezaei",
    name: "امیرحسین رضایی",
    rank: "رتبه ۱۲۰",
    year: "کنکور ۱۴۰۴",
    school: "دانشگاه صنعتی شریف",
    major: "مهندسی برق",
    group: "ریاضی",
    style: "داده‌محور",
    capacity: 5,
    capacityTotal: 12,
    rating: 4.9,
    reviewCount: 33,
    story:
      "همیشه سریع تست می‌زدم ولی نامطمئن. با تحلیل زمان‌بندی خودم فهمیدم کجا سرعتم به دقتم ضربه می‌زنه. حالا همین روش تحلیلی رو با دانش‌آموزام کار می‌کنم.",
    strengths: [
      { subject: "ریاضی", score: 95 },
      { subject: "فیزیک", score: 90 },
      { subject: "شیمی", score: 70 },
    ],
    verified: true,
  },
  {
    id: "negar-ahmadi",
    name: "نگار احمدی",
    rank: "رتبه ۳۱۰",
    year: "کنکور ۱۴۰۳",
    school: "دانشگاه شهید بهشتی",
    major: "دندان‌پزشکی",
    group: "تجربی",
    style: "انگیزشی",
    capacity: 2,
    capacityTotal: 10,
    rating: 4.9,
    reviewCount: 33,
    story:
      "تا یازدهم رتبه‌ام امیدوارکننده نبود. یک جهش واقعی در دوازدهم زدم، فقط با تغییر برنامه و انگیزه. می‌دونم افت انگیزه توی این مسیر یعنی چی.",
    strengths: [
      { subject: "زیست", score: 90 },
      { subject: "شیمی", score: 85 },
      { subject: "ریاضی", score: 68 },
    ],
    verified: true,
  },
  {
    id: "reza-karimi",
    name: "رضا کریمی",
    rank: "رتبه ۵۵",
    year: "کنکور ۱۴۰۴",
    school: "دانشگاه صنعتی شریف",
    major: "مهندسی کامپیوتر",
    group: "ریاضی",
    style: "پروژه‌محور",
    capacity: 0,
    capacityTotal: 10,
    rating: 4.8,
    reviewCount: 20,
    story:
      "ریاضیات گسسته و هندسه برام همیشه انتزاعی بود تا وقتی شروع کردم به حل روی مثال‌های واقعی. همون روش رو با دانش‌آموزام کار می‌کنم.",
    strengths: [
      { subject: "ریاضی", score: 96 },
      { subject: "فیزیک", score: 85 },
      { subject: "شیمی", score: 60 },
    ],
    verified: true,
  },
  {
    id: "mahsa-ghasemi",
    name: "مهسا قاسمی",
    rank: "رتبه ۲۰۰",
    year: "کنکور ۱۴۰۳",
    school: "دانشگاه صنعتی امیرکبیر",
    major: "مهندسی مکانیک",
    group: "ریاضی",
    style: "تست‌محور",
    capacity: 4,
    capacityTotal: 12,
    rating: 4.7,
    reviewCount: 15,
    story:
      "تست‌زنی زمان‌بندی‌شده تغییرم داد؛ از رتبه‌ی نامشخص به ۲۰۰ رسیدم فقط با تمرین تحت فشار زمانی واقعی.",
    strengths: [
      { subject: "فیزیک", score: 91 },
      { subject: "ریاضی", score: 88 },
      { subject: "شیمی", score: 65 },
    ],
    verified: true,
  },
];

// Post-session ratings — feedback the student leaves right after a call.
// Seeded here so a mentor's profile can show real quotes instead of just
// the "rating" number.
export type SessionFeedback = {
  id: string;
  mentorId: string;
  studentName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  date: string;
};

export const sessionFeedback: SessionFeedback[] = [
  {
    id: "fb-1",
    mentorId: "sara-mohammadi",
    studentName: "امیرحسین",
    rating: 5,
    comment: "خیلی صبوره و دقیقاً بر اساس ضعف‌های من برنامه می‌ده.",
    date: "۲۰ شهریور",
  },
  {
    id: "fb-2",
    mentorId: "sara-mohammadi",
    studentName: "نگین",
    rating: 5,
    comment: "بعد از هر جلسه احساس می‌کنم می‌دونم دقیقاً باید چیکار کنم.",
    date: "۵ شهریور",
  },
  {
    id: "fb-3",
    mentorId: "amirhossein-rezaei",
    studentName: "رضا",
    rating: 4,
    comment: "روش تحلیلی‌ش عالیه؛ فقط گاهی جلسه چند دقیقه دیر شروع می‌شه.",
    date: "۱۵ شهریور",
  },
];

export type Subject = "ریاضی" | "فیزیک" | "شیمی" | "زیست";

export const placementQuestions: {
  id: number;
  subject: Subject;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  difficulty: 1 | 2 | 3;
}[] = [
  {
    id: 1,
    subject: "ریاضی",
    topic: "تابع",
    prompt: "اگر f(x) = 2x + 3 باشد، مقدار f(2) کدام است؟",
    options: ["۵", "۶", "۷", "۸"],
    correctIndex: 2,
    difficulty: 1,
  },
  {
    id: 2,
    subject: "ریاضی",
    topic: "تابع",
    prompt: "دامنه‌ی تابع f(x) = 1/(x-3) کدام است؟",
    options: ["همه‌ی اعداد حقیقی", "x ≠ 0", "x ≠ 3", "x > 3"],
    correctIndex: 2,
    difficulty: 2,
  },
  {
    id: 3,
    subject: "فیزیک",
    topic: "حرکت‌شناسی",
    prompt: "متحرکی با سرعت اولیه ۲۰ m/s شروع به ترمزکردن می‌کند (a = −۲ m/s²). مسافت توقف چقدر است؟",
    options: ["۵۰ متر", "۱۰۰ متر", "۱۵۰ متر", "۲۰۰ متر"],
    correctIndex: 1,
    difficulty: 2,
  },
  {
    id: 4,
    subject: "شیمی",
    topic: "شیمی آلی",
    prompt: "کدام گروه عاملی مشخصه‌ی الکل‌هاست؟",
    options: ["−COOH", "−OH", "−CHO", "−NH₂"],
    correctIndex: 1,
    difficulty: 1,
  },
  {
    id: 5,
    subject: "زیست",
    topic: "ژنتیک",
    prompt: "در میوز، جدایی کروموزوم‌های همتا در کدام مرحله رخ می‌دهد؟",
    options: ["آنافاز I", "آنافاز II", "پروفاز I", "متافاز II"],
    correctIndex: 0,
    difficulty: 2,
  },
];

export const levelProfile = {
  score: 78,
  label: "در حال شکل‌گیری",
  rankRange: "۸,۰۰۰ تا ۱۵,۰۰۰",
  subjects: [
    { name: "ریاضی" as Subject, value: 85 },
    { name: "فیزیک" as Subject, value: 72 },
    { name: "شیمی" as Subject, value: 48 },
    { name: "زیست" as Subject, value: 66 },
  ],
  topics: {
    strong: ["مثلثات", "دینامیک", "سلول"],
    shaky: ["تابع", "الکتریسیته", "ژنتیک"],
    weak: ["شیمی آلی", "حرکت‌شناسی", "تعادل شیمیایی"],
  },
  criticalPoints: [
    { topic: "شیمی آلی", reason: "بیشترین ضریب کنکور در بین نقاط ضعف توست" },
    { topic: "حرکت‌شناسی", reason: "پایه‌ی بیشتر مباحث فیزیک دوازدهم است" },
    { topic: "تابع", reason: "در ریاضی و فیزیک هر دو تکرار می‌شود" },
  ],
  timingPattern: "سریع و نسبتاً دقیق",
};

export const studentProfile = {
  name: "ایمان",
  phone: "۰۹۱۲ ۱۲۳ ۴۵۶۷",
  grade: "پایه دوازدهم" as const,
  city: "تهران",
  joinedAt: "۱۴۰۴/۰۴/۱۲",
  notificationPrefs: {
    checkinReminder: true,
    mentorMessage: true,
    weeklyReport: false,
  },
};

export const studentPlan = {
  todayTasks: [
    { id: 1, subject: "ریاضی" as Subject, topic: "مرور فصل ۳", duration: 45, status: "todo" as const },
    { id: 2, subject: "شیمی" as Subject, topic: "تست‌زنی و حل نکات", duration: 60, status: "todo" as const },
    { id: 3, subject: "زیست" as Subject, topic: "مطالعه درس فیزیولوژی", duration: 40, status: "done" as const },
  ],
  weekHours: 28,
  weekCompletedHours: 11,
  streakDays: 4,
};

// Combined weekly view for /dashboard/calendar — mentor sessions, the
// bi-weekly mock exam, and a daily task summary side by side. Deliberately
// a summary per day (Time Block, not a minute-by-minute calendar); the
// full per-task breakdown still lives on /dashboard/plan.
export type CalendarDay = {
  dayName: string;
  tasks: { subject: string; hours: number }[]; // same numbers as /dashboard/plan
  session?: { time: string; mentorName: string; mode: "video" | "audio" };
  exam?: { provider: string; name: string };
};

export const studentWeekCalendar: CalendarDay[] = [
  {
    dayName: "شنبه",
    tasks: [{ subject: "زیست", hours: 3 }],
    session: { time: "۱۸:۰۰", mentorName: "سارا محمدی", mode: "video" },
  },
  { dayName: "یکشنبه", tasks: [{ subject: "فیزیک", hours: 2 }, { subject: "شیمی", hours: 1.5 }] },
  {
    dayName: "دوشنبه",
    tasks: [
      { subject: "ریاضی", hours: 3 },
      { subject: "فیزیک", hours: 2 },
      { subject: "شیمی", hours: 1.5 },
    ],
  },
  { dayName: "سه‌شنبه", tasks: [{ subject: "ریاضی", hours: 2 }, { subject: "شیمی", hours: 1 }] },
  { dayName: "چهارشنبه", tasks: [{ subject: "فیزیک", hours: 2.5 }] },
  { dayName: "پنجشنبه", tasks: [{ subject: "ریاضی", hours: 2 }] },
  { dayName: "جمعه", tasks: [{ subject: "زیست", hours: 1.5 }], exam: { provider: "قلمچی", name: "آزمون جامع شماره ۶" } },
];

// ---------------------------------------------------------------------
// Exam-driven weekly cycle (§ real konkur-mentoring workflow)
//
// The actual workflow this maps to: students take a bi-weekly mock exam
// (Kanoon/"قلمچی", Gaj, or others — kept free-text on purpose, not a
// hardcoded enum, since mentors use whichever one a student is enrolled
// in) and get a رشته/major-specific "کارنامه" (score sheet) broken down
// per subject. The mentor reads that sheet next to the subject's
// "ضریب" (weight coefficient for the student's target major) to decide
// what the coming week's plan should prioritize — a subject that's both
// weak AND high-coefficient matters far more than a weak low-coefficient
// one. That reasoning should be visible in the UI, not just the numbers.
// ---------------------------------------------------------------------

export type ExamSubjectResult = {
  subject: Subject;
  correct: number;
  wrong: number;
  unanswered: number;
  percentage: number; // "درصد" — the number Iranian students actually track
};

export type ExamResult = {
  id: string;
  examProvider: string; // "قلمچی" | "گاج" | "ماز" | ... — student's actual exam service
  examName: string;
  date: string; // Persian date string, e.g. "۲۹ شهریور ۱۴۰۵"
  subjects: ExamSubjectResult[];
  overallPercentage: number;
  nationalRank?: number; // "تراز"-adjacent rank among all participants nationwide
};

// Two consecutive bi-weekly exams for the demo student, so the UI can show
// a trend (improving/declining) per subject, not just a single snapshot.
export const examResults: ExamResult[] = [
  {
    id: "exam-2",
    examProvider: "قلمچی",
    examName: "آزمون جامع شماره ۵",
    date: "۲۹ شهریور ۱۴۰۵",
    overallPercentage: 61,
    nationalRank: 8400,
    subjects: [
      { subject: "ریاضی", correct: 18, wrong: 4, unanswered: 3, percentage: 72 },
      { subject: "فیزیک", correct: 14, wrong: 6, unanswered: 5, percentage: 56 },
      { subject: "شیمی", correct: 9, wrong: 10, unanswered: 6, percentage: 36 },
      { subject: "زیست", correct: 16, wrong: 5, unanswered: 4, percentage: 64 },
    ],
  },
  {
    id: "exam-1",
    examProvider: "قلمچی",
    examName: "آزمون جامع شماره ۴",
    date: "۱۵ شهریور ۱۴۰۵",
    overallPercentage: 55,
    nationalRank: 11200,
    subjects: [
      { subject: "ریاضی", correct: 16, wrong: 6, unanswered: 3, percentage: 64 },
      { subject: "فیزیک", correct: 13, wrong: 7, unanswered: 5, percentage: 52 },
      { subject: "شیمی", correct: 7, wrong: 11, unanswered: 7, percentage: 28 },
      { subject: "زیست", correct: 15, wrong: 6, unanswered: 4, percentage: 60 },
    ],
  },
];

// ---------------------------------------------------------------------
// Student-side karnameh upload — the student is the one who actually
// receives the exam result from Kanoon/Gaj, so *they* should be able to
// send it straight to the mentor from here instead of via Telegram. This
// is a submission log only — no score breakdown or analysis is rebuilt
// from it (that stays on the mentor's side, sourced from the exam
// provider itself, per the earlier product decision).
// ---------------------------------------------------------------------

export type KarnamehUpload = {
  id: string;
  examProvider: string;
  date: string;
  fileName: string;
  note: string;
  seenByMentor: boolean;
};

export const karnamehUploads: KarnamehUpload[] = [
  {
    id: "ku-1",
    examProvider: "قلمچی",
    date: "۱۵ شهریور ۱۴۰۵",
    fileName: "karnameh-azmoon-4.jpg",
    note: "",
    seenByMentor: true,
  },
];

export const targetMajor = {
  name: "پزشکی — تجربی",
  coefficients: [
    { subject: "زیست" as Subject, coefficient: 4 },
    { subject: "شیمی" as Subject, coefficient: 3 },
    { subject: "فیزیک" as Subject, coefficient: 2 },
    { subject: "ریاضی" as Subject, coefficient: 2 },
  ],
};

// A weekly study-hour budget allocated by priority rank — the highest-impact
// subject gets the biggest block. This is what turns "شیمی ضعیفه" into an
// actual number the student can put on their calendar, matching how a
// mentor really writes a plan out ("ریاضی ۳، فیزیک ۲، شیمی ۱.۵").
const HOURS_BY_PRIORITY_RANK = [3, 2, 1.5, 1];

// Optional chapter/sub-topic detail per subject — the "جزئیات بیشتر" layer
// a mentor can choose to fill in for precision (real mentor tools go down
// to فصل + ریز مبحث, not just a subject name). Left undefined for a subject
// and the UI simply won't show the expand affordance for it.
const SUBJECT_DETAILS: Partial<Record<Subject, { chapter: string; subtopic: string }>> = {
  شیمی: { chapter: "فصل ۲ — تعادل شیمیایی", subtopic: "ثابت تعادل و اصل لوشاتلیه" },
  زیست: { chapter: "فصل ۶ — تنظیم عصبی", subtopic: "سیناپس و انتقال‌دهنده‌های عصبی" },
  فیزیک: { chapter: "فصل ۱ — حرکت‌شناسی", subtopic: "حرکت با شتاب ثابت" },
};

/** Optional فصل/ریز مبحث detail for a subject block, if the mentor filled it in. */
export function getSubjectDetail(subject: Subject) {
  return SUBJECT_DETAILS[subject];
}

/** Weak-subject × coefficient reasoning the mentor's plan should surface. */
export function examDrivenPriorities() {
  const latest = examResults[0];
  return latest.subjects
    .map((s) => {
      const coeff = targetMajor.coefficients.find((c) => c.subject === s.subject)?.coefficient ?? 1;
      return { ...s, coefficient: coeff, impact: (100 - s.percentage) * coeff };
    })
    .sort((a, b) => b.impact - a.impact)
    .map((s, i) => ({ ...s, hours: HOURS_BY_PRIORITY_RANK[i] ?? 1, detail: SUBJECT_DETAILS[s.subject] }));
}

export type CheckInEntry = { subject: string; topic: string; minutes: number; tests: number };

export type NightlyCheckIn = {
  id: string;
  date: string; // "امشب", "دیشب", or a Persian date
  week: "this" | "last";
  dayName: string; // شنبه … جمعه — lets the weekly summary group by day
  studentId: string;
  entries: CheckInEntry[];
  mood: "great" | "ok" | "tired" | "struggled";
  note: string;
  mentorSeen: boolean;
  /** Optional, "HH:MM": last night's bedtime and this morning's wake-up. */
  sleep?: { bed: string; wake: string };
};

// "Today" across the demo (matches the plan page's امروز).
export const CURRENT_DAY_NAME = "دوشنبه";
// The demo's fixed "today" as a calendar date: دوشنبه ۷ مهر ۱۴۰۵.
export const DEMO_TODAY_ISO = "2026-09-29";

// Konkur 1406 hasn't been announced by سنجش yet (1405's was ۲۹ مرداد), so
// this is an estimate — change it here once the official date is out.
export const KONKUR_DATE = { label: "۱۵ تیر ۱۴۰۶", iso: "2027-07-06", estimated: true };

export function daysUntilKonkur(todayIso = DEMO_TODAY_ISO): number {
  const ms = Date.parse(`${KONKUR_DATE.iso}T00:00:00Z`) - Date.parse(`${todayIso}T00:00:00Z`);
  return Math.max(0, Math.round(ms / 86_400_000));
}
export const WEEK_DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
export const WEEK_LABELS = { this: "این هفته (۵ تا ۱۱ مهر)", last: "هفته‌ی قبل (۲۹ شهریور تا ۴ مهر)" };
// Konkur تجربی subjects incl. the general ones students actually log.
export const CHECKIN_SUBJECTS = ["زیست", "شیمی", "فیزیک", "ریاضی", "ادبیات", "عربی", "دینی", "زبان"];

type SeedEntry = [subject: string, topic: string, minutes: number, tests: number];

function seedCheckIn(
  id: string,
  studentId: string,
  week: NightlyCheckIn["week"],
  dayName: string,
  entries: SeedEntry[],
  mood: NightlyCheckIn["mood"],
  note = "",
  date = `${dayName}${week === "last" ? " هفته‌ی قبل" : ""}`
): NightlyCheckIn {
  return {
    id,
    date,
    week,
    dayName,
    studentId,
    entries: entries.map(([subject, topic, minutes, tests]) => ({ subject, topic, minutes, tests })),
    mood,
    note,
    mentorSeen: true,
  };
}

// Attaches last night's sleep to seeded check-ins by id: [bed, wake].
function withSleep(list: NightlyCheckIn[], sleep: Record<string, [bed: string, wake: string]>): NightlyCheckIn[] {
  return list.map((ci) => (sleep[ci.id] ? { ...ci, sleep: { bed: sleep[ci.id][0], wake: sleep[ci.id][1] } } : ci));
}

export const moodLabels: Record<NightlyCheckIn["mood"], string> = {
  great: "عالی بودم 💪",
  ok: "خوب بود 🙂",
  tired: "خسته بودم 😪",
  struggled: "سخت گذشت 😞",
};

// Check-ins for the mentor's students — this feed is what replaces the
// mentor's Telegram group in the current real-world workflow.
// The recent ones — what the mentor's "گزارش کارهای دیشب" feed shows.
export const nightlyCheckIns: NightlyCheckIn[] = withSleep([
  {
    ...seedCheckIn(
      "ci-1",
      "3",
      "this",
      "دوشنبه",
      [
        ["زیست", "فیزیولوژی گیاهی", 50, 30],
        ["شیمی", "تست‌زنی فصل ۲", 40, 25],
      ],
      "great",
      "امروز خیلی خوب پیش رفت، شیمی رو کامل تموم کردم.",
      "امشب"
    ),
    mentorSeen: false,
  },
  {
    ...seedCheckIn("ci-2", "2", "this", "یکشنبه", [["ریاضی", "مثلثات", 35, 15]], "tired",
      "امروز مدرسه فوق‌العاده داشتیم، کم رسیدم بخونم.", "دیشب"),
    mentorSeen: false,
  },
  seedCheckIn("ci-3", "1", "last", "جمعه", [], "struggled", "", "۳ روز پیش"),
], {
  "ci-1": ["23:30", "06:30"],
  "ci-2": ["01:15", "06:45"],
});

// Older nights for the mentor's students — only feed the weekly summaries.
export const checkInHistory: NightlyCheckIn[] = withSleep([
  seedCheckIn("h3-1", "3", "last", "شنبه", [["زیست", "ژنتیک", 90, 40], ["شیمی", "استوکیومتری", 60, 30]], "great"),
  seedCheckIn("h3-2", "3", "last", "یکشنبه", [["فیزیک", "حرکت‌شناسی", 75, 25], ["ریاضی", "تابع", 45, 20]], "ok"),
  seedCheckIn("h3-3", "3", "last", "دوشنبه", [["زیست", "گردش خون", 80, 35], ["ادبیات", "آرایه‌ها", 30, 20]], "great"),
  seedCheckIn("h3-4", "3", "last", "سه‌شنبه", [["شیمی", "تعادل", 70, 30], ["عربی", "ترجمه", 30, 15]], "ok"),
  seedCheckIn("h3-5", "3", "last", "چهارشنبه", [["زیست", "تنفس", 60, 30], ["فیزیک", "دینامیک", 60, 20]], "tired"),
  seedCheckIn("h3-6", "3", "last", "پنجشنبه", [["ریاضی", "مشتق", 60, 25], ["شیمی", "آلی", 45, 20]], "ok"),
  seedCheckIn("h3-7", "3", "last", "جمعه", [["زیست", "آزمون جامع قلمچی", 90, 50]], "ok", "آزمون قلمچی بود"),
  seedCheckIn("h3-8", "3", "this", "شنبه", [["زیست", "تنظیم عصبی", 70, 30], ["فیزیک", "کار و انرژی", 50, 20]], "great"),
  seedCheckIn("h3-9", "3", "this", "یکشنبه", [["شیمی", "تعادل", 60, 35], ["ریاضی", "مثلثات", 40, 15]], "ok"),

  seedCheckIn("h2-1", "2", "last", "شنبه", [["ریاضی", "حد", 90, 30], ["فیزیک", "الکتریسیته", 60, 20]], "ok"),
  seedCheckIn("h2-2", "2", "last", "دوشنبه", [["ریاضی", "مشتق", 70, 25], ["شیمی", "اسید و باز", 40, 15]], "ok"),
  seedCheckIn("h2-3", "2", "last", "چهارشنبه", [["فیزیک", "مغناطیس", 60, 20]], "tired"),
  seedCheckIn("h2-4", "2", "last", "پنجشنبه", [["ریاضی", "انتگرال", 50, 15], ["زبان", "لغت", 20, 10]], "ok"),
  seedCheckIn("h2-5", "2", "this", "شنبه", [["ریاضی", "مثلثات", 45, 20]], "ok"),

  seedCheckIn("h1-1", "1", "last", "شنبه", [["زیست", "سلول", 40, 10]], "tired"),
  seedCheckIn("h1-2", "1", "last", "سه‌شنبه", [["شیمی", "آلی", 30, 5]], "struggled", "هیچی نفهمیدم از آلی"),
], {
  "h3-1": ["23:00", "06:30"], "h3-2": ["23:30", "06:30"], "h3-3": ["23:15", "06:30"], "h3-4": ["00:00", "06:45"],
  "h3-5": ["00:30", "06:45"], "h3-6": ["23:30", "07:00"], "h3-7": ["23:00", "06:00"], "h3-8": ["23:00", "06:30"],
  "h3-9": ["23:45", "06:30"],
  "h2-1": ["00:30", "06:30"], "h2-2": ["01:00", "06:30"], "h2-3": ["01:30", "06:45"], "h2-4": ["00:45", "07:00"],
  "h2-5": ["01:00", "06:30"],
});

// The logged-in student's own (ایمان) past nights; tonight's is entered on
// /dashboard/report and kept in the browser (see checkin-store).
export const myCheckInSeed: NightlyCheckIn[] = withSleep([
  seedCheckIn("me-1", "me", "last", "شنبه", [["زیست", "ژنتیک", 80, 30], ["شیمی", "استوکیومتری", 50, 25]], "ok"),
  seedCheckIn("me-2", "me", "last", "یکشنبه", [["ریاضی", "تابع", 60, 20], ["فیزیک", "حرکت‌شناسی", 45, 15]], "great"),
  seedCheckIn("me-3", "me", "last", "دوشنبه", [["زیست", "گردش خون", 70, 35], ["ادبیات", "قرابت معنایی", 25, 15]], "ok"),
  seedCheckIn("me-4", "me", "last", "سه‌شنبه", [["شیمی", "تعادل", 60, 20]], "tired", "شیمی سنگین بود"),
  seedCheckIn("me-5", "me", "last", "چهارشنبه", [["فیزیک", "دینامیک", 50, 20], ["عربی", "قواعد", 30, 20]], "ok"),
  seedCheckIn("me-6", "me", "last", "پنجشنبه", [["زیست", "تنفس", 60, 30], ["ریاضی", "مشتق", 40, 15]], "great"),
  seedCheckIn("me-7", "me", "last", "جمعه", [["زیست", "آزمون جامع قلمچی", 90, 45]], "ok"),
  seedCheckIn("me-8", "me", "this", "شنبه", [["ریاضی", "مرور فصل ۲", 60, 25], ["شیمی", "تست‌زنی", 45, 30]], "ok"),
  seedCheckIn("me-9", "me", "this", "یکشنبه", [["فیزیک", "حرکت‌شناسی", 90, 20], ["زیست", "فیزیولوژی", 40, 20]], "great"),
], {
  "me-1": ["23:30", "07:00"], "me-2": ["23:00", "06:30"], "me-3": ["00:30", "06:30"], "me-4": ["01:00", "06:30"],
  "me-5": ["23:30", "06:45"], "me-6": ["23:00", "06:30"], "me-7": ["23:30", "06:00"],
  "me-8": ["23:15", "06:45"], "me-9": ["00:15", "06:45"],
});

export const chatMessages = [
  { id: 1, from: "mentor" as const, text: "سلام! برنامه‌ی این هفته رو دیدی؟ از فردا شیمی آلی رو شروع می‌کنیم.", time: "۰۹:۱۲" },
  { id: 2, from: "student" as const, text: "سلام سارا جان، دیدم. یه سوال داشتم از فصل ۲ شیمی که گیر کردم", time: "۱۴:۰۳" },
  { id: 3, from: "student" as const, text: "الان عکسشو می‌فرستم", time: "۱۴:۰۳" },
  { id: 4, from: "mentor" as const, text: "باشه بفرست ببینم. فردا سر جلسه هم روش کار می‌کنیم.", time: "۱۸:۴۰" },
];

export type WeeklyHistoryPoint = {
  weekLabel: string; // short label, e.g. "۱۵ شهریور"
  studyHours: number;
  planCompletionPercent: number;
};

export type MentorStudent = {
  id: string;
  name: string;
  grade: string;
  lastCheckIn: string;
  daysSinceCheckIn: number; // drives the at-risk rule, not the free-text label above
  planCompletion: number;
  unreadMessages: number;
  /** Biggest percentage drop between this student's last two exams, if any. */
  examDrop?: { subject: Subject; from: number; to: number };
  /** Oldest → newest. Real "روند" detection needs history, not one point. */
  weeklyHistory: WeeklyHistoryPoint[];
  nextWeekPlanReady: boolean; // drives the mentor-side "هنوز برنامه نساختی" nudge
};

export const mentorStudents: MentorStudent[] = [
  {
    id: "1",
    name: "امیرحسین رضایی",
    grade: "پایه دوازدهم — تجربی",
    lastCheckIn: "۳ روز پیش",
    daysSinceCheckIn: 3,
    planCompletion: 45,
    unreadMessages: 2,
    examDrop: { subject: "شیمی", from: 45, to: 36 },
    weeklyHistory: [
      { weekLabel: "۱ شهریور", studyHours: 24, planCompletionPercent: 78 },
      { weekLabel: "۱۵ شهریور", studyHours: 19, planCompletionPercent: 60 },
      { weekLabel: "۲۹ شهریور", studyHours: 14, planCompletionPercent: 45 },
    ],
    nextWeekPlanReady: false,
  },
  {
    id: "2",
    name: "مریم صادقی",
    grade: "پایه یازدهم — ریاضی",
    lastCheckIn: "دیروز",
    daysSinceCheckIn: 1,
    planCompletion: 68,
    unreadMessages: 0,
    // Looks fine as a single point (68% ≥ 60% threshold), but the trend
    // shows a steady decline — exactly the case a point-in-time rule misses.
    weeklyHistory: [
      { weekLabel: "۱ شهریور", studyHours: 22, planCompletionPercent: 88 },
      { weekLabel: "۱۵ شهریور", studyHours: 20, planCompletionPercent: 75 },
      { weekLabel: "۲۹ شهریور", studyHours: 18, planCompletionPercent: 68 },
    ],
    nextWeekPlanReady: false,
  },
  {
    id: "3",
    name: "علی نوری",
    grade: "پشت‌کنکوری — تجربی",
    lastCheckIn: "امروز",
    daysSinceCheckIn: 0,
    planCompletion: 92,
    unreadMessages: 1,
    weeklyHistory: [
      { weekLabel: "۱ شهریور", studyHours: 25, planCompletionPercent: 75 },
      { weekLabel: "۱۵ شهریور", studyHours: 27, planCompletionPercent: 84 },
      { weekLabel: "۲۹ شهریور", studyHours: 29, planCompletionPercent: 92 },
    ],
    nextWeekPlanReady: true,
  },
];

// ---------------------------------------------------------------------
// Automatic at-risk detection — a point-in-time threshold misses students
// who "still look fine" but are declining. Per the research (Moshaversara's
// "7 early-warning signals"), the strongest signal is a *trend* across
// consecutive weeks, not a single number. Priority order: hard signals
// first (check-in gap, exam drop), then trend, then a same-point fallback.
// ---------------------------------------------------------------------

// Four tiers, not three — "روی مسیر" (merely fine) and "عالی" (a standout
// performer) are genuinely different things to a mentor, and the real
// product we researched keeps them separate (عالی / معمولی / بحرانی) so
// top students get positive recognition instead of just "not at risk".
export type RiskLevel = "excellent" | "success" | "warning" | "danger";
export type RiskInfo = { level: RiskLevel; label: string; reason: string | null };

function isMonotonicDecline(values: number[]): boolean {
  return values.every((v, i) => i === 0 || v <= values[i - 1]) && values[0] > values[values.length - 1];
}

export function getRiskInfo(student: MentorStudent): RiskInfo {
  if (student.daysSinceCheckIn >= 3) {
    return {
      level: "danger",
      label: "نیاز به توجه",
      reason: `${toPersianDigits(student.daysSinceCheckIn)} روز گزارش کار نفرستاده`,
    };
  }
  if (student.examDrop && student.examDrop.from - student.examDrop.to >= 5) {
    const { subject, from, to } = student.examDrop;
    return {
      level: "danger",
      label: "نیاز به توجه",
      reason: `${subject} از ${toPersianDigits(from)}٪ به ${toPersianDigits(to)}٪ افت کرده`,
    };
  }

  const completions = student.weeklyHistory.map((w) => w.planCompletionPercent);
  if (completions.length >= 3 && isMonotonicDecline(completions)) {
    const totalDrop = completions[0] - completions[completions.length - 1];
    if (totalDrop >= 15) {
      return {
        level: "danger",
        label: "نیاز به توجه",
        reason: `کاهش تدریجی اجرای برنامه: ${completions.map((c) => `${toPersianDigits(c)}٪`).join(" ← ")}`,
      };
    }
  }

  const hours = student.weeklyHistory.map((w) => w.studyHours);
  if (hours.length >= 3 && isMonotonicDecline(hours)) {
    const dropPercent = Math.round(((hours[0] - hours[hours.length - 1]) / hours[0]) * 100);
    if (dropPercent >= 20) {
      return {
        level: "warning",
        label: "کمی عقب",
        reason: `کاهش تدریجی ساعت مطالعه: ${hours.map((h) => toPersianDigits(h)).join(" ← ")} ساعت`,
      };
    }
  }

  if (student.planCompletion < 60) {
    return {
      level: "warning",
      label: "کمی عقب",
      reason: `اجرای برنامه فقط ${toPersianDigits(student.planCompletion)}٪`,
    };
  }

  const isImproving = completions.length >= 2 && completions[completions.length - 1] > completions[0];
  if (student.planCompletion >= 90 && isImproving) {
    return { level: "excellent", label: "عالی", reason: null };
  }

  return { level: "success", label: "روی مسیر", reason: null };
}

// ---------------------------------------------------------------------
// Root-cause analysis ("مستر هوشمند") — cross-references the exam-driven
// priority (weak% × coefficient) with the placement profile's weak
// topics, so the mentor sees a *reason*, not just a number. Mentor-only:
// never surface this reasoning on a student-facing page.
// ---------------------------------------------------------------------

export function rootCauseAnalysis() {
  const priorities = examDrivenPriorities();
  const weakest = priorities[0];
  // crude topic match: topics whose name we associate with the weakest
  // subject in this demo dataset (a real backend would tag topics by
  // subject explicitly).
  const relatedTopics = levelProfile.topics.weak.filter((t) =>
    weakest.subject === "شیمی" ? t.includes("شیمی") || t.includes("تعادل") : true
  );
  return {
    subject: weakest.subject,
    percentage: weakest.percentage,
    coefficient: weakest.coefficient,
    likelyTopics: relatedTopics.length ? relatedTopics : levelProfile.topics.weak.slice(0, 2),
  };
}

// ---------------------------------------------------------------------
// Parent layer — read-only weekly report. No chat, no AI conversations,
// no mentor's private notes. Just the three numbers + one human line.
// ---------------------------------------------------------------------

// Growth history for the logged-in demo student (ایمان) — drives the
// trend chart on /parent and /dashboard/reports. Oldest → newest.
export const studentWeeklyHistory: WeeklyHistoryPoint[] = [
  { weekLabel: "۱ شهریور", studyHours: 8, planCompletionPercent: 40 },
  { weekLabel: "۸ شهریور", studyHours: 9, planCompletionPercent: 48 },
  { weekLabel: "۱۵ شهریور", studyHours: 10, planCompletionPercent: 55 },
  { weekLabel: "۲۲ شهریور", studyHours: 9, planCompletionPercent: 60 },
  { weekLabel: "۲۹ شهریور", studyHours: 11, planCompletionPercent: 68 },
];

export const parentWeeklyReport = {
  studentName: "ایمان",
  weekLabel: "هفته‌ی ۲۹ شهریور تا ۵ مهر",
  studyHours: studentPlan.weekCompletedHours,
  studyHoursTarget: studentPlan.weekHours,
  planCompletionPercent: 68,
  trend: "improving" as "improving" | "steady" | "declining",
  mentorNote:
    "این هفته پیشرفت خوبی توی شیمی داشت. تمرکز هفته‌ی بعد رو می‌ذاریم روی فیزیک. اگه سوالی بود در خدمتم.",
  mentorName: "سارا محمدی",
};

// V-03 — parent-facing billing (the parent is usually who actually pays
// for the subscription, not the student).
export type PaymentRecord = {
  id: string;
  date: string;
  planName: string;
  amount: number;
  status: "paid" | "failed";
};

export const parentBilling = {
  planId: "companion",
  planName: "همراه",
  price: 1490000,
  nextBillingDate: "۱۵ مهر",
  cardLast4: "۴۴۴۴",
  history: [
    { id: "pay-1", date: "۱۵ شهریور", planName: "همراه", amount: 1490000, status: "paid" },
    { id: "pay-2", date: "۱۵ مرداد", planName: "همراه", amount: 1490000, status: "paid" },
    { id: "pay-3", date: "۱۵ تیر", planName: "پایه", amount: 890000, status: "paid" },
  ] as PaymentRecord[],
};

// ---------------------------------------------------------------------
// Content library ("دانش‌سرا") — the mentor's own material (notes, voice
// notes, recorded explanations), replacing files scattered across
// Telegram. Not a public test bank — just this mentor's own content.
// ---------------------------------------------------------------------

export type ContentItem = {
  id: string;
  title: string;
  type: "pdf" | "audio" | "video";
  subject: Subject;
  topic: string;
  uploadedAt: string;
};

export const contentLibrary: ContentItem[] = [
  {
    id: "c1",
    title: "جزوه‌ی جمع‌بندی شیمی آلی",
    type: "pdf",
    subject: "شیمی",
    topic: "شیمی آلی",
    uploadedAt: "۲۵ شهریور ۱۴۰۵",
  },
  {
    id: "c2",
    title: "توضیح صوتی حل تست‌های تعادل شیمیایی",
    type: "audio",
    subject: "شیمی",
    topic: "تعادل شیمیایی",
    uploadedAt: "۲۷ شهریور ۱۴۰۵",
  },
  {
    id: "c3",
    title: "ویدیوی حل مسائل حرکت‌شناسی",
    type: "video",
    subject: "فیزیک",
    topic: "حرکت‌شناسی",
    uploadedAt: "۱ مهر ۱۴۰۵",
  },
];

export const pricingPlans = [
  {
    id: "free",
    name: "رایگان",
    price: 0,
    period: "",
    features: ["تعیین سطح کامل", "نیمرخ سطح", "مشاهده‌ی ۳ مشاور پیشنهادی"],
  },
  {
    id: "basic",
    name: "پایه",
    price: 890000,
    period: "در ماه",
    features: ["برنامه‌ریز تطبیقی", "معلم هوشمند AI", "بانک تست و گزارش"],
  },
  {
    id: "companion",
    name: "همراه",
    price: 1490000,
    period: "در ماه",
    highlight: true,
    features: [
      "همه‌ی امکانات پایه",
      "مشاور اختصاصی از رتبه‌برترها",
      "جلسه‌ی هفتگی + چت مستقیم",
    ],
  },
  {
    id: "premium",
    name: "ویژه",
    price: 2190000,
    period: "در ماه",
    features: ["همه‌ی امکانات همراه", "جلسات بیشتر در هفته", "پاسخ‌گویی سریع‌تر مشاور"],
  },
];

// ---------------------------------------------------------------------
// Mentor panel — messages, calendar, earnings, profile. Rounds out the
// sidebar nav so every link in MentorShell resolves to a real page.
// ---------------------------------------------------------------------

export type ChatMessage = {
  id: number;
  from: "mentor" | "student";
  text: string;
  time: string;
  voice?: { url: string; seconds: number };
  broadcast?: boolean; // sent to several students at once (پیام گروهی)
};

/** One thread per student, keyed by MentorStudent.id. */
export const mentorMessageThreads: Record<string, ChatMessage[]> = {
  "1": [
    { id: 1, from: "mentor", text: "سلام امیرحسین، این هفته برنامه رو دیدی؟", time: "دیروز ۱۰:۰۰" },
    { id: 2, from: "mentor", text: "چند روزه ازت خبری نیست، حالت خوبه؟", time: "امروز ۰۹:۳۰" },
  ],
  "2": [
    { id: 1, from: "student", text: "سلام، ببخشید دیشب مدرسه فوق‌العاده داشتیم کم رسیدم بخونم", time: "دیروز ۲۲:۱۰" },
    { id: 2, from: "mentor", text: "مشکلی نیست، فردا جبران می‌کنیم. شب بخیر", time: "دیروز ۲۲:۱۵" },
  ],
  "3": [
    { id: 1, from: "student", text: "سلام سارا جان، یه سوال از فصل ۲ شیمی داشتم", time: "۱۴:۰۳" },
    { id: 2, from: "student", text: "الان عکسشو می‌فرستم", time: "۱۴:۰۳" },
    { id: 3, from: "mentor", text: "باشه بفرست ببینم. فردا سر جلسه هم روش کار می‌کنیم.", time: "۱۸:۴۰" },
  ],
};

export type UpcomingSession = {
  id: string;
  studentId: string;
  dayLabel: string; // "امروز", "فردا", or a day name
  time: string;
  mode: "video" | "audio";
};

export const upcomingSessions: UpcomingSession[] = [
  { id: "s1", studentId: "3", dayLabel: "امروز", time: "۱۸:۰۰", mode: "video" },
  { id: "s2", studentId: "2", dayLabel: "فردا", time: "۱۹:۳۰", mode: "video" },
  { id: "s3", studentId: "1", dayLabel: "سه‌شنبه", time: "۱۷:۰۰", mode: "audio" },
];

export type StudentEarning = {
  studentId: string;
  planName: "برنزی" | "نقره‌ای" | "طلایی";
  monthlyFee: number; // تومان
  paidThisMonth: boolean;
};

export const studentEarnings: StudentEarning[] = [
  { studentId: "1", planName: "نقره‌ای", monthlyFee: 1200000, paidThisMonth: true },
  { studentId: "2", planName: "برنزی", monthlyFee: 800000, paidThisMonth: true },
  { studentId: "3", planName: "طلایی", monthlyFee: 1800000, paidThisMonth: false },
];

export const earningsHistory: { monthLabel: string; total: number }[] = [
  { monthLabel: "تیر", total: 2600000 },
  { monthLabel: "مرداد", total: 3200000 },
  { monthLabel: "شهریور", total: 3800000 },
];

// ---------------------------------------------------------------------
// News — public marketing content (konkur calendar changes, exam-provider
// updates, platform announcements). Deliberately NOT wired into
// StudentShell's nav: a student mid-study-session shouldn't get pulled
// into browsing news. Lives on the public site only.
// ---------------------------------------------------------------------

export type NewsArticle = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  date: string;
  category: string;
};

export const newsArticles: NewsArticle[] = [
  {
    slug: "konkur-1406-date-announced",
    title: "تاریخ برگزاری کنکور سراسری ۱۴۰۶ اعلام شد",
    excerpt: "سازمان سنجش زمان دقیق برگزاری کنکور سراسری سال آینده را اعلام کرد.",
    body: "طبق اعلام سازمان سنجش آموزش کشور، کنکور سراسری ۱۴۰۶ در تیرماه برگزار خواهد شد. دانش‌آموزان و داوطلبان می‌توانند از طریق سامانه‌ی سازمان سنجش، برنامه‌ی دقیق هر رشته را مشاهده کنند. مشاوران ما توصیه می‌کنند برنامه‌ریزی نیم‌سال دوم را با در نظر گرفتن این تاریخ تنظیم کنید.",
    date: "۱ مهر ۱۴۰۵",
    category: "تقویم کنکور",
  },
  {
    slug: "kanoon-exam-schedule-update",
    title: "تغییر در تقویم آزمون‌های دوهفته‌ای قلمچی",
    excerpt: "آزمون‌های جامع شماره ۶ و ۷ قلمچی یک هفته جابه‌جا شدند.",
    body: "بر اساس اعلام مؤسسه‌ی قلمچی، آزمون‌های جامع شماره ۶ و ۷ به دلیل هم‌زمانی با امتحانات میان‌ترم مدارس، یک هفته به تعویق افتادند. این تغییر روی برنامه‌ی هفتگی دانش‌آموزانی که با کارنامه‌ی این آزمون‌ها برنامه‌ریزی می‌کنند اثر می‌گذارد.",
    date: "۲۸ شهریور ۱۴۰۵",
    category: "اطلاعیه آزمون",
  },
  {
    slug: "platform-mentor-onboarding",
    title: "بازه‌ی پذیرش مشاوران جدید باز شد",
    excerpt: "اگر رتبه‌ی برتر کنکور بودی و می‌خوای مشاور بشی، الان زمان ثبت‌نامه.",
    body: "تیم ما به‌دنبال جذب مشاوران جدید از میان رتبه‌های برتر یک تا دو سال اخیر کنکور است. اگر تجربه‌ی موفقی در مسیر کنکور داشته‌اید و علاقه‌مند به کمک به دانش‌آموزان دیگر هستید، از طریق فرم ثبت‌نام مشاوران اقدام کنید.",
    date: "۲۰ شهریور ۱۴۰۵",
    category: "اعلامیه پلتفرم",
  },
];

// ---------------------------------------------------------------------
// Admin panel (A-02, A-03, A-04, A-06) — wireframe-level: platform ops
// approving mentors, managing accounts/complaints, and a finance overview.
// No real auth; entered the same way /parent is (a demo link).
// ---------------------------------------------------------------------

export type MentorApplication = {
  id: string;
  name: string;
  rank: string;
  year: string;
  school: string;
  major: string;
  appliedAt: string;
  status: "pending" | "approved" | "rejected";
};

export const mentorApplications: MentorApplication[] = [
  {
    id: "app-1",
    name: "پویا اسدی",
    rank: "رتبه ۹۰",
    year: "کنکور ۱۴۰۴",
    school: "دانشگاه تهران",
    major: "مهندسی برق",
    appliedAt: "۲ روز پیش",
    status: "pending",
  },
  {
    id: "app-2",
    name: "الناز رستمی",
    rank: "رتبه ۲۵۰",
    year: "کنکور ۱۴۰۳",
    school: "دانشگاه علوم پزشکی ایران",
    major: "پزشکی",
    appliedAt: "۵ روز پیش",
    status: "pending",
  },
  {
    id: "app-3",
    name: "کیان مرادی",
    rank: "رتبه ۱۸۰",
    year: "کنکور ۱۴۰۴",
    school: "دانشگاه صنعتی شریف",
    major: "مهندسی مکانیک",
    appliedAt: "۱ هفته پیش",
    status: "approved",
  },
];

export type AdminUser = {
  id: string;
  name: string;
  role: "دانش‌آموز" | "مشاور";
  phone: string;
  joinedAt: string;
  status: "active" | "suspended";
};

export const adminUsers: AdminUser[] = [
  { id: "u-1", name: "ایمان", role: "دانش‌آموز", phone: "۰۹۱۲ ۱۲۳ ۴۵۶۷", joinedAt: "۱۴۰۴/۰۴/۱۲", status: "active" },
  { id: "u-2", name: "امیرحسین رضایی", role: "دانش‌آموز", phone: "۰۹۳۵ ۲۲۲ ۳۳۴۴", joinedAt: "۱۴۰۴/۰۲/۰۱", status: "active" },
  { id: "u-3", name: "سارا محمدی", role: "مشاور", phone: "۰۹۱۲ ۹۹۹ ۸۸۷۷", joinedAt: "۱۴۰۳/۱۱/۱۰", status: "active" },
  { id: "u-4", name: "رضا نامدار", role: "دانش‌آموز", phone: "۰۹۳۹ ۴۴۴ ۵۵۶۶", joinedAt: "۱۴۰۴/۰۵/۲۰", status: "suspended" },
];

export type Complaint = {
  id: string;
  fromName: string;
  aboutName: string;
  reason: string;
  date: string;
  status: "open" | "resolved";
};

export const complaints: Complaint[] = [
  {
    id: "cp-1",
    fromName: "رضا نامدار",
    aboutName: "—",
    reason: "مشاورم دو هفته‌ست پاسخ پیام نمی‌ده",
    date: "۳ روز پیش",
    status: "open",
  },
  {
    id: "cp-2",
    fromName: "امیرحسین رضایی",
    aboutName: "—",
    reason: "پرداخت انجام شد ولی پلن آپدیت نشد",
    date: "۱ هفته پیش",
    status: "resolved",
  },
];

export type PlatformRevenuePoint = { monthLabel: string; total: number };

export const platformRevenue: PlatformRevenuePoint[] = [
  { monthLabel: "تیر", total: 42000000 },
  { monthLabel: "مرداد", total: 51000000 },
  { monthLabel: "شهریور", total: 63000000 },
];

export const pendingMentorPayouts = 8;

// A-07 — platform activity/audit log. Not user-facing: this is what an
// admin checks when a complaint comes in ("چرا حساب من مسدود شد؟") or a
// payment needs tracing. The event itself (who / what / when / details) is
// immutable on purpose — an editable audit trail proves nothing. What the
// admin edits is the follow-up layer (status, assignee, tags, note), and
// every such edit is itself recorded. Live admin actions are appended by
// admin-log-store.
export type LogCategory = "مشاوران" | "کاربران" | "مالی" | "شکایات" | "امنیت";
export type LogActorRole = "ادمین" | "سیستم" | "دانش‌آموز" | "مشاور" | "والد";
export type LogSeverity = "info" | "warning" | "critical";
export type FollowUpStatus = "new" | "in_progress" | "reviewed";

export type LogFollowUp = {
  status: FollowUpStatus;
  assignee: string;
  tags: string[];
  note: string;
  history: { by: string; at: string; change: string }[];
};

export type PlatformLogEntry = {
  id: string;
  category: LogCategory;
  actor: string;
  actorRole: LogActorRole;
  action: string;
  target: string;
  date: string; // "۷ مهر ۱۴۰۵"
  time: string; // "۱۰:۲۲"
  severity: LogSeverity;
  device?: string;
  details: { label: string; value: string }[];
  href?: string; // related admin page
  followUp: LogFollowUp;
};

export const LOG_ADMINS = ["ادمین پلتفرم", "مریم (پشتیبانی)", "علی (مالی)"];

function followUp(status: FollowUpStatus = "reviewed", extra: Partial<LogFollowUp> = {}): LogFollowUp {
  return { status, assignee: "", tags: [], note: "", history: [], ...extra };
}

export const platformLogs: PlatformLogEntry[] = [
  {
    id: "log-1",
    category: "مشاوران",
    actor: "ادمین پلتفرم",
    actorRole: "ادمین",
    action: "تأیید درخواست مشاور",
    target: "کیان مرادی",
    date: "۷ مهر ۱۴۰۵",
    time: "۱۰:۲۲",
    severity: "info",
    device: "تهران · Chrome روی macOS",
    details: [
      { label: "رتبه", value: "۱۲۰ تجربی ۱۴۰۴" },
      { label: "مدرک احراز", value: "karnameh-1404.pdf" },
      { label: "وضعیت", value: "در انتظار ← تأییدشده" },
    ],
    href: "/admin/mentors",
    followUp: followUp(),
  },
  {
    id: "log-2",
    category: "امنیت",
    actor: "سیستم",
    actorRole: "سیستم",
    action: "۵ تلاش ناموفق ورود پشت‌سرهم",
    target: "حساب ۰۹۳۹ ۴۴۴ ۵۵۶۶ (رضا نامدار)",
    date: "۷ مهر ۱۴۰۵",
    time: "۰۳:۴۱",
    severity: "critical",
    device: "IP ناشناس · خارج از ایران",
    details: [
      { label: "تعداد تلاش", value: "۵ در ۲ دقیقه" },
      { label: "اقدام خودکار", value: "قفل ورود به مدت ۳۰ دقیقه" },
    ],
    href: "/admin/users",
    followUp: followUp("new"),
  },
  {
    id: "log-3",
    category: "کاربران",
    actor: "ادمین پلتفرم",
    actorRole: "ادمین",
    action: "مسدودسازی حساب",
    target: "رضا نامدار",
    date: "۶ مهر ۱۴۰۵",
    time: "۱۸:۰۵",
    severity: "warning",
    device: "تهران · Chrome روی macOS",
    details: [
      { label: "دلیل", value: "گزارش رفتار نامناسب در چت با مشاور" },
      { label: "وضعیت", value: "فعال ← مسدود" },
    ],
    href: "/admin/users",
    followUp: followUp("in_progress", {
      assignee: "مریم (پشتیبانی)",
      tags: ["نیاز به تماس"],
      note: "با والدینش تماس گرفته بشه قبل از رفع مسدودیت.",
      history: [{ by: "مریم (پشتیبانی)", at: "۶ مهر، ۱۸:۲۰", change: "وضعیت: جدید ← در حال پیگیری" }],
    }),
  },
  {
    id: "log-4",
    category: "مالی",
    actor: "درگاه پرداخت",
    actorRole: "سیستم",
    action: "پرداخت ناموفق",
    target: "امیرحسین رضایی — پلن همراه",
    date: "۶ مهر ۱۴۰۵",
    time: "۱۴:۴۰",
    severity: "warning",
    details: [
      { label: "مبلغ", value: "۱,۴۹۰,۰۰۰ تومان" },
      { label: "کد پیگیری", value: "TRX-88213" },
      { label: "خطای بانک", value: "موجودی کافی نیست (کد ۵۱)" },
    ],
    href: "/admin/payments",
    followUp: followUp("new"),
  },
  {
    id: "log-5",
    category: "شکایات",
    actor: "رضا نامدار",
    actorRole: "دانش‌آموز",
    action: "ثبت شکایت جدید",
    target: "مشاور بی‌پاسخ — نگار احمدی",
    date: "۴ مهر ۱۴۰۵",
    time: "۰۹:۱۵",
    severity: "warning",
    device: "مشهد · اپ اندروید",
    details: [
      { label: "متن", value: "مشاورم دو هفته‌ست پاسخ پیام نمی‌ده" },
      { label: "آخرین پیام مشاور", value: "۱۹ شهریور" },
    ],
    href: "/admin/users",
    followUp: followUp("in_progress", { assignee: "ادمین پلتفرم", tags: ["تعویض مشاور"] }),
  },
  {
    id: "log-6",
    category: "مالی",
    actor: "درگاه پرداخت",
    actorRole: "سیستم",
    action: "پرداخت موفق",
    target: "ایمان — پلن همراه",
    date: "۳ مهر ۱۴۰۵",
    time: "۱۱:۰۰",
    severity: "info",
    details: [
      { label: "مبلغ", value: "۱,۴۹۰,۰۰۰ تومان" },
      { label: "کد پیگیری", value: "TRX-88102" },
      { label: "پرداخت‌کننده", value: "والد (کارت ****۴۴۴۴)" },
    ],
    href: "/admin/payments",
    followUp: followUp(),
  },
  {
    id: "log-7",
    category: "امنیت",
    actor: "سارا محمدی",
    actorRole: "مشاور",
    action: "ورود از دستگاه جدید",
    target: "حساب مشاور",
    date: "۲ مهر ۱۴۰۵",
    time: "۲۲:۱۰",
    severity: "info",
    device: "اصفهان · Safari روی iPhone",
    details: [{ label: "تأیید دومرحله‌ای", value: "با کد پیامکی تأیید شد" }],
    followUp: followUp(),
  },
  {
    id: "log-8",
    category: "کاربران",
    actor: "ادمین پلتفرم",
    actorRole: "ادمین",
    action: "رفع مسدودیت حساب",
    target: "نگین احمدی",
    date: "۲ مهر ۱۴۰۵",
    time: "۱۶:۳۰",
    severity: "info",
    details: [
      { label: "دلیل", value: "اشتباه در تشخیص پرداخت تکراری" },
      { label: "وضعیت", value: "مسدود ← فعال" },
    ],
    href: "/admin/users",
    followUp: followUp(),
  },
  {
    id: "log-9",
    category: "شکایات",
    actor: "ادمین پلتفرم",
    actorRole: "ادمین",
    action: "بستن شکایت به‌عنوان حل‌شده",
    target: "امیرحسین رضایی — پلن آپدیت‌نشده",
    date: "۱ مهر ۱۴۰۵",
    time: "۱۳:۱۰",
    severity: "info",
    details: [{ label: "راه‌حل", value: "پلن دستی به «همراه» تغییر کرد" }],
    followUp: followUp(),
  },
  {
    id: "log-10",
    category: "مشاوران",
    actor: "ادمین پلتفرم",
    actorRole: "ادمین",
    action: "رد درخواست مشاور",
    target: "حسین طاهری",
    date: "۳۱ شهریور ۱۴۰۵",
    time: "۱۰:۰۰",
    severity: "info",
    details: [
      { label: "دلیل", value: "کارنامه‌ی آپلودشده با رتبه‌ی اعلام‌شده نمی‌خوند" },
      { label: "وضعیت", value: "در انتظار ← رد شده" },
    ],
    href: "/admin/mentors",
    followUp: followUp("reviewed", { tags: ["احراز هویت"] }),
  },
];

// Remainder of A-06 — transactions an admin has to act on (refund
// requests), not just the revenue overview /admin already has.
export type Transaction = {
  id: string;
  studentName: string;
  planName: string;
  amount: number;
  date: string;
  type: "purchase" | "refund_request";
  status: "pending" | "approved" | "rejected";
};

export const transactions: Transaction[] = [
  {
    id: "tx-1",
    studentName: "رضا نامدار",
    planName: "پلن همراه",
    amount: 1490000,
    date: "۲ روز پیش",
    type: "refund_request",
    status: "pending",
  },
  {
    id: "tx-2",
    studentName: "نگین احمدی",
    planName: "پلن پایه",
    amount: 890000,
    date: "۴ روز پیش",
    type: "refund_request",
    status: "pending",
  },
  {
    id: "tx-3",
    studentName: "امیرحسین رضایی",
    planName: "پلن همراه",
    amount: 1490000,
    date: "۱ هفته پیش",
    type: "purchase",
    status: "approved",
  },
  {
    id: "tx-4",
    studentName: "ایمان",
    planName: "پلن همراه",
    amount: 1490000,
    date: "۱ هفته پیش",
    type: "refund_request",
    status: "rejected",
  },
];

// Private, mentor-only notes on a student's case file — never shown to the
// student or parent. Was a single hardcoded uncontrolled textarea before;
// now a real dated log, since a mentor actually keeps a running record
// across many sessions, not just one note.
export type PrivateNote = { id: string; studentId: string; text: string; date: string };

export const mentorPrivateNotes: PrivateNote[] = [
  { id: "pn-1", studentId: "1", text: "بعد از جلسه‌ی قبل انگیزه‌اش کم شده بود؛ حواسم به این باشه.", date: "۲۰ شهریور" },
  { id: "pn-2", studentId: "3", text: "خانواده فشار زیادی برای رشته‌ی پزشکی می‌ذارن؛ باید موقع صحبت با خودش مراقب باشم.", date: "۱۵ شهریور" },
];

// A student's own free-form notebook — NOT the test-bank "دفترچه‌ی
// اشتباهات" (that's still deliberately deferred, phase 4). Just a place
// to jot something down, separate from the structured plan/check-in.
export type StudentNote = { id: string; title: string; body: string; date: string };

export const studentNotes: StudentNote[] = [
  {
    id: "sn-1",
    title: "فرمول‌های اثبات‌نشده‌ی مثلثات",
    body: "یادم باشه فردا از سارا بپرسم فرمول تبدیل جمع به ضرب رو از کجا میاد.",
    date: "۲ روز پیش",
  },
  {
    id: "sn-2",
    title: "ایده برای جمع‌بندی شیمی",
    body: "به‌جای خوندن کل فصل، فقط رو غلط‌های آزمون قبلی مرور کنم.",
    date: "۵ روز پیش",
  },
];

// Referral program — invite a friend, both sides get a discount on their
// next month.
export type ReferralRecord = { id: string; friendName: string; date: string; status: "joined" | "pending_payment" };

export const referralProgram = {
  code: "IMAN-K404",
  discountPercent: 20,
  invited: [
    { id: "rf-1", friendName: "علی نوری", date: "۱ هفته پیش", status: "joined" as const },
    { id: "rf-2", friendName: "مریم صادقی", date: "۳ هفته پیش", status: "pending_payment" as const },
  ] as ReferralRecord[],
};

// ---------------------------------------------------------------------
// دفترچه‌ی غلط‌ها — the student logs each wrong test with *why* it went
// wrong. No test bank needed: the student just references the source
// (exam / book + question number). The point is the pattern: "most of my
// mistakes are carelessness, not ignorance" changes what the mentor plans.
// ---------------------------------------------------------------------

export type MistakeReason = "careless" | "calculation" | "concept" | "forgot" | "time" | "trap" | "not_studied";

export const MISTAKE_REASONS: Record<MistakeReason, { label: string; hint: string }> = {
  careless: { label: "بی‌دقتی", hint: "صورت سؤال رو بد خوندم، «نیست» یا واحد رو ندیدم" },
  calculation: { label: "اشتباه محاسباتی", hint: "راه رو بلد بودم، توی حساب اشتباه کردم" },
  concept: { label: "بلد نبودم", hint: "مفهوم رو درست نفهمیده بودم" },
  forgot: { label: "فرمول/نکته یادم رفت", hint: "خونده بودم ولی سر جلسه یادم نیومد" },
  time: { label: "کمبود وقت", hint: "وقت نشد درست حلش کنم" },
  trap: { label: "تله‌ی تستی", hint: "گول گزینه‌ی انحرافی رو خوردم" },
  not_studied: { label: "نخونده بودم", hint: "این مبحث رو هنوز نخونده بودم" },
};

export type MistakeEntry = {
  id: string;
  studentId: string;
  subject: string;
  topic: string;
  source: string;
  questionNo?: string;
  reason: MistakeReason;
  fix: string; // «درستش چی بود» — what to do next time
  date: string;
  resolved: boolean; // re-solved it correctly later
};

function seedMistake(
  id: string,
  studentId: string,
  subject: string,
  topic: string,
  source: string,
  reason: MistakeReason,
  fix = "",
  date = "هفته‌ی قبل",
  resolved = false,
  questionNo?: string
): MistakeEntry {
  return { id, studentId, subject, topic, source, reason, fix, date, resolved, questionNo };
}

// The logged-in student's own notebook seed (see mistakes-store).
export const myMistakesSeed: MistakeEntry[] = [
  seedMistake("mm-1", "me", "شیمی", "استوکیومتری", "آزمون قلم‌چی ۴ مهر", "calculation", "واحد گرم به مول رو دوبار چک کنم", "۴ مهر", false, "۱۴۷"),
  seedMistake("mm-2", "me", "زیست", "گردش خون", "آزمون قلم‌چی ۴ مهر", "careless", "کلمه‌ی «نادرست» توی صورت سؤال بود", "۴ مهر", false, "۱۲"),
  seedMistake("mm-3", "me", "زیست", "ژنتیک", "آزمون قلم‌چی ۴ مهر", "concept", "", "۴ مهر", false, "۳۱"),
  seedMistake("mm-4", "me", "فیزیک", "حرکت‌شناسی", "خیلی سبز فصل ۲", "careless", "جهت مثبت محور رو اول مشخص کنم", "۲ مهر", true, "۸۸"),
  seedMistake("mm-5", "me", "ریاضی", "مشتق", "خیلی سبز فصل ۴", "calculation", "", "۱ مهر", false, "۱۰۲"),
  seedMistake("mm-6", "me", "شیمی", "تعادل", "آزمون قلم‌چی ۴ مهر", "trap", "گزینه‌ی ۲ فقط نیمه‌ی اول درست بود", "۴ مهر", false, "۱۵۸"),
  seedMistake("mm-7", "me", "فیزیک", "دینامیک", "آزمون قلم‌چی ۴ مهر", "time", "", "۴ مهر", false, "۱۱۵"),
  seedMistake("mm-8", "me", "زیست", "تنفس", "مهروماه فصل ۵", "careless", "", "۳۱ شهریور", true, "۴۰"),
];

// Mentor's students — feeds «الگوی غلط‌ها» on the case file.
export const studentMistakes: MistakeEntry[] = [
  seedMistake("sm-1", "3", "زیست", "تنظیم عصبی", "آزمون قلم‌چی ۴ مهر", "careless"),
  seedMistake("sm-2", "3", "شیمی", "تعادل", "آزمون قلم‌چی ۴ مهر", "calculation"),
  seedMistake("sm-3", "3", "فیزیک", "کار و انرژی", "آزمون قلم‌چی ۴ مهر", "careless"),
  seedMistake("sm-4", "3", "ریاضی", "مثلثات", "خیلی سبز", "time"),
  seedMistake("sm-5", "3", "زیست", "ژنتیک", "آزمون قلم‌چی ۴ مهر", "trap"),
  seedMistake("sm-6", "1", "شیمی", "آلی", "آزمون قلم‌چی ۴ مهر", "not_studied"),
  seedMistake("sm-7", "1", "شیمی", "آلی", "مبتکران", "concept"),
  seedMistake("sm-8", "1", "زیست", "سلول", "آزمون قلم‌چی ۴ مهر", "concept"),
  seedMistake("sm-9", "1", "فیزیک", "الکتریسیته", "آزمون قلم‌چی ۴ مهر", "forgot"),
];

// ---------------------------------------------------------------------
// Packages (مدت اشتراک) + installments. Benchmark: darsbama.com sells the
// same three terms (1 month / 3 months / until konkur) with ~5% off for
// 3 months. Our discounts are a business decision — change them here.
// ---------------------------------------------------------------------

export type PackageDuration = {
  id: "1m" | "3m" | "konkur";
  label: string;
  months: number;
  discountPercent: number;
  maxInstallments: number; // 1 = pay in full only
};

export const PACKAGE_DURATIONS: PackageDuration[] = [
  { id: "1m", label: "یک‌ماهه", months: 1, discountPercent: 0, maxInstallments: 1 },
  { id: "3m", label: "سه‌ماهه", months: 3, discountPercent: 10, maxInstallments: 3 },
  { id: "konkur", label: "تا کنکور", months: 9, discountPercent: 20, maxInstallments: 4 },
];

// Money-back window after paying for a new package, no questions asked.
export const GUARANTEE_DAYS = 7;

// Monthly due dates counted from the demo's today (۷ مهر).
export const INSTALLMENT_DUE_LABELS = ["امروز", "۷ آبان", "۷ آذر", "۷ دی"];

// ---------------------------------------------------------------------
// Admin-only mentor reassignment (تعویض مشاور). The student can't trigger
// this from their panel — they ask support, and ops decides.
// ---------------------------------------------------------------------

export type StudentAssignment = { userId: string; name: string; group: ExamGroup; mentorId: string };

export const studentAssignments: StudentAssignment[] = [
  { userId: "u-1", name: "ایمان", group: "تجربی", mentorId: "sara-mohammadi" },
  { userId: "u-2", name: "امیرحسین رضایی", group: "تجربی", mentorId: "sara-mohammadi" },
  { userId: "u-4", name: "رضا نامدار", group: "تجربی", mentorId: "negar-ahmadi" },
  { userId: "u-5", name: "نگین احمدی", group: "ریاضی", mentorId: "amirhossein-rezaei" },
];

export const REASSIGN_REASONS = [
  "مشاور پاسخگو نیست",
  "درخواست دانش‌آموز یا والد",
  "ناسازگاری سبک مشاوره",
  "مشاور غیرفعال شده",
  "سایر",
];

// What the new mentor inherits — and what deliberately stays behind.
export const REASSIGN_TRANSFERS = {
  moves: ["برنامه‌ها و تاریخچه‌ی اجرا", "گزارش کارهای شبانه و جمع هفته‌ها", "کارنامه‌های آپلودشده", "دفترچه‌ی غلط‌ها"],
  stays: ["یادداشت‌های خصوصی مشاور قبلی (قول «فقط خودت می‌بینی»)", "گفتگوهای قبلی با مشاور قبلی"],
};

// ---------------------------------------------------------------------
// Sessions run on an outside platform the mentor already uses — no
// in-site video. Google Meet works in Iran today but Google services have
// had repeated disruptions, so domestic Skyroom (reachable during
// international-internet cuts) or any link is allowed. Plus a phone
// fallback for when the link won't open.
// ---------------------------------------------------------------------

export type MeetingProvider = "google_meet" | "skyroom" | "other";

export const MEETING_PROVIDERS: Record<MeetingProvider, { label: string; example: string; pattern: RegExp }> = {
  google_meet: {
    label: "گوگل میت",
    example: "https://meet.google.com/abc-defg-hij",
    pattern: /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/,
  },
  skyroom: {
    label: "اسکای‌روم",
    example: "https://www.skyroom.online/ch/sara-mohammadi/room",
    pattern: /^https:\/\/(www\.)?skyroom\.online\/\S+$/,
  },
  other: {
    label: "لینک دیگه",
    example: "https://…",
    pattern: /^https:\/\/\S+\.\S+$/,
  },
};

export type MeetingSetup = { provider: MeetingProvider; url: string; fallbackPhone: string };

// سارا محمدی's room — the logged-in mentor of this demo.
export const DEFAULT_MEETING: MeetingSetup = {
  provider: "google_meet",
  url: "https://meet.google.com/xpl-konk-uri",
  fallbackPhone: "۰۹۱۲ ۹۹۹ ۸۸۷۷",
};
