import { toPersianDigits } from "@/lib/utils";

// Only the number is LTR (`tnum`); the unit stays in the RTL flow. Wrapping
// "۱,۴۹۰,۰۰۰ تومان" in one `tnum` span renders it as «تومان ۱,۴۹۰,۰۰۰».
export function Toman({ amount }: { amount: number }) {
  return (
    <>
      <span className="tnum">
        {toPersianDigits(amount.toLocaleString("en-US"))}
      </span>{" "}
      تومان
    </>
  );
}
