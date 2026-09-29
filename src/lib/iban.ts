import { toLatinDigits, toPersianDigits } from "./utils";

// Iranian IBAN («شبا»): IR + 2 check digits + 22 digits (0 + 3-digit bank
// code + 18-digit account). Check digits follow ISO 13616 (mod 97 == 1).
const BANKS: Record<string, string> = {
  "010": "بانک مرکزی",
  "011": "صنعت و معدن",
  "012": "ملت",
  "013": "رفاه کارگران",
  "014": "مسکن",
  "015": "سپه",
  "016": "کشاورزی",
  "017": "ملی",
  "018": "تجارت",
  "019": "صادرات",
  "020": "توسعه صادرات",
  "021": "پست بانک",
  "022": "توسعه تعاون",
  "051": "موسسه اعتباری توسعه",
  "053": "کارآفرین",
  "054": "پارسیان",
  "055": "اقتصاد نوین",
  "056": "سامان",
  "057": "پاسارگاد",
  "058": "سرمایه",
  "059": "سینا",
  "060": "قرض‌الحسنه مهر ایران",
  "061": "شهر",
  "062": "آینده",
  "064": "گردشگری",
  "066": "دی",
  "069": "ایران زمین",
  "070": "قرض‌الحسنه رسالت",
  "078": "خاورمیانه",
  "095": "ایران و ونزوئلا",
};

/** «IR 96 0017…» typed any way (Persian digits, spaces, lowercase) → «IR960017…». */
export function normalizeIban(input: string): string {
  return toLatinDigits(input)
    .replace(/[\s‌-]/g, "")
    .toUpperCase();
}

function mod97(digits: string): number {
  let r = 0;
  for (const c of digits) r = (r * 10 + Number(c)) % 97;
  return r;
}

export type IbanCheck = { ok: true; iban: string; bank: string } | { ok: false; error: string };

export function checkIban(input: string): IbanCheck {
  const iban = normalizeIban(input);
  if (!iban) return { ok: false, error: "شماره‌ی شبا رو وارد کن." };
  if (!iban.startsWith("IR")) return { ok: false, error: "شبای ایرانی با IR شروع می‌شه." };
  if (!/^IR\d{24}$/.test(iban))
    return {
      ok: false,
      error: `شبا باید IR و ۲۴ رقم باشه (الان ${toPersianDigits(Math.max(0, iban.length - 2))} رقم).`,
    };
  // Move «IR» + check digits to the end; I=18, R=27.
  if (mod97(iban.slice(4) + "1827" + iban.slice(2, 4)) !== 1)
    return { ok: false, error: "این شماره‌ی شبا معتبر نیست — یه رقمش اشتباهه. دوباره از کارت یا اپ بانک کپی کن." };
  const bank = BANKS[iban.slice(5, 8)];
  if (!bank) return { ok: false, error: "کد بانک این شبا شناخته‌شده نیست." };
  return { ok: true, iban, bank };
}

export function bankOf(iban: string): string {
  return BANKS[iban.slice(5, 8)] ?? "بانک نامشخص";
}

/** Only the last 4 digits — for every place except the finance review. */
export function maskIban(iban: string): string {
  return `IR•• •••• •••• ${toPersianDigits(iban.slice(-4))}`;
}

/** Full IBAN in readable groups: IR96 0017 0000 … */
export function formatIban(iban: string): string {
  return iban.replace(/(.{4})/g, "$1 ").trim();
}
