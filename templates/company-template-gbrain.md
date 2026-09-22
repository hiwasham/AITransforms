#  https://github.com/garrytan/gbrain

In GBrain, company profiles reside in the **`companies/`** directory of your **Brain Repository** (`brain/companies/`). 
- Like all canonical entity pages in GBrain, 
- a company page 
	- follows a **MECE taxonomy** 
	- and uses the **Dual-Layer "[[gbrain page-Compiled Truth & Timeline pattern|Compiled Truth + Timeline"** pattern]] 
		- separated by a markdown horizontal rule (`---`).
## Standard GBrain Company Page Template

Below is the production template structure for a company profile in GBrain:

```markdown
---
id: 9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c
type: company
tags: [portfolio, b2b-saas, strategic-partner]
aliases: [Acme, Acme Corp]
---

### Compiled Truth

**Acme Corporation** is an enterprise AI infrastructure startup building automated data pipeline connectors for financial institutions. 

#### Core Metadata
* **Industry / Sector:** B2B SaaS / Data Infrastructure
* **Relationship Tier:** Portfolio Company / Strategic Partner
* **Website:** https://example.com
* **Location:** San Francisco, CA

#### Key Contacts & Stakeholders
* **CEO / Founder:** [[people/jane-doe]]
* **VP of Engineering:** [[people/john-smith]]
* **Primary Internal Owner:** [[people/pedro-perez]]

#### Current State & Strategic Alignment
* **Active Projects:** [[projects/acme-integration-v1]]
* **Key Metrics / Status:** Series A funded ($12M raised); currently integrating GBrain MCP connectors into their staging environment.
* **Open Action Items:**
  - [ ] Schedule Q3 technical review with [[people/john-smith]]
  - [ ] Review updated API contract in [[projects/acme-integration-v1]]

---

#### Timeline
* **2026-05-20 02:30 PM PT** | [[people/jane-doe]] agreed to pilot the new MCP endpoint during the Q2 review meeting [[meetings/2026-05-20-acme-sync]]. [Source: Meeting Transcript]
* **2026-04-15 10:00 AM PT** | Initial introductory call with [[people/jane-doe]] and [[people/john-smith]]; discussed database connector integration requirements.
* **2026-03-01 09:00 AM PT** | Entity created in brain following YC batch introduction.
