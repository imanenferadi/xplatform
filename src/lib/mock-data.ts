// Mock data for design/demo purposes only. Replace with real API calls
// once the backend exists. Nothing here is persisted or fetched.

export type Mentor = {
  id: string;
  name: string;
  rank: string;
  year: string;
  school: string;
  major: string;
  style: string;
  capacity: number;
  capacityTotal: number;
  rating: number;
  reviewCount: number;
  story: string;
  strengths: { subject: string; score: number }[];
  verified: boolean;
};

export const mentors: Mentor[] = [
  {
    id: "sara-mohammadi",
    name: "سارا محمدی",
    rank: "رتبه ۴۴۰",
    year: "کنکور ۱۴۰۳",
    school: "دانشگاه تهران",
    major: "دانشجوی پزشکی",
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

export const chatMessages = [
  { id: 1, from: "mentor" as const, text: "سلام! برنامه‌ی این هفته رو دیدی؟ از فردا شیمی آلی رو شروع می‌کنیم.", time: "۰۹:۱۲" },
  { id: 2, from: "student" as const, text: "سلام سارا جان، دیدم. یه سوال داشتم از فصل ۲ شیمی که گیر کردم", time: "۱۴:۰۳" },
  { id: 3, from: "student" as const, text: "الان عکسشو می‌فرستم", time: "۱۴:۰۳" },
  { id: 4, from: "mentor" as const, text: "باشه بفرست ببینم. فردا سر جلسه هم روش کار می‌کنیم.", time: "۱۸:۴۰" },
];

export const mentorStudents = [
  {
    id: "1",
    name: "امیرحسین رضایی",
    grade: "پایه دوازدهم — تجربی",
    status: "danger" as const,
    lastCheckIn: "۳ روز پیش",
    planCompletion: 45,
    unreadMessages: 2,
  },
  {
    id: "2",
    name: "مریم صادقی",
    grade: "پایه یازدهم — ریاضی",
    status: "warning" as const,
    lastCheckIn: "دیروز",
    planCompletion: 68,
    unreadMessages: 0,
  },
  {
    id: "3",
    name: "علی نوری",
    grade: "پشت‌کنکوری — تجربی",
    status: "success" as const,
    lastCheckIn: "امروز",
    planCompletion: 92,
    unreadMessages: 1,
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
