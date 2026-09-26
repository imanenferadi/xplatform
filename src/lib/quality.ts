import {
  QUALITY_FLAGS,
  QUALITY_WEIGHTS,
  mentorResponseHours,
  type ChurnResponse,
  type Mentor,
  type MentorQualityData,
} from "./mock-data";

export type QualityRow = {
  mentor: Mentor;
  score: number;
  responseHours: number;
  reportRate: number;
  retention: number;
  rating: number;
  planOnTime: number;
  complaints: number; // seeded + cancellations that blamed this mentor
  utilization: number; // % of capacity in use
  flags: string[];
  data: MentorQualityData;
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

// Each metric mapped to 0–100, then weighted (QUALITY_WEIGHTS).
export function computeQuality(mentor: Mentor, data: MentorQualityData, churn: ChurnResponse[]): QualityRow {
  const responseHours = mentorResponseHours[mentor.id] ?? data.responseTrend[data.responseTrend.length - 1];
  const complaints = data.complaints + churn.filter((c) => c.mentorId === mentor.id && c.reason === "mentor").length;
  const parts = {
    response: clamp(100 - ((responseHours - 4) / 44) * 100), // ≤4h = 100, ≥48h = 0
    reports: clamp(data.reportRate),
    retention: clamp(data.retention),
    rating: clamp(((mentor.rating - 3) / 2) * 100), // 3★ = 0, 5★ = 100
    planOnTime: clamp(data.planOnTime),
    complaints: clamp(100 - (complaints / 3) * 100), // 3+ = 0
  };
  const total = Object.values(QUALITY_WEIGHTS).reduce((a, b) => a + b, 0);
  const score = Math.round(
    (Object.keys(parts) as (keyof typeof parts)[]).reduce((s, k) => s + parts[k] * QUALITY_WEIGHTS[k], 0) / total
  );

  const flags: string[] = [];
  if (responseHours > QUALITY_FLAGS.maxResponseHours) flags.push("پاسخ دیر");
  if (data.reportRate < QUALITY_FLAGS.minReportRate) flags.push("گزارش کار کم");
  if (mentor.rating < QUALITY_FLAGS.minRating) flags.push("امتیاز پایین");
  if (complaints >= QUALITY_FLAGS.maxComplaints) flags.push("شکایت");

  return {
    mentor,
    score,
    responseHours,
    reportRate: data.reportRate,
    retention: data.retention,
    rating: mentor.rating,
    planOnTime: data.planOnTime,
    complaints,
    utilization: Math.round(((mentor.capacityTotal - mentor.capacity) / mentor.capacityTotal) * 100),
    flags,
    data,
  };
}
