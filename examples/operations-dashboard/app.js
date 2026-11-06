import {
  RANGES,
  aggregate,
  byRegion,
  chartBuckets,
  deltaPercent,
  deltaPoints,
  formatNumber,
  formatRate,
  getComparisonRows,
  getRows,
  previousChartBuckets,
  sampleOrders,
  signed,
} from "./data.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  range: "last",
  region: "all",
  compare: true,
  dataState: "ready",
  orderStatus: "all",
  ordersOpen: false,
};

let loadingTimer = null;

const refs = {
  summaryBody: $("#summary-body"),
  summaryTitle: $("#summary-title"),
  ordersPanel: $("#orders-panel"),
  ordersTitle: $("#orders-title"),
  ordersContext: $("#orders-context"),
  ordersCount: $("#orders-count"),
  ordersBody: $("#orders-body"),
  orderStatus: $("#order-status"),
  stateBanner: $("#state-banner"),
  filterSummary: $("#filter-summary"),
  region: $("#region"),
  compare: $("#compare"),
  dataState: $("#data-state"),
  live: $("#live-status"),
};

const regionLabel = (region) => (region === "all" ? "All regions" : region);
const statusLabel = (status) => (status === "all" ? "All statuses" : status);

function announce(message) {
  refs.live.textContent = "";
  requestAnimationFrame(() => {
    refs.live.textContent = message;
  });
}

function deltaChip(value, suffix, direction) {
  if (value == null || !Number.isFinite(value)) return "";
  const rounded = Math.abs(value) < 0.05 ? 0 : value;
  const tone =
    rounded === 0
      ? "neutral"
      : direction === "down"
        ? rounded < 0
          ? "good"
          : "bad"
        : direction === "up"
          ? rounded > 0
            ? "good"
            : "bad"
          : "neutral";
  const arrow = rounded > 0 ? "↑" : rounded < 0 ? "↓" : "→";
  return `<span class="delta ${tone}"><span aria-hidden="true">${arrow}</span>${signed(
    rounded,
    1,
  )}${suffix}</span>`;
}

function absoluteChange(current, previous) {
  const difference = current - previous;
  return `${difference > 0 ? "+" : ""}${formatNumber(difference)}`;
}

function plural(count, singular, pluralForm = `${singular}s`) {
  return `${formatNumber(count)} ${count === 1 ? singular : pluralForm}`;
}

function formatList(items) {
  if (items.length <= 2) return items.join(" and ");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function renderFilters() {
  const range = RANGES[state.range];
  $$("[data-range]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.range === state.range));
  });
  refs.region.value = state.region;
  refs.compare.checked = state.compare;
  refs.dataState.value = state.dataState;
  refs.orderStatus.value = state.orderStatus;
  refs.filterSummary.textContent = `${range.shortTitle} · ${regionLabel(
    state.region,
  )}${state.compare ? ` · compared with ${range.previousTitle}` : ""}`;
}

function renderStateBanner() {
  if (state.dataState === "stale") {
    refs.stateBanner.innerHTML = `<div class="banner warning" role="status"><strong>This snapshot is 38 minutes old.</strong> Delivery feeds normally update every 15 minutes. The figures below may have changed since the last refresh.</div>`;
    return;
  }
  if (state.dataState === "partial") {
    refs.stateBanner.innerHTML = `<div class="banner info" role="status"><strong>East is missing Sunday data.</strong> East's on-time rate uses 6 of 7 days. Totals and comparisons exclude the missing day so the rate is not presented as complete.</div>`;
    return;
  }
  refs.stateBanner.innerHTML = "";
}

function insightMarkup(current, previous, regions) {
  const range = RANGES[state.range];
  const scope = regionLabel(state.region);

  if (state.region === "all") {
    const lowest = [...regions].sort((a, b) => (a.onTimeRate ?? 1) - (b.onTimeRate ?? 1))[0];
    if (!lowest) return "";
    const failedShare = current.failed ? Math.round((lowest.failed / current.failed) * 100) : 0;
    const orderChange = deltaPercent(current.orders, previous.orders);
    const failedChange = deltaPercent(current.failed, previous.failed);
    const comparison = state.compare
      ? ` Volume is ${orderChange >= 0 ? "up" : "down"} ${Math.abs(orderChange).toFixed(
          1,
        )}% while failed attempts are ${failedChange >= 0 ? "up" : "down"} ${Math.abs(
          failedChange,
        ).toFixed(1)}%. Check ${lowest.region} before treating the week as a clean improvement.`
      : "";
    return `<section class="insight" aria-label="Most important signal">
      <div class="insight-copy">
        <strong>${lowest.region} has the lowest on-time rate (${formatRate(lowest.onTimeRate)}).</strong>
        <p>${formatNumber(lowest.failed)} of ${formatNumber(current.failed)} failed attempts (${failedShare}%) are in ${lowest.region}. ${comparison}</p>
      </div>
      <button type="button" class="primary-button" data-action="investigate" data-region="${lowest.region}">View ${lowest.region} failures</button>
    </section>`;
  }

  const currentRate = formatRate(current.onTimeRate);
  const previousRate = formatRate(previous.onTimeRate);
  const points = deltaPoints(current.onTimeRate, previous.onTimeRate);
  const failedChange = deltaPercent(current.failed, previous.failed);
  const orderChange = deltaPercent(current.orders, previous.orders);
  const comparison = state.compare
    ? `${points >= 0 ? "Up" : "Down"} ${Math.abs(points).toFixed(1)} points from ${previousRate}. Failed attempts ${
        failedChange >= 0 ? "rose" : "fell"
      } ${Math.abs(failedChange).toFixed(1)}% (${absoluteChange(current.failed, previous.failed)}) while orders ${
        orderChange >= 0 ? "rose" : "fell"
      } ${Math.abs(orderChange).toFixed(1)}%.`
    : "Comparison is turned off.";
  return `<section class="insight" aria-label="Most important signal">
    <div class="insight-copy">
      <strong>${scope} is at ${currentRate} on-time delivery this period.</strong>
      <p>${comparison} ${formatNumber(current.failed)} failed attempts and ${formatNumber(
        current.late,
      )} late deliveries are in scope.</p>
    </div>
    <button type="button" class="primary-button" data-action="orders" data-status="Failed">View ${scope} failures</button>
  </section>`;
}

function metricMarkup(current, previous) {
  const range = RANGES[state.range];
  const scope = regionLabel(state.region);
  const partialNote = state.dataState === "partial" ? " East Sunday data is excluded." : "";
  const comparison = (value, suffix, direction) =>
    state.compare ? deltaChip(value, suffix, direction) : "";
  const comparisonLine = (value, suffix, direction) => {
    if (!state.compare) return "";
    const rounded = Math.abs(value) < 0.05 ? 0 : value;
    return `<span class="muted">${signed(rounded, 1)}${suffix} vs ${range.previousTitle}</span>`;
  };
  const points = deltaPoints(current.onTimeRate, previous.onTimeRate);
  const failedChange = deltaPercent(current.failed, previous.failed);
  const orderChange = deltaPercent(current.orders, previous.orders);

  return `<section class="metrics" aria-label="Delivery health metrics">
    <article class="metric-card metric-primary">
      <div class="metric-top">
        <p class="metric-label">On-time delivery rate</p>
        ${comparison(points, " pts", "up")}
      </div>
      <p class="metric-value">${formatRate(current.onTimeRate).replace("%", "")}<small>%</small></p>
      <p class="metric-detail">${formatNumber(current.onTime)} of ${formatNumber(
        current.delivered,
      )} delivered orders arrived within the promised window. ${comparisonLine(points, " pts", "up")}</p>
      <details class="definition">
        <summary>How this is calculated</summary>
        <p>On-time delivered orders ÷ delivered orders in ${scope} for ${range.shortTitle}. A failed attempt is not in the denominator.${partialNote}</p>
      </details>
    </article>
    <article class="metric-card">
      <div class="metric-top">
        <p class="metric-label">Failed delivery attempts</p>
        ${comparison(failedChange, "%", "down")}
      </div>
      <p class="metric-value">${formatNumber(current.failed)}</p>
      <p class="metric-detail">${formatRate(current.failedRate)} of ${formatNumber(
        current.orders,
      )} orders. ${state.compare ? `${absoluteChange(current.failed, previous.failed)} vs ${range.previousTitle}.` : "Comparison is off."}</p>
      <details class="definition">
        <summary>How this is calculated</summary>
        <p>A delivery attempt that did not complete successfully ÷ all orders scheduled in ${scope} for ${range.shortTitle}. A failed attempt is not counted as delivered.${partialNote}</p>
      </details>
    </article>
    <article class="metric-card">
      <div class="metric-top">
        <p class="metric-label">Orders</p>
        ${comparison(orderChange, "%", "neutral")}
      </div>
      <p class="metric-value">${formatNumber(current.orders)}</p>
      <p class="metric-detail">Scheduled for delivery in ${scope}. ${state.compare ? `${absoluteChange(current.orders, previous.orders)} vs ${range.previousTitle}.` : "Comparison is off."}</p>
      <details class="definition">
        <summary>How this is calculated</summary>
        <p>All orders with a promised delivery window in ${scope} for ${range.shortTitle}. Order volume is context, not a quality signal by itself.${partialNote}</p>
      </details>
    </article>
  </section>`;
}

function chartTicks(maxValue) {
  const target = Math.max(maxValue, 1);
  const raw = target / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const step =
    (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;
  const max = Math.ceil(target / step) * step;
  const ticks = [];
  for (let value = 0; value <= max + 1e-9; value += step) ticks.push(value);
  return { max, ticks };
}

function isNarrow() {
  return window.matchMedia("(max-width: 640px)").matches;
}

function barPath(buckets, previousBuckets, compare, unit) {
  const narrow = isNarrow();
  const width = narrow ? 340 : 760;
  const height = narrow ? 280 : 260;
  const margin = narrow
    ? { top: 16, right: 6, bottom: 56, left: 36 }
    : { top: 18, right: 16, bottom: 42, left: 48 };
  const axisFont = narrow ? 12 : 9;
  const labelFont = narrow ? 12 : 10;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const currentFailed = buckets.reduce((sum, bucket) => sum + bucket.failed, 0);
  const previousFailed = previousBuckets.reduce((sum, bucket) => sum + bucket.failed, 0);
  const trend = !compare
    ? "Comparison is turned off."
    : currentFailed === previousFailed
      ? "Both periods have the same number of failed attempts."
      : currentFailed > previousFailed
        ? "The current period has more failed attempts than the previous period."
        : "The current period has fewer failed attempts than the previous period.";
  const { max, ticks } = chartTicks(
    Math.max(
      ...buckets.map((bucket) => bucket.failed),
      ...(compare ? previousBuckets.map((bucket) => bucket.failed) : [0]),
    ),
  );
  const groupWidth = plotWidth / Math.max(buckets.length, 1);
  const barWidth = narrow ? Math.min(16, groupWidth * 0.3) : Math.min(26, groupWidth * 0.26);
  const gap = Math.max(3, barWidth * 0.22);
  const y = (value) => margin.top + plotHeight - (value / max) * plotHeight;

  const grid = ticks
    .map((value) => {
      const top = y(value);
      return `<line x1="${margin.left}" x2="${width - margin.right}" y1="${top}" y2="${top}" stroke="#edf1ef" stroke-width="1" />
        <text x="${margin.left - 8}" y="${top + 3}" text-anchor="end" fill="#62716b" font-size="${axisFont}">${formatNumber(
          value,
        )}</text>`;
    })
    .join("");

  const bars = buckets
    .map((bucket, index) => {
      const center = margin.left + groupWidth * (index + 0.5);
      const currentX = compare ? center - barWidth - gap / 2 : center - barWidth / 2;
      const previousX = center + gap / 2;
      const currentHeight = (bucket.failed / max) * plotHeight;
      const previousHeight = compare
        ? (previousBuckets[index].failed / max) * plotHeight
        : 0;
      const [labelDay, labelDate = ""] = bucket.label.split(" ");
      const label = narrow
        ? `<text x="${center}" y="${height - 30}" text-anchor="middle" fill="#5c6d67" font-size="${labelFont}">${labelDay}<tspan x="${center}" dy="12">${labelDate}</tspan></text>`
        : `<text x="${center}" y="${height - 17}" text-anchor="middle" fill="#5c6d67" font-size="${labelFont}">${bucket.label}</text>`;
      const title = `${bucket.label}: ${formatNumber(bucket.failed)} failed${
        compare ? `; previous period ${formatNumber(previousBuckets[index].failed)}` : ""
      }`;
      const currentBar = `<rect x="${currentX}" y="${margin.top + plotHeight - currentHeight}" width="${barWidth}" height="${currentHeight}" rx="3" fill="#11614a"><title>${title}</title></rect>`;
      const previousBar = compare
        ? `<rect x="${previousX}" y="${margin.top + plotHeight - previousHeight}" width="${barWidth}" height="${previousHeight}" rx="3" fill="#e8eeeb" stroke="#9fb2a9"><title>Previous period: ${formatNumber(
            previousBuckets[index].failed,
          )} failed</title></rect>`
        : "";
      return `${label}${currentBar}${previousBar}`;
    })
    .join("");

  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="chart-title chart-description">
    <title id="chart-title">Failed delivery attempts by ${unit}</title>
    <desc id="chart-description">Bar chart. Current period is solid green; previous period is pale grey. ${trend} Exact values are available in the data table below.</desc>
    ${grid}
    ${bars}
    <line x1="${margin.left}" x2="${width - margin.right}" y1="${margin.top + plotHeight}" y2="${
      margin.top + plotHeight
    }" stroke="#bdcbc4" stroke-width="1" />
  </svg>`;
}

function chartMarkup(current, previous) {
  const range = RANGES[state.range];
  const options = { partial: state.dataState === "partial" };
  const buckets = chartBuckets(range, state.region, options);
  const previousBuckets = previousChartBuckets(range, state.region, options);
  const compare = state.compare;
  const peakValue = Math.max(...buckets.map((bucket) => bucket.failed));
  const peakBuckets = buckets.filter((bucket) => bucket.failed === peakValue);
  const peakText =
    peakBuckets.length === 1
      ? `${peakBuckets[0].label} (${formatNumber(peakValue)})`
      : `${formatList(peakBuckets.map((bucket) => bucket.label))} (${formatNumber(
          peakValue,
        )} each)`;
  const change = deltaPercent(current.failed, previous.failed);
  const multiWeek = range.start !== range.end;
  const unit = multiWeek ? "week" : "day";
  const peakSentence =
    peakBuckets.length === 1
      ? `The highest ${unit} was ${peakText}.`
      : `The highest ${unit}s were ${peakText}.`;
  const changeText =
    change == null
      ? "there is no previous-period count to compare"
      : `${change >= 0 ? "up" : "down"} ${Math.abs(change).toFixed(
          1,
        )}% from ${formatNumber(previous.failed)}`;
  const summary = compare
    ? `<strong>${formatNumber(current.failed)} failed attempts</strong>, ${changeText}. ${peakSentence}`
    : `<strong>${formatNumber(current.failed)} failed attempts</strong> in this view. Comparison is turned off.`;
  const tableRows = buckets
    .map((bucket, index) => {
      const failureRate = bucket.orders ? bucket.failed / bucket.orders : null;
      return `<tr>
        <th scope="row">${bucket.label}</th>
        <td class="num">${formatNumber(bucket.orders)}</td>
        <td class="num">${formatNumber(bucket.failed)}</td>
        <td class="num">${formatRate(failureRate)}</td>
        <td class="num">${formatRate(bucket.onTimeRate)}</td>
        ${compare ? `<td class="num">${formatNumber(previousBuckets[index].failed)}</td>` : ""}
      </tr>`;
    })
    .join("");

  return `<section class="panel" aria-labelledby="chart-heading">
    <div class="panel-heading">
      <div>
        <h2 id="chart-heading">Failed attempts by ${multiWeek ? "week" : "day"}</h2>
        <p class="panel-subtitle">${range.title} · ${regionLabel(state.region)}</p>
      </div>
      <div class="legend" aria-label="Chart legend">
        <span class="legend-item"><span class="legend-swatch" aria-hidden="true"></span>This period</span>
        ${compare ? `<span class="legend-item"><span class="legend-swatch previous" aria-hidden="true"></span>Previous period</span>` : ""}
      </div>
    </div>
    <p class="chart-summary">${summary}</p>
    <div class="chart-wrap">${barPath(buckets, previousBuckets, compare, unit)}</div>
    <p class="chart-note">Counts start at zero. Previous period covers ${range.previousTitle} and has the same length as the selected range.</p>
    <details class="data-table-details">
      <summary>View the numbers</summary>
      <div class="table-scroll" role="region" aria-label="Failed attempts table, scroll horizontally if needed" tabindex="0">
        <table>
          <caption>Failed attempts and on-time rate for ${range.shortTitle}${compare ? `, with ${range.previousTitle} failed counts` : ""}.</caption>
          <thead><tr><th scope="col">${multiWeek ? "Week" : "Day"}</th><th scope="col" class="num">Orders</th><th scope="col" class="num">Failed</th><th scope="col" class="num">Failure rate</th><th scope="col" class="num">On-time rate</th>${compare ? `<th scope="col" class="num">Failed (previous)</th>` : ""}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </details>
  </section>`;
}

function regionsMarkup(currentRegions, previousRegions) {
  const range = RANGES[state.range];
  const sorted = [...currentRegions].sort(
    (a, b) => (a.onTimeRate ?? 1) - (b.onTimeRate ?? 1),
  );
  const previousByRegion = new Map(previousRegions.map((region) => [region.region, region]));
  const rows = sorted
    .map((region) => {
      const previous = previousByRegion.get(region.region);
      const points = deltaPoints(region.onTimeRate, previous?.onTimeRate);
      const partial =
        state.dataState === "partial" && region.region === "East"
          ? `<span class="partial-tag">Partial · 6/7 days</span>`
          : "";
      return `<tr>
        <th scope="row">${region.region}${partial}</th>
        <td>
          <div class="rate-cell">
            <span class="rate-track" aria-hidden="true"><span class="rate-fill ${
              region.onTimeRate < 0.93 ? "low" : ""
            }" style="width:${(region.onTimeRate * 100).toFixed(1)}%"></span></span>
            <strong>${formatRate(region.onTimeRate)}</strong>
          </div>
        </td>
        <td class="num">${formatNumber(region.failed)} <span class="muted">(${formatRate(
          region.failedRate,
        )})</span></td>
        ${
          state.compare
            ? `<td class="num">${deltaChip(points, " pts", "up")}</td>`
            : ""
        }
        <td><button type="button" class="row-button" data-action="region" data-region="${
          region.region
        }" aria-label="View orders for ${region.region}">View orders</button></td>
      </tr>`;
    })
    .join("");

  return `<section class="panel" aria-labelledby="regions-heading">
    <div class="panel-heading">
      <div>
        <h2 id="regions-heading">${
          state.region === "all" ? "On-time rate by region" : `On-time rate for ${state.region}`
        }</h2>
        <p class="panel-subtitle">${
          state.region === "all" ? "Lowest first · " : ""
        }${range.title} · bars use a 0–100% scale</p>
      </div>
    </div>
    <div class="table-scroll" role="region" aria-label="On-time rate by region table, scroll horizontally if needed" tabindex="0">
      <table>
        <caption>On-time rate and failed attempts by region. The change column compares ${range.previousTitle}.</caption>
        <thead><tr><th scope="col">Region</th><th scope="col">On-time rate</th><th scope="col" class="num">Failed attempts</th>${state.compare ? `<th scope="col" class="num">On-time change</th>` : ""}<th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="chart-note table-hint">Scroll the table sideways for failure and change columns.</p>
    <p class="chart-note">Region rates use all delivered orders in the selected period. A failed attempt is not included in the on-time denominator.</p>
  </section>`;
}

function skeletonMarkup() {
  return `<div aria-busy="true">
    <div class="skeleton-grid" aria-hidden="true">
      <div class="skeleton-card"><div class="skeleton-line short"></div><div class="skeleton-line value"></div><div class="skeleton-line wide"></div><div class="skeleton-line"></div></div>
      <div class="skeleton-card"><div class="skeleton-line short"></div><div class="skeleton-line value"></div><div class="skeleton-line wide"></div></div>
      <div class="skeleton-card"><div class="skeleton-line short"></div><div class="skeleton-line value"></div><div class="skeleton-line wide"></div></div>
    </div>
    <div class="skeleton-panel" aria-hidden="true"><div class="skeleton-line short"></div><div class="skeleton-line chart"></div></div>
    <p role="status">Loading delivery data…</p>
  </div>`;
}

function errorMarkup() {
  return `<div class="state-card">
    <div class="state-mark" aria-hidden="true">!</div>
    <p class="eyebrow">Data unavailable</p>
    <h2>We couldn't load this week's delivery data.</h2>
    <p>The last successful refresh was Mon 2 Nov, 06:12. No figures are shown because older totals could mislead a decision. Nothing in the workspace was changed.</p>
    <div class="state-actions"><button type="button" class="primary-button" data-action="retry">Try again</button></div>
  </div>`;
}

function emptyMarkup() {
  return `<div class="state-card">
    <p class="eyebrow">No data</p>
    <h2>No delivery data for this selection.</h2>
    <p>There are no recorded orders for ${RANGES[state.range].shortTitle} in ${regionLabel(
      state.region,
    )}. This is different from a filter that hides matching orders.</p>
    <div class="state-actions">
      <button type="button" class="primary-button" data-action="reset-range">View last complete week</button>
      <button type="button" class="secondary-button" data-action="reset-region">Show all regions</button>
    </div>
  </div>`;
}

function renderSummary() {
  if (state.dataState === "loading") {
    refs.summaryBody.innerHTML = skeletonMarkup();
    return;
  }
  if (state.dataState === "error") {
    refs.summaryBody.innerHTML = errorMarkup();
    return;
  }
  if (state.dataState === "empty") {
    refs.summaryBody.innerHTML = emptyMarkup();
    return;
  }

  const range = RANGES[state.range];
  const options = { partial: state.dataState === "partial" };
  const currentRows = getRows(range, state.region, options);
  const previousRows = getComparisonRows(range, state.region, options);
  const current = aggregate(currentRows);
  const previous = aggregate(previousRows);
  const currentRegions = byRegion(currentRows);
  const previousRegions = byRegion(previousRows);

  refs.summaryBody.innerHTML = [
    insightMarkup(current, previous, currentRegions),
    metricMarkup(current, previous),
    chartMarkup(current, previous),
    regionsMarkup(currentRegions, previousRegions),
  ].join("");
}

function statusBadge(status) {
  const config = {
    "On time": { className: "on-time", icon: "✓" },
    Late: { className: "late", icon: "◷" },
    Failed: { className: "failed", icon: "!" },
    "In transit": { className: "in-transit", icon: "→" },
  }[status] ?? { className: "in-transit", icon: "→" };
  return `<span class="status ${config.className}"><span class="status-icon" aria-hidden="true">${config.icon}</span>${status}</span>`;
}

function renderOrders() {
  const range = RANGES[state.range];
  const options = { partial: state.dataState === "partial" };
  const rows = getRows(range, state.region, options);
  const current = aggregate(rows);
  const allSamples = sampleOrders(state.region, range);
  const samples =
    state.orderStatus === "all"
      ? allSamples
      : allSamples.filter((order) => order.status === state.orderStatus);

  refs.ordersPanel.hidden = false;
  refs.ordersContext.textContent = `${range.shortTitle} · ${regionLabel(
    state.region,
  )} · ${statusLabel(state.orderStatus)}`;
  const scopeCount =
    state.orderStatus === "Failed"
      ? current.failed
      : state.orderStatus === "Late"
        ? current.late
        : state.orderStatus === "On time"
          ? current.onTime
          : state.orderStatus === "In transit"
            ? 0
            : current.orders;
  const statusWord =
    state.orderStatus === "In transit" ? "in-transit" : state.orderStatus.toLowerCase();
  if (samples.length) {
    refs.ordersCount.textContent =
      state.orderStatus === "all"
        ? `Showing ${plural(samples.length, "sample order")} of ${plural(
            current.orders,
            "order",
          )} in this view.`
        : `Showing ${plural(samples.length, "sample row")} of ${plural(
            scopeCount,
            `${statusWord} order`,
          )} in this view.`;
  } else {
    refs.ordersCount.textContent = `No sample rows · ${plural(
      scopeCount,
      `${statusWord} order`,
    )} in this view.`;
  }
  refs.orderStatus.value = state.orderStatus;

  if (!samples.length) {
    refs.ordersBody.innerHTML = `<div class="empty-orders">
      <h3>No orders match this status.</h3>
      <p>${
        state.orderStatus === "In transit"
          ? "This is a completed week, so no orders are still in transit."
          : "The selected status has no sample rows in this view."
      } Clear the status filter to see all sample orders.</p>
      <button type="button" class="secondary-button" data-action="clear-status">Clear status filter</button>
    </div>`;
    return;
  }

  const tableRows = samples
    .map(
      (order) => `<tr>
        <th scope="row">${order.id}</th>
        <td>${order.region}</td>
        <td>${order.promised}</td>
        <td>${order.delivered}</td>
        <td>${statusBadge(order.status)}</td>
      </tr>`,
    )
    .join("");

  refs.ordersBody.innerHTML = `<div class="orders-table-wrap" role="region" aria-label="Orders table, scroll horizontally if needed" tabindex="0">
    <table class="orders-table">
      <caption>Sample orders from the current selection. This is not the full order list.</caption>
      <thead><tr><th scope="col">Order</th><th scope="col">Region</th><th scope="col">Promised window</th><th scope="col">Delivered</th><th scope="col">Status</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>`;
}

function render() {
  renderFilters();
  renderStateBanner();
  renderSummary();
  if (state.ordersOpen && state.dataState !== "error" && state.dataState !== "empty") {
    renderOrders();
  } else if (state.dataState === "error" || state.dataState === "empty") {
    refs.ordersPanel.hidden = true;
  }
}

function openOrders(status = "all", options = {}) {
  if (state.dataState === "error" || state.dataState === "empty" || state.dataState === "loading") {
    return;
  }
  state.orderStatus = status;
  state.ordersOpen = true;
  if (options.region) state.region = options.region;
  render();
  requestAnimationFrame(() => {
    refs.ordersPanel.hidden = false;
    refs.ordersTitle.focus();
    refs.ordersPanel.scrollIntoView({ block: "start", behavior: "smooth" });
    announce(`${statusLabel(status)} orders for ${regionLabel(state.region)}.`);
  });
}

function setDataState(value) {
  clearTimeout(loadingTimer);
  state.dataState = value;
  if (value === "loading") {
    state.ordersOpen = false;
    refs.ordersPanel.hidden = true;
    render();
    announce("Loading delivery data.");
    loadingTimer = setTimeout(() => {
      state.dataState = "ready";
      render();
      announce("Delivery data loaded.");
    }, 1100);
    return;
  }
  if (value === "error" || value === "empty") {
    state.ordersOpen = false;
    refs.ordersPanel.hidden = true;
  }
  render();
  const messages = {
    ready: "Delivery data ready.",
    stale: "Showing a stale snapshot. Figures may have changed.",
    partial: "Showing partial data. East Sunday is missing.",
    error: "Delivery data could not be loaded.",
    empty: "No delivery data for this selection.",
  };
  announce(messages[value] ?? "Data state changed.");
}

function syncFromControls() {
  $$("[data-range]").forEach((button) => {
    button.addEventListener("click", () => {
      state.range = button.dataset.range;
      render();
      announce(`Showing ${RANGES[state.range].shortTitle} for ${regionLabel(state.region)}.`);
    });
  });

  refs.region.addEventListener("change", () => {
    state.region = refs.region.value;
    render();
    announce(`Showing ${regionLabel(state.region)} for ${RANGES[state.range].shortTitle}.`);
  });

  refs.compare.addEventListener("change", () => {
    state.compare = refs.compare.checked;
    render();
    announce(state.compare ? "Comparison with previous period is on." : "Comparison is off.");
  });

  refs.dataState.addEventListener("change", () => setDataState(refs.dataState.value));

  $("#reset-filters").addEventListener("click", () => {
    state.range = "last";
    state.region = "all";
    state.compare = true;
    state.orderStatus = "all";
    state.ordersOpen = false;
    refs.ordersPanel.hidden = true;
    render();
    announce("Filters reset to last week, all regions, with comparison on.");
  });

  $("#back-to-summary").addEventListener("click", () => {
    state.ordersOpen = false;
    refs.ordersPanel.hidden = true;
    refs.summaryTitle.focus();
    refs.summaryTitle.scrollIntoView({ block: "start", behavior: "smooth" });
    announce("Returned to the delivery summary.");
  });

  refs.orderStatus.addEventListener("change", () => {
    state.orderStatus = refs.orderStatus.value;
    renderOrders();
    announce(`Status filter set to ${statusLabel(state.orderStatus)}.`);
  });

  refs.summaryBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    switch (button.dataset.action) {
      case "orders":
        openOrders(button.dataset.status ?? "all");
        break;
      case "region":
        openOrders("all", { region: button.dataset.region });
        break;
      case "investigate":
        openOrders("Failed", { region: button.dataset.region });
        break;
      case "retry":
        setDataState("loading");
        break;
      case "reset-range":
        state.range = "last";
        state.dataState = "ready";
        render();
        announce("Showing the last complete week.");
        break;
      case "reset-region":
        state.region = "all";
        state.dataState = "ready";
        render();
        announce("Showing all regions.");
        break;
      default:
        break;
    }
  });

  refs.ordersBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='clear-status']");
    if (!button) return;
    state.orderStatus = "all";
    renderOrders();
    announce("Status filter cleared.");
  });
}

syncFromControls();
render();

// The chart needs different geometry at narrow widths so labels stay readable.
window.matchMedia("(max-width: 640px)").addEventListener("change", () => render());
