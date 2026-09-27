import { useSearchParams } from "react-router";
import "../styles/shared.css";

export function MonthPicker({ month }: { month: string }) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <label className="month-picker">
      Month
      <input
        type="month"
        value={month}
        onChange={(event) => {
          const next = new URLSearchParams(searchParams);
          next.set("month", event.target.value);
          setSearchParams(next);
        }}
      />
    </label>
  );
}
