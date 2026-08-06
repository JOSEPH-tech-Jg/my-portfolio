# Governance, Risk, and Compliance (GRC) in Cybersecurity — Complete Master Reference

> **Document Owner:** Office of the CISO / GRC Program Office
> **Classification:** Internal Reference (fictional company data used throughout)
> **Version:** 1.0
> **Last Reviewed:** 2026-08-06
> **Review Cycle:** Annual (or upon significant regulatory / organizational change)

---

## Table of Contents

1. [GRC Fundamentals](#1-grc-fundamentals)
2. [Cybersecurity Governance](#2-cybersecurity-governance)
3. [Security Policies & Documentation](#3-security-policies--documentation)
4. [Risk Management](#4-risk-management)
5. [Risk Assessment Methodologies](#5-risk-assessment-methodologies)
6. [Business Continuity & Disaster Recovery](#6-business-continuity--disaster-recovery)
7. [Compliance Frameworks & Regulations](#7-compliance-frameworks--regulations)
8. [ISO 27001 Deep Dive](#8-iso-27001-deep-dive)
9. [NIST CSF Deep Dive](#9-nist-csf-deep-dive)
10. [PCI DSS Deep Dive](#10-pci-dss-deep-dive)
11. [Third-Party & Supply Chain Risk](#11-third-party--supply-chain-risk)
12. [Audit & Assurance](#12-audit--assurance)
13. [Privacy](#13-privacy)
14. [Security Awareness & Human Factors](#14-security-awareness--human-factors)
15. [GRC Tooling & Automation](#15-grc-tooling--automation)
16. [Mock GRC Program Build-Out](#16-mock-grc-program-build-out)

---

# 1. GRC Fundamentals

## 1.1 What Is GRC?

GRC stands for **Governance, Risk Management, and Compliance**. It is a set of organizational capabilities that enable an organization to reliably achieve objectives, address uncertainty, and act with integrity. In cybersecurity, GRC is the discipline that ties security to business goals rather than treating it as an isolated IT concern.

The three components:

| Component | Definition | Security Example |
|-----------|------------|------------------|
| **Governance** | The system by which an organization is directed and controlled; who has authority, how decisions are made, and how performance is measured. | A Security Steering Committee with a charter, decision rights, and a board-approved security strategy and budget. |
| **Risk Management** | The coordinated activities to direct and control an organization with regard to risk; identifying, analyzing, evaluating, and treating risk. | A risk register where the "customer data exposure" risk is scored as High, with compensating controls and an owner. |
| **Compliance** | Conforming to laws, regulations, standards, and internal policy. | Maintaining GDPR data-subject request workflows and ISO 27001 control evidence for audits. |

### 1.1.1 GRC as a Single Discipline

GRC is more than the sum of its parts. Organizations that run governance, risk, and compliance as three separate silos typically experience:

- Duplicate audits asking the same questions to different teams.
- Controls implemented to satisfy an auditor that add no real security value.
- Risk registers that are disconnected from budgets and strategy.
- Compliance "check-the-box" exercises that fail to improve the security posture.

An **integrated GRC program** ensures that governance sets direction, risk informs decisions, and compliance provides verifiable assurance that the organization is doing what it said it would do.

## 1.2 Why GRC Matters

1. **It gives security a seat at the table.** Boards ask "how secure are we?" — GRC answers with metrics and risk language executives understand.
2. **It turns security into a business enabler.** A vendor won't sign a contract without SOC 2; GRC produces the evidence that closes the deal.
3. **It reduces surprises.** Instead of discovering a compliance gap during a regulatory audit, GRC surfaces it early with a remediation plan.
4. **It aligns risk with capital.** The CFO understands "$2M to fix a High-risk finding" better than "we need a WAF."
5. **It protects the brand.** Demonstrable governance and compliance builds customer and partner trust.

## 1.3 GRC as a Framework for Decisions

GRC provides a repeatable decision loop:

```
Business objectives
      │
      ▼
Set direction (Governance) ──────► Strategy, policies, budget, roles
      │                                    │
      ▼                                    ▼
Identify & assess risk (Risk) ◄─────  Controls & investments
      │                                    │
      ▼                                    ▼
Measure compliance & report (Compliance) ─► Metrics, audits, evidence
      │
      └──────────► Feedback into next cycle
```

**Example decision:** Should the company adopt a public cloud for payroll processing?

- **Governance:** Cloud strategy must be approved by the Architecture Review Board; the CISO has veto authority over data classification moves.
- **Risk:** A risk assessment scores data-at-rest encryption gaps as High for payroll (PII-heavy).
- **Compliance:** Payroll data falls under GDPR, requiring a Data Processing Agreement (DPA) and DPIA before migration.

The GRC framework produces a single, defensible decision: **migrate with DPA, encryption, and approval** — or **delay migration until controls are in place.**

## 1.4 GRC Team Structure

A typical mature GRC organization:

```
Chief Information Security Officer (CISO)
│
├── GRC Manager (owns policy, audit coordination, compliance mapping)
│   ├── Compliance Analyst (regulatory: GDPR, HIPAA, PCI, SOX)
│   ├── Policy & Standards Specialist
│   └── Audit Liaison (internal audit interface)
│
├── Risk Manager (owns the risk register, risk assessments)
│   ├── Third-Party Risk Analyst (vendor assessments)
│   └── BIA / BCM Coordinator
│
├── Privacy Officer / Data Protection Officer (often dotted-line)
│   └── Privacy Analyst (DPIAs, DSARs)
│
└── Security Awareness Lead (training, phishing, culture)
```

**Key roles in a realistic small-to-mid organization:**

| Role | Responsibilities |
|------|------------------|
| **CISO** | Owns overall security strategy, risk appetite, board reporting, budget. |
| **GRC Manager** | Runs the governance calendar, policy lifecycle, control evidence library, audit coordination. |
| **Risk Manager** | Facilitates risk assessments, maintains risk register, tracks risk treatment plans. |
| **Privacy Officer** | Operates the privacy program, DPIAs, DSARs, cross-border transfer assessments. |
| **BCM Coordinator** | Maintains BIA, BCP/DRP, schedules and runs tabletop exercises. |
| **Awareness Lead** | Builds training curriculum, runs phishing simulations, tracks human-risk metrics. |

## 1.5 GRC Maturity

GRC maturity is commonly measured on a 5-level scale (often adapted from CMMI / Carnegie Mellon):

| Level | Name | Characteristics | Example Behavior |
|-------|------|-----------------|------------------|
| 1 | **Initial / Ad hoc** | No documented process; firefighting; depends on heroic individuals. | "The DBA happens to back up the DB because he was burned once." |
| 2 | **Repeatable / Managed** | Some processes exist but are undocumented; person-dependent. | "We do risk assessments when the auditor asks." |
| 3 | **Defined** | Documented, standardized, and trained processes. | Risk assessments follow a published methodology; all staff trained on it. |
| 4 | **Quantitatively Managed** | Processes are measured with quantitative metrics and goals. | Risk score reductions and control coverage % are tracked with SLAs. |
| 5 | **Optimizing** | Continuous improvement using data; lessons learned drive change. | Post-incident reviews routinely change controls; maturity is benchmarked annually. |

**Mock maturity assessment (initial state → target):**

| Capability | Current Level | Target Level | Gap Notes |
|------------|---------------|--------------|-----------|
| Policy lifecycle | 1 | 3 | No version control; policies authored ad hoc. |
| Risk register | 2 | 3 | Exists in spreadsheet; no owners tracked. |
| Compliance mapping | 1 | 3 | Only PCI mapped; GDPR unmapped. |
| Vendor risk | 1 | 3 | Contracts reviewed for insurance only. |
| Training | 2 | 3 | Annual video-based training; no simulation. |
| Metrics & reporting | 1 | 3 | No board dashboard. |

---

# 2. Cybersecurity Governance

## 2.1 Board & Executive Oversight

The board of directors has a fiduciary duty to oversee risk. Increasingly, regulators and shareholders expect boards to understand and actively question cybersecurity posture.

**Board-level responsibilities:**

- Approve the overall risk appetite statement.
- Approve the annual cybersecurity budget and strategy.
- Receive regular (quarterly) security reporting.
- Appoint or confirm the accountable security executive (CISO or equivalent).
- Ensure crisis/incident escalation to the board is defined.

**Board vs. management vs. security team roles:**

| Level | Role | Typical Focus |
|-------|------|---------------|
| **Board of Directors** | Oversight, risk appetite, strategy approval | "Are we accepting risk knowingly and in line with appetite?" |
| **C-suite / Executive team** | Direction, funding, accountability | "Are we investing appropriately and are risks being managed?" |
| **CISO & Security team** | Execution, assurance, reporting | "Are controls effective? What needs attention?" |
| **Audit Committee** | Independent assurance | "Are controls operating as designed? Are findings remediated?" |

## 2.2 Security Strategy & Policies

A security strategy translates board-level expectations into a multi-year plan. It should be:

- **Aligned with business strategy** (e.g., "enter 3 new EU markets" → GDPR readiness, data residency).
- **Risk-based** (prioritized by risk reduction per dollar).
- **Measurable** (tied to metrics and target outcomes).
- **Resourced** (with budget, headcount, and roadmap).

**Mock 3-year security strategy (fictional company "Acme HealthTech"):**

| Year | Theme | Key Initiatives | Budget |
|------|-------|-----------------|--------|
| Year 1 | **Foundation** | CISO hired; policy suite v2; risk register live; MFA everywhere; AV/EDR deployment; training program. | $1.8M |
| Year 2 | **Hardening** | ISO 27001 certification; SIEM + SOC retainer; vendor risk program; DR test for crown jewels; segment network. | $2.4M |
| Year 3 | **Maturity** | Zero-trust architecture; continuous compliance automation; threat modeling integrated into SDLC; board-level metrics automation. | $3.1M |

## 2.3 Organizational Structure & the CISO Role

The CISO is the executive accountable for the security program. Success factors:

- **Reporting line matters.** A CISO reporting to the CIO can face conflicts (budget vs. control). Many orgs have the CISO report to the CEO, COO, or CRO, or at minimum have a dotted line to the board.
- **Authority to enforce.** The CISO needs decision rights over risk acceptance and policy exceptions.
- **Influence.** The best CISOs are translators between technical teams and executives.

**Mock CISO reporting options and trade-offs:**

| Reporting Line | Pros | Cons |
|----------------|------|------|
| To CIO | Budget synergy with IT | Control conflicts; security seen as IT cost |
| To CEO | Direct board visibility, authority | Requires high-level communication skills |
| To CRO/COO | Business alignment, independence from IT | Risk may dominate; slower tech decision speed |
| Matrix (CIO + dotted board) | Both business and technical alignment | Ambiguity, dual accountability |

## 2.4 Decision Rights

Clear decision rights prevent both gridlock and cowboy behavior. A **RACI matrix** (Responsible / Accountable / Consulted / Informed) is the standard tool.

**Mock security decision rights (excerpt):**

| Decision | R | A | C | I |
|----------|---|---|---|---|
| Accept residual risk above appetite | Risk owner | CISO | Board (for critical) | Board |
| Approve security policy | Policy author | CISO | Legal, HR, IT | Board |
| Grant policy exception | Exception requester | CISO / GRC Manager | Legal | Audit Committee |
| Approve vendor contract with access to PII | Procurement | Privacy Officer + CISO | Legal | — |
| Classify new data asset | Data owner | CISO (approve classification scheme) | IT | — |
| Declare security incident | IR Lead | CISO | CEO/General Counsel (major) | Board |

## 2.5 Security Budget (Mock)

**Fictional company:** Acme HealthTech (500 employees, SaaS EHR platform, 120K patients' PHI).

**FY2026 security budget breakdown ($2.4M total):**

| Category | Amount | % of Budget | Notes |
|----------|--------|-------------|-------|
| Personnel (security team: 9 FTEs) | $1,120,000 | 46.7% | Salaries, benefits, training |
| Security tools & software (EDR, SIEM, MFA, DLP, GRC platform) | $580,000 | 24.2% | Includes licenses, maintenance |
| Managed services (SOC retainer, penetration testing, red team) | $350,000 | 14.6% | External testing + 24/7 monitoring |
| Incident response retainers & cyber insurance | $180,000 | 7.5% | Insurance premium + retainer fee |
| Audit & compliance (ISO cert, PCI QSA, penetration tests) | $120,000 | 5.0% | Certification audits + assessments |
| Awareness & training | $50,000 | 2.1% | Learning platform + simulations |

**Security spend as a metric:** ~4.8% of IT budget, ~0.8% of revenue. Industry benchmarks: security spend is typically 5–10% of IT budget; higher for regulated sectors (healthcare/finance).

## 2.6 Metrics & Reporting to the Board (Mock Dashboard)

Boards don't want raw technical data; they want to understand **direction of travel** (improving/declining), **material risks**, and **assurance**.

**Mock quarterly Board Security Dashboard (Q2 2026):**

| Metric | Target | Q2 Actual | Q1 Actual | Trend |
|--------|--------|-----------|-----------|-------|
| High/Critical open risks | ≤ 10 | 12 | 14 | Improving |
| Open audit findings > 90 days | ≤ 5 | 7 | 4 | Declining |
| Phishing click rate | ≤ 5% | 6.2% | 7.8% | Improving |
| MFA coverage (privileged) | 100% | 96% | 91% | Improving |
| Patching critical vulns (SLA ≤ 7 days) | 100% | 94% | 89% | Improving |
| Security incidents (material) | 0 | 0 | 0 | Steady |
| % of staff completing training | 100% | 97% | 95% | Improving |
| Vendor assessments overdue | ≤ 5 | 8 | 11 | Improving |
| Time to patch ransomware-critical vulns | ≤ 72h | 60h | 88h | Improving |

**Narrative for the board (mock):**
> "Security posture improved this quarter across all tracked categories. Two areas require attention: (1) open audit findings aged over 90 days rose from 4 to 7 — the GRC team has re-sequenced remediation and added 1 contractor; (2) privileged MFA coverage is at 96%, with the remaining 4% on legacy appliances being decommissioned in July. No material breaches occurred."

## 2.7 Governance Committees

Common committees in a mature GRC program:

| Committee | Membership | Cadence | Scope |
|-----------|-----------|---------|-------|
| **Board / Audit Committee** | Independent directors | Quarterly | Risk appetite, major findings, incident escalation |
| **Security Steering Committee** | CISO, CIO, CFO, COO, Legal, HR, Privacy | Monthly | Budget, initiatives, risk review, policy approval |
| **Risk Committee** | CISO (chair), risk owners, GRC Manager | Monthly | Risk register review, treatment decisions |
| **Change Advisory Board (CAB)** | IT, security, business reps | Weekly | Change approval (security review input) |
| **Incident Response Team / CSIRT** | On-call IR leads, comms, legal | On-call | Incident management & response |

## 2.8 Policy Hierarchy

Policies exist at levels of abstraction. The classic hierarchy:

```
Policy        (WHAT and WHY — high-level intent, board/CISO approved)
  │
  ▼
Standard      (MANDATORY specific requirements — how to meet policy)
  │
  ▼
Procedure     (STEP-BY-STEP instructions — how to do a task)
  │
  ▼
Guideline     (RECOMMENDED best practice — optional but advisable)
```

### Mock Example: Passwords

| Level | Document | Content |
|-------|----------|---------|
| **Policy** | *Access Control Policy* | "All system access must be controlled and authenticated in accordance with risk." |
| **Standard** | *Authentication Standard* | "Passwords must be ≥ 14 characters; MFA required for all remote and privileged access; MFA using SMS prohibited for privileged accounts." |
| **Procedure** | *Password Reset Procedure* | Step 1: Verify identity via two approved factors. Step 2: Reset in IdP. Step 3: Notify user. Step 4: Log in ITSM ticket. |
| **Guideline** | *Password Creation Guideline* | "Use passphrases of 4+ random words. Avoid song lyrics and birthdates. Consider a password manager." |

### Mock Example: Cloud Migration

| Level | Document | Content |
|-------|----------|---------|
| **Policy** | *Data Protection Policy* | "Data must be classified and protected according to confidentiality, integrity, and availability requirements." |
| **Standard** | *Cloud Security Standard* | "All cloud workloads must use encryption at rest and in transit; least-privilege IAM; no long-lived keys; logging enabled." |
| **Procedure** | *Cloud Onboarding Procedure* | Steps for creating a new AWS account, joining the org, baseline CIS hardening, connecting to SIEM. |
| **Guideline** | *Cloud Cost-Security Guideline* | "Prefer managed services; tag resources; revisit encryption choices quarterly." |

---

# 3. Security Policies & Documentation

## 3.1 Types of Security Policies

| Type | Purpose | Example Documents |
|------|---------|-------------------|
| **Enterprise / Governance** | High-level direction | Information Security Policy, Acceptable Use Policy |
| **Technical / Domain** | Control requirements | Access Control, Network Security, Encryption, Patch Management |
| **Operational** | How work is done securely | Incident Response, Change Management, Backup, Remote Work |
| **Compliance-driven** | Satisfy specific obligations | GDPR Data Retention, PCI-DSS-scoped policies, HIPAA safeguards |
| **Personnel / HR** | Human behavior | Acceptable Use, Bring Your Own Device (BYOD), Code of Conduct, Social Media |
| **Lifecycle** | Data through its life | Data Classification, Data Retention & Disposal |

## 3.2 Writing Effective Policies

**Golden rules:**

1. **Write for the audience** — a board policy reads differently from an IT standard.
2. **Use enforceable language** — "must" for mandatory, "should" for recommended. Avoid "may" and vague words.
3. **State who it applies to** — "All employees, contractors, and third parties with access to Acme systems."
4. **Define roles and responsibilities.**
5. **Include exceptions process.**
6. **State review cadence and approval authority.**
7. **Reference supporting standards/procedures/guidelines.**
8. **Version and date every document.**
9. **Get sign-off** from the accountable owner (CISO, CEO, board as appropriate).
10. **Communicate** — a policy nobody knows about protects nothing.

### Policy Document Template

```
DOCUMENT CONTROL
  Title, Owner, Approver, Version, Effective Date, Last Review, Next Review, Classification

1. PURPOSE                 Why the policy exists
2. SCOPE                   Who/what it applies to
3. POLICY STATEMENTS       The "must" requirements
4. ROLES & RESPONSIBILITIES
5. COMPLIANCE & ENFORCEMENT (consequences)
6. EXCEPTIONS               How to request and who approves
7. RELATED DOCUMENTS        Standards, procedures, guidelines, external references
8. DEFINITIONS
9. VERSION HISTORY          v1.0 initial, v1.1 clarified remote access, etc.
```

### Approval & Review Cycle (Mock)

| Policy | Approver | Review Cycle | Next Due |
|--------|----------|--------------|----------|
| Information Security Policy | CEO + Board | 24 months | 2027-05 |
| Acceptable Use Policy | CISO + Legal + HR | 12 months | 2027-01 |
| Password/Authentication Standard | CISO | 6 months | 2026-12 |
| Incident Response Plan | CISO | 12 months (after every major incident) | 2027-03 |
| BYOD Policy | CISO + Legal + HR | 12 months | 2027-04 |

## 3.3 Mock Policies

### 3.3.1 Acceptable Use Policy (AUP) — Excerpt

> **Purpose:** Define acceptable use of Acme information resources.
>
> **Scope:** All employees, contractors, and consultants.
>
> **Policy statements:**
> - Company-owned devices are for business use; limited personal use is permitted if it does not interfere with work or security.
> - Users must not store Confidential or Restricted data on personal devices or personal cloud accounts.
> - Users must not bypass security controls (e.g., VPN, MFA, proxies).
> - Prohibited: pirated software, harassment, gambling, unauthorized access attempts, sharing of credentials.
> - Email and internet activity may be monitored to protect company assets.
> - Reporting: suspected misuse must be reported to the GRC team or via the anonymous hotline.
>
> **Enforcement:** Violations may result in disciplinary action up to and including termination and referral for criminal prosecution.

### 3.3.2 Password & Authentication Policy — Excerpt

> **Policy statements:**
> - All accounts must use passwords meeting the Authentication Standard (≥ 14 characters).
> - MFA is mandatory for all remote access, email, VPN, cloud admin consoles, and privileged accounts.
> - Shared accounts are prohibited except where explicitly approved by the CISO.
> - Passwords must never be shared; suspected compromise must be reported within 1 hour and the password changed.
> - Service accounts must use secrets stored in the enterprise vault, not plaintext config files.
> - Privileged access must be rotated on a schedule and use a privileged access management (PAM) solution where feasible.

### 3.3.3 Incident Response Policy — Excerpt

> **Purpose:** Ensure timely, coordinated response to security incidents to protect assets and comply with legal/regulatory obligations.
>
> **Key statements:**
> - All employees must report suspected incidents within 1 hour of discovery (helpdesk, IR hotline, or Security mailbox).
> - The CISO declares the incident level (SEV-1..SEV-4) and activates the Incident Response Plan.
> - Only the designated spokesperson communicates externally; no other employee may post about the incident.
> - Breach notification obligations (e.g., GDPR 72 hours, HIPAA 60 days) are owned by the Incident Commander with Privacy/Legal support.
> - Evidence must be preserved; forensic images taken before remediation where practical.
> - Post-incident reviews are mandatory within 30 days for SEV-1/SEV-2.

### 3.3.4 BYOD Policy — Excerpt

> **Purpose:** Allow personal device use where business value exists, while protecting company data.
>
> **Policy statements:**
> - BYOD permitted for email and productivity apps only; Restricted data may not be stored locally.
> - Devices must run a supported OS, be patched, and be enrolled in MDM with remote-wipe capability.
> - Users must enable device passcode/biometrics and full-disk encryption.
> - Company data is separated via containerization; personal data is not accessed by the company.
> - Lost/stolen devices must be reported immediately; MDM wipe will be initiated for the company container.
> - Devices found rooted/jailbroken will be blocked.

## 3.4 Policy Enforcement & Exceptions

**Enforcement methods (in increasing severity):**
1. Technical controls (MFA enforced in IdP, DLP blocks, conditional access).
2. Automated reminders (policy acknowledgment in the LMS).
3. Management escalation (supervisor notification).
4. HR disciplinary action (documented progressive discipline).
5. Termination / contract consequence.

**Exception process (mock):**

| Field | Example |
|-------|---------|
| Requesting policy | Authentication Standard §4.2 (MFA for admin console) |
| Justification | Legacy HVAC controller does not support TOTP; replacement scheduled Q3 |
| Compensating control | Device on isolated VLAN; restricted network egress; password rotated monthly |
| Duration | 90 days (renewable once) |
| Approver | CISO |
| Risk accepted | Low residual, documented in risk register ID #RK-114 |

**Policy exceptions must be:**
- Time-limited (never permanent, or must have a formal waiver).
- Risk-assessed (with compensating controls).
- Approved at the right level (never self-approved).
- Tracked in a register and reported in metrics.

## 3.5 Version Control

Every policy document must be versioned. A mock version history:

| Version | Date | Author | Summary of Change | Approved By |
|---------|------|--------|-------------------|-------------|
| 0.1 | 2025-11-10 | GRC Manager | Draft for review | — |
| 0.2 | 2025-11-24 | Legal, HR, IT | Redline feedback | — |
| 1.0 | 2025-12-15 | GRC Manager | Final for approval | CISO |
| 1.1 | 2026-03-02 | GRC Manager | Added remote work clause after RTO | CISO |
| 2.0 | 2026-08-06 | GRC Manager | Alignment with ISO 27001:2022 | CISO + CEO |

**Version control practices:**
- Store policies in a centralized document management system with change audit trail.
- Every change requires a diff/approval record.
- Policies must be approved only after the current version is verified.
- Superseded versions archived for regulatory audit purposes.
- Automate "next review date" reminders.

---

# 4. Risk Management

## 4.1 Core Risk Concepts

| Term | Definition | Mock Example |
|------|-----------|--------------|
| **Asset** | Something of value to the organization that needs protection. | EHR database containing 120K patients' PHI; web application; brand reputation. |
| **Threat** | Any circumstance or event that could harm an asset. | Ransomware gang; disgruntled employee; accidental deletion; natural disaster. |
| **Vulnerability** | A weakness that a threat could exploit. | Unpatched Apache server CVE-2026-1182; no MFA on admin console; open S3 bucket. |
| **Risk** | The potential for loss when a threat exploits a vulnerability against an asset. | "Ransomware encrypts the EHR DB because the backup is offline and not tested, causing 3 days of downtime." |
| **Control** | A safeguard that reduces risk (preventive, detective, corrective). | EDR, backups, MFA, SIEM alerts, incident response plan. |
| **Threat actor** | Entity that may carry out a threat. | State-sponsored APT, cybercriminal, insider, hacktivist. |
| **Exposure** | The extent to which an asset is subject to a threat. | Publicly reachable admin interface increases exposure. |
| **Likelihood** | Probability a threat will materialize against the vulnerability. | High (public CVE with exploit available in the wild). |
| **Impact** | The consequence if it happens. | $2M revenue loss, regulatory fine, patient harm, reputation damage. |

### The Risk Equation

```
Risk = Threat × Vulnerability × Asset Value (Impact)
     = Likelihood × Impact (after controls considered)

Residual Risk = Inherent Risk − Effect of Controls
```

## 4.2 Risk Appetite & Tolerance

| Term | Definition | Mock Statement |
|------|-----------|----------------|
| **Risk Appetite** | The amount of risk the organization is willing to accept in pursuit of objectives. | "Acme accepts no risk that could expose patient data, cause harm to patients, or result in a material breach of trust." |
| **Risk Tolerance** | The acceptable deviation from the appetite for a specific risk. | "Up to 15 minutes of e-commerce downtime per month is tolerated; customer PII loss is not tolerated at any level." |
| **Risk Capacity** | The maximum risk the organization *could* bear before failing. | "Acme can absorb $5M in loss before liquidity is threatened." |

**Mock risk appetite matrix (heat map thresholds):**

| | Impact: Low (1) | Impact: Med (2) | Impact: High (3) | Impact: Critical (4) |
|---|---|---|---|---|
| **Likelihood: Rare (1)** | Accept | Accept | Accept | Manage |
| **Likelihood: Possible (2)** | Accept | Accept | Manage | Manage |
| **Likelihood: Likely (3)** | Accept | Manage | Manage | Avoid/Transfer |
| **Likelihood: Almost certain (4)** | Manage | Manage | Avoid/Transfer | Avoid/Transfer |

## 4.3 Risk Management Frameworks

| Framework | Focus | Key Ideas | Best For |
|-----------|-------|-----------|----------|
| **NIST RMF** (NIST SP 800-37) | Security & privacy risk in US federal systems | Categorize → Select → Implement → Assess → Authorize → Monitor (6 steps). | Government, regulated entities, system-focused risk. |
| **ISO 31000** | Enterprise risk management principles | Principles + framework + process (Communicate, Establish context, Assess, Treat, Monitor). | Broad, all-risk governance; non-prescriptive. |
| **FAIR** (Factor Analysis of Information Risk) | Quantitative cyber risk | Models loss event frequency × loss magnitude; expressed in $, not scores. | CISOs needing dollar-denominated risk to present to boards. |
| **COSO ERM** | Enterprise risk broadly | Aligns risk with strategy; 5 components. | Whole-enterprise (not just cyber) risk. |
| **OCTAVE** | Self-directed organizational risk | Focus on organizational risk without heavy external assessors. | Mid-size orgs without dedicated risk teams. |

### NIST RMF 7 Steps (as of NIST SP 800-37 Rev. 2)

1. **Prepare** — establish context, roles, risk management strategy.
2. **Categorize** — classify the system and data (FIPS 199: low/moderate/high impact).
3. **Select** — choose baseline controls (NIST SP 800-53).
4. **Implement** — deploy controls.
5. **Assess** — evaluate control effectiveness.
6. **Authorize** — formal decision to operate (ATO).
7. **Monitor** — ongoing control monitoring, reauthorization.

## 4.4 Risk Assessment Process

A standard process (matching ISO 31000 / NIST SP 800-30):

```
1. Establish Context        (scope, criteria, assumptions)
2. Identify Risks           (assets, threats, vulnerabilities)
3. Analyze Risks            (likelihood, impact → score)
4. Evaluate Risks           (compare to appetite → prioritize)
5. Treat Risks              (avoid/mitigate/transfer/accept)
6. Monitor & Review         (reassess, track residual risk)
7. Communicate & Consult    (throughout — with stakeholders)
```

## 4.5 Qualitative vs. Quantitative Risk

### Qualitative Approach

Scales like **Likelihood (1–4)** and **Impact (1–4)** combined into a matrix. Fast, accessible, but subjective and not dollar-denominated.

### Quantitative Approach (FAIR)

Expresses risk in **financial terms**. Core concepts:

```
Risk = Loss Event Frequency (LEF) × Loss Magnitude (LM)

LEF = Threat Event Frequency (TEF) × Vulnerability (Vuln, 0-100%)
LM  = Primary Loss (direct) + Secondary Loss (downstream/third-party)
```

**Mock quantitative example — ransom encryption of the EHR:**

| FAIR Factor | Input | Rationale |
|-------------|-------|-----------|
| Threat Event Frequency (TEF) | 1.2 events/year | Threat intel: 1.2 ransomware attempts against healthcare/year |
| Vulnerability (V) | 0.35 | 35% chance a given attack succeeds (unpatched legacy + gaps in backup) |
| Loss Event Frequency (LEF) | 0.42/year | 1.2 × 0.35 |
| Primary Loss (PL) | $1.4M | Ransom paid, IR fees, forensics, legal, downtime revenue |
| Secondary Loss (SL) | $1.1M | Fines (HIPAA), patient notification, reputation, lost contracts |
| Loss Magnitude (LM) | $2.5M | PL + SL |
| **Annualized Loss Exposure (ALE)** | **$1.05M** | LEF × LM = 0.42 × $2.5M |

### The ALE Formula (the simpler quantitative model)

```
SLE (Single Loss Expectancy) = Asset Value × Exposure Factor
ALE (Annualized Loss Expectancy) = SLE × ARO (Annualized Rate of Occurrence)
```

**Mock ALE calculation:**

| Asset | Asset Value | Exposure Factor | SLE | ARO | ALE |
|-------|-------------|-----------------|-----|-----|-----|
| Customer database | $500,000 | 60% (partial loss of data integrity) | $300,000 | 0.2 | $60,000 |
| E-commerce platform | $1,000,000 | 30% | $300,000 | 0.5 | $150,000 |
| Production email | $200,000 | 50% | $100,000 | 1.0 | $100,000 |

**Decision:** A control costing ≤ $50,000/year that halves the ARO of the e-commerce platform (saving $75,000/year) has a positive ROI → implement.

## 4.6 Risk Register (Mock with Scoring)

**Scoring scale (qualitative):**
- **Likelihood:** 1 = Rare, 2 = Possible, 3 = Likely, 4 = Almost certain
- **Impact:** 1 = Low, 2 = Medium, 3 = High, 4 = Critical
- **Score:** L × I → 1–4 Low, 5–8 Medium, 9–12 High, 13–16 Critical

**Mock risk register (Acme HealthTech, top risks):**

| ID | Risk Description | Asset | L | I | Score | Rating | Owner | Treatment | Residual L | Residual I | Residual Score | Target Date | Status |
|----|------------------|-------|---|---|-------|--------|-------|-----------|-------------|-------------|----------------|-------------|--------|
| RK-101 | Ransomware encrypts EHR, causing extended downtime | EHR DB | 3 | 4 | 12 | **High** | CTO | Mitigate: EDR + air-gapped backups + IR retainer | 2 | 4 | 8 | 2026-09-30 | In progress |
| RK-102 | Third-party vendor data breach exposes PHI | Vendor app | 3 | 4 | 12 | **High** | CPO | Mitigate: vendor assessment + contract MFA; Transfer: cyber insurance | 2 | 3 | 6 | 2026-08-15 | In progress |
| RK-103 | Disgruntled employee exfiltrates customer data | HR systems | 2 | 4 | 8 | **Medium** | CISO | Mitigate: DLP + least privilege + termination checklist | 1 | 4 | 4 | 2026-10-01 | Open |
| RK-104 | Unpatched CVE on public web server exploited | Web app | 3 | 3 | 9 | **High** | AppSec Lead | Mitigate: patch within 48h + WAF + pen test | 2 | 2 | 4 | 2026-07-31 | In progress |
| RK-105 | Failed single AWS region outage | Cloud prod | 3 | 2 | 6 | **Medium** | Cloud Lead | Mitigate: multi-AZ + RTO test | 1 | 2 | 2 | 2026-11-30 | Open |
| RK-106 | GDPR non-compliance on data retention | All systems | 2 | 3 | 6 | **Medium** | Privacy | Mitigate: retention schedule + deletion jobs | 1 | 3 | 3 | 2026-12-15 | Open |
| RK-107 | Phishing leads to credential theft for finance | O365 | 3 | 3 | 9 | **High** | CISO | Mitigate: MFA + training + phishing sims | 2 | 3 | 6 | 2026-09-01 | In progress |
| RK-108 | Social engineering via phone (vishing) bypasses support | Helpdesk | 3 | 2 | 6 | **Medium** | Service Desk Mgr | Mitigate: caller verification process | 2 | 2 | 4 | 2026-08-20 | Open |

## 4.7 Risk Treatment

The four standard treatment options:

| Treatment | Definition | Mock Example |
|-----------|-----------|--------------|
| **Avoid** | Eliminate the activity creating the risk. | "We will not offer online payment on this product because fraud risk exceeds benefit." |
| **Mitigate** | Reduce likelihood and/or impact with controls. | "Add MFA + anomaly detection to reduce account-takeover likelihood." |
| **Transfer** | Share or shift risk to another party. | "Purchase cyber insurance; shift fraud liability to payment processor via contract." |
| **Accept** | Knowingly retain residual risk within appetite. | "Accept 15-minute monthly downtime for the reporting tool; monitor and re-evaluate annually." |

**When acceptance is legitimate:** residual risk is within tolerance, owner is accountable, and it's formally recorded and periodically reviewed.

## 4.8 Residual Risk

Residual risk = the risk remaining after controls. Every risk in the register should show both inherent and residual scores. The **owner accepts residual risk** (never the security team alone). If residual is above appetite, treatment must be escalated (e.g., to the board for critical).

**Mock example:**

| Risk | Inherent | Controls | Residual | Verdict |
|------|----------|----------|----------|---------|
| RK-101 Ransomware | Critical (16) | EDR, air-gapped backups, IR retainer, user training | High (8) | Above appetite → escalate to board; fund mitigation |
| RK-105 Single-region outage | Medium (6) | Multi-AZ deployment | Low (2) | Within appetite → accept, monitor |

## 4.9 Third-Party Risk (TPRM)

### Vendor Risk Lifecycle Overview

```
Onboard ──► Assess ──► Contract ──► Monitor ──► Offboard / Review
```

### Mock Vendor Risk Scorecard

Scoring: **Criticality** (1–4) × **Risk profile** (assessed gaps). Weighted by category.

**Mock scorecard for "CloudSync, Inc." (file-sync vendor):**

| Assessment Category | Weight | Score (1–5) | Weighted | Notes |
|---------------------|--------|-------------|----------|-------|
| Security program maturity | 25% | 4 | 1.00 | SOC 2 Type II, ISO 27001 |
| Data protection & encryption | 20% | 5 | 1.00 | AES-256 at rest, TLS 1.3 |
| Access control & identity | 15% | 3 | 0.45 | MFA default; no SSO SCIM yet |
| Incident response | 15% | 4 | 0.60 | 24/7 SOC, 48h SLA notification |
| Business continuity | 10% | 3 | 0.30 | Multi-region but no RTO SLA in contract |
| Compliance posture | 10% | 4 | 0.40 | GDPR, CCPA, HIPAA BAA available |
| Sub-processor management | 5% | 3 | 0.15 | Uses 3 sub-processors, disclosed |
| **Overall** | 100% | — | **3.90 / 5** | **Acceptable with conditions** |

**Conditions to contract:** SSO/SCIM within 90 days; sub-processor list in DPA; breach notification clause ≤ 48h; RTO SLA added.

---

# 5. Risk Assessment Methodologies

## 5.1 NIST SP 800-30 (Guide for Conducting Risk Assessments)

A 9-step methodology within the broader RMF:

1. **Prepare for the assessment** (scope, assumptions, constraints, roles).
2. **Conduct the assessment** — identify:
   - Threat sources & events
   - Vulnerabilities and predisposing conditions
   - Likelihood of threat events exploiting vulnerabilities
   - Impact on missions/business
3. **Communicate results.**
4. **Maintain the assessment** (re-run on significant change).

**NIST SP 800-30 threat sources table (excerpt):**

| Threat Source | Description | Typical Actor |
|---------------|-------------|---------------|
| Adversarial — Criminal | Theft of data, ransomware, fraud | Cybercriminals |
| Adversarial — Insider | Misuse of privileges, theft | Employees, contractors |
| Accidental | Errors, misconfigurations | Staff |
| Structural | Equipment/software failure | — |
| Environmental | Natural disaster | — |

## 5.2 ISO/IEC 27005 (Information Security Risk Management)

Part of the ISO 27000 family; provides risk management guidance aligned with ISO/IEC 27001. Process:

- **Context establishment** (criteria for risk acceptance, scope).
- **Risk assessment:** identification → analysis → evaluation.
- **Risk treatment:** mitigation options, control selection, residual risk.
- **Risk acceptance, communication, consultation, monitoring, review.**

**ISO 27005 vs NIST 800-30 quick compare:**

| Aspect | ISO 27005 | NIST SP 800-30 |
|--------|-----------|-----------------|
| Origin | International standard | US federal guidance |
| Orientation | Process guidance for ISMS | System-level assessment for RMF |
| Scoring | Flexible (org-defined) | Scales defined in standard |
| Output | Input to Statement of Applicability | Input to ATO decision |

## 5.3 Threat Modeling as Risk Assessment

Threat modeling is a developer/architect-friendly risk assessment performed during design.

**Common methodologies:**

| Method | Core Idea |
|--------|-----------|
| **STRIDE** (Microsoft) | Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation of privilege — categorize threats per element. |
| **DREAD** | Damage, Reproducibility, Exploitability, Affected users, Discoverability — score risks. |
| **PASTA** | Process for Attack Simulation and Threat Analysis — 7-stage, business-aligned. |
| **Attack Trees** | Model attacker goals and the steps to reach them. |
| **OCTAVE Allegro** | Organizational + technology focus, results to risk register. |

**Mock STRIDE on a login endpoint:**

| Element | STRIDE Threat | Risk | Mitigation |
|---------|---------------|------|------------|
| Login form | Spoofing — attacker guesses creds | High | MFA, rate limiting, account lockout |
| Session token | Tampering — token forged | Medium | Signed tokens, short expiry |
| Audit log | Repudiation — no evidence of action | Medium | Append-only logging, SIEM |
| Error message | Info disclosure — reveals user existence | Low | Generic error messages |
| Login endpoint | DoS — credential stuffing flood | Medium | WAF, CAPTCHA, throttling |
| Admin function | Elevation of privilege — IDOR | High | RBAC checks, pen test |

## 5.4 Control Selection (NIST 800-53, CIS Controls)

After risk assessment, select controls from catalogs:

| Catalog | Content | Use |
|---------|---------|-----|
| **NIST SP 800-53** | 20 control families, 1,000+ controls, baselines (Low/Moderate/High) | RMF, federal systems, cloud (FedRAMP) |
| **CIS Critical Security Controls v8** | 18 prioritized controls mapped to Safeguards | Pragmatic, high-value defensive baseline for any org |
| **ISO/IEC 27002** | Guidance for Annex A controls | ISO 27001 control implementation |
| **OWASP ASVS** | Application security verification | Web/app security verification levels |

**CIS v8 top controls (excerpt):**

| Control | Safeguard Example |
|---------|-------------------|
| 1. Inventory & Control of Enterprise Assets | Maintain an accurate asset inventory |
| 3. Data Protection | Encrypt sensitive data in transit and at rest |
| 5. Account Management | Use MFA for administrative access |
| 6. Access Control Management | Review and revoke access quarterly |
| 10. Malware Defenses | Deploy anti-malware with auto-update |
| 16. Application Software Security | Secure coding training; dependency scanning |
| 17. Incident Response Management | Designate IR staff; run exercises |

## 5.5 Mock Full Risk Assessment Walkthrough

**System:** "PharmaOne" — a fictional SaaS clinical-trials management platform used by Acme and exposed to external research sponsors.

### Step 1 — Establish Context

- **Scope:** PharmaOne application, its cloud infrastructure (AWS us-east-1), and supporting CI/CD pipeline.
- **Data:** Personally Identifiable Information (PII) of trial subjects; clinical trial data (trade secret).
- **Data classification:** Restricted (subjects' PII), Confidential (trial protocols).
- **Categorization (FIPS 199):** Confidentiality = High, Integrity = High, Availability = Moderate.

### Step 2 — Identify Assets & Dependencies

| Asset | Owner | Dependency |
|-------|-------|-----------|
| PharmaOne web app (AWS EKS) | Product Eng | IdP (Auth0), RDS, S3, API gateway |
| Trial subjects database (PostgreSQL RDS) | Data Engineering | RDS, backups |
| CI/CD pipeline (GitLab) | DevOps | GitLab runners, registry |
| Source code & secrets | Engineering | GitHub, Vault |
| Third-party: Auth0, Stripe, Twilio, Snowflake | Vendors | — |

### Step 3 — Identify Threats & Vulnerabilities

| # | Threat Source | Threat Event | Vulnerability |
|---|---------------|--------------|---------------|
| T1 | Criminal group | Ransomware | RDS public snapshot accidentally enabled; no MFA on admin IAM |
| T2 | Criminal group | Credential stuffing | No CAPTCHA; legacy users without MFA |
| T3 | Insider | Exfiltration of trial data | Broad analyst DB read access |
| T4 | Software flaw | SQL injection | Unparameterized query in legacy export endpoint (found in pen test) |
| T5 | Vendor | Auth0 outage | Single IdP dependency, no failover |
| T6 | Accidental | Misconfigured S3 bucket public | Missing S3 Block Public Access |

### Step 4 — Analyze Likelihood & Impact

| # | Likelihood (1–4) | Impact (1–4) | Score | Rating |
|---|------------------|--------------|-------|--------|
| T1 | 3 | 4 | 12 | High |
| T2 | 4 | 3 | 12 | High |
| T3 | 2 | 4 | 8 | Medium |
| T4 | 2 | 3 | 6 | Medium |
| T5 | 2 | 2 | 4 | Medium |
| T6 | 3 | 4 | 12 | High |

### Step 5 — Evaluate vs. Appetite

- T1, T2, T6 are above appetite → must treat.
- T3, T4 are at appetite boundary → treat with low-cost controls.
- T5 within appetite → monitor.

### Step 6 — Select & Implement Controls

| Risk | Control Selected | Mapping |
|------|------------------|---------|
| T1 | Remove public snapshots; MFA on all IAM admin; EDR; back up cross-region | NIST 800-53 AC-2, AC-3, SC-7, CP-9; CIS 1, 5, 10 |
| T2 | Enforce MFA for all; CAPTCHA on login; rate limiting via WAF | NIST IA-2; CIS 5, 6 |
| T6 | S3 Block Public Access at org level; automated compliance scanning | NIST SC-7, SI-4; CIS 3 |
| T3 | Least privilege review; quarterly access recertification; DLP on export | NIST AC-6, MP-5; CIS 6 |
| T4 | Parameterized queries; SAST/DAST in pipeline; re-pen-test export endpoint | NIST SI-11, SA-11; OWASP ASVS |

### Step 7 — Assess, Authorize, Monitor

- Internal assessor validates controls → residual scores drop to ≤ 4 (Low/Medium).
- **ATO granted** by the CISO with conditions (MFA rollout completes in 30 days).
- Monitoring: SIEM alerts, quarterly vulnerability scans, annual re-assessment, re-ATO at 3 years or significant change.

---

# 6. Business Continuity & Disaster Recovery

## 6.1 Business Impact Analysis (BIA)

The BIA identifies critical business functions, their dependencies, and the impact of disruption. Outputs feed RTO/RPO/MTD.

### Key BIA Terms

| Term | Meaning | Mock Value |
|------|---------|-----------|
| **RTO — Recovery Time Objective** | Maximum acceptable time to restore service after an outage. | 4 hours for EHR; 24 hours for reporting. |
| **RPO — Recovery Point Objective** | Maximum acceptable data loss measured in time (how far back data may be lost). | 15 minutes for transactions; 24 hours for analytics. |
| **MTD — Maximum Tolerable Downtime** | The longest an organization can survive without the function before irreparable harm. | 24 hours for e-commerce; 72 hours for marketing site. |
| **MBCO — Minimum Business Continuity Objective** | Minimum level of service to keep running during disruption. | Process 50% of orders; support critical patients only. |

### Mock BIA Summary Table

| Business Function | MTD | RTO | RPO | Dependency | Impact if exceeded |
|-------------------|-----|-----|-----|-----------|--------------------|
| Patient appointment booking | 12 h | 4 h | 5 min | EHR, DB, network | Patient harm, regulatory (HIPAA) |
| EHR / clinical data access | 24 h | 4 h | 15 min | EHR cluster, DNS | Patient harm, fines, reputation |
| Billing / payments | 48 h | 8 h | 1 h | Payments gateway, ERP | Revenue loss ($120K/h) |
| Payroll (bi-weekly) | 72 h | 24 h | 24 h | Payroll SaaS, HR DB | Employee trust, legal risk |
| Internal collaboration (email, chat) | 72 h | 24 h | 24 h | O365 | Productivity loss |
| Marketing website | 5 days | 48 h | 24 h | Web hosting, CMS | Brand/revenue (low) |

## 6.2 BCP vs. DRP

| Aspect | BCP (Business Continuity Plan) | DRP (Disaster Recovery Plan) |
|--------|-------------------------------|------------------------------|
| Scope | The whole business: people, processes, facilities, communications. | IT systems, data, infrastructure. |
| Focus | "How do we keep the business running?" | "How do we restore IT?" |
| Horizon | Short- and long-term disruption (pandemic, key-person loss, site loss). | Typically sudden tech/physical disaster. |
| Outputs | Crisis management, workarounds, alternate sites, staffing plans. | Runbooks, restore procedures, failover runbooks. |
| Relationship | BCP includes DRP as a component. | DRP is a subset supporting BCP. |

## 6.3 DR Strategies (Hot / Warm / Cold Sites)

| Strategy | Readiness | RTO | RPO | Cost | Mock Use |
|----------|-----------|-----|-----|------|----------|
| **Hot site** | Fully provisioned, replicated, ready in minutes/hours. | Minutes–hours | Near-zero | Very high | Critical EHR / payment systems |
| **Warm site** | Partially provisioned; restore data and configure. | Hours–1 day | Hours | Medium | ERP, CRM |
| **Cold site** | Empty/available space; build-out required. | Days–weeks | Days | Low | Dev/test, low-critical functions |
| **Active-active (multi-site/multi-cloud)** | Both sites live, load-balanced. | Sub-minute | Near-zero | Very high | Global e-commerce |
| **Backup-then-restore** (no alternate site) | Restore from backups to new infrastructure. | Hours–days | Depends on backup cadence | Low–medium | Reporting, analytics |

**Decision rule (mock):** assign DR strategy by function priority from the BIA — P1 (patient safety) → hot/active-active; P2 (billing) → warm; P3 (analytics) → cold/backup-restore.

## 6.4 Backup Strategies

**3-2-1-1-0 rule (modern extension):**

- **3** copies of data
- **2** different media types
- **1** copy offsite (different location/cloud)
- **1** copy offline or immutable (ransomware-proof)
- **0** errors after testing (verified restores)

**Mock backup matrix:**

| Data Set | Cadence | Type | Retention | Location | Immutable? | Last Verified Restore |
|----------|---------|------|-----------|----------|-----------|-----------------------|
| EHR DB | Continuous + nightly full | SQL backup → object storage | 35 days | AWS us-west-2 (secondary region) | Yes (Object Lock) | 2026-07-15 ✅ |
| File shares | Nightly incremental, weekly full | File backup agent | 90 days | Co-location + cloud | Yes | 2026-06-30 ✅ |
| Email (O365) | Continuous | SaaS native + export | 1 year | Cloud | No | 2026-05-20 ✅ |
| Source code | Every commit | Git | Perpetual | Cloud + local mirror | Yes (tags) | 2026-07-20 ✅ |

**Backup testing:** automated restore validation quarterly; full DR test annually. Never trust a backup you haven't restored.

## 6.5 BC/DR Testing (Mock Exercise)

### Mock Exercise: "Outage-2026" Tabletop + Live Failover

| Item | Detail |
|------|--------|
| Date | 2026-07-28 (announced) |
| Scenario | Region-wide cloud outage in us-east-1 + ransomware confirmed on 12 servers (exercised together) |
| Participants | CISO (lead), Incident Commander, IT ops, Cloud eng, Comms, Legal, Exec sponsor, recorder |
| Objectives | 1) Fail over EHR to us-west-2 within RTO; 2) invoke crisis comms; 3) validate immutable backups restore; 4) document decisions for audit |
| Timeline (simulated) | T+0 outage declared; T+1h failover decision; T+3h EHR read/write restored (RTO 4h = pass); T+6h payments restored; T+24h full restoration; T+72h post-incident review |

**Findings from the exercise:**

| Finding | Severity | Action |
|---------|----------|--------|
| DNS failover required manual step not in runbook | High | Update runbook; add automation |
| Backup vault read permission missing for restore role | High | Fix IAM policy; test restore again |
| Crisis comms templates outdated (CISO role changed) | Medium | Refresh templates quarterly |
| 2 team members unaware of failover scripts location | Medium | Add to onboarding checklist |
| All RTO/RPO targets met or exceeded | Good | Document as evidence |

## 6.6 Cloud BC Considerations

- **Regions/AZs:** design multi-AZ always; multi-region for critical workloads.
- **Data residency:** BC copies in another region may cross legal borders → assess GDPR data residency.
- **Shared responsibility:** provider SLA ≠ your RTO. AWS guarantees nothing about *your* restore time.
- **Configuration drift:** infrastructure-as-code (Terraform) enables rapid rebuild; document golden images.
- **Cloud exit:** ensure you can extract data if you leave a provider.
- **Provider outage ≠ your outage if** you have runbooks, tested failover, and duplicate copies.

---

# 7. Compliance Frameworks & Regulations

## 7.1 GDPR (EU General Data Protection Regulation)

**Scope:** organizations processing personal data of EU/EEA data subjects, wherever located.

| Element | Requirement |
|---------|-------------|
| **Principles** | Lawfulness/fairness/transparency; purpose limitation; data minimization; accuracy; storage limitation; integrity/confidentiality (security); accountability. |
| **Lawful basis** | Consent, contract, legal obligation, vital interests, public task, legitimate interests. |
| **Data subject rights** | Access, rectification, erasure (right to be forgotten), restriction, portability, objection, not be subject to automated decisions. |
| **DSAR (Data Subject Access Request)** | Respond within **1 month** (extendable by 2 with justification). |
| **DPO (Data Protection Officer)** | Required for public bodies, large-scale monitoring, or large-scale special-category data. |
| **DPIA** | Required where processing "likely to result in a high risk to individuals." |
| **Breach notification** | Notify supervisory authority within **72 hours**; notify data subjects if high risk. |
| **Data transfer** | Transfers outside EEA require adequacy decisions, SCCs (Standard Contractual Clauses), or other safeguards. |
| **Fines** | Up to **€20M or 4% of global annual turnover**, whichever is higher. |
| **Records of processing** | Article 30: maintain processing activity records. |

### Mock GDPR operational metrics

| Metric | Value |
|--------|-------|
| DSARs received (2026 YTD) | 214 |
| Median DSAR response time | 12 days (target ≤ 20) |
| DPIAs completed YTD | 17 |
| Breaches notified to authority | 1 (low-risk, no data subject notification) |
| Records of processing updated | 96% complete |

## 7.2 HIPAA (US Health Insurance Portability and Accountability Act)

**Scope:** covered entities (providers, payers) and business associates handling **PHI** (Protected Health Information).

| Element | Requirement |
|---------|-------------|
| **Privacy Rule** | Limits use/disclosure of PHI to minimum necessary; patient rights to access, amend, accounting of disclosures. |
| **Security Rule** | Administrative, Physical, and Technical safeguards for **ePHI**. |
| **Administrative safeguards** | Risk analysis, workforce training, contingency plans, access controls, security policies. |
| **Physical safeguards** | Facility access control, workstation/device security. |
| **Technical safeguards** | Access control, audit controls, integrity, transmission security. |
| **Breach Notification Rule** | Notify affected individuals within **60 days**; HHS for breaches affecting 500+ within 60 days; media in some cases. |
| **BAA (Business Associate Agreement)** | Required with any vendor that creates, receives, or transmits PHI. |
| **Penalties** | Up to ~$2M per violation category per year; state AG enforcement; criminal referral for willful neglect. |

### Mock HIPAA safeguards table

| Safeguard Category | Example Control |
|--------------------|-----------------|
| Administrative | Annual security risk assessment (2026-08 scheduled) |
| Administrative | Workforce training on PHI handling — 97% completion |
| Physical | Data-center badge access + camera surveillance; workstation auto-lock 5 min |
| Technical | ePHI encrypted at rest (AES-256) and in transit (TLS 1.2+) |
| Technical | Unique user IDs + automatic logoff; audit logs retained 6 years |
| Technical | Integrity controls on ePHI; disaster recovery plan tested |

## 7.3 PCI DSS (Payment Card Industry Data Security Standard)

**Scope:** entities that store, process, or transmit cardholder data. Full deep-dive in Section 10.

**Overview of the 4 areas and 12 requirements:**

| Area | Requirements |
|------|--------------|
| Build and Maintain a Secure Network and Systems | 1 (firewalls), 2 (secure config) |
| Protect Cardholder Data | 3 (protect stored data), 4 (encrypt transmission) |
| Maintain a Vulnerability Management Program | 5 (malware), 6 (secure apps), 7 (least access), 8 (authenticate), 9 (physical) |
| Implement Strong Access Control Measures | (continues) |
| Maintain a Vulnerability Management Program | 7, 8, 9 |
| Implement Strong Access Control Measures | — |
| Maintain a Vulnerability Management Program | 7–9 |
| Implement Strong Access Control Measures | — |
| Maintain an Information Security Policy | 12 |

*(The 12 requirements are formally grouped into 6 "goal" areas; see Section 10 for the exact layout.)*

**Key concepts:** Scoping (CDE — Cardholder Data Environment), segmentation, SAQ vs. QSA ROC, quarterly external ASV scans, annual penetration test, PCI requires a formal QSA ROC for most Level 1 merchants.

## 7.4 SOX (Sarbanes-Oxley Act, US)

**Scope:** US public companies and their auditors; controls over financial reporting.

| Element | Requirement |
|---------|-------------|
| **Section 302** | CEO/CFO certification of financial reports and internal controls. |
| **Section 404** | Management assessment of internal control over financial reporting (ICFR); auditor attestation (404b). |
| **ITGC focus** | IT General Controls: access management, change management, program development, computer operations. |
| **Relevance to security** | Security controls that protect financial data and prevent fraud (e.g., segregation of duties, change control, access recertification). |
| **Non-compliance** | Restatement, fines, criminal penalties, delisting risk. |

### Mock SOX in-scope IT controls

| Control | Frequency | Owner | Evidence |
|---------|-----------|-------|----------|
| Segregation of duties on journal entries | Monthly review | Controller | Access review sign-off |
| Access recertification of financial systems | Quarterly | IT Access Mgr | Recertification reports |
| Emergency change approvals | On demand | CAB | Change tickets |
| Backup & restore of financial DB | Weekly test | DBA | Restore logs |

## 7.5 ISO/IEC 27001

**Scope:** the international standard for an Information Security Management System (ISMS). Deep-dive in Section 8.

| Element | Detail |
|---------|--------|
| Clauses 4–10 | Context, Leadership, Planning, Support, Operation, Performance evaluation, Improvement. |
| Annex A (2022) | 93 controls in 4 themes: Organizational, People, Physical, Technological. |
| Certification | Third-party certification via accredited certification body (CB). |
| Validity | 3-year certification with annual surveillance audits. |
| Requirement | Controls are **risk-driven**: choose Annex A controls via risk assessment; produce Statement of Applicability (SoA). |

## 7.6 NIST Cybersecurity Framework (CSF)

**Scope:** voluntary framework of best practices for managing cyber risk. Deep-dive in Section 9. CSF 2.0 (2024) has 6 functions: **Govern, Identify, Protect, Detect, Respond, Recover**.

## 7.7 SOC 2 (Service Organization Control)

**Scope:** trust services report for service organizations (SaaS, hosted services).

| Aspect | Detail |
|--------|--------|
| **Trust Services Criteria** | Security (mandatory); Availability; Confidentiality; Processing Integrity; Privacy (optional). |
| **Type I** | Design of controls at a point in time. |
| **Type II** | Design **and operating effectiveness** over a period (typically 6–12 months). |
| **Auditor** | Licensed CPA firm (e.g., Big 4 or specialized firms). |
| **CC criteria** | Common Criteria (CC1–CC9) — the "security" backbone (control environment, risk assessment, monitoring, logical & physical access, etc.). |

### Mock SOC 2 scope decision

| Trust Criteria | In Scope? | Rationale |
|----------------|-----------|-----------|
| Security | Yes | Mandatory, core to our product promise |
| Availability | Yes | 99.9% uptime SLA advertised |
| Confidentiality | Yes | Handle customer PII/confidential data |
| Processing Integrity | No | We don't process transactions with data-integrity obligations |
| Privacy | Yes | We market a privacy feature; customers expect it |

## 7.8 CMMC (Cybersecurity Maturity Model Certification)

**Scope:** US Department of Defense contractors/subcontractors handling CUI (Controlled Unclassified Information).

| Level | Requirement |
|-------|-------------|
| **Level 1** | 17 practices — basic cyber hygiene for FCI (Federal Contract Information). |
| **Level 2** | 110 practices (NIST SP 800-171) — protect CUI. |
| **Level 3** | 110 practices + selected enhanced practices — reduce risk from APTs. |
| **Assessment** | Level 1: self-assessment; Level 2: self or C3PAO (depending on contract); Level 3: C3PAO assessment + government review. |

## 7.9 Mapping Frameworks (Mock Control Mapping Table)

Compliance teams map controls across frameworks to avoid duplicate audits.

| Control Objective | ISO 27001:2022 (Annex A) | NIST CSF 2.0 | NIST 800-53 | PCI DSS 4.0 | GDPR |
|-------------------|--------------------------|--------------|-------------|-------------|------|
| Access control & least privilege | A.5.15–5.18, A.8.2 | PR.AC | AC-2, AC-3, AC-6 | Req 7 | Art. 32 |
| Multi-factor authentication | A.8.5 | PR.AA | IA-2 | Req 8.4 | Art. 32 |
| Malware protection | A.8.7 | PR.PS | SI-3 | Req 5 | Art. 32 |
| Vulnerability management | A.8.8 | ID.RA / PR.PS | RA-5, SI-2 | Req 6.3 | Art. 32 |
| Network segmentation | A.8.20 | PR.AC | SC-7 | Req 1 | Art. 32 |
| Incident response | A.5.24–5.28 | RS / RC | IR-4, IR-6 | Req 12.10 | Art. 33–34 |
| Audit logging & monitoring | A.8.15 | DE.CM | AU-2, SI-4 | Req 10 | Art. 32 |
| Backup & recovery | A.8.13 | PR.DS / RC.RP | CP-9, CP-10 | Req 9.5 | Art. 32 |
| Third-party oversight | A.5.19–5.23 | ID.RA / GV | SA-9, PS-7 | Req 12.8 | Art. 28 |
| Security awareness & training | A.6.3 | PR.AT | AT-2, AT-3 | Req 12.6 | Art. 39 |

---

# 8. ISO 27001 Deep Dive

## 8.1 The ISMS Concept

An **ISMS (Information Security Management System)** is a systematic approach to managing sensitive information so it remains secure. It is **not just controls** — it's a management system with:

- Policies and objectives
- Defined roles and responsibilities
- Risk management process
- Performance measurement
- Continual improvement

The ISMS is built on **risk-based thinking**: you choose and implement controls based on your risk assessment, not a one-size-fits-all checklist. You document choices in a **Statement of Applicability (SoA)**.

## 8.2 Plan-Do-Check-Act (PDCA)

ISO 27001 is structured around the Deming cycle:

```
PLAN     →  Establish ISMS policy, objectives, processes, and risk treatment plan.
DO       →  Implement and operate the ISMS (controls, procedures, awareness).
CHECK    →  Monitor, measure, analyze, evaluate (internal audits, metrics, reviews).
ACT      →  Take corrective/preventive action; continually improve.
```

## 8.3 The Clauses (Requirements)

| Clause | Title | Focus |
|--------|-------|-------|
| 4 | Context of the Organization | Internal/external issues, interested parties, scope of ISMS. |
| 5 | Leadership | Top management commitment, policy, roles, responsibilities, authorities. |
| 6 | Planning | Risk assessment, risk treatment, information security objectives. |
| 7 | Support | Resources, competence, awareness, communication, documented information. |
| 8 | Operation | Operational planning, risk assessment/risk treatment processes. |
| 9 | Performance Evaluation | Monitoring/measurement, internal audit, management review. |
| 10 | Improvement | Nonconformity & corrective action, continual improvement. |

## 8.4 Annex A Controls Overview (ISO/IEC 27001:2022)

**93 controls in 4 themes:**

| Theme | Count | Example Controls |
|-------|-------|------------------|
| **Organizational** (5) | 37 | A.5.1 Policies; A.5.9 Inventory of assets; A.5.15 Access control; A.5.24 Incident management; A.5.30 ICT readiness for BCM |
| **People** (6) | 8 | A.6.1 Screening; A.6.2 Terms & conditions of employment; A.6.3 Awareness; A.6.6 Remote working |
| **Physical** (7) | 14 | A.7.2 Physical entry; A.7.5 Protecting against physical threats; A.7.12 Cabling; A.7.14 Secure disposal |
| **Technological** (8) | 34 | A.8.2 Privileged access; A.8.7 Malware protection; A.8.8 Vulnerability management; A.8.15 Logging; A.8.16 Monitoring; A.8.24 Secure dev; A.8.28 Secure coding |

## 8.5 Certification Journey (Mock Timeline)

**Company:** Acme HealthTech pursuing ISO 27001:2022 certification.

| Phase | Timeline | Activities | Key Deliverables |
|-------|----------|-----------|------------------|
| **Gap assessment** | Weeks 1–4 | Compare current state vs. ISO requirements; gap report; plan. | Gap analysis report; project plan |
| **ISMS build** | Weeks 5–16 | Scope defined; policy suite v2; risk assessment; SoA; control implementation (MFA rollout, logging, access reviews). | ISMS Manual, policies, SoA, risk treatment plan |
| **Internal audit** | Weeks 17–20 | Internal auditor(s) assess all clauses & controls; nonconformities identified and corrected. | Internal audit report, CAP records |
| **Stage 1 audit** | Week 22 | Documentation review — is the ISMS "ready"? Auditor reviews policies, risk assessment, SoA. | Stage 1 report, minor NCs |
| **Remediation** | Weeks 23–26 | Fix minor nonconformities, close observations. | Evidence of corrections |
| **Stage 2 audit** | Week 28 | On-site audit of implementation and operating effectiveness across sample of controls. | Certificate recommendation |
| **Certification** | Week 30 | Certification body issues ISO 27001 certificate (3-year validity). | Certificate |
| **Surveillance audits** | Year 1 & 2 | Annual surveillance (one-day) audits. | Surveillance reports |
| **Recertification** | Year 3 | Full recertification audit. | New certificate |

**Common stage-1/2 audit findings (mock):**

| Finding | Type | Clause |
|---------|------|--------|
| Asset inventory not updated quarterly | Minor NC | A.5.9 |
| Missing documented risk treatment plan sign-off | Minor NC | 6.1 |
| Awareness training attendance not tracked | Observation | A.6.3 |
| No evidence of supplier security reviews | Minor NC | A.5.19 |
| Management review minutes lack action tracking | Minor NC | 9.3 |

## 8.6 Internal Audit

- Must be performed at planned intervals by **competent** auditors.
- Should be **independent** of the area being audited (auditors shouldn't audit their own work).
- Output: audit report, nonconformities, corrective action plans.
- Internal audit is the "Check" that feeds "Act."

**Mock internal audit schedule:**

| Month | Scope | Auditor |
|-------|-------|---------|
| Jan | Leadership & planning (clauses 4–6) | GRC (vs. IT) |
| Apr | Annex A: Organizational controls | External consultant |
| Jul | Annex A: Technological controls (access, logging, dev) | GRC + AppSec |
| Oct | Annex A: Physical + People + Support | GRC (vs. Facilities/HR) |

## 8.7 Continual Improvement

- Corrective actions must address **root cause**, not symptoms (use 5-Whys, fishbone).
- Management review (at least annually) reviews audit results, risk levels, metrics, incidents, and improvement actions.
- Improvement examples: automation of control evidence, better vulnerability SLA, new training.

**Mock 5-Whys example:**
> **Nonconformity:** Privileged accounts not reviewed for 4 months.
> 1. Why? The access recertification workflow stalled in IT Ops.
> 2. Why? The recertification owner left and task wasn't reassigned.
> 3. Why? No automated escalation for overdue recertifications.
> 4. Why? Tooling didn't support due-date alerts.
> 5. Why? Recertification process was manual (spreadsheet).
> **Corrective action:** automate recertification in the IAM tool with auto-escalation; assign backup owner.

---

# 9. NIST CSF Deep Dive

## 9.1 The Functions (CSF 2.0 — 6 Functions)

NIST CSF 2.0 (Feb 2024) organizes cybersecurity into six functions:

| Function | Purpose | CSF 1.1 name |
|----------|---------|--------------|
| **Govern (GV)** | Establish cybersecurity governance: roles, strategy, policy, oversight, risk management strategy. | *(new in 2.0)* |
| **Identify (ID)** | Understand the organization's assets, data, risks, and requirements. | Same |
| **Protect (PR)** | Implement safeguards for critical infrastructure, data, and assets. | Same |
| **Detect (DE)** | Find cybersecurity events and anomalies. | Same |
| **Respond (RS)** | Act on detected incidents: contain, eradicate, communicate, analyze. | Same |
| **Recover (RC)** | Restore capabilities and services; improve from lessons learned. | Same |

## 9.2 Categories & Subcategories

Each function contains **categories** and **subcategories** (specific outcomes). Example excerpts:

**Govern (GV):**
| Category | Example Subcategories |
|----------|-----------------------|
| GV.OC — Organizational Context | GV.OC-01 mission/objectives understood; GV.OC-02 internal/external stakeholders |
| GV.RM — Risk Management Strategy | GV.RM-01 risk management objectives; GV.RM-02 appetite/tolerance |
| GV.RR — Roles, Responsibilities, Authorities | GV.RR-01 cybersecurity roles assigned |
| GV.PO — Policy | GV.PO-01 policy governance; GV.PO-02 policies established to meet objectives |
| GV.OV — Oversight | GV.OV-01 results reviewed; GV.OV-03 governance/oversight performed |

**Protect (PR):**
| Category | Example Subcategories |
|----------|-----------------------|
| PR.AA — Identity Management & Access Control | PR.AA-01 identities managed; PR.AA-03 remote access secure; PR.AA-05 access authorized |
| PR.AT — Awareness & Training | PR.AT-01 personnel trained; PR.AT-02 personnel understand roles |
| PR.DS — Data Security | PR.DS-01 data at rest protected; PR.DS-02 data in transit protected; PR.DS-11 backups |
| PR.PS — Technology Infrastructure Resilience | PR.PS-01 configuration management; PR.PS-02 maintenance; PR.PS-05 resilient architecture |

## 9.3 Profiles & Tiers

### Profiles

- **Current profile:** where you are today across all subcategories (implemented / not).
- **Target profile:** where you want to be (business-aligned).
- **Gap analysis** between them drives investment prioritization.

### Tiers (CSF 2.0 replaced 4 tiers with a qualitative scale)

| Tier | Description |
|------|-------------|
| **Tier 1 — Partial** | Ad hoc, reactive, no organizational governance. |
| **Tier 2 — Risk Informed** | Risk-based practices, but inconsistently applied; management aware. |
| **Tier 3 — Repeatable** | Practices formally approved, risk-informed, consistently applied, integrated with business. |
| **Tier 4 — Adaptive** | Predictive, continuous improvement, real-time adaptation. |

## 9.4 Implementing CSF (Mock CSF Profile)

**Acme HealthTech target profile — excerpt (target Tier 3).**

| Subcategory | Current | Target | Gap | Priority | Owner |
|-------------|---------|--------|-----|----------|-------|
| GV.RM-02 risk appetite | Partially (no board-approved statement) | Fully | Establish board-approved appetite statement | High | CISO |
| ID.AM-01 asset inventory | Partial (IT assets only, no OT/data assets) | Fully | Extend inventory to data assets + cloud | High | GRC Manager |
| ID.RA-04 threats identified | Partial (vendor threat intel only) | Fully | Add OSINT + sector intel feed | Medium | SOC Lead |
| PR.AA-01 identities | Partial (HR-managed only, no privileged lifecycle) | Fully | IAM/PAM rollout | High | IAM Lead |
| PR.DS-11 backups tested | Partial (quarterly, not all systems) | Fully | Automated restore validation all systems | High | Cloud Lead |
| DE.CM-01 network monitoring | Partial (no visibility on east-west traffic) | Fully | Network detection + segmentation | Medium | Network Eng |
| RS.MI-03 containment | Partial | Fully | IR playbook update + tabletop | Medium | CISO |
| RC.RP-01 recovery plan executed | Partial (no recent full DR test) | Fully | Annual DR test with exec participation | High | BCM Coordinator |

## 9.5 CSF vs. ISO 27001 Mapping

| CSF Function | ISO 27001 mapping (high level) |
|--------------|---------------------------------|
| Govern (GV) | Clause 5 (Leadership), 6 (Planning), 9.3 (Management review) |
| Identify (ID) | Clause 4, 6.1; Annex A.5.9 (asset inventory), A.5.19 (suppliers), A.5.28 (threat intel) |
| Protect (PR) | Annex A.8.2–8.8, A.8.13, A.6.3, A.7.x (access, crypto, backups, awareness, physical) |
| Detect (DE) | Annex A.8.15 (logging), A.8.16 (monitoring) |
| Respond (RS) | Annex A.5.24–5.28 (incident management) |
| Recover (RC) | Annex A.5.29–5.30 (BCM), A.8.13 (backups), Clause 10 (improvement) |

**How they differ:** ISO 27001 is a certifiable management-system standard (conformity). CSF is a voluntary outcome-based framework (maturity/readiness), not certifiable. Many orgs run both: CSF for strategy/board communication, ISO for certification and control discipline.

---

# 10. PCI DSS Deep Dive

## 10.1 Overview & Scope

**PCI DSS** protects cardholder data (CHD: PAN, expiry, CVV2; plus SAD — sensitive authentication data) and applies to any entity that **stores, processes, or transmits** cardholder data.

**Scoping:** Define the **CDE (Cardholder Data Environment)** — people, processes, and technology that touch CHD. Everything in scope must meet all 12 requirements.

### Scope Reduction via Segmentation

If non-CDE systems are **segmented** (isolated via firewalls/VLANs with documented access rules) so they cannot communicate with the CDE, those systems may be **out of scope**. Segmentation must be tested (penetration test of the segmentation).

**Mock segmentation diagram (text):**

```
Internet ──► [WAF / Firewall] ──► Payment Gateway (PCI scope: CDE)
                              └──► E-commerce app (in scope via API)
                              └──► Marketing site (OUT of scope — no CHD, segmented)
```

**Segmentation rules (mock):** Out-of-scope zones may not initiate connections to CDE; CDE→out-of-scope allowed only for needed services; rules documented and pen-tested annually.

## 10.2 The 12 Requirements (grouped by 6 goals)

| Goal | Requirements |
|------|--------------|
| **1. Build and Maintain a Secure Network and Systems** | 1 — Install/maintain network security controls (firewalls); 2 — Secure configuration of systems |
| **2. Protect Cardholder Data** | 3 — Protect stored cardholder data; 4 — Encrypt transmission |
| **3. Maintain a Vulnerability Management Program** | 5 — Protect all systems against malware; 6 — Develop/maintain secure systems & software |
| **4. Implement Strong Access Control Measures** | 7 — Restrict access by need-to-know; 8 — Identify/authenticate access to system components; 9 — Restrict physical access |
| **5. Regularly Monitor and Test Networks** | 10 — Log/monitor all access; 11 — Regularly test security (ASV scans, pen tests) |
| **6. Maintain an Information Security Policy** | 12 — Support with policies and organizational awareness |

## 10.3 SAQ vs. QSA ROC

| Option | Who | When |
|--------|-----|------|
| **SAQ (Self-Assessment Questionnaire)** | Merchant self-assesses | Lower volumes / fewer channels / no CHD storage, depending on SAQ type. |
| **ROC (Report on Compliance)** | **QSA** (Qualified Security Assessor) performs on-site assessment | Level 1 merchants (6M+ transactions/year) or any merchant required by acquirer; organizations that store CHD. |
| **ISA** | Internal Security Assessor (employee trained by PCI SSC) | Supports QSA-led validation. |

**Mock determination:**

| Characteristic | Acme (Merchant) |
|----------------|-----------------|
| Annual transactions | 4.8M (Level 1 = 6M+ → **Level 2**) |
| Channels | Card-present + e-commerce |
| Store CHD? | No — tokenized via gateway (PAN only transient) |
| SAQ eligibility | SAQ A (fully outsourced, no CHD storage, no direct transmission) — but some direct API use → **SAQ A-EP or QSA ROC** |
| Decision | Engage QSA for ROC due to custom checkout code; target SAQ A-EP next year after further outsourcing |

## 10.4 Cardholder Data Environment Components

| Component | In CDE? | Notes |
|-----------|---------|-------|
| POS terminals | Yes | Connected to payment gateway |
| Payment gateway (Stripe) | Yes (third party) | Provides Attestation of Compliance (AoC) |
| E-commerce web server | Yes | Transmits PAN during checkout |
| Backend order DB | No (tokenized) | Stores token, not PAN |
| Marketing CRM | No | No CHD |
| Analytics warehouse | No | Only tokenized data |

## 10.5 Mock PCI Compliance Checklist

| Requirement | In Place? | Evidence | Owner |
|-------------|-----------|----------|-------|
| 1 — Network controls between CDE and out-of-scope | ✅ | Firewall rule documentation + annual segmentation pen test | Net Eng |
| 2 — Default passwords/secure config | ✅ | CIS hardening baseline applied; config scan clean | Sys Admin |
| 3 — Cardholder data protection | ✅ | PAN tokenized; no PAN at rest; retention = 0 | Dev |
| 4 — Encryption in transit | ✅ | TLS 1.2+ enforced; HSTS; no SSL 3.0/TLS 1.0 | Dev |
| 5 — Malware protection | ✅ | EDR on all CDE systems; auto-updates | IT Ops |
| 6 — Secure software development | ⚠️ | SAST in CI (ok); DAST quarterly (ok); pen test due 30 days | AppSec |
| 7 — Least privilege | ✅ | RBAC; quarterly access reviews | IAM |
| 8 — Identification & authentication | ⚠️ | MFA on all admin access to CDE (98% complete; 1 legacy server) | IAM |
| 9 — Physical access | ✅ | Data center badge + camera; device inventory | Facilities |
| 10 — Logging & monitoring | ✅ | Centralized SIEM; audit logs 12 months; integrity protection | SOC |
| 11 — Testing | ✅ | Quarterly ASV scan passed; annual pen test scheduled | AppSec |
| 12 — Policy & awareness | ✅ | InfoSec policy; annual training; incident response plan | GRC |

## 10.6 Common PCI Failures (real-world lessons)

1. **Scope creep / poor segmentation** — marketing site shares the CDE network → whole network in scope.
2. **Storing prohibited SAD** — accidentally retaining CVV2 or full track data "for troubleshooting."
3. **Default creds on POS/systems.**
4. **Encryption gaps** — TLS 1.0 still enabled, mixed content.
5. **ASV scan remediation delays** — scans fail and roll forward quarters.
6. **Key-management weaknesses** — hardcoded encryption keys, no key rotation.
7. **Incomplete evidence for the ROC** — QSA can't validate controls without artifacts.
8. **Access reviews not performed** — stale admin accounts on firewalls.
9. **Log tampering** — no integrity protection on audit logs.
10. **Training fatigue** — one-time training, no ongoing awareness program.

---

# 11. Third-Party & Supply Chain Risk

## 11.1 Vendor Risk Lifecycle

```
1. Intake        ──► classify vendor, criticality, data access
2. Due diligence ──► questionnaire, security review, SOC2/ISO evidence
3. Contracting   ──► security clauses, DPAs, SLAs, breach notification
4. Onboarding    ──► provision access least-privilege, technical controls
5. Monitoring    ──► continuous: reassessment, incident intel, scorecard
6. Offboarding   ──► revoke access, return/destroy data, exit report
```

## 11.2 Due Diligence (Mock Questionnaire)

**Vendor:** "CloudSync, Inc." — criticality **High** (handles confidential PHI/contracts).

| # | Question | Answer | Risk Flag |
|---|----------|--------|-----------|
| 1 | Do you have a CISO / security lead? | Yes | Low |
| 2 | What compliance certifications do you hold? | SOC 2 Type II, ISO 27001, HIPAA BAA | Low |
| 3 | Do you encrypt data at rest and in transit? | AES-256 / TLS 1.3 | Low |
| 4 | Do you support MFA for admin access? | Yes, default | Low |
| 5 | Do you use sub-processors? | 3 (infra, support, AI) | Medium — need DPA listing |
| 6 | Breach notification SLA? | 48 hours (contract), 72h GDPR | Low |
| 7 | Do you undergo independent pen tests? | Annual, by third party | Low |
| 8 | Data residency / backup locations? | US + EU (cross-border) | Medium — GDPR adequacy review |
| 9 | Business continuity / DR plan tested? | Yes, annually | Low |
| 10 | Financial stability / insurance? | Cyber insurance $5M, audited | Low |

**Overall vendor risk rating:** Medium (sub-processors + cross-border), acceptable with conditions.

## 11.3 Contractual Security Clauses

| Clause | Required Content | Mock Value |
|--------|------------------|-----------|
| Security & confidentiality | Vendor maintains safeguards for our data | Yes |
| **Data Processing Agreement (DPA)** | GDPR Art. 28 terms; sub-processor list; instructions | Yes |
| **Business Associate Agreement (BAA)** | HIPAA for PHI-handling vendors | Yes |
| Breach notification | Timeline + details | ≤ 48 hours |
| Data location | Geographic restrictions | US/EU only |
| Right to audit | Access to vendor SOC 2 / assessment reports | Annual |
| Deletion/return on termination | Data disposal + certification | 30 days + certificate |
| Indemnification | Vendor covers losses from their breach | Up to contract value |
| Insurance | Minimum coverage amounts | Cyber $5M, E&O $2M |
| SLA & continuity | Availability, RTO/RPO | 99.9%, RTO 4h |

## 11.4 Vendor Monitoring (Mock)

**Quarterly vendor risk scorecard trend:**

| Vendor | Q1 | Q2 | Q3 | Q4 | Trend | Trigger Action |
|--------|----|----|----|----|-------|----------------|
| CloudSync | 4.2 | 4.0 | 3.8 | 3.5 | Declining | Escalate: request updated SOC 2 + incident report |
| PayNet (gateway) | 4.5 | 4.5 | 4.6 | 4.6 | Stable | None |
| DataWidget (analytics) | 3.1 | 3.2 | 3.0 | 2.8 | Declining | Below 3.0 threshold → enhanced monitoring, contract review |
| HRSuite (HR SaaS) | 4.0 | 4.1 | 4.2 | 4.3 | Improving | None |

**Monitoring sources:** SOC 2 reports, breach news, vulnerability intel, third-party risk ratings (e.g., BitSight/SecurityScorecard-style), vendor-supplied updates, annual reassessments for high-criticality vendors.

## 11.5 Supply Chain Attacks

High-profile supply-chain attacks demonstrate the risk (e.g., SolarWinds, log4j, MOVEit, 3CX). Lessons:

- Attackers target **trusted software/vendors** because they inherit the vendor's access.
- **Software bill of materials (SBOM)** makes it possible to respond to a library vulnerability instantly.
- **Vendor access is privileged access** — treat it as such (MFA, limited scope, monitoring).
- **Build vs. buy:** the more critical the vendor, the deeper the due diligence.
- Assume compromise: monitor vendor-connected traffic and review vendor access logs.

### Mock supply-chain scenario

> **Event:** Vulnerability announced in "LogSync" logging library used by 14 Acme services.
> **Response:** SBOM query identifies affected services in 2 hours → 5 services internet-facing patched in 8 hours; 9 internal services within 48h; EDR + SIEM rules added to detect exploitation within 1 hour; vendor (library maintainer) contacted; third-party risk team reviewed exposure from any upstream maintainers.

## 11.6 Incident Response for Vendors

| Step | Action |
|------|--------|
| 1 | Confirm vendor's breach scope touches our data/access. |
| 2 | Activate IR plan; assign vendor incident lead. |
| 3 | Obtain breach details (data, systems, timeline, root cause). |
| 4 | Assess our exposure; check our own logs for suspicious access from vendor systems. |
| 5 | Rotate shared/transitive credentials. |
| 6 | Invoke breach notification obligations (GDPR/HIPAA) if required. |
| 7 | Require vendor root-cause analysis (RCA) and corrective action plan. |
| 8 | Update vendor risk scorecard; consider re-assessment or exit. |
| 9 | Document lessons; update vendor selection criteria. |

---

# 12. Audit & Assurance

## 12.1 Internal vs. External Audit

| Aspect | Internal Audit | External Audit |
|--------|----------------|----------------|
| Purpose | Improve controls, risk management, governance; advise management. | Independent assurance to stakeholders; regulatory/attestation. |
| Independence | Report to board/audit committee (not management of audited area). | Fully independent third party. |
| Frequency | Continuous / risk-based schedule. | Annual or contractual. |
| Examples | Control self-assessments, internal security audits. | SOC 2, ISO surveillance, QSA ROC, financial audit (SOX 404). |
| Standard | IIA standards (IPPF) for internal audit. | ISACA, AICPA, ISO CB rules. |

**Mock statement:** "Internal audit found 4 findings; the security team remediated 3 within 60 days. External SOC 2 Type II reported no exceptions."

## 12.2 Audit Types

| Type | Focus | Example |
|------|-------|---------|
| **Compliance audit** | Adherence to regulation/standard. | GDPR data-retention review; PCI requirement 12. |
| **Operational audit** | Effectiveness/efficiency of processes. | Change management process review. |
| **Technical audit** | Configuration, vulnerabilities, architecture. | Penetration test, hardening review, cloud configuration audit. |
| **Financial audit / ITGC** | Controls over financial reporting. | SOX 404 access & change controls. |
| **Privacy audit** | Privacy program effectiveness. | DSAR handling, DPIA completeness. |
| **Supplier audit** | Vendor control environment. | CloudSync SOC 2 report review; on-site option. |

## 12.3 Audit Evidence

Good evidence is **objective, sufficient, and timely**:

| Evidence Type | Examples |
|---------------|----------|
| Configuration evidence | Screenshots, system config exports, cloud config audit reports. |
| Logs | Access logs, change logs, SIEM alerts. |
| Documentation | Policies, procedures, standards, SoA. |
| Reports | Pen test reports, SOC 2 reports, ASV scans. |
| Interviews | Sessions with control owners. |
| Testing | Auditor-performed tests (e.g., attempted login, check a firewall rule). |
| Ticketing evidence | Access request/approval tickets, remediation tickets. |

## 12.4 Auditor Independence

Independence requirements:

- Auditors must not audit **their own work** (the person who built the control can't assess it).
- Internal audit should not have operational responsibilities in audited areas.
- External auditors must be free of conflicts (no cross-selling of services that create self-review).
- Rotation requirements exist for financial auditors (audit partners rotate).

## 12.5 Mock Audit Findings Report

**Audit:** Internal Security Audit — Cloud Infrastructure (scope: AWS prod).
**Auditor:** Internal audit team (independent of Cloud Ops).

| ID | Finding | Severity | Impact | Root Cause | Recommendation | Due Date | Status |
|----|---------|----------|--------|-----------|----------------|----------|--------|
| F-01 | 12 IAM users have access keys older than 365 days | High | Stolen key would grant broad access | No key rotation policy | Implement key rotation; move to role-based temp creds | 2026-09-30 | Open |
| F-02 | S3 bucket "acme-backups" publicly listable via misconfigured ACL | Critical | Data exposure | No Block Public Access default | Enforce S3 Block Public Access at org; re-scan | 2026-08-10 | In progress |
| F-03 | No MFA on 2 break-glass accounts | High | Account takeover | Emergency process undocumented | MFA hardware keys; document break-glass procedure | 2026-08-25 | Open |
| F-04 | Change to security group not reviewed by CAB | Medium | Unreviewed network change | Exceptions not enforced | Require CAB approval; audit non-compliant changes | 2026-09-15 | Open |
| F-05 | Audit logs for CloudTrail not replicated to secondary region | Medium | Log loss in region outage | No replication config | Enable org-wide CloudTrail to S3 in us-west-2 | 2026-10-01 | Open |

**Summary:** 1 Critical, 3 High, 1 Medium. No systemically flawed control areas. Remediation owners assigned; GRC tracks closure; overdue findings reported to board.

## 12.6 Remediating Audit Findings

**CLOSED-loop process:**

```
Finding logged ──► Owner assigned & due date ──► Corrective action ──►
Re-test (evidence) ──► Status update ──► Closure approved by auditor ──►
Trended in metrics
```

**Remediation SLA (mock):**

| Severity | SLA | Escalation if missed |
|----------|-----|----------------------|
| Critical | 30 days | CISO + Board |
| High | 60 days | CISO |
| Medium | 90 days | GRC Manager |
| Low | 180 days | GRC Manager |

## 12.7 Continuous Auditing

Modern GRC automates evidence collection so audits are "always on":

- Automated control checks (e.g., nightly scan for public S3 buckets, MFA coverage, expired certs).
- Continuous compliance platforms gather evidence → reduce audit effort.
- Drift detection flags deviations from baseline immediately.
- Benefit: findings are caught before auditors do, and certifications renew faster.

---

# 13. Privacy

## 13.1 Privacy vs. Security

| Aspect | Privacy | Security |
|--------|---------|----------|
| Focus | Rights of individuals over their personal data. | Protecting information from unauthorized access/loss. |
| Question | "Do we have the right to process this, for this purpose?" | "Can someone break in?" |
| Drives | Consent, purpose limitation, minimization, rights. | Confidentiality, integrity, availability. |
| Overlap | Security is a **prerequisite** (Art. 32 GDPR). Privacy adds legal/ethical limits on *use*. |
| Example | You may *securely* store data you should never have collected. |

## 13.2 Privacy Principles

| Principle | Definition | Mock Implementation |
|-----------|-----------|---------------------|
| **Lawfulness, fairness, transparency** | Process lawfully, fairly, transparently. | Privacy notice updated; consent records stored. |
| **Purpose limitation** | Only collect for specified, legitimate purposes. | Marketing data not used for health analysis. |
| **Data minimization** | Collect only what's needed. | Forms ask for name + email only, not DOB. |
| **Accuracy** | Keep data correct; correct on request. | DSAR rectification workflow; CRM dedup. |
| **Storage limitation** | Delete when no longer needed. | Retention schedule + automated deletion jobs. |
| **Integrity & confidentiality (security)** | Protect against unauthorized access/loss. | Encryption, access controls, DLP. |
| **Accountability** | Demonstrate compliance. | Records of processing, DPIAs, training logs. |

## 13.3 Privacy Impact Assessment (Mock PIA)

**Project:** Adding a "health reminders" AI feature that analyzes patient data.

| PIA Section | Answer |
|-------------|--------|
| **Data involved** | Patient name, contact, diagnosis codes, visit history. |
| **Data classification** | Restricted (special-category health data). |
| **Purpose** | Personalized care reminders. |
| **Legal basis** | Consent (explicit) + legitimate interest for appointment reminders. |
| **Data flows** | EHR → analytics pipeline → AI model (sub-processor) → SMS/email. |
| **Risks** | Re-identification, profiling harms, excessive retention, vendor exposure. |
| **Mitigations** | Anonymization before analytics; explicit consent; vendor DPA + no-retention; retention 12 months; opt-out. |
| **Data subject rights** | Access, deletion, object; automated decision-making transparency (GDPR Art. 22 check). |
| **DPO opinion** | Approved with conditions (explicit consent + vendor DPA). |

## 13.4 Privacy by Design & by Default

**Privacy by design** — bake privacy into systems at the design stage (proactive, default privacy, end-to-end security, visibility).

**Privacy by default** — settings ship privacy-friendly by default:
- No data collected beyond what's necessary.
- Consent defaults to **off** for non-essential processing.
- Max/min retention by default.

**Mock default settings checklist for a new app:**

| Setting | Default |
|---------|---------|
| Analytics tracking | Off until consent |
| Marketing emails | Unsubscribed |
| Data retention | 12 months (configurable, never unlimited) |
| Third-party SDKs | Disabled unless opted in |
| Profile visibility | Private |

## 13.5 The Privacy Program

| Program Element | Owner | Evidence |
|-----------------|-------|----------|
| Privacy notices | Privacy Officer | Published, reviewed annually |
| DSAR process | Privacy Officer | Response tracker (SLA 20 days) |
| DPIA process | Privacy Officer | 17 DPIAs completed 2026 |
| Consent management | Product | Consent registry + preference center |
| Records of processing | Privacy Officer | Article 30 register updated quarterly |
| Training | Awareness Lead | Annual privacy training module |
| Breach management | CISO + Privacy | GDPR/HIPAA notification workflows |
| Vendor DPAs | Procurement + Privacy | DPA library, sub-processor list |

## 13.6 Consent Management

- Consent must be **freely given, specific, informed, unambiguous** (GDPR).
- Record **who, what, when, how** consent was given.
- Withdrawal must be as easy as giving consent.
- Separate consent per purpose; no bundling.
- Children's consent (age thresholds) where applicable.

**Mock consent record schema:**

| Field | Example |
|-------|---------|
| Subject ID | 88213 |
| Purpose | Marketing emails |
| Basis | Explicit consent |
| Given | 2026-03-14 09:22 UTC |
| Source | Web signup v4 |
| Version of notice | Privacy Notice v2.1 |
| Status | Active (withdrawn 2026-07-02 → delete from marketing list) |

## 13.7 Cross-Border Data Transfers

| Mechanism | When Used |
|-----------|-----------|
| **Adequacy decision** | EU has deemed country provides adequate protection (e.g., UK, Japan, Canada). |
| **Standard Contractual Clauses (SCCs)** | Contractual safeguards for transfers to non-adequate countries. |
| **Binding Corporate Rules (BCRs)** | Group-wide internal transfer rules (EU). |
| **Derogations** | Exceptions: explicit consent, necessary for contract, legal claims. |

**Mock transfer assessment:**
> Acme (EU HQ) uses US-based CloudSync. Transfer basis: SCCs (2021) + **transfer impact assessment (TIA)** documented, considering US surveillance law per Schrems II. Supplementary measures: regional data residency option enabled; encryption with Acme-held keys; no US government access request received.

---

# 14. Security Awareness & Human Factors

## 14.1 Why Human Risk Matters

- Over **70–90%** of breaches involve a human element (phishing, errors, misuse).
- People are the perimeter: employees handle credentials, approve payments, and click links.
- Awareness programs must **change behavior**, not just tick a training box.

## 14.2 Training Program (Mock Annual Plan)

| Month | Topic | Modality | Audience |
|-------|-------|----------|----------|
| Jan | New-hire security onboarding | eLearning + quiz | All new hires |
| Feb | Phishing & social engineering | eLearning + simulation launch | All |
| Mar | Passwords & MFA; password manager rollout | eLearning | All |
| Apr | Remote work & BYOD | eLearning | All |
| May | Physical security & clean desk | eLearning | All |
| Jun | GDPR/privacy basics; DSAR awareness | eLearning | All + extra for data roles |
| Jul | Mid-year phishing simulation #2 | Simulation | All |
| Aug | Incident reporting — what to do | Micro-learning + IR hotline poster | All |
| Sep | Secure development (OWASP Top 10) | Workshop | Developers |
| Oct | Vendor & third-party risk awareness | eLearning | Procurement, managers |
| Nov | End-of-year phishing simulation #3 | Simulation | All |
| Dec | Yearly review + refreshers | Micro-lessons | All |

## 14.3 Phishing Simulations (Mock Results)

| Campaign | Month | Employees | Sent | Clicked | Click Rate | Reported | Baseline |
|----------|-------|-----------|------|---------|-----------|----------|----------|
| Payroll-themed invoice | Feb | 470 | 470 | 41 | 8.7% | 9 | Baseline |
| Microsoft 365 credential | May | 468 | 468 | 29 | 6.2% | 18 | — |
| Gift card / HR reward | Jul | 465 | 465 | 18 | 3.9% | 31 | — |
| Teams-chat style vishing precursor | Sep | 463 | 463 | 12 | 2.6% | 42 | — |
| Fake SSO login | Nov | 461 | 461 | 9 | 2.0% | 55 | Improvement ✓ |

**Repeated offenders:** 6 employees clicked in 3+ campaigns → mandatory one-on-one training + stricter access review.
**Benchmark:** click rate < 5% is good; top-performing organizations reach ~2% or below.

## 14.4 Human Risk & Culture

- **Blame-free culture:** people must report mistakes without fear, or incidents hide.
- **Security champions:** embed trained volunteers in departments.
- **Communications:** internal security newsletter, "security Tuesday" tips, leadership-led messaging.
- **Reward the right behavior:** public recognition for reporting phishing quickly.
- **Measure culture:** pulse surveys asking "would you report a mistake?" etc.

## 14.5 Metrics (Mock Training Metrics)

| Metric | Target | Q1 | Q2 | Q3 (actual) | Q4 (proj) |
|--------|--------|----|----|-------------|-----------|
| Training completion | 100% | 92% | 95% | 97% | 100% |
| Phishing click rate | < 5% | 8.7% | 6.2% | 2.6% | 2.0% |
| Phishing report rate | > 40% of clicks reported | 22% | 62% | — | — |
| Time to report (median) | < 15 min | — | — | 11 min | 10 min |
| Awareness quiz pass rate | > 90% | 88% | 91% | 94% | 95% |
| Champions active | 20 | 8 | 14 | 18 | 22 |

---

# 15. GRC Tooling & Automation

## 15.1 GRC Platform Overview

A GRC platform centralizes policy, risk, compliance, and audit workflows.

**Typical modules:**

| Module | Function |
|--------|----------|
| Policy management | Versioning, approval workflow, attestation |
| Risk management | Risk register, assessments, treatment plans, heat maps |
| Compliance management | Control mapping, evidence collection, framework alignment |
| Vendor risk | Questionnaires, assessments, scorecards |
| Audit management | Findings, CAPA tracking, evidence |
| Incident management (light) | Incident logging, IRP linkage |
| Reporting & dashboards | Executive metrics, KPIs |

**Common vendors (illustrative):** Archer, ServiceNow GRC, OneTrust (privacy/GRC), AuditBoard, LogicGate, Vanta/Drata (continuous compliance), Scytale.

**Mock selection criteria:**

| Criterion | Weight | Requirement |
|-----------|--------|-------------|
| Frameworks supported | 20% | ISO 27001, NIST CSF, SOC 2, GDPR, PCI |
| Evidence automation | 20% | Cloud integration (AWS/GCP), continuous checks |
| User-friendliness | 15% | Non-security users can submit evidence |
| Integration | 15% | SSO, ticketing, SIEM |
| Cost | 15% | < $100K/yr |
| Support & roadmap | 15% | Vendor responsiveness, SOC 2 |

## 15.2 Automating Controls (Mock)

Automated controls reduce human error and produce evidence continuously.

| Control | Manual (before) | Automated (after) | Frequency |
|---------|-----------------|-------------------|-----------|
| Public S3 bucket check | Quarterly manual review | Policy-as-code scan + alert | Continuous |
| MFA coverage | Semi-annual audit | IdP report + automated alert on drop | Weekly |
| Certificate expiry | Manual spreadsheet | Automated scanner + tickets | Daily |
| Patching critical vulns | Monthly manual | Auto-patch for approved classes + daily scan | Daily |
| Access recertification | Annual email churn | IAM tool workflow + escalation | Quarterly |
| Policy attestation | HR nag emails | LMS auto-assignment + reminders | Annual |
| AWS CloudTrail to SIEM | Manual export | EventBridge → SIEM pipeline | Continuous |

**Benefit example (mock):** Automated S3 scan found and blocked 3 misconfigured buckets in Q2 that would previously have gone undetected until audit.

## 15.3 Policy Management Tools

- Central repository with metadata (owner, version, review date).
- Workflow: draft → review → approve → publish → acknowledge.
- Attestation tracking ("who has read and agreed to AUP").
- Version diffing and audit trail.
- Retention of superseded versions.

## 15.4 Risk Dashboards & KPIs (Mock GRC Dashboard)

**Executive risk dashboard — Q3 2026:**

| KPI | Value | Target | Trend |
|-----|-------|--------|-------|
| Critical risks (open) | 1 | 0 | ⚠️ |
| High risks (open) | 7 | ≤ 6 | ⚠️ |
| Medium+ risks within appetite | 78% | > 85% | 🟡 |
| Risks with owner assigned | 100% | 100% | ✅ |
| Treatment plan on-time | 82% | > 90% | 🟡 |
| Audit findings open (by severity) | 1C / 5H / 8M | C=0, H≤3 | 🟡 |
| Findings remediated on time (60d) | 88% | 100% | 🟡 |
| Control effectiveness (tested) | 91% | > 95% | 🟡 |
| Vendor assessments current | 92% | 100% | ✅ |
| Policies in review window | 3 overdue | 0 | ⚠️ |
| Staff training complete | 97% | 100% | 🟡 |
| Continuous compliance checks passing | 96.4% | > 99% | 🟡 |

## 15.5 Metrics & KPIs Framework

| Metric Type | Example | Audience |
|-------------|---------|----------|
| **Lagging** (outcome) | Breach count, downtime, fines, findings aged | Board |
| **Leading** (predictive) | MFA coverage, patch SLA adherence, phishing click rate | Exec + CISO |
| **Operational** | Ticket SLA, scan coverage, evidence freshness | GRC/ops teams |
| **Assurance** | Control test pass rate, audit closure rate | Audit committee |

**Golden rule:** every KPI should have a **target**, **owner**, **source**, and a **decision/action** tied to it. A metric nobody acts on is decoration.

---

# 16. Mock GRC Program Build-Out

## 16.1 The Company

**"NovaPay"** — fictional fintech startup, 220 employees, B2B payment orchestration platform. Founded 2021, Series B. Processes payment instructions (not card PANs — bank-account data), holds corporate PII. Growing into EU markets. Has 1 security engineer, no CISO, no GRC. Customers (enterprises) increasingly ask for SOC 2 and GDPR evidence.

## 16.2 Starting State (Assessment)

| Capability | Current State | Risk/Impact |
|------------|---------------|-------------|
| Leadership | No CISO; security owned by CTO (part-time) | No accountable exec; board can't be briefed |
| Policies | 2 outdated policies (AUP, password), no versioning | Compliance gaps, inconsistent behavior |
| Risk management | None — no register | No prioritized investment |
| Access | MFA on email only; admin consoles unprotected | High ATO risk |
| Monitoring | Minimal logging; no SIEM | Can't detect or prove incidents |
| Backup | Nightly full to cloud; no restore tests | DR risk |
| Compliance | No frameworks; customer audit requests answered ad hoc | Lost deals |
| Training | One-off onboarding video | Human risk |

## 16.3 GRC Program Roadmap

| Phase | Timeline | Objectives | Key Activities | Success Criteria |
|-------|----------|-----------|----------------|------------------|
| **0 — Foundation** | Months 1–3 | Stand up leadership & basics | Hire CISO; board risk appetite statement; policy framework (7 core policies); risk register v1; MFA everywhere; asset inventory | CISO hired; appetite approved; register live; MFA 100% |
| **1 — Stabilize** | Months 4–6 | Control high risks | SIEM + SOC retainer; access recertification; backup restore tests; incident response plan + tabletop; vendor due diligence | No critical risks open; DR test pass; IR plan exercised |
| **2 — Certify/Validate** | Months 7–12 | External assurance | SOC 2 Type I then Type II prep; ISO 27001 gap + stage 1; GDPR alignment; training program + phishing sims | SOC 2 Type I issued; ISO stage 1 passed; GDPR records complete |
| **3 — Mature** | Year 2 | Operationalize GRC | GRC platform; continuous compliance automation; vendor scorecards; metrics to board; third-party risk program | Board dashboard live; automation covers 80% of controls; vendor program operating |
| **4 — Optimize** | Year 3 | Scale & improve | ISO 27001 certification; SOC 2 Type II; internal audit program; threat modeling in SDLC; cyber insurance review | Certifications held; audits pass; internal audit cycle running |

## 16.4 Key Decisions Made (with rationale)

| Decision | Rationale |
|----------|-----------|
| Hire CISO before buying tools | Accountability and strategy must precede tooling. |
| Focus first on MFA + access control | Highest-risk reduction per dollar; customer confidence. |
| Pursue SOC 2 before ISO 27001 | Customer sales cycle demands SOC 2; ISO follows for maturity. |
| Start risk register as simple spreadsheet, migrate later | Momentum over perfection; don't buy GRC tooling before process. |
| Outsource SOC/monitoring initially | Scale without hiring 6 analysts in year 1. |
| Board risk appetite approved in Month 2 | Enables CISO to make defensible accept/decline decisions. |
| Backup to immutable object storage | Ransomware resilience without complex on-prem DR. |

## 16.5 Mock Board Update (Month 6)

> **NovaPay Board Cybersecurity Briefing — June 2026**
>
> **Headline:** "Foundation complete; control program stabilizing. Zero material incidents. Customer assurance assets in build."
>
> **Program status:**
> - CISO hired (April); security team 3 FTE + SOC retainer.
> - 7 policies approved; 96% staff attestation complete.
> - Risk register: 24 risks tracked; 4 High (was 9); 0 Critical.
> - MFA: 100% of staff, 100% of admin consoles; privileged accounts 98% (2 legacy devices being replaced).
> - SIEM live; 4,200 events/day; 11 confirmed low-severity incidents; all closed.
> - First phishing simulation: 6.4% click rate → target ≤ 5% by Q4.
> - SOC 2 Type I scheduled August; ISO 27001 gap assessment July.
>
> **Ask of the board:** Approve $85K for GRC platform (Phase 3) and $40K for ISO certification audit budget. Confirm appetite statement remains appropriate post EU expansion.
>
> **Top risks for board awareness:**
> 1. Third-party concentration — 2 vendors handle >60% of payment traffic (monitoring + contractual clauses in place; mitigation Q3).
> 2. EU market entry creates GDPR breach-notification obligations (DSAR/notification workflows live; DPO designation pending).

## 16.6 Lessons Learned (candid)

1. **Start with the CISO, not the tool.** NovaPay saved $85K by not buying a GRC platform in month 1.
2. **Board appetite statements matter** — they made every later risk decision faster and defensible.
3. **Policies without enforcement are decoration** — enforcement came from MFA rollout + technical controls, not prose.
4. **Measure what you'll act on** — NovaPay's board sees 6 KPIs, not 30.
5. **Automation pays for itself** — continuous S3/identity checks caught issues the manual process missed for months.
6. **Cultural fit:** leadership messaging ("we treat your data like our own") drove better click-report rates than any video.
7. **Don't certify before you're ready** — they did SOC 2 Type I to de-risk, then Type II, then ISO.

---

## Appendix A — Glossary of Key Terms

| Term | Definition |
|------|-----------|
| ALE | Annualized Loss Expectancy = SLE × ARO. |
| ARO | Annualized Rate of Occurrence. |
| ATO | Authority to Operate. |
| BIA | Business Impact Analysis. |
| BCP | Business Continuity Plan. |
| CDE | Cardholder Data Environment (PCI). |
| CISO | Chief Information Security Officer. |
| CSF | NIST Cybersecurity Framework. |
| DPIA | Data Protection Impact Assessment. |
| DPO | Data Protection Officer. |
| DRP | Disaster Recovery Plan. |
| DSAR | Data Subject Access Request. |
| GRC | Governance, Risk, and Compliance. |
| ISMS | Information Security Management System. |
| MTD | Maximum Tolerable Downtime. |
| PAN | Primary Account Number (cardholder data). |
| PIA | Privacy Impact Assessment. |
| RPO | Recovery Point Objective. |
| RTO | Recovery Time Objective. |
| SAQ | Self-Assessment Questionnaire (PCI). |
| SCC | Standard Contractual Clauses. |
| SLE | Single Loss Expectancy. |
| SoA | Statement of Applicability. |
| SOC 2 | Service Organization Control report (trust services). |
| TPRM | Third-Party Risk Management. |
| QSA | Qualified Security Assessor (PCI). |

## Appendix B — Quick Reference: Which Framework When?

| Need | Recommended |
|------|-------------|
| Board-level strategy and maturity language | NIST CSF 2.0 |
| Certifiable management system | ISO/IEC 27001 |
| Card payments compliance | PCI DSS |
| US federal / government contracts | NIST RMF / FedRAMP / CMMC (DoD) |
| Financial reporting controls (public co.) | SOX 404 |
| Privacy of EU personal data | GDPR |
| US health data | HIPAA |
| SaaS customer assurance | SOC 2 |
| Enterprise-wide non-cyber risk | ISO 31000 / COSO ERM |
| Dollar-denominated cyber risk | FAIR |

---

*End of document — 16 sections, appendices, all examples fictional for educational reference.*
