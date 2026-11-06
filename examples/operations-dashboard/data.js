// Synthetic delivery data for the operations dashboard example.
// Every number is generated from the fixed weekly profiles below. Nothing here
// describes a real product, customer or delivery network.

export const REGIONS = ["North", "South", "East", "West"];

export const WEEKS = [
  { start: "2026-09-07", label: "Sep 7–13", factor: 0.94 },
  { start: "2026-09-14", label: "Sep 14–20", factor: 0.96 },
  { start: "2026-09-21", label: "Sep 21–27", factor: 0.97 },
  { start: "2026-09-28", label: "Sep 28–Oct 4", factor: 1.0 },
  { start: "2026-10-05", label: "Oct 5–11", factor: 1.0 },
  { start: "2026-10-12", label: "Oct 12–18", factor: 1.01 },
  { start: "2026-10-19", label: "Oct 19–25", factor: 1.02 },
  { start: "2026-10-26", label: "Oct 26–Nov 1", factor: 1.09 },
];

const BASE_ORDERS = { North: 1190, South: 1090, East: 1080, West: 1060 };

const ON_TIME = {
  North: [0.951, 0.95, 0.949, 0.948, 0.946, 0.944, 0.937, 0.964],
  South: [0.949, 0.948, 0.947, 0.945, 0.943, 0.94, 0.932, 0.952],
  East: [0.928, 0.927, 0.925, 0.923, 0.92, 0.916, 0.884, 0.903],
  West: [0.972, 0.971, 0.97, 0.97, 0.969, 0.968, 0.969, 0.982],
};

const FAILED = {
  North: [0.031, 0.03, 0.03, 0.029, 0.029, 0.03, 0.028, 0.035],
  South: [0.029, 0.029, 0.028, 0.028, 0.028, 0.029, 0.028, 0.034],
  East: [0.036, 0.037, 0.038, 0.039, 0.037, 0.038, 0.04, 0.052],
  West: [0.024, 0.024, 0.023, 0.023, 0.023, 0.024, 0.024, 0.025],
};

// The final week has a volume spike in East and a quieter West.
const REGION_WEEK_ADJUST = {
  East: { 7: 1.055 },
  West: { 7: 0.952 },
};

const DAY_WEIGHTS = [0.15, 0.16, 0.16, 0.16, 0.15, 0.12, 0.1];
const ON_TIME_OFFSETS = [0.002, 0, 0.001, -0.001, 0.003, -0.006, 0.004];
const FAILED_OFFSETS = [0, 0, 0.001, 0, 0.002, -0.003, 0.004];
// Rotates by week so daily failure counts differ instead of every weekday tying.
const FAILED_DAY_FACTOR = [1.08, 0.96, 1.04, 0.92, 1.1, 0.88, 0.82];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function addDays(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function distribute(total, weights) {
  const values = weights.map((weight) => Math.round(total * weight));
  const difference = total - values.reduce((sum, value) => sum + value, 0);
  values[values.length - 1] += difference;
  return values;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildDailyRows() {
  const rows = [];
  WEEKS.forEach((week, weekIndex) => {
    REGIONS.forEach((region) => {
      const adjust = REGION_WEEK_ADJUST[region]?.[weekIndex] ?? 1;
      const weeklyOrders = Math.round(BASE_ORDERS[region] * week.factor * adjust);
      const weeklyFailed = Math.round(weeklyOrders * FAILED[region][weekIndex]);
      const ordersByDay = distribute(weeklyOrders, DAY_WEIGHTS);
      const failedWeights = DAY_WEIGHTS.map(
        (weight, dayIndex) => weight * FAILED_DAY_FACTOR[(weekIndex + dayIndex) % 7],
      );
      const failedWeightTotal = failedWeights.reduce((sum, weight) => sum + weight, 0);
      const failedByDay = distribute(
        weeklyFailed,
        failedWeights.map((weight) => weight / failedWeightTotal),
      );

      ordersByDay.forEach((orders, dayIndex) => {
        const failed = failedByDay[dayIndex];
        const delivered = orders - failed;
        const rate = clamp(
          ON_TIME[region][weekIndex] + ON_TIME_OFFSETS[dayIndex] + FAILED_OFFSETS[dayIndex] * 0.2,
          0.8,
          0.995,
        );
        const onTime = Math.min(delivered, Math.round(delivered * rate));
        const date = addDays(week.start, dayIndex);
        rows.push({
          date,
          day: DAY_LABELS[dayIndex],
          dayIndex,
          weekIndex,
          region,
          orders,
          delivered,
          onTime,
          late: delivered - onTime,
          failed,
        });
      });
    });
  });
  return rows;
}

export const DAILY_ROWS = buildDailyRows();

export const RANGES = {
  last: {
    id: "last",
    label: "Last week",
    start: 7,
    end: 7,
    previousStart: 6,
    previousEnd: 6,
    title: "Oct 26 – Nov 1, 2026",
    shortTitle: "Oct 26 – Nov 1",
    previousTitle: "Oct 19 – 25",
  },
  previous: {
    id: "previous",
    label: "Previous week",
    start: 6,
    end: 6,
    previousStart: 5,
    previousEnd: 5,
    title: "Oct 19 – 25, 2026",
    shortTitle: "Oct 19 – 25",
    previousTitle: "Oct 12 – 18",
  },
  month: {
    id: "month",
    label: "Last 4 weeks",
    start: 4,
    end: 7,
    previousStart: 0,
    previousEnd: 3,
    title: "Oct 5 – Nov 1, 2026",
    shortTitle: "Oct 5 – Nov 1",
    previousTitle: "Sep 7 – Oct 4",
  },
};

export function getRows(range, region = "all", { partial = false } = {}) {
  let rows = DAILY_ROWS.filter(
    (row) => row.weekIndex >= range.start && row.weekIndex <= range.end,
  );
  if (region !== "all") rows = rows.filter((row) => row.region === region);
  if (partial) {
    rows = rows.filter((row) => !(row.region === "East" && row.date === "2026-11-01"));
  }
  return rows;
}

export function getComparisonRows(range, region = "all", { partial = false } = {}) {
  let rows = DAILY_ROWS.filter(
    (row) => row.weekIndex >= range.previousStart && row.weekIndex <= range.previousEnd,
  );
  if (region !== "all") rows = rows.filter((row) => row.region === region);
  if (partial) {
    rows = rows.filter((row) => !(row.region === "East" && row.date === "2026-11-01"));
  }
  return rows;
}

export function aggregate(rows) {
  const totals = rows.reduce(
    (result, row) => {
      result.orders += row.orders;
      result.delivered += row.delivered;
      result.onTime += row.onTime;
      result.late += row.late;
      result.failed += row.failed;
      return result;
    },
    { orders: 0, delivered: 0, onTime: 0, late: 0, failed: 0 },
  );
  return {
    ...totals,
    onTimeRate: totals.delivered ? totals.onTime / totals.delivered : null,
    failedRate: totals.orders ? totals.failed / totals.orders : null,
  };
}

export function byRegion(rows) {
  const present = new Set(rows.map((row) => row.region));
  return REGIONS.filter((region) => present.has(region)).map((region) => ({
    region,
    ...aggregate(rows.filter((row) => row.region === region)),
  }));
}

function dateKey(date) {
  return date;
}

export function dailySeries(rows, range) {
  const byDate = new Map();
  rows.forEach((row) => {
    const current = byDate.get(row.date) ?? {
      date: row.date,
      orders: 0,
      delivered: 0,
      onTime: 0,
      late: 0,
      failed: 0,
    };
    current.orders += row.orders;
    current.delivered += row.delivered;
    current.onTime += row.onTime;
    current.late += row.late;
    current.failed += row.failed;
    byDate.set(row.date, current);
  });

  const series = [];
  for (let week = range.start; week <= range.end; week += 1) {
    for (let day = 0; day < 7; day += 1) {
      const date = addDays(WEEKS[week].start, day);
      const totals = byDate.get(dateKey(date));
      series.push({
        date,
        label: `${DAY_LABELS[day]} ${Number(date.slice(8, 10))}`,
        day,
        orders: totals?.orders ?? 0,
        delivered: totals?.delivered ?? 0,
        onTime: totals?.onTime ?? 0,
        failed: totals?.failed ?? 0,
        onTimeRate: totals?.delivered ? totals.onTime / totals.delivered : null,
      });
    }
  }
  return series;
}

export function dailySeriesForRange(range, region, options) {
  return dailySeries(getRows(range, region, options), range);
}

export function previousDailySeries(range, region, options) {
  const rows = getComparisonRows(range, region, options);
  const previousRange = {
    start: range.previousStart,
    end: range.previousEnd,
  };
  return dailySeries(rows, previousRange);
}

export function chartBuckets(range, region, options = {}) {
  if (range.start === range.end) {
    return dailySeriesForRange(range, region, options).map((day) => ({
      label: day.label,
      orders: day.orders,
      failed: day.failed,
      onTimeRate: day.onTimeRate,
    }));
  }
  const buckets = [];
  for (let week = range.start; week <= range.end; week += 1) {
    const totals = aggregate(
      getRows(range, region, options).filter((row) => row.weekIndex === week),
    );
    buckets.push({
      label: WEEKS[week].label.replace(/–.*/, ""),
      orders: totals.orders,
      failed: totals.failed,
      onTimeRate: totals.onTimeRate,
    });
  }
  return buckets;
}

export function previousChartBuckets(range, region, options = {}) {
  if (range.previousStart === range.previousEnd) {
    return previousDailySeries(range, region, options).map((day) => ({
      label: day.label,
      orders: day.orders,
      failed: day.failed,
      onTimeRate: day.onTimeRate,
    }));
  }
  const buckets = [];
  for (let week = range.previousStart; week <= range.previousEnd; week += 1) {
    const totals = aggregate(
      getComparisonRows(range, region, options).filter((row) => row.weekIndex === week),
    );
    buckets.push({
      label: WEEKS[week].label.replace(/–.*/, ""),
      orders: totals.orders,
      failed: totals.failed,
      onTimeRate: totals.onTimeRate,
    });
  }
  return buckets;
}

const SAMPLE_STATUSES = ["On time", "Late", "Failed", "On time", "Failed"];
const PROMISED_WINDOWS = [
  ["10:00", "12:00"],
  ["14:00", "16:00"],
  ["09:00", "11:00"],
  ["16:00", "18:00"],
];

function addMinutes(time, minutes) {
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(
    2,
    "0",
  )}`;
}

export function sampleOrders(region, range = RANGES.last) {
  const regions = region === "all" ? REGIONS : [region];
  const weekStart = WEEKS[range.end].start;
  const orders = [];
  let index = 0;
  regions.forEach((name, regionIndex) => {
    SAMPLE_STATUSES.forEach((status, statusIndex) => {
      index += 1;
      const slot = regionIndex + statusIndex;
      const dayIndex = slot % 5;
      const [start, end] = PROMISED_WINDOWS[slot % PROMISED_WINDOWS.length];
      const date = addDays(weekStart, dayIndex);
      const day = `${DAY_LABELS[dayIndex]} ${Number(date.slice(8, 10))}`;
      const delivered =
        status === "On time"
          ? `${day} · ${addMinutes(start, 45)}`
          : status === "Late"
            ? `${day} · ${addMinutes(end, 102)}`
            : "No completed attempt";
      orders.push({
        id: `NW-${48210 + index}`,
        region: name,
        promised: `${day} · ${start}–${end}`,
        delivered,
        status,
      });
    });
  });
  return orders;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatRate(value, digits = 1) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function deltaPoints(current, previous) {
  if (current == null || previous == null) return null;
  return (current - previous) * 100;
}

export function deltaPercent(current, previous) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export function signed(value, digits = 1) {
  if (value == null) return "—";
  const rounded = Math.abs(value).toFixed(digits);
  if (Number(rounded) === 0) return `0.${"0".repeat(digits)}`;
  return `${value > 0 ? "+" : "-"}${rounded}`;
}
