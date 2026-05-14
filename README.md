# @eucomplyhub/mcp-eu-ai-act

MCP (Model Context Protocol) server exposing free EU AI Act compliance classifiers to AI assistants. Built for **Claude Desktop**, **Cursor**, **Windsurf**, and any MCP-compatible client.

> Powers AI assistants to evaluate mid-market SaaS systems against EU AI Act, NIST AI RMF, ISO/IEC 42001, OECD, GDPR, and sector-specific overlays.

[![npm](https://img.shields.io/npm/v/@eucomplyhub/mcp-eu-ai-act.svg)](https://www.npmjs.com/package/@eucomplyhub/mcp-eu-ai-act)
[![npm downloads](https://img.shields.io/npm/dm/@eucomplyhub/mcp-eu-ai-act.svg)](https://www.npmjs.com/package/@eucomplyhub/mcp-eu-ai-act)
[![license](https://img.shields.io/npm/l/@eucomplyhub/mcp-eu-ai-act.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-1.0-blue)](https://modelcontextprotocol.io/)
[![Powered by Claude](https://img.shields.io/badge/powered%20by-Claude-7C3AED)](https://www.anthropic.com/)

---

## ⚡ TL;DR (60-second install)

```bash
npm install -g @eucomplyhub/mcp-eu-ai-act
```

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "eucomplyhub": {
      "command": "npx",
      "args": ["-y", "@eucomplyhub/mcp-eu-ai-act"]
    }
  }
}
```

Restart Claude Desktop. Ask:

> *"Classify Acme Inc — an HR-tech SaaS using AI to score candidates for B2B enterprise customers."*

Claude returns full Annex III mapping, Article 50 transparency obligations, GPAI Article 53 reasoning, and 5 priority remediation actions tailored to the deployment.

---

## 🆚 How does this differ from other EU AI Act MCP servers?

There's one other EU AI Act MCP server in the awesome-mcp-servers Legal section ([@ark-forge/mcp-eu-ai-act](https://github.com/ark-forge/mcp-eu-ai-act)). It's a different scope:

| | This server | ark-forge/mcp-eu-ai-act |
|---|---|---|
| Frameworks | EU AI Act **+** NIST AI RMF **+** ISO/IEC 42001 **+** OECD **+** Singapore **+** GDPR **+** HIPAA **+** Colorado SB 24-205 | EU AI Act only |
| Layers | Two: deterministic 30-sec + Claude-powered 60-sec | Code scanner |
| Output | Multi-jurisdiction risk class + Annex III mapping + Article 50/53 reasoning + 5 remediation actions | Violations + remediation guidance |
| Use case | Mid-market SaaS audit prep across multiple frameworks | Codebase compliance check |

Use whichever fits your scope. They're complementary, not competitive.

---

## 🎬 Sample Claude Desktop output

```
> Classify Acme Inc — HR-tech SaaS using AI to score candidates for B2B enterprise customers.

Running classify_annex3...

Overall risk: HIGH-RISK
Summary: Acme operates in Annex III §4 (employment), with AI-driven
candidate scoring affecting hiring decisions. Article 50 disclosure
applies. EU customers trigger full obligations.

Annex III categories:
  III.4 Employment           ✓ YES   — AI ranking influences hiring
  III.5 Essential services   — NO    — not credit/benefit scoring
  [...6 more categories...]

Article 50: APPLIES
  Reasoning: Candidates interact with AI-generated outputs;
  transparency disclosure required at the point of evaluation.

GPAI Article 53: deployer (you consume third-party foundation model)
  Reasoning: Score generation via OpenAI/Anthropic API → you're
  not the provider, but Article 26 deployer obligations apply.

Priority remediation actions:
  1. Implement Article 14 human oversight UI — manager confirmation
     step before AI-ranked candidates auto-proceed
  2. Add Article 50 transparency banner — "AI-assisted scoring"
     notice visible to candidates
  3. Document training data lineage (Article 10) — if Acme fine-tunes
  4. Establish post-market monitoring (Article 72)
  5. GDPR overlap — DPIA required (Annex III high-risk = Art 35 trigger)
```

---

## Tools exposed

### 1. `quick_risk_class` — 30-second multi-jurisdiction risk classifier

Deterministic, rule-based AI risk classification. **No LLM call** — same inputs always produce the same outputs.

**Frameworks covered:**
- 🇪🇺 EU AI Act (Articles 5, 9–15, 26, 27, 50, 53)
- 🇺🇸 NIST AI RMF (Govern · Map · Measure · Manage)
- 🌐 ISO/IEC 42001 (Clauses 4–10 + Annex B)
- 🌍 OECD AI Principles
- 🇸🇬 Singapore Model AI Governance
- 🇨🇳 PRC GenAI Interim Measures (for generation archetype)
- 🔐 GDPR + UK GDPR + DPDP + CCPA + LGPD + PIPEDA (privacy stack)
- 🏥 HIPAA / FDA SaMD / EU MDR-AI (healthcare overlay)
- ⚖️ EEOC + NYC AEDT + Colorado SB 24-205 (US employment overlay)
- 🏛️ OMB M-24-10 + CoE AI Convention (public sector overlay)

**Inputs:**
- `industry`: healthcare, publicSector, education, hr, retail, industrial, media, other
- `archetype`: decisioning, generation, classification, recommendation, automation, forecasting
- `impact`: internal, b2b, consumer, regulated

**Returns:** Risk class (Critical / High / Limited / Minimal), 5-axis risk profile, per-framework verdicts.

---

### 2. `classify_annex3` — Deep Annex III classification (Claude-powered)

Full EU AI Act mapping using Claude (Anthropic) with complete regulatory context — Articles 6, 9–15, 26, 27, 50, 53 plus the postponement nuance (Annex III standalone enforcement postponed to Dec 2 2027; Article 50 + GPAI Article 53 lock in Aug 2 2026).

**Inputs:**
- `company`: Company name
- `industry`: Industry/vertical
- `features`: Array of AI features
- `useCase`: Plain-English description (min 20 chars)
- `euExposure`: eu-customers-output, eu-employees-only, no-eu, considering-eu

**Returns:**
- Overall risk classification (high-risk / limited-risk / gpai / minimal-risk)
- 8 Annex III categories with applies status + reasoning
- Article 50 transparency obligations + reasoning
- GPAI Article 53 applicability (provider / deployer) + reasoning
- 5 priority remediation actions tailored to your stack

> Calls https://eucomplyhub.com/api/annex3-classify — free, no signup, ~60s response time.

---

## Install

### For Claude Desktop

1. Install the package globally:

   ```bash
   npm install -g @eucomplyhub/mcp-eu-ai-act
   ```

2. Edit your Claude Desktop config file:

   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

3. Add the server:

   ```json
   {
     "mcpServers": {
       "eucomplyhub": {
         "command": "npx",
         "args": ["-y", "@eucomplyhub/mcp-eu-ai-act"]
       }
     }
   }
   ```

4. Restart Claude Desktop.

5. In a new chat, ask:

   > Use the eucomplyhub tools to classify Acme Inc — an HR-tech SaaS with CV screening features for European enterprise customers.

   Claude will call `classify_annex3` and return a structured Annex III mapping + priority remediation actions.

### For Cursor

Add to `.cursor/mcp.json` (workspace) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "eucomplyhub": {
      "command": "npx",
      "args": ["-y", "@eucomplyhub/mcp-eu-ai-act"]
    }
  }
}
```

### For Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "eucomplyhub": {
      "command": "npx",
      "args": ["-y", "@eucomplyhub/mcp-eu-ai-act"]
    }
  }
}
```

### Generic stdio client

```bash
npx -y @eucomplyhub/mcp-eu-ai-act
```

The server runs over stdio (standard MCP transport).

---

## Example prompts

Once installed, ask your AI assistant questions like:

- *"What's the EU AI Act risk class for an HR-tech SaaS using AI to score job candidates?"*
- *"Run the quick risk classifier for a healthcare diagnostic AI used by EU regulated medical providers."*
- *"Deep-classify Acme Inc — they're a B2B fintech using AI to score loan applicants in the EU."*
- *"For Notion AI features, what Annex III categories apply and what's the Article 50 obligation?"*

The assistant will call the appropriate tool and return structured results you can act on.

---

## What does this cost?

**Free.** Both tools call free public endpoints at `eucomplyhub.com`:

- `quick_risk_class` runs entirely locally (deterministic JavaScript, no network call)
- `classify_annex3` calls `https://eucomplyhub.com/api/annex3-classify` (rate-limited free public API)

Rate limits apply for abuse prevention. Heavy usage should consider commissioning a full audit via [eucomplyhub.com/audit](https://eucomplyhub.com/audit).

---

## Disclaimer

This MCP server is an **educational tool for orientation**, not legal advice. Each framework has specific clauses, exceptions, and edge cases. For binding compliance mapping (audit deliverables, certification prep, regulatory submission), consult an expert.

For a paid expert audit:
- 📋 **Tier 1 Quick Audit (€799):** Free /risk-class + /annex3 + 60-min consultation
- 🔬 **Tier 2 Full Audit (€1,999):** Triple-framework methodology + audit-ready deliverable
- 🛡️ **Tier 3 Continuous Monitoring (€299/mo):** Post-audit ongoing review

Book at [eucomplyhub.com/audit](https://eucomplyhub.com/audit).

---

## Methodology

Built and maintained by [Piotr Reder](https://www.linkedin.com/in/piotrreder/) ([eucomplyhub.com](https://eucomplyhub.com)). Triple-framework specialist for mid-market SaaS preparing for EU AI Act enforcement.

**Risk class logic** adapted from [@clustral/risk-compass](https://github.com/king-star-12/risk-compass) (MIT).

**Annex III deep classifier** powered by [Anthropic Claude](https://www.anthropic.com/) (claude-sonnet-4-6).

---

## Web versions

Prefer a browser?

- 🌐 [eucomplyhub.com/risk-class](https://eucomplyhub.com/risk-class) — interactive Tier 0 classifier (same logic as `quick_risk_class`)
- 🔬 [eucomplyhub.com/annex3](https://eucomplyhub.com/annex3) — Tier 1 deep classifier (same as `classify_annex3`)
- 🗺️ [eucomplyhub.com/crosswalk](https://eucomplyhub.com/crosswalk) — interactive EU AI Act ↔ ISO 42001 ↔ NIST mapping

---

## License

MIT — see [LICENSE](LICENSE).

## Contributing

Issues + PRs welcome at https://github.com/eucomplyhub/mcp-eu-ai-act

For questions about the audit methodology behind the tools, reach out: [piotr@eucomplyhub.com](mailto:piotr@eucomplyhub.com)

---

## Roadmap

**Q3 2026** (July–September)
- [ ] `classify_fria` — Fundamental Rights Impact Assessment generator (Article 27)
- [ ] `classify_hr_bias` — Vertical bias audit for HR-tech (Annex III §4 + Colorado SB 24-205)
- [ ] `validate_disclosure` — Article 50 transparency UX audit (Generated by AI label checker)

**Q4 2026** (October–December)
- [ ] `audit_gpai_provider` — Article 53 GPAI provider compliance check (training data lineage + technical documentation)
- [ ] `monitor_continuous` — Post-market monitoring helper (Article 72)
- [ ] Localized output: PL, DE, FR, ES, IT

**2027**
- [ ] Annex III standalone enforcement support (Dec 2 2027 deadline)
- [ ] ISO/IEC 42001 certification readiness audit module

Feedback on priorities? [Open an issue](https://github.com/eucomplyhub/mcp-eu-ai-act/issues) or email piotr@eucomplyhub.com.

---

## Changelog

### 0.1.0 — 2026-05-14

- Initial release
- Two tools: `quick_risk_class` + `classify_annex3`
- 10+ frameworks covered (EU AI Act, NIST AI RMF, ISO/IEC 42001, OECD, Singapore, GDPR, HIPAA, Colorado SB 24-205)
- Claude Desktop / Cursor / Windsurf install instructions
- Multi-jurisdiction overlay logic
- Postponement-aware (Annex III standalone → Dec 2 2027; Article 50 + GPAI 53 stay Aug 2 2026)
