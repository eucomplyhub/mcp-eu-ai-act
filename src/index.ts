#!/usr/bin/env node

/**
 * @eucomplyhub/mcp-eu-ai-act
 *
 * MCP (Model Context Protocol) server exposing eucomplyhub.com's free EU AI Act
 * compliance classifiers to AI assistants (Claude Desktop, Cursor, Windsurf, etc.)
 *
 * Two tools exposed:
 *   1. classify_annex3 — Deep Annex III classification (Claude-powered)
 *      Maps to: https://eucomplyhub.com/api/annex3-classify
 *   2. quick_risk_class — 30-second multi-jurisdiction risk classifier
 *      (deterministic, no LLM call — same logic as eucomplyhub.com/risk-class)
 *
 * @license MIT
 * @see https://eucomplyhub.com
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const SERVER_NAME = "@eucomplyhub/mcp-eu-ai-act";
const SERVER_VERSION = "0.1.0";
const API_BASE = "https://eucomplyhub.com";

// ─── Deterministic risk-class logic (mirror of /risk-class page) ─────────────

const INDUSTRY_W: Record<string, number[]> = {
  healthcare: [8, 10, 7, 9, 9],
  publicSector: [9, 8, 9, 8, 9],
  education: [7, 7, 8, 6, 6],
  hr: [8, 8, 9, 6, 7],
  retail: [3, 5, 4, 4, 4],
  industrial: [4, 4, 3, 7, 4],
  media: [4, 4, 6, 7, 4],
  other: [5, 5, 5, 5, 5],
};

const ARCHETYPE_W: Record<string, number[]> = {
  decisioning: [9, 5, 9, 8, 8],
  generation: [4, 5, 5, 8, 4],
  classification: [6, 5, 7, 6, 5],
  recommendation: [5, 5, 7, 4, 5],
  automation: [7, 5, 5, 9, 7],
  forecasting: [4, 5, 6, 7, 4],
};

const IMPACT_W: Record<string, number[]> = {
  internal: [2, 3, 3, 4, 2],
  b2b: [4, 5, 5, 6, 5],
  consumer: [6, 7, 7, 7, 7],
  regulated: [10, 9, 10, 9, 10],
};

const AXES = ["decisionalImpact", "dataSensitivity", "biasRisk", "hallucinationCost", "regulatoryLoad"];

function r1(x: number): number {
  return Math.round(x * 10) / 10;
}

function classifyRisk(industry: string, archetype: string, impact: string) {
  const i = INDUSTRY_W[industry];
  const a = ARCHETYPE_W[archetype];
  const p = IMPACT_W[impact];

  if (!i || !a || !p) {
    throw new Error(`Invalid input. industry must be one of: ${Object.keys(INDUSTRY_W).join(", ")}. archetype: ${Object.keys(ARCHETYPE_W).join(", ")}. impact: ${Object.keys(IMPACT_W).join(", ")}.`);
  }

  const scores: Record<string, number> = {};
  for (let k = 0; k < 5; k++) {
    scores[AXES[k]] = r1((i[k] + a[k] + p[k]) / 3);
  }

  const m = Math.max(scores.decisionalImpact, scores.biasRisk, scores.regulatoryLoad);
  let cls: string, summary: string;
  if (m >= 9) {
    cls = "Critical";
    summary = "Re-scope before any build. Conformity assessment, fundamental-rights review and sector-specific approvals are mandatory before deployment.";
  } else if (m >= 7) {
    cls = "High";
    summary = "Engineer for conformity assessment, fairness evaluation and tamper-evident audit trail from day one. Annex III obligations apply.";
  } else if (m >= 5) {
    cls = "Limited";
    summary = "Ship with transparency disclosures, output grounding and a documented incident-response plan. Article 50 transparency applies.";
  } else {
    cls = "Minimal";
    summary = "Move fast — but maintain an audit trail and basic ISO/IEC 42001 hygiene. Re-classify when scope changes.";
  }

  const di = scores.decisionalImpact, br = scores.biasRisk, rl = scores.regulatoryLoad, hc = scores.hallucinationCost, ds = scores.dataSensitivity;

  const frameworks = [
    {
      id: "eu_ai_act",
      label: "EU AI Act",
      region: "EU",
      verdict:
        di >= 9
          ? "Review for Art. 5 prohibited practices before any deployment."
          : (di >= 7 || impact === "regulated")
            ? "High-risk system — full Annex III obligations apply (Articles 9–15, 26, 27)."
            : di >= 5
              ? "Limited risk — Article 50 transparency duties apply (user notification + content labelling)."
              : "Minimal risk — voluntary best-practice + ISO/IEC 42001 alignment.",
    },
    {
      id: "nist_ai_rmf",
      label: "NIST AI RMF",
      region: "US / global",
      verdict:
        br >= 8
          ? "Govern + Measure priority — fairness, validity and reliability controls."
          : hc >= 7
            ? "Measure + Manage — robustness and reliability emphasis."
            : "Map + Govern — full functional alignment across all four functions.",
    },
    {
      id: "iso_42001",
      label: "ISO/IEC 42001",
      region: "Global",
      verdict:
        rl >= 8
          ? "Full AIMS implementation with sector annex controls (Clauses 4–10)."
          : rl >= 6
            ? "Core AIMS implementation with documented risk treatment plan."
            : "Lightweight AIMS aligned with existing ISO 27001 program.",
    },
    {
      id: "oecd",
      label: "OECD AI Principles",
      region: "50+ countries",
      verdict: (br >= 7 || di >= 7)
        ? "Human-centred values, transparency and accountability obligations."
        : "Standard accountability + transparency posture sufficient.",
    },
    {
      id: "singapore",
      label: "Singapore Model AI Governance",
      region: "Singapore",
      verdict: (impact === "consumer" || impact === "regulated")
        ? "Apply AI Verify testing toolkit before deployment."
        : "Internal governance committee + risk impact assessment.",
    },
    {
      id: "gdpr",
      label: "GDPR · UK GDPR · DPDP · CCPA · LGPD · PIPEDA",
      region: "Global privacy",
      verdict: ds >= 7
        ? "Strong: DPA(s), DPIA, DPO consultation, Article 22 / DPDP §11 automated-decision review."
        : "Standard: lawful basis, transparency notices, data subject rights operationalised.",
    },
  ];

  // PRC GenAI overlay
  if (archetype === "generation") {
    frameworks.push({
      id: "prc_genai",
      label: "PRC GenAI Interim Measures",
      region: "China",
      verdict: "Pre-launch security assessment + watermarking obligations apply for PRC users.",
    });
  }

  // Sector overlays
  if (industry === "healthcare") {
    frameworks.push({
      id: "hipaa_fda_samd",
      label: "HIPAA / FDA SaMD / EU MDR-AI",
      region: "Health",
      verdict: "PHI minimisation, BAAs, and software-as-medical-device classification check required.",
    });
  } else if (industry === "hr") {
    frameworks.push({
      id: "us_employment",
      label: "EEOC + NYC AEDT + Colorado SB 24-205",
      region: "US employment",
      verdict: "Pre-deployment bias audit + candidate notice + annual disparate-impact testing.",
    });
  } else if (industry === "publicSector") {
    frameworks.push({
      id: "us_public_sector",
      label: "OMB M-24-10 + CoE AI Convention",
      region: "Public sector",
      verdict: "Rights-impact assessment + public AI use case inventory + human rights safeguards.",
    });
  }

  return {
    class: cls,
    summary,
    scores,
    frameworks,
    methodology: "Deterministic, rule-based classification. Same inputs always produce the same outputs. Logic adapted from @clustral/risk-compass (MIT). Triple-framework methodology by eucomplyhub.com.",
    disclaimer: "This is a high-level orientation tool, not legal advice. For binding compliance mapping, consult an expert. See https://eucomplyhub.com/risk-class for the interactive web version.",
  };
}

// ─── MCP Server setup ────────────────────────────────────────────────────────

const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "quick_risk_class",
        description:
          "30-second deterministic multi-jurisdiction AI risk classification across EU AI Act, NIST AI RMF, ISO/IEC 42001, OECD, Singapore Model AI Governance, GDPR, and sector-specific overlays (HIPAA, NYC AEDT, Colorado SB 24-205). No LLM call. Same inputs always produce same outputs. Use this for quick orientation before deeper analysis.",
        inputSchema: {
          type: "object",
          properties: {
            industry: {
              type: "string",
              enum: ["healthcare", "publicSector", "education", "hr", "retail", "industrial", "media", "other"],
              description: "Industry vertical. Use 'other' for fintech/banking/insurance.",
            },
            archetype: {
              type: "string",
              enum: ["decisioning", "generation", "classification", "recommendation", "automation", "forecasting"],
              description: "What the AI primarily does: decisioning (approve/deny, score, allocate), generation (draft, summarise), classification (label, route, triage), recommendation (rank, suggest), automation (multi-step actions), forecasting (predict outcomes).",
            },
            impact: {
              type: "string",
              enum: ["internal", "b2b", "consumer", "regulated"],
              description: "Who is affected: internal (employee-only), b2b (business customers), consumer (end users), regulated (healthcare, finance, public sector).",
            },
          },
          required: ["industry", "archetype", "impact"],
        },
      },
      {
        name: "classify_annex3",
        description:
          "Deep Annex III classification using Claude (Anthropic) with full EU AI Act regulatory context. Maps your product against all 8 Annex III high-risk categories + Article 50 transparency + GPAI Article 53 + GPAI provider/deployer reasoning. Returns 5 priority remediation actions tailored to your stack. ~60 seconds (LLM-powered).",
        inputSchema: {
          type: "object",
          properties: {
            company: {
              type: "string",
              description: "Company name being classified.",
            },
            industry: {
              type: "string",
              description: "Industry/vertical (e.g., 'HR-tech', 'fintech', 'healthtech', 'productivity', 'voice-AI').",
            },
            features: {
              type: "array",
              items: { type: "string" },
              description: "AI features in the product. Examples: 'content-generation', 'scoring', 'decision-making', 'api-consumer', 'own-model', 'recommendation', 'classification'.",
            },
            useCase: {
              type: "string",
              description: "Plain-English description of what the AI does and who it serves. Min 20 chars.",
            },
            euExposure: {
              type: "string",
              enum: ["eu-customers-output", "eu-employees-only", "no-eu", "considering-eu"],
              description: "EU exposure level. 'eu-customers-output' = serves EU customers with AI-influenced outputs. 'eu-employees-only' = internal tools used by EU employees only. 'no-eu' = no EU footprint. 'considering-eu' = planning EU expansion.",
            },
          },
          required: ["company", "industry", "features", "useCase", "euExposure"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error("Missing arguments");
  }

  if (name === "quick_risk_class") {
    const { industry, archetype, impact } = args as {
      industry: string;
      archetype: string;
      impact: string;
    };

    try {
      const result = classifyRisk(industry, archetype, impact);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${err.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (name === "classify_annex3") {
    try {
      const response = await fetch(`${API_BASE}/api/annex3-classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Classifier API returned ${response.status}: ${errText.slice(0, 200)}`);
      }

      const result = await response.json();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error calling classifier: ${err.message}. Try the web version: https://eucomplyhub.com/annex3`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[${SERVER_NAME}] v${SERVER_VERSION} listening on stdio.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
