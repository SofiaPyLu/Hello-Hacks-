const { THRESHOLDS } = require("../constants");
const { getSummary } = require("../processors/summaryProcessor");
const { previousMonth } = require("../utils/month");

const RATIO_LABELS = {
  foodCostPercent: "Food cost",
  laborCostPercent: "Labor cost",
  primeCostPercent: "Prime cost",
};

function buildFallbackSummary(current, previous) {
  if (current.totalRevenue === 0 && current.totalCosts === 0) {
    return `No data available for ${current.month}.`;
  }

  const netProfit = current.netProfit;
  const outcome =
    netProfit >= 0
      ? `$${netProfit.toLocaleString("en-US")} profit`
      : `a $${Math.abs(netProfit).toLocaleString("en-US")} loss`;

  const sentences = [
    `In ${current.month}, revenue was $${current.totalRevenue.toLocaleString("en-US")} and costs were $${current.totalCosts.toLocaleString("en-US")}, leaving ${outcome} (${current.profitMargin}% margin).`,
  ];

  if (previous && previous.totalRevenue > 0) {
    const profitChange = netProfit - previous.netProfit;
    sentences.push(
      `Profit ${profitChange >= 0 ? "rose" : "fell"} by $${Math.abs(profitChange).toLocaleString("en-US")} compared to ${previous.month}.`,
    );
  }

  const unhealthy = Object.entries(current.ratios).filter(
    ([, ratio]) => ratio.status === "yellow" || ratio.status === "red",
  );

  for (const [key, ratio] of unhealthy) {
    sentences.push(
      `${RATIO_LABELS[key]} is ${ratio.value}%, above the ${THRESHOLDS[key].green}% target.`,
    );
  }

  if (unhealthy.length === 0) {
    sentences.push("All health indicators are in the healthy range.");
  }

  return sentences.join(" ");
}

function buildPrompt(current, prev) {
  return `You are a financial assistant for a small independent restaurant owner.

Current month data:
${JSON.stringify(current)}

Previous month data:
${JSON.stringify(prev)}

Write 3-5 short sentences in plain English: how the month went, the biggest change from last month, and one concrete suggestion. No jargon, no markdown.`;
}

async function generateAiSummary(month, entries) {
  const current = getSummary(entries, month);
  const prev = getSummary(entries, previousMonth(month));
  const fallback = () => ({
    month,
    summary: buildFallbackSummary(current, prev),
    source: "fallback",
  });

  if (!process.env.AI_API_KEY) return fallback();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(
      process.env.AI_API_URL || "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AI_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: process.env.AI_MODEL || "claude-opus-5",
          max_tokens: 300,
          messages: [{ role: "user", content: buildPrompt(current, prev) }],
        }),
      },
    );

    if (!response.ok) throw new Error(`AI request failed: ${response.status}`);

    const data = await response.json();
    const text = data?.content?.[0]?.text?.trim();
    if (!text) throw new Error("AI response had no text");

    return { month, summary: text, source: "ai" };
  } catch (error) {
    // ponytail: any failure — network, timeout, bad shape — degrades to the fallback text.
    console.error("AI summary failed, using fallback:", error.message);
    return fallback();
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { buildFallbackSummary, generateAiSummary };
