# Incident Response & Digital Forensics — Master Reference

**Version:** 2.4
**Classification:** Internal — For Authorized Personnel Only
**Last Updated:** 2026-08-06
**Owner:** Global Security Operations Center (GSOC)
**Applies To:** All business units, managed systems, cloud tenants, and third-party service providers connected to the corporate network.

---

> **DISCLAIMER:** This document is a **training and reference** document. All organizations, people, IP addresses, hostnames, hashes, phone numbers, usernames, and log samples contained within are **entirely fictional** and are provided solely to illustrate incident response (IR) and digital forensics concepts. Do not attempt to probe or exploit any system referenced here. Any resemblance to real persons or systems is coincidental. Incident response and forensic activity must always be performed in accordance with applicable laws, organizational policy, and with proper authorization.

---

## Table of Contents

1. [Incident Response Fundamentals](#1-incident-response-fundamentals)
2. [IR Team & Operations](#2-ir-team--operations)
3. [Preparation](#3-preparation)
4. [Detection & Triage](#4-detection--triage)
5. [Evidence Collection & Handling](#5-evidence-collection--handling)
6. [Digital Forensics Fundamentals](#6-digital-forensics-fundamentals)
7. [Memory Forensics](#7-memory-forensics)
8. [Disk Forensics](#8-disk-forensics)
9. [Windows Forensics Artifacts](#9-windows-forensics-artifacts)
10. [Linux Forensics](#10-linux-forensics)
11. [Network Forensics](#11-network-forensics)
12. [Log Analysis](#12-log-analysis)
13. [Malware Analysis & Forensics](#13-malware-analysis--forensics)
14. [Eradication, Recovery & Containment](#14-eradication-recovery--containment)
15. [Lessons Learned & Reporting](#15-lessons-learned--reporting)
16. [Mock Full Incident Case Study](#16-mock-full-incident-case-study)

---

# 1. Incident Response Fundamentals

## 1.1 What Is an Incident?

An **incident** is any event that may indicate an organization's assets, information, or systems are threatened, compromised, or breached. A **security event** is any observable occurrence (a single log line, one alert). An **incident** is a collection of related events that have been confirmed (or strongly suspected) to have a malicious or policy-violating cause.

> **The one-line rule:** *An event is something that happened. An incident is something that happened to us, with intent.*

### 1.1.1 Event vs. Incident vs. Breach

| Term | Definition | Example |
|---|---|---|
| **Event** | Observable occurrence on a system or network | A failed login at 03:12 from an unknown IP |
| **Adverse Event** | An event with negative consequences | A workstation crashes due to malformed email attachment |
| **Incident** | Adverse event confirmed to be an attack or policy violation | The crash was caused by malware launched from phishing |
| **Compromise** | Unauthorized access to a system/account | Attacker gained a valid domain account |
| **Breach** | Confirmed unauthorized disclosure of data | Exfiltrated customer PII confirmed |

## 1.2 Incident Categories

Organizations classify incidents to route them to the correct teams and trigger the right playbooks.

| Category | Code | Description | Typical Severity |
|---|---|---|---|
| Malware / Ransomware | MAL | Viruses, worms, trojans, ransomware, wipers | High–Critical |
| Phishing / Social Engineering | PHI | Credential harvesting, BEC, malicious links | Medium–High |
| Unauthorized Access | UAA | Stolen credentials, account takeover, lateral movement | High–Critical |
| Denial of Service | DOS | DoS/DDoS against internet-facing services | Medium–High |
| Insider Threat | INS | Policy violations, data exfiltration by employees | Medium–Critical |
| Data Breach / Data Loss | DAT | Confidential data exposure, egress of sensitive data | High–Critical |
| Configuration / Human Error | CFG | Misconfigured S3 bucket, accidental firewall change | Low–Medium |
| Supply Chain | SUP | Compromised vendor software, third-party access abuse | High–Critical |
| Physical | PHY | Laptop theft, unauthorized facility access | Medium–High |

### 1.2.1 Mock Incident Intake Example

```
Ticket ID:        INC-2026-83421
Opened:           2026-08-03 09:41:22 UTC  By: SOC-Analyst-JSmith
Category:         UAA (Unauthorized Access)
Severity (auto):  Medium (awaiting triage)
Reporting Source: EDR alert + User report
Summary:          User k.morales received "impossible travel" alert;
                  Azure AD login from MX (CDMX) 4 minutes after login from US (NYC).
Entity:           OPS-WIN10-LAP-4821 | Account: k.morales@fictionalcorp.example
```

## 1.3 IR Goals: Preservation, Containment, Eradication, Recovery

The four operational goals of response — often remembered as **PCER**:

1. **Preservation** — Stop the bleeding of *evidence*; preserve volatile data and logs before they are destroyed. Also preserve services where possible.
2. **Containment** — Limit the blast radius. Isolate affected systems and cut off attacker access (network, accounts, C2).
3. **Eradication** — Remove the root cause: delete malware, revoke compromised credentials, close the vulnerability that allowed entry.
4. **Recovery** — Restore affected systems to a known-good, hardened state and return to normal operations with validation.

**Note the order:** Preservation happens *before* or *during* containment, because destructive containment (e.g., powering off a box) can destroy volatile evidence. Eradication must follow containment — cleaning malware while the attacker still has access is futile.

## 1.4 The NIST SP 800-61 IR Lifecycle

NIST Special Publication 800-61, *Computer Security Incident Handling Guide*, defines four phases:

```
┌────────────────────────────────────────────────────────────────┐
│                     NIST 800-61 Lifecycle                       │
│                                                                │
│    Preparation    →  Detection & Analysis  →  Containment      │
│         ↑                                       │             │
│         │                                       ↓             │
│   Lessons Learned ←  Recovery       ←     Eradication          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

| Phase | Key Activities |
|---|---|
| **1. Preparation** | Establish IR policy/plan/teams, build tooling, train staff, conduct tabletop exercises, pre-negotiate contracts (IR retainer, legal counsel), asset inventory |
| **2. Detection & Analysis** | Monitor, detect, validate, and triage. Scope the incident. Determine impact and root cause. All alert data lives and dies here — most incidents fail because analysis stops too early |
| **3. Containment** | Short-term (immediate containment — block IP, isolate host) and long-term (rebuild, apply patches) strategies. Document every action |
| **4. Eradication** | Remove the cause — delete malware, remove persistence, revoke credentials, close vulnerabilities |
| **5. Recovery** | Restore systems from known-good backups, validate functionality, monitor for re-infection, communicate with stakeholders |
| **6. Lessons Learned** | Formal post-incident review. Produce an after-action report. Update playbooks, training, and controls |

## 1.5 The SANS PICERL Model

SANS teaches a six-step lifecycle — **PICERL** — which is compatible with, and often taught alongside, NIST 800-61:

| Letter | Step | Focus |
|---|---|---|
| **P** | Preparation | Readiness before the incident |
| **I** | Identification | Detect, triage, and confirm the incident |
| **C** | Containment | Limit damage and preserve evidence |
| **E** | Eradication | Remove the adversary and their tools |
| **R** | Recovery | Return to service safely and validated |
| **L** | Lessons Learned | Review and improve |

> **PICERL vs. NIST:** They describe the same journey. PICERL folds "Detection & Analysis" into *Identification* and treats *Containment* as a distinct early step. Use whichever your organization standardized on — consistency matters more than which model you pick.

## 1.6 IR vs. DFIR

| | **Incident Response (IR)** | **Digital Forensics (DF)** | **DFIR (combined)** |
|---|---|---|---|
| **Primary goal** | Stop the attack, restore operations | Answer *who, what, when, where, how* | Both, in a coordinated timeline |
| **Mindset** | Time-critical, decisive, operational | Meticulous, methodical, evidentiary | Analysis-driven response |
| **Main output** | Containment, eradication, recovery actions | Forensic report / evidence for legal | Defensible evidence + response |
| **Time pressure** | Extreme — minutes to hours | Can be slower — days to weeks | Split between the two |
| **Key constraint** | Business continuity | Evidence integrity & chain of custody | Balancing speed and integrity |

**The tension:** In a live incident you cannot afford to image 2,000 servers. DFIR practitioners triage remotely, collect high-value volatile data first, and preserve only critical systems for full imaging. The *forensic mindset* still applies to every collected byte: note hashes, timestamps, and provenance.

---
# 2. IR Team & Operations

## 2.1 Team Roles & Responsibilities

A mature IR team has clearly defined roles. In a small organization one person may wear several hats, but the *functions* must still exist.

| Role | Abbreviation | Responsibilities |
|---|---|---|
| **Incident Commander (IC)** | IC | Owns the incident end-to-end; makes prioritization calls; chairs status calls; does *not* do technical forensics |
| **Lead Handler** | LH | Runs the technical response; coordinates handlers; drives the timeline; ensures playbook execution |
| **Forensic Analyst** | FA | Evidence acquisition, preservation, analysis; chain-of-custody; forensic report |
| **Malware Analyst** | MA | Static/dynamic malware analysis; IOC extraction; sandboxing |
| **Network Analyst** | NA | Packet capture, netflow, firewall/DNS log review; C2 and exfiltration analysis |
| **Threat Intel** | TI | Context on the adversary, IOCs, TTPs; feed indicators back into defenses |
| **Subject Matter Expert (SME)** | SME | System/app owner knowledge (e.g., Active Directory, SAP, AWS) |
| **Communications / PR** | COMMS | Internal stakeholder updates, regulatory notifications, press statements |
| **Legal Counsel** | LEGAL | Data protection obligations, evidence admissibility, privilege, breach notification |
| **HR** | HR | Insider-threat and employee-related handling (only when required) |
| **Senior Management** | MGMT | Escalation decisions, budget for response, final sign-off |

### 2.1.1 RACI Matrix

| Activity | IC | LH | FA | SME | COMMS | LEGAL | MGMT |
|---|---|---|---|---|---|---|---|
| Declare incident | A | C | C | C | I | C | R |
| Technical triage | A | R | C | C | I | I | I |
| Evidence acquisition | I | A | R | C | I | C | I |
| Containment action | A | R | C | C | I | I | C |
| Eradication | A | R | C | C | I | I | I |
| Regulatory notification | C | I | I | I | R | A | C |
| Press/executive statement | C | I | I | I | R | A | C |
| Lessons learned | A | R | C | C | C | C | A |
| Approve return-to-normal | R | C | C | C | C | C | A |

**R** = Responsible (does the work), **A** = Accountable (signs off, one per row), **C** = Consulted (input before decision), **I** = Informed (told after).

## 2.2 On-Call Rotation

- **Structure:** Primary + backup per discipline (handler, forensics, malware, network).
- **Cadence:** Weekly rotation, published via calendar; no handoff gaps.
- **Coverage:** 24×7×365 for tier-1 triage; "on-call escalation" for specialists.
- **SLA targets (mock):**
  - Tier-1 acknowledge: **≤ 5 minutes** (pager tree + SMS + phone).
  - Tier-2 (handler) engaged: **≤ 30 minutes** after escalation.
  - Executive / legal notification for Critical: **≤ 1 hour**.
- **On-call documentation:** Each rotation publishes a call sheet with cell numbers, escalation order, and the current incident bridge (e.g., 555-0141, PIN 837201).

## 2.3 IR Plan Contents

A usable IR plan is short enough to read during a crisis. Recommended sections:

1. **Purpose & Scope** — why it exists, what it covers, out-of-scope items.
2. **Definitions & Severity** — incident classes and severity levels (see §4).
3. **Roles & Contact Matrix** — who to call, in order, 24×7 numbers.
4. **Detection & Reporting** — how incidents are reported (email, phone, portal).
5. **Triage & Declaration** — who can declare an incident at each severity.
6. **Response Procedures per Category** — pointer to playbooks, not full text.
7. **Communication Plan** — internal/external/regulatory notification trees and templates.
8. **Evidence Handling** — chain of custody, collection standards, legal hold.
9. **Recovery & BC/DR Interface** — when business continuity activates.
10. **Post-Incident Review** — timeline, metrics, after-action report ownership.

## 2.4 IR Playbooks

A **playbook** is a step-by-step procedure for a *specific* incident type. The IR plan is the umbrella; playbooks are the tactical detail.

| Playbook | Key Steps (abridged) |
|---|---|
| **Phishing** | Preserve email headers + attachment; verify user disclosure; block sender/URL; scan mailbox for similar; credential reset if phished; report to mail provider |
| **Ransomware** | Isolate infected hosts; preserve ransom note; identify variant; find patient zero; locate backups; do **not** pay without exec/legal sign-off; engage BC |
| **Account Takeover** | Confirm anomalous auth; disable account; revoke tokens/sessions; trace access (mail, apps, MFA); reset credentials; audit actions performed |
| **Data Exfiltration** | Preserve egress logs (proxy, DNS, firewall); identify exfiltration channel; scope data; notify legal (breach); begin containment of channel |
| **Insider Threat** | HR + legal lead; preserve user activity; avoid alerting subject; timeline user actions; interview evidence plan |
| **DDoS** | Engage ISP/scrubbing; adjust WAF; increase autoscaling; preserve pcap; coordinate with customers |

## 2.5 IR Runbook Example (Mock)

A runbook is even more granular — concrete commands and checkbox steps. Example extract from the *Phishing-Phished-Credentials* runbook:

```
RUNBOOK: PHI-002 "User entered password on phishing page"
Target time to complete: 60 min

STEP 1 — Verify claim (LH)                                  [ ]  Done
  - Confirm the phishing URL resolves to a fake login page.
  - Check mail log: did user receive the lure? (O365 Threat Explorer)

STEP 2 — Contain the account (LH)                            [ ]  Done
  - Disable the AD account:
      Disable-ADAccount -Identity k.morales
  - Revoke all sessions & tokens in Entra ID:
      Revoke-AzureADUserAllRefreshToken -ObjectId k.morales
  - Reset password (120-char random):
      Set-ADAccountPassword -Identity k.morales -Reset -NewPassword (ConvertTo-SecureString -AsPlainText (New-RandomPassword) -Force)

STEP 3 — Kill lateral risk (FA)                               [ ]  Done
  - Reset kerberoastable tokens; clear cached credentials on user's machine.

STEP 4 — Evidence (FA)                                        [ ]  Done
  - Save phishing email as .msg + headers (EML).
  - Screenshot phishing page and save to IR share (2-24-Tri-01).
  - Log browser history around the timestamp.

STEP 5 — Notify                                              [ ]  Done
  - User informed of password reset (helpdesk ticket linked).
  - LEGAL notified if any corporate data may have been exposed.
```

## 2.6 Communication Plan

Communications must be pre-planned. Key principles:

- **One voice** — the IC (or COMMS) is the single source of truth for external messaging.
- **Codewords** — avoid announcing attack details over channels an attacker might monitor. Use a private bridge and codewords (e.g., code name per incident: *"Project Clearwater"*).
- **Frequency** — publish a standing cadence: "Status call every 2 hours at :00 and :30; email summary at 07:00 daily."
- **Audience tiers:**

| Audience | Channel | Content | Timing |
|---|---|---|---|
| IR team | Incident bridge + chat | Technical details, tasks, decisions | Live |
| Executive | Briefing email + call | Business impact, decision requests | Twice daily |
| Employees | Intranet + email | Awareness (avoid: credential resets, legitimate security ops) | As needed |
| Regulators (GDPR) | Notification form + email | Required facts (see §2.8) | ≤ 72h |
| Customers/Public | Press statement (PR) | What, when, what's protected, contacts | Per legal/PR |
| Law enforcement | As advised by legal | Case-specific | As advised |

## 2.7 Escalation Path

```
Level 1  SOC Analyst  ──  triage, confirm, contain-within-guardrails
              │ (doesn't meet severity threshold → close/resolve)
              ▼
Level 2  IR Handler / Shift Lead  ──  deep analysis, scope, containment
              │ (Severity 3+ or confirmed actor) 
              ▼
Level 3  Incident Commander + DFIR Team  ──  full response, forensic acquisition
              │ (Severity 4+ / regulatory impact)
              ▼
Level 4  Executives, Legal, PR, Board  ──  business decisions, disclosure
```

**Mock escalation trigger table (excerpt):**

| Condition | Escalate to | Within |
|---|---|---|
| EDR detonates ransomware behavior on any host | L2 Handler | 15 min |
| Credentials of a domain admin validated as compromised | L3 IC | 30 min |
| Customer PII ≥ 1,000 records possibly exposed | L4 Exec + Legal | 1 hour |
| Evidence of data exfiltration from a restricted server | L3 IC | immediate |

## 2.8 Regulatory Reporting Obligations

Timing is legally binding. The two most common regimes for a fictional EU/multinational org:

| Regulation | Trigger | Deadline | Key Content |
|---|---|---|---|
| **GDPR Art. 33** | Personal data breach (risk to rights & freedoms) | **≤ 72 hours** after becoming aware | Nature of breach, categories/approx. number of data subjects + records, measures taken, contact of DPO |
| **GDPR Art. 34** | High risk to individuals | *Without undue delay* | Plain-language description, measures, recommendations to individuals |
| **NIS2 (EU)** | Incident affecting essential/important entity | **≤ 24 hours** (early warning), 72h (notification), 1 month (final) | Severity, cross-border impact, root cause (if known), mitigation |
| **Local breach laws** | Varies by jurisdiction (e.g., state breach laws) | Varies (often 30–60 days) | Varies |
| **SEC / stock exchange** | Materiality | 4 business days (US SEC) | Disclosure per exchange rules |

### 2.8.1 Mock GDPR Breach Notification Template

```
To: <Regulator>  /  DPO: <name>
Subject: Personal Data Breach Notification — INC-2026-83421

1. Nature of the breach:
   Unauthorized access to a Microsoft 365 mailbox of employee
   K. Morales (finance department) via compromised credentials.
2. Categories of personal data involved:
   Name, corporate email address, internal notes, and ~2,400
   customer payment-reference records visible in shared mail folders.
3. Approximate number of data subjects: ~2,400.  Records: ~2,400.
4. Consequences:
   Unauthorized reading; no evidence of modification or deletion as of notification.
5. Measures taken:
   Account disabled 2026-08-03 10:12 UTC; sessions revoked; password reset;
   mail actions (read/forward) under review; forensic acquisition initiated;
   additional monitoring enabled; containment of related accounts underway.
6. Contact: DPO name, phone, email.

Regards,
[Name], Data Protection Officer, FictionalCorp Inc.
```

> **Practical guidance:** When in doubt, notify. Document your *reasoning* at the time of the decision (a "non-notification rationale" memo protects you if a regulator later asks why you stayed silent).

---
# 3. Preparation

## 3.1 Hardening (Do It Before You Need It)

Preparation is the cheapest phase. A few high-yield controls:

| Control | Why It Matters for IR |
|---|---|
| Centralized logging (SIEM + log retention ≥ 90 days) | Historical timeline; long dwell-time attacks need old logs |
| **NTFS/AD audit policies + Sysmon on endpoints** | Attacker actions produce logs you can actually see |
| MFA on all accounts, Conditional Access policies | Kills the #1 initial-access method |
| Network segmentation + host firewalls | Contains lateral movement |
| **Immutable / off-site backups, tested restores** | Only reliable recovery path against ransomware |
| Host inventory (asset DB, CMDB) | You cannot protect/preserve what you do not know exists |
| EDR on 100% of endpoints + servers | Detection, isolation, remote triage |
| Least-privilege + tiered admin accounts | Limits blast radius of a single credential |
| Patching SLAs, vulnerability mgmt | Reduces known-CVE initial access |

## 3.2 IR Tooling Checklist

Split into "already deployed" and "responder kit". Everything must be tested before an incident.

**Deployed (sensor/collection layer):**
- EDR/XDR (endpoint telemetry + isolation), SIEM, IDS/IPS, DNS logging, proxy logging, netflow, mail gateway logs, cloud (AWS CloudTrail / Azure AD Sign-in Logs), vulnerability scanner.

**Responder kit (acquired/run during incident):**
- Memory: DumpIt, WinPmem, Belkasoft, LiME (Linux).
- Disk: FTK Imager, dd/dcfldd (Linux), AFF4/E01 writers, write blockers (Tableau, WiebeTech).
- Triage: KAPE (Kroll Artifact Parser/Extractor), Velociraptor, Cado/FTK collection agent, `autorunsc`, Sysinternals suite.
- Analysis: Volatility 3, strings, YARA, 7-Zip, hash tools (sha1sum/md5deep), Wireshark/tshark, `fls`/`icat`/`tsk` (Sleuth Kit), Autopsy, HxD/010 Editor, VirusTotal API, sandbox (Cuckoo/CAPE, Joe Sandbox, or cloud).
- Log: Splunk/ELK/Sentinel (whatever the org uses), or at minimum `grep` + `awk` on exported logs.
- Communications: encrypted chat, secure file share for evidence staging, incident bridge.

> **Rule:** No tool should be introduced into an active investigation for the first time. Run a "tool bake-off" annually.

## 3.3 Evidence Preservation Pre-Authorization

Get *written authorization* to preserve and collect before you need it:

- **Legal hold** issued by legal for all relevant systems when a breach is probable.
- **Pre-approved forensic acquisition scope** signed by security leadership: lists which systems may be imaged without further approval (e.g., all servers, endpoints of departed users).
- **Collection authorization form** (mock below) used per-host during an incident.

```
COLLECTION AUTHORIZATION — FICTIONALCORP INC.
Case:  INC-2026-83421        Authorizer: J. Nwosu (CISO)
Systems authorized:  OPS-WIN10-LAP-4821, OPS-FILE-0314,
                     OPS-SRV-DC02, OPS-MAIL-EX01 (mailbox KMorales)
Scope of collection:  Full memory, full disk (endpoints);
                      logical collection (servers), relevant logs.
Legal hold in place:  YES  (Ref: LH-2026-0117)
Duration:  Until case closure + 12 months.
Authorized collectors:  A. Reyes (Lead FA), M. Tanaka (FA2)
Date/Time:  2026-08-03 10:30 UTC      Signed: ___________________
```

## 3.4 Tabletop Exercises

A tabletop is a discussion-based simulation with no live systems. It tests decision-making, not tooling.

- **Frequency:** Minimum two per year (one technical, one executive-level).
- **Scenario bank (rotate):** ransomware encrypting file servers; insider exfiltrating IP; cloud account takeover of a production AWS account; GDPR breach notification drill; supply-chain (vendor compromise) affecting CI/CD.
- **Deliverables per exercise:** a facilitator guide, injects (turns), an observation log, and an "actions to improve" list with owners/dates.
- **Mock inject (turn 3 of ransomware tabletop):**

```
INJECT T3 — 60 minutes into the scenario.
"Ops reports the backup appliance is also showing encrypted files.
 Recovery staff state the last successful backup is 11 days old."
Question to the room:
 1. What is the immediate containment action for the backup appliance?
 2. Who decides whether to invoke Business Continuity (BC)?
 3. What data-loss statement do we prepare for execs, and when?
 4. Does this change our ransom-decision posture? Who decides?
```

## 3.5 Documentation Templates

Pre-build every form you will need. Examples in this document:

- Incident intake ticket (§1.2.1)
- Collection authorization (§3.3)
- Chain of custody form (§5.3)
- Triage/severity sheet (§4.3)
- Evidence log (§6.2)
- Eradication playbook (§14.4)
- Executive report (§15.3)
- Technical report structure (§15.4)

**Golden rule:** If it wasn't written down, it didn't happen. Log every action, decision, and timestamp during the incident, even if the logs are messy.

## 3.6 IR Tool Kit (Physical / Jump Bag)

For on-site response (legal holds, departed-user machines, offices):

- Write blocker (SATA + NVMe + USB-C adapters), spare USB keys (sanitized), forensic workstation or strong laptop with analysis tools, external evidence storage (encrypted), label maker, tamper-evident evidence bags, serial/anti-static gloves, camera (document physical state), charging cables, offline hash/list of known-good hashes, power injector or UPS for de-energized devices.

## 3.7 Mock Chain of Custody Form (see §5.3 for full version)

Even during preparation, the form should exist and be printed. A canonical minimal version is included at §5.3; print copies in every jump bag.

---
# 4. Detection & Triage

## 4.1 Alert Triage

The goal of triage is to move from *noise* to *confirmed incident* quickly and to avoid wasting forensic resources on false positives. Standard triage loop:

1. **Fidelity check** — Is the telemetry source trustworthy? Is the alert a known false positive?
2. **Verify** — Correlate with at least one independent source (e.g., EDR alert + SIEM log + user report).
3. **Scope** — How many hosts/users/accounts are affected? Where did it start (patient zero)?
4. **Impact** — What data/function is at risk? Which business units?
5. **Declare** — Assign severity; declare incident if warranted; open bridge.

## 4.2 Verification Techniques

- Check EDR alert details and related processes/timeline on the host.
- Correlate with SIEM (authentication events, VPN, firewall, DNS).
- Confirm with the user/system owner (e.g., "Did you log in from Mexico?").
- Query threat intel for the IP/hash/domain (VirusTotal, MISP, TI feeds).
- Look for *additional* signals: new user accounts, scheduled tasks, RDP inbound, unusual SMB connections.

## 4.3 Severity Scoring

Severity = **Impact × Confidence × Scope**, mapped to a 1–5 scale. Use a defined matrix so two analysts score the same incident identically.

### 4.3.1 Mock Severity Matrix

| Severity | Level | Impact | Examples | Response Time | Notify |
|---|---|---|---|---|---|
| **Critical** | 5 | Regulatory/personal data breach, core system outage, ransom encrypted | Exfiltration of PII, ransomware on DC, domain admin takeover | < 1 hr | Exec, Legal, PR, Regulator |
| **High** | 4 | Major system compromise, lateral movement, data theft potential | Malware with C2 on 10+ hosts, unauthorized admin RDP | < 4 hr | Exec, Legal |
| **Medium** | 3 | Single compromised account/host, isolated malware | One phishing credential compromise, single-host beacon | < 24 hr | Security leadership |
| **Low** | 2 | Minor impact, no data at risk | Adware, policy violation with no exfil | < 72 hr | Local team |
| **Informational** | 1 | No impact, general threat activity | Port scans, mass phishing campaigns blocked | Track only | None |

### 4.3.2 Scorecard Template

```
INCIDENT SEVERITY SCORECARD
Incident:  INC-2026-83421
Scorer:    A. Reyes (LH)                 Date: 2026-08-03 10:05 UTC

Component          Score   Rationale
─────────────────────────────────────────────────────────────
Impact            5       Possible PII (customer records) in mailbox
Confidence        4       Two independent detections (EDR + IdP logs)
Scope             4       Mailbox shared with finance + possible OAuth
                      ─────────────────────────────────
TOTAL SEVERITY     5       (max of components dominates)  → CRITICAL
```

## 4.4 Declaration of Incident

Declaration is a formal decision, not just a feeling. Standard inputs: verified alert, severity ≥ 3, or any indication of an active adversary. The IC (or LH if IC not yet reached) declares.

```
INCIDENT DECLARATION
ID:   INC-2026-83421
Status: DECLARED — CRITICAL
Declared by:  A. Reyes (IC)    2026-08-03 10:18 UTC
Basis:  Confirmed unauthorized mailbox access + possible PII.
        IDP shows attacker-driven logins, sessions revoked (contained)
        pending deeper analysis.
Codename:  "Project Clearwater"
Bridge:  555-0141 / PIN 837201     Chat: #clearwater-incident
Immediate actions:  Host isolation (LAP-4821) approved;
                    legal hold LH-2026-0117 issued;
                    BC on standby; regulator clock started (T-72h).
```

## 4.5 Initial Scoping: Contains / Contained / Not Contained

A quick and useful triage model classifies each affected asset:

- **Contains** — the attacker *may* still have active access or the asset is still at risk (e.g., compromised account still active).
- **Contained** — the asset is isolated and no longer reachable by the attacker (host on quarantine VLAN, account disabled, sessions revoked).
- **Not contained / Escalating** — attacker access is spreading; more assets being touched.

| Asset | State | Evidence |
|---|---|---|
| OPS-WIN10-LAP-4821 | **Contained** | On quarantine VLAN, EDR isolated 10:12 UTC |
| k.morales@fictionalcorp | **Contained** | Account disabled, sessions revoked 10:12 UTC |
| OPS-MAIL-EX01 mailbox | **Contains** | Attacker actions in mailbox not fully reviewed yet |
| Shared mailbox "FinanceInvoices" | **Not contained** | Access by attacker *not yet confirmed* — triaging |

## 4.6 Mock Triage Narrative

> **Incident INC-2026-83421 — triage narrative (abridged).**
>
> At 09:41 UTC, the SOC received an EDR alert `AUTH-impossibletravel-9f31` on the identity provider: the account `k.morales` (finance) authenticated from an IPv6 address geo-locating to Mexico City at 09:34 UTC, four minutes after a legitimate-looking login from New York City (09:30 UTC). MFA was not challenged on the second login because the attacker used a session token (OAuth device flow).
>
> The tier-1 analyst verified by (a) checking the EDR/IdP raw logs, (b) calling the user who confirmed she was at her desk in NYC and had not attempted a second login, and (c) querying the source IP against internal threat intel, which had no prior hits. The analyst invoked the account-takeover playbook: disabled the account, revoked sessions, and escalated.
>
> The lead handler expanded scope using the SIEM. At 09:50 UTC a search showed the same source IP had authenticated to a *shared* mailbox `FinanceInvoices` at 09:41 UTC, and that a mail rule forwarding outbound mail to an external address `clearwater@mail-fwd.example` had been created at 09:39 UTC. This elevated the incident from "single user" to "possible PII breach," triggering Critical severity and legal notification.
>
> **Assessment:** Initial access via phished session token; attacker focused on finance mail. Containment: account disabled, mailbox rule removed at 10:12 UTC, host isolated, legal hold issued. Not contained: attacker's full mailbox access window (09:34–10:12) and any OAuth apps granted still under review.

---

# 5. Evidence Collection & Handling

## 5.1 Evidence Types

| Type | Examples | Volatility |
|---|---|---|
| **Volatile (memory/state)** | RAM contents, running processes, network connections, logged-in users, ARP cache | Seconds–minutes |
| **Semi-volatile** | Temp files, event logs (mostly), swap, pagefile | Minutes–hours |
| **Persistent (disk)** | Files, registry, MFT, deleted-file slack, browser history | Days–years |
| **Remote/logs** | SIEM, firewall, DNS, IdP, cloud provider logs | Often not under attacker control — collect early |

## 5.2 Order of Volatility

Collect the most volatile data **first**, from the most volatile to least. A common sequence for a live Windows host:

1. RAM / memory image (most volatile, vanishes at power-off)
2. Network connections & state (may change every second)
3. Running processes & loaded modules
4. Logged-in users, recent commands (shell history)
5. Temporary files, unallocated space, slack
6. Files on disk (registry, MFT, user profiles)
7. Swap/pagefile, hibernation file (persistent but huge)

> **Mnemonic:** *"Memory, Network, Process, User, Temp, Disk, Swap."*

## 5.3 Mock Chain of Custody Form

```
                 CHAIN OF CUSTODY — FICTIONALCORP INC.
Case:  INC-2026-83421                      Exhibit No:  EV-001
Item:  Forensic image of OPS-WIN10-LAP-4821 (NVMe SSD, 512GB)
       Image file:  LAP-4821_dd.E01  (SHA256 below)
Collected:  2026-08-03 14:07 UTC   By: A. Reyes (FA)
Collected from:  Data center rack N-14, slot 07, anti-static bay
Relevant info:  Host isolated 10:12 UTC; seized while powered on;
                live acquisition with FTK Imager (write-blocked).

HASH (SHA256 of image):  c3f0a9d2b8e14c75a6b92d81e3f04ab7cd56209f...
                           ...  (record full value at collection)

SEALED / TRANSFERRED TO:
Date/Time        From          To            Reason              Seal OK?
──────────────────────────────────────────────────────────────────────
08-03 14:07      A. Reyes      Evidence Locker R2   Initial storage   Y
08-03 16:30      Evidence Locker R2   M. Tanaka (FA2)   Analysis         Y
08-04 09:12      M. Tanaka     A. Reyes      Legal review prep   Y
08-05 11:00      A. Reyes      Legal Counsel L. Chen  Discovery      Y

STORAGE:  Evidence Locker R2, safe B, key held by FA lead.
DESTRUCTION (if applicable):  Not before 2027-08-05 without legal approval.
```

**Chain of custody rules:** Every transfer signed; evidence sealed and tamper-evident; hashes re-verified at each handover; never leave evidence unattended; storage locked and logged.

## 5.4 Evidence Integrity — Hashing

Hashing produces a digital fingerprint. If the hash before and after analysis matches, the evidence is unchanged.

- **SHA-256** is the standard (cryptographically collision-resistant). MD5/SHA-1 still seen but deprecated for integrity in court contexts.
- Hash at **collection**, at **each transfer**, and at **reporting**.
- Example verification:

```
$ sha256sum LAP-4821_dd.E01
c3f0a9d2b8e14c75a6b92d81e3f04ab7cd56209f1ae38d75b2c9460af8e17d4aa  LAP-4821_dd.E01
  (recorded at collection 2026-08-03 14:07 UTC)

$ sha256sum LAP-4821_dd.E01        # re-verify before analysis
c3f0a9d2b8e14c75a6b92d81e3f04ab7cd56209f1ae38d75b2c9460af8e17d4aa  LAP-4821_dd.E01
  ✓ MATCH — evidence integrity confirmed
```

## 5.5 Acquisition vs. Collection

- **Collection** — gathering logical, relevant data (files, logs, registry, triage output). Faster; fine for most investigations.
- **Acquisition** — creating a forensic *image* (byte-for-byte copy) of a device or volume, including unallocated space. Required when you must recover deleted data or prove nothing was altered.

| | Collection | Acquisition |
|---|---|---|
| Scope | Logical (selected data) | Full device/volume |
| Includes deleted data? | Usually no | Yes (unallocated) |
| Speed | Fast | Slow (large drives) |
| Typical use | Live incident triage | Formal investigation/legal |

## 5.6 Legal Considerations

- **Authorization:** Only collect with documented authority (legal hold, warrant, HR directive, policy consent).
- **Jurisdiction:** Cloud data may reside in other countries; GDPR/cross-border restrictions apply.
- **Privilege:** Legal review before extracting attorney-client privileged data.
- **Proportionality:** Collect only what's necessary; document why.
- **Admissibility:** If there's any chance of litigation, follow 800-86/ISO 27037-style practices: write-block, hash, document, chain of custody.
- **Privacy:** Minimize employee data exposure; separate PII review from incident team if possible.

## 5.7 Documentation Standards

Every item of evidence gets an evidence log entry. Required fields:

1. Case ID and exhibit number
2. Source device/host + location
3. Collector name, date/time (UTC), method used (tool + version)
4. Hash (SHA-256) at collection
5. Storage location and any transfers
6. Notes (unusual condition, e.g., "host powered on, no time sync")

### 5.7.1 Mock Evidence Log

```
Case: INC-2026-83421        Prepared by: M. Tanaka      Date: 2026-08-03
#     Exhibit      Item                              Hash (prefix)      Method
───── ──────────────────────────────────────────────────────────────────────
1     EV-001      LAP-4821 disk image (E01)         c3f0a9d2…            FTK Imager 4.7
2     EV-002      LAP-4821 memory (LAP4821.mem)     b71e90c4…            WinPmem 3.3
3     EV-003      Mailbox KMorales export (PST)     9d2f14ab…            O365 eDiscovery
4     EV-004      IdP sign-in logs (CSV, 48h)       a6c8102f…            Entra export
5     EV-005      SIEM correlation extracts (JSON)  e02c55d9…            Splunk export
6     EV-006      Ransom note screenshot (PNG)      4f73aa19…            Analyst capture
```

---
# 6. Digital Forensics Fundamentals

## 6.1 Forensic Soundness

A process is **forensically sound** when it can be repeated by another examiner with the same result, and when the evidence's integrity is provable.

The pillars:
1. **Preserve the original** — never work on the original; always on a copy/image.
2. **Minimize alteration** — write blockers and read-only mounts.
3. **Prove integrity** — hashing before/after.
4. **Document everything** — methodology, tools, timestamps.
5. **Follow the scientific method** — hypothesis, test, document.

## 6.2 Imaging

Imaging = creating a byte-for-byte copy of a storage device. Never work on the live disk.

| Image Type | Extension/Format | Notes |
|---|---|---|
| **Raw / DD** | `.dd`, `.raw`, `.img` | Simplest; byte-identical bitstream; no metadata or compression |
| **E01 / EWF** | `.E01`, `.E02`, … | EnCase format; segmented, compresses, stores case metadata + hashes |
| **AFF4** | `.aff4` | Open format; compression, encryption, provenance |
| **VHD/VMDK** | `.vhd`, `.vmdk` | Virtual disk formats; sometimes used for analysis but keep a raw/E01 master |

## 6.3 Write Blockers Explained

A **write blocker** is a hardware or software device that sits between the forensic workstation and the source drive, allowing reads and *denying all writes*. It guarantees the original drive is not modified, which is the legal requirement for evidence admissibility.

- **Hardware:** e.g., Tableau SATA/NVMe bridges, WiebeTech enclosures. Best for legal matters.
- **Software:** read-only mounting (`mount -o ro`, `fls` open read-only). Acceptable for internal investigations but weaker in court.

## 6.4 Hashing Verification

Covered in §5.4. Always:
- Generate hash **during** acquisition (E01 embeds it).
- Independently verify afterwards with a second tool (`sha1sum` vs. FTK Imager's report).
- Record hashes in the evidence log and the final report.

## 6.5 Forensic Workstations

Characteristics:
- Physically isolated lab network (or fully offline).
- Large, fast storage (RAID arrays for image sets).
- Write-blocking hardware attached.
- Trusted software image of the analyst OS; tool updates verified by hash.
- Clean environment: antivirus definitions, disabled auto-run, verified tool binaries.
- Chain-of-custody applies to the workstation too (it's an evidence container).

## 6.6 Imaging Windows (FTK Imager)

`AccessData FTK Imager` is a popular GUI tool. Key workflow (mock):

```
FTK Imager 4.7.0
1) File → Create Disk Image…
2) Select source: Physical Drive 2 [NVMe WDC SN750 512GB]
   (Physical — captures unallocated space; Logical only files)
3) Image Type: E01 (EnCase)
   Evidence Item Information:
     Case: INC-2026-83421   Exhibit: EV-001
     Unique description: OPS-WIN10-LAP-4821 system drive
     Examiner: A. Reyes
4) Destination: \\evidencestore\cases\INC-2026-83421\
   Image file name: LAP-4821_dd.E01
5) Options: ✓ Verify images after they are created
             ✓ Create directory listings
6) Start.  Progress bar; E01 segments auto-split (2GB).
```

Output at completion (mock):
```
Image created:  C:\evidence\LAP-4821_dd.E01
Verification successful.
Image Validation: OK   (MD5: 4f73aa19c4d1...   SHA1: c3f0a9d2...)
```

## 6.7 Imaging Linux (dd / dcfldd)

`dd` is the classic bit-copy tool; `dcfldd` adds hashing on the fly and progress.

```
root@forensics:~# dcfldd if=/dev/sda1 of=/evidence/opsdb_disk.dd \
    hash=sha256 hashlog=/evidence/opsdb_disk.sha256 bs=4M status=progress
5632 blocks (1408MB) written.

root@forensics:~# cat /evidence/opsdb_disk.sha256
dcfldd wrote 9f3ab12c8d7e5a61... opsdb_disk.dd

# Verify
root@forensics:~# sha256sum /evidence/opsdb_disk.dd
9f3ab12c8d7e5a61...  opsdb_disk.dd     ✓ matches collection hash
```

> **Never mount the image for analysis without making a working copy.** Keep the master image sealed.

## 6.8 Memory vs. Disk Forensics

| | Memory Forensics | Disk Forensics |
|---|---|---|
| **What it shows** | What's running *now*, loaded malware, network connections, passwords/keys in memory, injected code | Persistent data, deleted files, logs, user activity history |
| **Loses** | Everything at power-off | Survives reboot |
| **Best for** | Rootkits, process hollowing, C2, live malware | Timeline reconstruction, file recovery, persistence |
| **Sample** | RAM image (Volatility) | Disk image (Autopsy/Sleuth Kit) |
| **Key limitation** | Small window; must capture during incident | May miss in-memory-only malware |

**Rule:** When a host is live and suspicious, capture memory *before* touching disk. Disk forensics alone frequently misses in-memory implants.

## 6.9 Volatile Data Collection (Windows/Linux)

The quick-win commands run on a live host *before* reboot. Always redirect output to a secure location (a USB key or network share), never save to the compromised disk.

### 6.9.1 netstat — active connections (Windows)

```
C:\> netstat -ano
Active Connections
  Proto  Local Address          Foreign Address        State
  TCP    10.4.12.21:49301       10.4.12.4:445          ESTABLISHED   ← SMB to DC (normal)
  TCP    10.4.12.21:55210       203.0.113.77:443       ESTABLISHED   ← suspicious external
  TCP    10.4.12.21:55211       203.0.113.77:443       ESTABLISHED
  TCP    10.4.12.21:55212       203.0.113.77:443       ESTABLISHED   ← beacon-like
  UDP    10.4.12.21:137         *:*                                  ← NetBIOS
```
Three parallel connections to one external HTTPS IP → investigate (see §7/§11).

### 6.9.2 net session — SMB sessions (Windows)

```
C:\> net session
Computer            User name            Client Type        Opens Idle time
----------------------------------------------------------------------------
\\10.4.12.31        svc-backup$          Windows 10        3    00:01:23
\\10.4.12.44        ADMIN_DOM\\backup    Windows 10        1    00:00:05   ← suspicious
\\10.4.12.66        svc-sql$             Windows 10        2    00:00:10
```
A user session named `backup` on a workstation warrants a check.

### 6.9.3 tasklist — running processes (Windows)

```
C:\> tasklist /v
Image Name          PID  Session Name   Mem Usage   Status   User Name
svchost.exe         812  Services       12,450K     Running  NT AUTHORITY\SYSTEM
winlogon.exe        976  Services        6,120K     Running  NT AUTHORITY\SYSTEM
calc.exe           1332  Console        88,404K     Running  CORP\k.morales   ← unexpected
powershell.exe     1488  Console        74,300K     Running  CORP\svc-backup  ← unexpected
```

### 6.9.4 whoami — current user context (Windows)

```
C:\> whoami /priv
PRIVILEGES INFORMATION
SeDebugPrivilege   Debug programs        Enabled
SeBackupPrivilege  Back up files...      Enabled
```
Running as a service account with SeBackup/SeDebug privileges = very suspicious for attacker use.

### 6.9.5 last / w — logins & logged-in users (Linux)

```
$ last -a | head -20
root     pts/0    Tue Aug  3 09:31   still logged in    192.168.4.99
alice    pts/1    Tue Aug  3 02:12   still logged in    192.168.4.10
svc-mgmt pts/2    Tue Aug  3 09:12   still logged in    198.51.100.22   ← non-staff source
root     pts/0    Mon Aug  2 22:04 - 22:11  (00:07)     192.168.4.99

$ w
 09:45:22 up 4 days,  2:14,  2 users,  load average: 0.21, 0.35, 0.18
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
svc-mgmt pts/2    198.51.100.22    09:12    0.00s  0.05s  0.01s bash -i
```

---

# 7. Memory Forensics

## 7.1 Why Memory Matters

Malware that never touches disk (fileless), process hollowing, injected code, in-memory C2 sessions, and credentials cached in RAM are **only** visible in memory. Memory forensics answers: *what was actually running at the moment of capture?*

## 7.2 Acquisition (Windows: DumpIt / WinPmem)

```
C:\IR> WinPmem.exe LAP4821.mem --output LAP4821.mem --format raw
[MemProcFS] Acquiring memory into file: LAP4821.mem
[OK] Created memory map, PML4: 0x1ffff8000
[OK] Dumping: 3%....48%....100%
[OK] Acquisition complete: 16 GB written in 4m 12s
C:\IR> sha256sum LAP4821.mem
b71e90c4e8d2a15f9c3b61d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e  LAP4821.mem
```

## 7.3 Volatility 3 Plugins (with Mock Outputs)

Volatility 3 (`vol`) is Python-based and doesn't need a symbol profile (auto-detects Windows/Linux/macOS).

```
C:\IR> python vol3 -f LAP4821.mem windows.pslist.PsList
PID    PPID   ImageFileName  Offset(V)   Threads Handles SessionId Wow64
4      0      System         0x...       105     -      N/A     0
340    4      wininit.exe    0x...       3       78     0       0
...
4324   4888   calc.exe       0x...       2       24     1       0     ← suspicious (see text)
4508   4888   powershell.exe 0x...       5       96     1       0     ← suspicious
```

### 7.3.1 pstree — process relationships

```
C:\IR> python vol3 -f LAP4821.mem windows.pstree.PsTree
* 4 (0) System
*** 340 (0) wininit.exe
*** 4888 (0) svchost.exe
***** 4324 (1) calc.exe
***** 4508 (1) powershell.exe
```
`calc.exe` and `powershell.exe` spawned from `svchost.exe`? Never normal → strong indicator of process injection/hollowing.

### 7.3.2 netscan — network artifacts

```
C:\IR> python vol3 -f LAP4821.mem windows.netscan.NetScan
Offset  Proto  Local Addr        Foreign Addr      State      PID
0x..    TCPv4  10.4.12.21:49301  10.4.12.4:445     ESTABLISHED  812
0x..    TCPv4  10.4.12.21:55210  203.0.113.77:443  ESTABLISHED  4324  ← calc.exe has network!
0x..    TCPv4  10.4.12.21:55211  203.0.113.77:443  ESTABLISHED  4324
0x..    TCPv4  10.4.12.21:55212  203.0.113.77:443  ESTABLISHED  4324
```
`calc.exe` holding three outbound connections → injected code performing C2.

### 7.3.3 malfind — injected/abnormal memory

```
C:\IR> python vol3 -f LAP4821.mem windows.malfind.Malfind
Process: calc.exe Pid: 4324 Address: 0x000001F0000
Protection: PAGE_EXECUTE_READWRITE
Vad Tag: VadS
PrivateMemory: True
Disasm:
0x000001f0000 4d 5a              push   rbp        ; 'MZ' ← PE header in executable heap
0x000001f0002 90                 nop
...
```
PAGE_EXECUTE_READWRITE with an `MZ` PE header in private memory = classic shellcode/injected module.

### 7.3.4 dlllist — loaded modules

```
C:\IR> python vol3 -f LAP4821.mem windows.dlllist.DllList --pid 4324
PID  Process    Base            Size    Path
4324 calc.exe   0x00007ff7...   0x...   C:\Windows\System32\calc.exe
4324 calc.exe   0x00000001f0000 0x4000  C:\Windows\Temp\svchost.tmp   ← suspicious load path
```
A module loaded from `Temp` named `svchost.tmp` = masquerading payload.

### 7.3.5 Process Hollowing Detection

Process hollowing = attacker creates a legit process, suspends it, unmaps its image, and writes malware into the same PID. Detection signals in memory:

- Process running from a path with no corresponding on-disk image (e.g., `svchost.exe` with no `svchost` in System32).
- VAD anomalies: PAGE_EXECUTE_READWRITE, private memory containing PE headers.
- `malfind` hits; `psscan` showing PID with unexpected parent.
- Mismatch between `Path` in `dlllist` and expected location.
- Unusual thread start addresses (not in the DLL).

```
C:\IR> python vol3 -f LAP4821.mem windows.malfind.Malfind | Select-String "MZ|EXECUTE"
Process: svchost.exe Pid: 1604 Address: 0x0000028a0e0000
Protection: PAGE_EXECUTE_READWRITE  ← hollowed/hidden payload
```

### 7.3.6 Hunting (yara)

Volatility 3 supports YARA scanning of memory for known malware signatures or strings.

```
C:\IR> python vol3 -f LAP4821.mem windows.yarascan.YaraScan --yara-rules ./iocs.yar
Rule: TSPY_FIN7_PAYLOAD  Offset: 0x000001f0000  PID: 4324  Process: calc.exe
  Scan result: 4 matches
```

## 7.4 Live Memory Analysis

Sometimes you analyze the live host directly (MemProcFS maps memory as a filesystem). Useful to extract configs and credentials quickly during an incident, but it modifies the host slightly — use the same tools as disk forensics and document.

## 7.5 Rootkit Detection in Memory

Rootkits hide processes, drivers, and files from the OS's own APIs. Memory analysis bypasses the OS APIs by reading raw structures:

- `windows.psscan` finds hidden processes (does not rely on the process list API).
- `windows.driverscan` lists loaded drivers from kernel structures; compare to a known-good driver list to spot unsigned/hidden drivers.
- `windows.ssdt` (x86) reveals SSDT hooks.
- `windows.callbacks` lists kernel callbacks that rootkits register.

```
C:\IR> python vol3 -f serverDC.mem windows.psscan.PsScan
PID   PPID   ImageFileName  CreateTime
4     0      System         2026-08-03 09:12:34
1604  340    svchost.exe    2026-08-03 09:30:11   ← not in PsList → HIDDEN
```
A PID in `psscan` missing from `pslist` = hidden process (rootkit).

---
# 8. Disk Forensics

## 8.1 Filesystems and What They Leave Behind

| Filesystem | Used by | Forensic artifacts of note |
|---|---|---|
| **NTFS** | Modern Windows | **MFT** (every file/dir, deleted too), $LogFile, $UsnJrnl (change journal), ADS (alternate data streams), $Secure/SDS, $Recycle.Bin, Volume Shadow Copies (VSS) |
| **FAT12/16/32** | Old Windows, SD cards, USB | File Allocation Table entries; deleted files retain first bytes in directory entries (easier recovery); no journaling; no per-file ACLs |
| **ext4** | Linux | Journal (recovery), inode tables, extents, `ext4_find_first_deleted` potential; orphan inode list; **unallocated blocks** hold data; journal may hold file contents |
| **APFS** | macOS | Copy-on-write snapshots, journal; deleted files recoverable unless purged |

### 8.1.1 Artifacts by Filesystem (excerpt)

- **NTFS:** Because everything is recorded in the MFT, deleted files can often be fully recovered and even show original timestamps.
- **ext4:** Timestamps are stored per inode (access/modify/change/birth) plus the journal; `debugfs` can extract deleted inodes if not overwritten.

## 8.2 Deleted File Recovery

- **NTFS:** Parse MFT entries; recover data runs; files may be in $Recycle.Bin with `$I` (metadata) + `$R` (data) files.
- **FAT:** Directory entry still names the file; first cluster chain pointer intact → carve directly.
- **ext4:** `debugfs -R "lsdel"` lists deleted inodes; `extundelete` can restore.

```
# Sleuth Kit: recover deleted files from an image
$ fls -r -d /evidence/opsdb_disk.dd | head -20
r/r 344563-128-3:  deleted.pdf                    (deleted)
r/r 344580-128-3:  credentials.txt                (deleted)   ← interesting
v/v 344590:        (realloc)  salary.xlsx

$ icat -o 2048 /evidence/opsdb_disk.dd 344580-128-3 > recovered_credentials.txt
```

## 8.3 MFT Analysis

The MFT is the heart of NTFS — a table with one record per file (including deleted ones). Analysis with `fls`/`istat` or commercial tools:

```
$ mft2csv C:\evidence\LAP-4821\MFT  > mft.csv
# filter for suspicious paths / timestamps
$ awk -F',' '$4 ~ /Temp|AppData|Public|ProgramData/ {print}' mft.csv | head
Entry  Name            Path                          Modified            Size
  90   svchost.tmp     C:\Windows\Temp\svchost.tmp   2026-08-03 09:29   181,532
  91   rrr.exe         C:\Users\k.morales\AppData\Roaming\rrr.exe
                                                    2026-08-03 09:28   65,000
```

MFT fields of interest: **standard timestamps** (created, modified, MFT entry modified, accessed), **USN change journal** correlations, **$DATA runs** for carving, and **$FILE_NAME** old names/timestamps.

## 8.4 File Carving

Carving = recovering files from raw bytes without filesystem metadata (e.g., from unallocated space or damaged volumes) by looking for file signatures (magic numbers).

| File | Signature (hex) |
|---|---|
| JPEG | `FF D8 FF` |
| PNG | `89 50 4E 47` |
| PDF | `25 50 44 46` (`%PDF`) |
| ZIP/Office (OLE) | `50 4B 03 04` (`PK..`) |
| DOCX/XLSX | ZIP magic, then `[Content_Types]` |
| ELF (Linux) | `7F 45 4C 46` |

```
$ foremost -i /evidence/opsdb_disk.dd -o /evidence/carved -t jpg,pdf,zip
Processing: /evidence/opsdb_disk.dd
Extracting 14 JPEG, 3 PDF, 2 ZIP files
$ ls /evidence/carved/
jpg/ pdf/ zip/
```

## 8.5 Timeline Analysis

Timeline analysis builds a chronological view of file activity. The Sleuth Kit flow: `fls -m` → bodyfile → `mactime`.

```
# Build bodyfile from an image
$ fls -m /evidence/opsdb_disk.dd -o 2048 -r / > bodyfile.txt
# Create timeline
$ mactime -b bodyfile.txt -d > timeline.csv

# Extract interesting window
$ grep '2026-08-03 09:2[0-9]' timeline.csv
Date,Time,Size,Type,Mode,UID,GID,Meta,File Name
08/03/2026,09:27:22,0,m..,d/drwxr-xr-x,0,0,1205,-/C:/Windows/Temp
08/03/2026,09:29:04,181532,ma.,r/rrw-,0,0,90,-/C:/Windows/Temp/svchost.tmp
08/03/2026,09:30:11,0,.a.,d/drwxr-xr-x,0,0,1230,-/C:/Users/k.morales/AppData/Roaming/rrr.exe
```
The compression burst of writes at 09:27–09:30 across Temp/AppData is a classic malware-drop pattern.

Tools: `mactime` (Sleuth Kit), **Plaso/log2timeline** (modern, massive timelines), **Timesketch** (UI for Plaso), or timeline plugins in commercial tools.

## 8.6 Artifact Locations Cheat-Sheet (Windows)

| Artifact | Location |
|---|---|
| Prefetch | `C:\Windows\Prefetch\*.pf` |
| Amcache | `C:\Windows\AppCompat\Programs\Amcache.hve` |
| SRUM | `C:\Windows\System32\sru\SRUDB.dat` |
| Shimcache | `C:\Windows\System32\sdb\sdmain.sdb` / registry AppCompatCache |
| $Recycle.Bin | `C:\$Recycle.Bin\<SID>\$I<orig>$` + `$R<orig>$` |
| UserAssist | Registry `NTUSER.DAT\...\Explorer\UserAssist\{GUID}\Count` |
| LNK files | `%AppData%\Microsoft\Windows\Recent\` + Open/Save MRU, Jump Lists |
| Browser history | Chrome/Edge `History` (SQLite), Firefox `places.sqlite` |
| WMI persistence | `WMI\Repository\OBJECTS.DATA` + ActiveScriptEventConsumer/CommandLineEventConsumer |
| Scheduled tasks | `C:\Windows\System32\Tasks\*`, registry `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Schedule\TaskCache` |
| MFT / USN journal | `C:\$MFT`, `C:\$Extend\$UsnJrnl:$J` |
| Event logs | `C:\Windows\System32\winevt\Logs\*.evtx` |

---

# 9. Windows Forensics Artifacts (Deep Dive)

## 9.1 MFT (Master File Table)

- **What:** NTFS's database of every file/directory (entry #, name, attributes, timestamps, data runs).
- **Where:** `C:\$MFT` (system metadata file).
- **Reveals:** File existence incl. deleted, full paths, creation/modification/access times, ADS, old file names.
- **Analyze:** `fls`, `mft2csv`, Autopsy; correlate $UsnJrnl for change order.

## 9.2 Registry Hives

| Hive | Key content |
|---|---|
| **SAM** | Local user/password hashes, group memberships |
| **SYSTEM** | Boot config, services (incl. non-standard), drivers, time zone, network config |
| **SOFTWARE** | Installed apps, autoruns, MRU lists, policies |
| **SECURITY** | Security policy, local logon data |
| **NTUSER.DAT** (per user) | UserAssist, MRU, typed paths, Run keys, MuiCache |
| **USRCLASS.DAT** (per user) | Shell extensions, recent docs, Jump Lists |

### 9.2.1 Common attacker-targeted keys (mock)

```
HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
    "svc"  = "C:\Windows\Temp\svchost.tmp"          ← persistence (startup)
HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\calc.exe
    "Debugger" = "C:\Windows\Temp\svchost.tmp"      ← IFEO hijack (execution)
```

Analyze with **RegRipper**:

```
$ rip.pl -r SYSTEM -p services
service   Type   Start   ImagePath
svc-rr    0x10   2       \??\C:\Windows\Temp\svchost.tmp   ← unusual
```

## 9.3 Windows Event Logs (Key IDs)

| Event ID | Source | What it means |
|---|---|---|
| 4624 | Security | Successful logon (logon types 3=network, 8=NetworkCleartext, 10=RDP, 11=cached) |
| 4625 | Security | Failed logon (account enumeration / password spraying) |
| 4634 / 4647 | Security | Logoff / user-initiated logoff |
| 4672 | Security | Special privileges assigned (admin) |
| 4688 | Security (with command-line audit) | Process creation (parent PID, command line) |
| 4720–4735 | Security | Account/user/group management (new admins!) |
| 4740 | Security | Account locked out |
| 4768 | Security | Kerberos TGT issued |
| 4769 | Security | Service ticket issued (Kerberoast activity) |
| 4776 | Security | NTLM credential validation |
| 1102 | Security | Audit log cleared ← attacker erasing tracks |
| 7045 | System | **Service installed** (never trust these during IR) |
| 20001 | Sysmon | Process creation (with hashes, parents) |
| 3 | Sysmon | Network connection |
| 1 | Sysmon | Process creation (rich fields) |
| 11 | Sysmon | File create |
| 22 | Sysmon | DNS query |

**Mock — logon type 3 from suspicious source (4624):**
```
Event 4624, Microsoft-Windows-Security-Auditing
 Subject: Security ID: CORP\svc-backup
 Logon Type: 3 (network)
 New Logon:  CORP\svc-backup  (admin? yes)
 Workstation: DESKTOP-RR4T
 Source Network Address: 10.4.12.44
 Process: NtLmSsp
```

## 9.4 Prefetch

- **What:** Optimizes app startup; records executable runs.
- **Where:** `C:\Windows\Prefetch\*.pf`.
- **Reveals:** Programs executed (including from unusual locations), run count, last run time, referenced files.
- **Analyze:** `pf` tool, PECmd (Eric Zimmerman), or strings.

```
C:\> PECmd.exe -f C:\Windows\Prefetch\CALC.EXE-6F9B33D2.pf
Executable: CALC.EXE
Last Run:   2026-08-03 09:29:11
Run Count:   1
Referenced:  \WINDOWS\TEMP\SVCHOST.TMP
```
`calc.exe` executing once, referencing a Temp file = smoking gun.

> **Note:** Prefetch is disabled by default on SSD-heavy enterprise builds — do not rely on it; Amcache/Shimcache fill the gap.

## 9.5 Amcache

- **What:** Application compatibility cache; records executables ever run/installed.
- **Where:** `C:\Windows\AppCompat\Programs\Amcache.hve`.
- **Reveals:** First-run times, file paths, hashes of executables (good for malware hunting).

```
$ python AmcacheParser.py -i C:\evidence\Amcache.hve -o out
Key: File | Path | SHA1 | FirstExecuted
     C:\Windows\Temp\svchost.tmp | 0x1f2a... | 2026-08-03 09:27
     C:\Users\k.morales\AppData\Roaming\rrr.exe | 0x88aa... | 2026-08-03 09:28
```

## 9.6 SRUM (System Resource Usage Monitor)

- **What:** Tracks per-app resource/network usage and app execution (Windows 10/11).
- **Where:** `C:\Windows\System32\sru\SRUDB.dat`.
- **Reveals:** Timeline of app executions (even without Prefetch), network bytes per app.

```
$ python SrumECmd.py -f C:\evidence\SRUDB.dat
AppId | AppName | Bytes Sent | Bytes Received | LastConnected
      | svchost.tmp | 1,204,300 | 8,410,200 | 2026-08-03 09:31
```
Large upload in `svchost.tmp` = data staging/exfiltration signal.

## 9.7 Shimcache (AppCompatCache)

- **What:** Records execution of programs (persisted in SYSTEM hive).
- **Where:** `SYSTEM` hive → `ControlSet001\Control\Session Manager\AppCompatCache`.
- **Reveals:** Files executed + last modified time — a persistent execution history even if Prefetch cleared.

```
$ python AppCompatCacheParser.py -i C:\evidence\SYSTEM
LastModified | Path | ExecutedOn
2026-08-03 09:28:10 | C:\Windows\Temp\svchost.tmp | Yes
```

## 9.8 $Recycle.Bin

- **What:** Deleted files per user SID: `$I` (metadata: original path, deletion time) + `$R` (data).
- **Reveals:** What the attacker deleted, original paths, deletion times.

```
$ python $Recycle.Bin parser (RECmd):
C:\$Recycle.Bin\S-1-5-21-...
   $I4f21.zip → original: C:\FinanceInvoices\Invoices_2026_Q3.zip
                deleted: 2026-08-03 09:44:12
   $R4f21.zip → 812,440 bytes (recoverable)
```
An attacker zipping and deleting finance invoices = exfiltration prep.

## 9.9 Recent Files / UserAssist

- **UserAssist** (NTUSER.DAT): counts GUI program executions with a ROT13-obfuscated name; gives run count + last run.
- **Recent/LNK:** `%AppData%\Microsoft\Windows\Recent` — LNK files to opened docs (path embedded, survives some sanitization).
- **OpenSavePidlMRU / RecentDocs:** typed file paths in registry.

```
$ python LECmd.py -f C:\evidence\FINANCE INVOICES 2026.xlsx.lnk
LNK Target: C:\FinanceInvoices\Invoices_2026_Q3.zip
Accessed:   2026-08-03 09:43:58
```

## 9.10 Jump Lists

- **What:** Per-user lists of recent files per app (taskbar). Stored in `%AppData%\Microsoft\Windows\Recent\AutomaticDestinations\*.automaticDestinations-ms` (with binaries) and `CustomDestinations\`.
- **Reveals:** Files a user/app touched even if deleted afterward; app usage timeline.

```
$ python JLECmd.py -f C:\evidence\*.automaticDestinations-ms
AppID | Name | Target | LastAccessed
{91cfe33d-...} | explorer | C:\FinanceInvoices\Invoices_2026_Q3.zip | 2026-08-03 09:44
```

---
# 10. Linux Forensics

## 10.1 Key Files & Artifacts

| Artifact | Location | Reveals |
|---|---|---|
| Auth log | `/var/log/auth.log` (Debian) / `/var/log/secure` (RHEL) | SSH logins, sudo, PAM events |
| Syslog | `/var/log/syslog`, `/var/log/messages` | General system events, cron output |
| Bash history | `~/.bash_history` (per user, and root) | Commands typed (if enabled) |
| Passwd/shadow | `/etc/passwd`, `/etc/shadow` | Accounts, password hashes |
| lastlog | `/var/log/lastlog` | Last login per user |
| wtmp/btmp | `/var/log/wtmp`, `/var/log/btmp` | Successful/failed logins |
| Cron | `/etc/crontab`, `/etc/cron.*`, `/var/spool/cron/` | Scheduled jobs (persistence) |
| systemd | `/etc/systemd/system/*.service`, journald logs | Services, units (persistence) |
| SSH keys | `~/.ssh/authorized_keys`, `known_hosts` | Backdoor access keys |
| rc.local / init | `/etc/rc.local`, `/etc/init.d/` | Legacy startup persistence |
| Current processes | `/proc`, `ps aux`, `ss -tunap` | Running state (volatile!) |
| Network config | `/etc/hosts`, `iptables`, `/etc/resolv.conf` | Tampering / DNS changes |
| History of root | `/root/.bash_history`, `.mysql_history` | Admin activity |

## 10.2 Process Investigation

```
$ ps auxww | head -20
USER   PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND
root     1  0.0  0.1 167k 15k ?   Ss   Aug02 0:11 /sbin/init
root   320  0.0  0.2 220k 28k ?   Ss   Aug02 0:00 /usr/sbin/sshd -D
svc-mgmt 1111  0.0  0.0  108m 4k ?  S   09:12 0:00 ./tmp/fancyd
root   1112  0.0  0.0  108m 4k ?  S   09:12 0:00 ./tmp/fancyd -child
```
A service running from `/tmp` (often mounted `noexec` — but not always) with a generic name → suspicious. Check binary, network, parent.

```
$ ls -la /proc/1111/exe            # real binary path
lrwxrwxrwx 1 root root 0 Aug 3 09:12 /proc/1111/exe -> /tmp/fancyd (deleted)
$ cat /proc/1111/cmdline | tr '\0' ' '
./tmp/fancyd -c /tmp/.x/conf
$ ss -tunap | grep 1111
tcp   ESTAB  0 0  192.168.4.99:44112 198.51.100.22:4444 users:(("fancyd",pid=1111))
```

## 10.3 Persistence Artifacts

### 10.3.1 crontab

```
$ cat /etc/cron.d/pwn
* * * * * root /usr/bin/python3 -c "exec(__import__('socket').socket())..." >/dev/null 2>&1
$ ls -la /etc/cron.d/
-rw-r--r-- 1 root root 71 Aug  3 09:13 pwn   ← recent suspicious file
```

### 10.3.2 systemd unit

```
$ cat /etc/systemd/system/svc-fancyd.service
[Unit]
Description=helper service
[Service]
ExecStart=/usr/local/bin/fancyd --daemon
Restart=always
[Install]
WantedBy=multi-user.target
$ systemctl enable svc-fancyd 2>/dev/null && echo "persisted"
```

### 10.3.3 rc.local

```
$ tail -3 /etc/rc.local
/usr/local/bin/fancyd &
exit 0
```

### 10.3.4 SSH authorized_keys (backdoor)

```
$ cat /root/.ssh/authorized_keys
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... attacker@evil.example
$ ls -la /root/.ssh/
total 12
drwx------ 2 root root 4096 Aug  3 09:15 .ssh     ← modified at compromise time
```

## 10.4 Log Investigation (mock)

```
$ grep 'Accepted\|Failed' /var/log/auth.log | tail -15
Aug  3 09:10:01 opsdb sshd[1988]: Failed password for root from 198.51.100.22 port 51234 ssh2
Aug  3 09:10:02 opsdb sshd[1988]: Accepted password for svc-mgmt from 198.51.100.22 port 51235 ssh2
Aug  3 09:12:44 opsdb sudo: svc-mgmt : TTY=pts/2 ; COMMAND=/bin/sh -c 'whoami'
Aug  3 09:13:11 opsdb sudo: svc-mgmt : COMMAND=/bin/sh -c 'echo root::0:0:root:/root:/bin/bash >> /etc/passwd'
Aug  3 09:14:00 opsdb sudo: svc-mgmt : COMMAND=/usr/bin/tee /etc/systemd/system/svc-fancyd.service
```
Root password hash added to /etc/passwd = direct backdoor.

## 10.5 lastlog / wtmp / btmp

```
$ lastlog | head
Username  Port   From             Latest
root      pts/0  192.168.4.99     Tue Aug  3 09:31:22 2026
svc-mgmt  pts/2  198.51.100.22    Tue Aug  3 09:12:44 2026

$ last -f /var/log/wtmp | head
svc-mgmt pts/2  198.51.100.22   Tue Aug  3 09:12   still logged in
$ lastb | head   # failed logins from btmp
root    pts/0  198.51.100.22   Tue Aug  3 09:10 - 09:10 (00:00)
```

---

# 11. Network Forensics

## 11.1 Pcap Analysis (Wireshark / tshark)

Packet captures show the actual conversations: who connected to whom, protocols, payloads.

```
# Read a capture, show HTTP requests
$ tshark -r capture.pcap -Y "http.request" -T fields -e ip.src -e http.host -e http.request.uri
192.168.4.44  clearwater.example.c2   /api/beacon?id=4821&op=7
192.168.4.44  clearwater.example.c2   /api/beacon?id=4821&op=9

# Follow a TCP stream for a specific conversation
$ tshark -r capture.pcap -z follow,tcp,raw,12
GET /uploads/Invoices_2026_Q3.zip HTTP/1.1
Host: 203.0.113.77
```

## 11.2 Netflow

Netflow (and variants like sFlow, IPFIX) records **conversation summaries** (5-tuple, bytes, packets, start/end) without payloads. Perfect for long-term storage and spotting volume anomalies.

```
# Mock netflow row (Splunk query result)
time        src_ip          dst_ip          bytes   flows
09:41:03    10.4.12.21      203.0.113.77    41,120   12   ← repeated beacon to same IP
09:43:57    10.4.12.21      203.0.113.77    55,900    9
09:45:00    10.4.12.44      203.0.113.77    812,400  1   ← big one-way transfer (exfil)
```

## 11.3 DNS Logs

DNS logs are gold: every hostname a compromised box resolves is logged at your DNS server even if the traffic is encrypted.

```
# Mock DNS log
09:12:31 10.4.12.21 QUERY   IN A  clearwater.example.c2
09:12:31 10.4.12.21 QUERY   IN A  api.fakeupdate.example
09:44:01 10.4.12.21 QUERY   IN A  megasync.example
```
Look for: unique/newly-registered domains, DGA-like names, high query volume to one domain (beaconing), domains matching intel.

## 11.4 Proxy Logs

```
# Mock proxy log
Date,User,URL,Action,Status
08-03 09:41:00,k.morales,https://clearwater.example.c2/api/beacon,BLOCKED,403
08-03 09:30:12,k.morales,https://cdn.c2.example/setup.exe,DENY-URL,200
```
Proxy logs map user→URL; correlate with user identity and time.

## 11.5 Identifying C2 (Beaconing)

Beaconing = malware periodically "phoning home." Signature in netflow/DNS:

- **Regular intervals** (e.g., every 60s ± jitter).
- **Small request / slightly larger response** (command-and-control exchange).
- **Low data volume but very steady** over hours/days.
- **Fixed destination IP or domain** per implant.

```
# Detect beaconing from netflow (pseudo-SQL)
SELECT src_ip, dst_ip, COUNT(*) AS hits,
       ROUND(STDDEV(interval),2) AS jitter,
       MIN(bytes) AS min_b, MAX(bytes) AS max_b
FROM netflow
WHERE time BETWEEN '2026-08-02' AND '2026-08-03'
GROUP BY src_ip, dst_ip
HAVING COUNT(*) > 100 AND jitter < 10;
Result:
10.4.12.21 | 203.0.113.77 | 1271 hits | jitter 2.3s | 1200..2100 bytes
```
1,271 connections to one external IP with ~2s jitter = textbook beacon.

## 11.6 Lateral Movement Tracing

Correlate **logon type 3 (4624)** events across hosts with source IPs, SMB/RDP connections, and new service installs (7045):

```
Timeline (from SIEM):
09:30 10.4.12.21 → 10.4.12.4  SMB (logon svc-backup$)      initial foothold host→DC access
09:41 10.4.12.21 → 203.0.113.77  HTTPS beacons             C2
09:52 10.4.12.4  → 10.4.12.66  RDP logon ADMIN_DOM\backup   lateral to SQL box
10:05 10.4.12.66 → 10.4.12.70  SMB write Payloads/          staged tools
```
The pivot path is: **FOOTHOLD → beacon → pivot → stage tools**.

## 11.7 Network Evidence Timeline

Build a network timeline to pair with the host timeline:

| Time (UTC) | Source | Dest | Detail | Evidence source |
|---|---|---|---|---|
| 09:30:12 | 10.4.12.21 | 10.4.12.4 | SMB session svc-backup$ | Security 4624 |
| 09:41:00–10:12 | 10.4.12.21 | 203.0.113.77 | HTTPS beacons (1271 conns) | netflow + proxy |
| 09:52:04 | 10.4.12.4 | 10.4.12.66 | RDP logon ADMIN_DOM\backup | Security 4624 type 10 |
| 10:05:33 | 10.4.12.66 | 10.4.12.70 | SMB write Payloads/ | Sysmon 11 / SMB server audit |
| 09:43:57 | 10.4.12.21 | 203.0.113.77 | 812 KB single transfer | netflow (exfil suspect) |

---
# 12. Log Analysis

## 12.1 Windows Event Logs

Covered in depth at §9.3. Practical analysis loop:

1. Pull the relevant `.evtx` files (or query via SIEM).
2. Filter by event IDs of interest (4624/4625/4768/4769/4688/7045/1102).
3. Correlate by **source IP**, **account**, and **workstation**.
4. Spot anomalies: impossible travel, non-working-hour logons, RDP from unexpected IPs, log-clearing (1102).

```
# Query a collected evtx (PowerShell)
Get-WinEvent -FilterHashtable @{Path='C:\evidence\security.evtx';
  Id=4624,4625} -MaxEvents 500 |
  Where-Object { $_.Properties[18].Value -match '198.51.100' } |
  Select-Object TimeCreated, Id, @{n='Account';e={$_.Properties[5].Value}},
             @{n='IP';e={$_.Properties[18].Value}}
```

## 12.2 Sysmon

Sysmon (System Monitor) adds rich endpoint telemetry. It must be *deployed with a config* before an incident. High-value event IDs:

| ID | Event | Forensic value |
|---|---|---|
| 1 | Process creation | Command line, parent PID, hashes, user |
| 3 | Network connection | Source/dest, image making the connection |
| 5 | Process terminated | Helps reconstruct sessions |
| 6 | Driver loaded | Kernel-level implants |
| 7 | Image loaded | DLL injection detection |
| 10 | Process accessed | LSASS access (credential dumping) |
| 11 | File create | Dropped files (e.g., to Temp) |
| 13 | Registry value set | Persistence (Run keys) |
| 22 | DNS query | C2 domains resolved |

**Mock Sysmon 10 — LSASS access (credential dump):**
```
EventID: 10  ProcessAccessed
SourceImage: C:\Windows\System32\lsass.exe
GrantedAccess: 0x1010
CallTrace: ...Dbghelp.dll+0x42a0   ← typical mimikatz pattern
TargetImage: C:\Windows\System32\lsass.exe
```

## 12.3 Web Server Logs (IIS / Apache)

Attacker patterns to find in web logs: SQL injection, brute force of login, LFI/RFI, webshell POSTs, `/admin` probes.

### 12.3.1 Mock Apache access.log (excerpt)

```
203.0.113.55 - - [03/Aug/2026:09:11:02 +0000] "GET /wp-login.php HTTP/1.1" 200 3200 "..." "curl/8.4"
203.0.113.55 - - [03/Aug/2026:09:11:04 +0000] "GET /wp-login.php HTTP/1.1" 200 3200 "..." "curl/8.4"
203.0.113.55 - - [03/Aug/2026:09:11:06 +0000] "GET /wp-login.php HTTP/1.1" 200 3200 "..." "curl/8.4"
   ← rapid repeated logins = brute force
192.168.4.44 - - [03/Aug/2026:09:15:41 +0000] "POST /uploads/photo.php HTTP/1.1" 200 512 "..." "Mozilla/5.0"
   ← POST to an upload handler from internal IP = webshell write suspicion
198.51.100.22 - - [03/Aug/2026:09:16:00 +0000] "GET /admin/config.bak HTTP/1.1" 200 18433 "..." "-"
   ← direct hit on a sensitive file
```

### 12.3.2 Mock IIS log (excerpt)

```
#Fields: date time s-ip cs-method cs-uri-stem sc-status cs(User-Agent)
2026-08-03 09:11:01 10.4.10.1 GET /login.aspx 500 -  sqlmap/1.7
2026-08-03 09:11:03 10.4.10.1 GET /login.aspx 500 -  sqlmap/1.7
2026-08-03 09:11:05 10.4.10.1 GET /login.aspx 500 -  sqlmap/1.7
2026-08-03 09:12:00 10.4.10.1 GET /api/export.aspx?report=..%2f..%2fweb.config 200 -  -
```
User-agent `sqlmap/1.7` + path traversal attempt → SQLi + LFI.

### 12.3.3 Top web-log queries during IR

```
# Failed logins (Apache)
$ awk '$9 ~ /^(401|403)/ {print $1, $7}' access.log | sort | uniq -c | sort -rn | head
# User agents of interest
$ awk '{print $12}' access.log | sort | uniq -c | sort -rn | grep -i -E "curl|wget|sqlmap|nikto|python"
```

## 12.4 Firewall Logs

Firewall/edge logs confirm allowed/blocked flows. Key questions: what was allowed to/from C2 IPs? Was exfiltration permitted by an existing allow rule?

```
# Mock firewall deny then allow (attacker enabling a rule)
08-03 09:12:40  deny  tcp 10.4.12.21:55210 -> 203.0.113.77:443 out:if=wan
08-03 09:13:02  allow tcp 10.4.12.21:55210 -> 203.0.113.77:443 out:if=wan
08-03 09:13:05  allow tcp 10.4.12.21:55211 -> 203.0.113.77:443 out:if=wan
   ← rule change at 09:13 allowed beaconing; find who made it (change mgmt logs)
```

## 12.5 Cloud Logs

- **AWS CloudTrail:** API calls (IAM, S3, EC2). Look for `AssumeRole`, `CreateAccessKey`, `PutBucketPolicy` (public exposure), stopped logging.
- **Azure AD / Entra Sign-in logs:** interactive/non-interactive logins, MFA failures, conditional access. Look for legacy auth (device flow), app role grants to unknown service principals.
- **Google Workspace:** login activity, Gmail delegation, forwarding rules.

```
# Mock Entra ID event (OAuth device-flow token grant — the INC-83421 vector)
time                   user             app           result
2026-08-03 09:34:19    k.morales        Graph          Success (conditional access bypassed)
2026-08-03 09:34:19    k.morales        Graph          TokenIssued (device code flow)
```
**Pattern:** device code / OAuth flows are silent to MFA and hard to spot without app+IP context.

## 12.6 Log Correlation

Correlation = joining independent sources to build confidence and scope. Example joins:

| Question | Join |
|---|---|
| "Did the attacker move to other hosts?" | 4624 (logon IP) × DHCP/asset DB × RDP logs |
| "Was data exfiltrated?" | proxy/DNS (dest) × netflow (volume) × mailbox rules × SMB writes |
| "When did it start?" | EDR first-seen × earliest 4624 × firewall allow × phishing mailbox |
| "Who else used this account?" | 4624 × VPN logs × mail client IPs |

**Mock correlation rule (SIEM):** `EDR `beacon` + netflow 3+ connections/min to same external IP + DNS query count > 500 → create `HIGH_SEV_BEACON` incident automatically.

## 12.7 Common Attacker Patterns in Logs

| Pattern | Log signature |
|---|---|
| Password spraying | Many 4625 for same user or same password pattern; slow cadence |
| Brute force | Rapid 4625 from one IP; RDP/SSH ports |
| Kerberoasting | Many 4769 for SPNs; TGS-REQ with RC4; followed by 4624 as the service account |
| Pass-the-hash | 4624 type 3 from workstation A using credentials of user logged into B |
| Token impersonation / LSASS dump | Sysmon 10 (LSASS access), 7 (Dbghelp loaded into suspicious process) |
| Log clearing | Event 1102; missing logs during a gap |
| New admin | 4728/4732 (member added to Administrators) |
| Persistence | 7045 (service), Scheduled Task registration (Task Scheduler events 106/140/200), Sysmon 13 Run key |
| DCSync | 4662 (Replicating Directory Changes right) on domain controllers |

---

# 13. Malware Analysis & Forensics

## 13.1 Static vs. Dynamic Analysis

| | Static | Dynamic |
|---|---|---|
| **Definition** | Analyzing without executing | Executing in a controlled sandbox |
| **Answer** | "What *could* it do?" | "What *does* it do?" |
| **Speed / cost** | Fast, cheap | Slow, needs sandbox |
| **Blind spots** | Packing, obfuscation, run-time deobfuscation | Anti-sandbox evasion (sleeps, checks user input, checks VM) |
| **Common tools** | `file`, `strings`, `pescan`, `pefile`, IDA/Ghidra, YARA | Cuckoo/CAPE, REMnux + inetsim, Process Monitor |

## 13.2 Triage Flow

1. **Hash** the sample (SHA-256) → search intel (VirusTotal, MISP).
2. **file / PE header** — architecture, compile time, section names.
3. **strings** — URLs, IPs, filenames, error messages.
4. **Imports** — APIs it uses (network, registry, process injection).
5. **YARA** — known family signatures.
6. **Sandbox** — run, watch behavior.
7. **Reverse engineer** if needed.

## 13.3 Triage Commands (Mock)

```
$ sha256sum sample.bin
8c2f1a0b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f  sample.bin
# ↑ VT: 12/70 detections, family "EMOTET" (mock)

$ file sample.bin
sample.bin: PE32 executable (console) Intel 80386, for MS Windows

$ strings -n 8 sample.bin | grep -iE "http|\.dll|\.exe|reg|hkey|cmd|powershell"
https://clearwater.example.c2/api/
C:\Windows\Temp\svchost.tmp
Software\Microsoft\Windows\CurrentVersion\Run
VirtualAlloc
CreateRemoteThread
```

### 13.3.1 PE Header Analysis (mock)

```
$ python3 - <<'EOF'
import pefile
pe = pefile.PE("sample.bin")
print("Machine:", pe.FILE_HEADER.Machine)          # 0x14c = i386
print("Compile time:", pe.FILE_HEADER.TimeDateStamp)  # 2025-11-30
print("Subsystem:", pe.OPTIONAL_HEADER.Subsystem)     # 3 = CONSOLE
print("Entry point RVA:", hex(pe.OPTIONAL_HEADER.AddressOfEntryPoint))
print("Sections:", [(s.Name, hex(s.VirtualSize)) for s in pe.sections])
EOF
Machine: 0x14c
Compile time: 2025-11-30 12:33:02   (no longer aligned to real date)
Subsystem: 3
Entry point RVA: 0x14000
Sections: [(b'.text', 0x2a000), (b'.data', 0x4000), (b'.rsrc', 0x3000)]
```
No `.reloc`, one suspicious `.text` size, odd timestamp → further dynamic analysis warranted.

## 13.4 Malware Persistence Discovery

Combine host artifacts to find where malware survives reboot:

| Persistence location | Where to look |
|---|---|
| Run keys | HKLM\...\Run, HKCU\...\Run, RunOnce |
| Services | HKLM\SYSTEM\...\Services, event 7045 |
| Scheduled tasks | Task Scheduler (see §9/§10) |
| Startup folders | `Startup` dirs (per user + common) |
| WMI subscriptions | `WMI\Repository` — no files, survives with event consumers |
| DLL search-order hijacking | AppDirs, registry App Paths |
| IFEO / image hijack | `HKLM\SOFTWARE\...\Image File Execution Options` |
| Boot execute | `HKLM\SYSTEM\...\Control\Session Manager\BootExecute` |

**Mock discovery sweep (autorunsc):**
```
autorunsc.exe -a * -c
[HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run]
"svc" = "C:\Windows\Temp\svchost.tmp"            ← FOUND (new, unsigned)
[WMI ActiveScriptEventConsumer]
Name: "Consumer-9f31"  Script: "powershell -enc <b64>"   ← FOUND (fileless)
```

## 13.5 Reverse Engineering Intro

- **Disassembly** (Ghidra/IDA): decompile to C-like pseudocode; follow entry point → main → imports.
- **Key questions:** What is the C2 protocol? What data is exfiltrated? Is there a kill-switch/decryption routine? What anti-analysis does it use?
- **Dynamic debugging** (x64dbg/ollydbg): breakpoints at network APIs (`InternetOpen`, `ws2_32`), string deobfuscation loop.
- **Sandboxing best practice:** never run malware on a production network; use isolated VM with internet simulation (`inetsim`), snapshot rollback, and full packet capture.

### 13.5.1 Mock C2 decoder output (from RE)

```
Python snippet extracted from sample.bin's deobfuscation loop:
URL = "https://clearwater.example.c2/api/beacon"
key = "s3cr3t!"          # XOR key recovered statically
payload = xor(decode("..."), key)   # decodes config JSON
beacon every 60s ± 2s; user-agent "Mozilla/5.0" + " ops=7"
```

---
# 14. Eradication, Recovery & Containment

## 14.1 Containment Strategies (Mock)

Containment = cut the attacker off. Typical controls in order of speed:

| Strategy | Speed | Effect | Example |
|---|---|---|---|
| **Endpoint isolation** | Seconds | Kill network on the host (EDR) | EDR "isolate host" on LAP-4821 at 10:12 |
| **Account disable** | Minutes | Block credential use everywhere | `Disable-ADAccount k.morales` |
| **Revoke sessions/tokens** | Minutes | Invalidate OAuth/session tokens | Entra revoke-all-refresh-tokens |
| **Firewall block** | Minutes | Block C2/exfil IPs and ports | `deny tcp any -> 203.0.113.77` |
| **Network segmentation** | Hours | Cut VLANs/subnets apart | Move affected subnet to quarantine VLAN 99, no cross-routing |
| **VPN kill** | Minutes | Remove remote access for attacker | Revoke user's VPN cert |
| **Mailbox rule removal** | Minutes | Stop exfil rules | Remove O365 forwarding rule at 10:12 |
| **DNS sinkhole** | Hours | Redirect known C2 domains to sinkhole | Add `clearwater.example.c2` → 10.255.255.1 |

### 14.1.1 Mock containment decision log

```
10:12  A. Reyes (IC):  Approve EDR isolate LAP-4821.
                       Disable k.morales. Revoke tokens. Block
                       203.0.113.77/32 at edge FW (rule IR-83421).
10:18  LH:  Quarantine VLAN 99 applied to LAP-4821 (moved from VLAN 14).
10:25  LH:  Mailbox forwarding rule "clearwater@mail-fwd.example" removed.
10:30  LEGAL: Legal hold LH-2026-0117 confirmed; regulator clock running.
10:35  LH:  VPN cert for k.morales revoked.
10:40  NA:  DNS sinkhole for 3 confirmed C2 domains added.
```

## 14.2 Eradication Methods

After containment, remove the adversary *and* their footholds:

1. **Kill malware processes** and delete files (from a known-clean context, not the infected OS).
2. **Remove persistence** — Run keys, services, tasks, WMI consumers, boot execute (see §13.4).
3. **Revoke all compromised credentials** — password resets for affected users + any credential exposed (service accounts, kerberoastable accounts).
4. **Rotate secrets** — API keys, tokens, machine account passwords that may have been captured (incl. in memory dumps).
5. **Patch the root-cause vulnerability** (e.g., the unpatched web app that was exploited).
6. **Remove attacker-created accounts** after forensic preservation (don't delete evidence before analysis is complete).

> **Eradication never means "delete a few files."** If you cannot prove the full scope, rebuild the host from a known-good image. Rebuild is the *only* guaranteed eradication for deep implants.

## 14.3 Recovery Validation

Recovery is not "systems are back." It is "systems are back **and proven safe**."

| Check | Method |
|---|---|
| Integrity | Restore from known-good, offline, immutable backup; verify app data by hash/review |
| Malware-free | Run EDR full scan + YARA hunt; memory image check before connect |
| Credentials rotated | Audit that ALL touched accounts/passwords changed |
| Persistence gone | Re-scan autoruns, services, tasks, WMI, boot execute |
| Re-monitoring | Re-enable enhanced monitoring (SIEM watchlists) on restored hosts |
| Functionality | Business team UAT sign-off per application |
| Re-infection guard | Re-block known IOCs; keep C2 IPs blocked; monitor 30–90 days |

**Mock recovery checklist (excerpt):**
```
[ ] DC02 restored from 2026-08-02 backup; `dcdiag` all green
[ ] LAP-4821 rebuilt from gold image (not restored — was untrusted)
[ ] All 4 affected accounts force-password-reset; MFA re-enrolled
[ ] YARA hunt across fleet: 0 hits
[ ] SIEM watchlist "Clearwater IOCs" active for 90 days
[ ] User UAT complete for Finance apps; Finance resumed 08-05 14:00
```

## 14.4 Mock Eradication Playbook (Ransomware)

```
PLAYBOOK: MAL-01 Eradication (after containment & forensics)

1. LOCK ENVIRONMENT (IC)
   - Suspend non-essential services; open change freeze.
   - Confirm backups offline + immutable and validated.

2. PRESERVE (FA) — done in IR phase, do not delete before this
   - Ensure all imaged hosts are sealed; hold evidence.

3. KILL & CLEAN (LH + SME)
   - Remove ransom/malware files (documented hashes).
   - Delete persistence: services, Run keys, scheduled tasks, WMI.
   - Verify nothing re-spawns (watch 4h).

4. ROTATE & RESET (ID team)
   - Reset passwords: all admins, service accounts, SA/domain.
   - Rotate tokens/certs: machine accounts, domain, app secrets.

5. PATCH & HARDEN (Patch team)
   - Apply missing patches to entry vector + all exposed systems.
   - Harden: disable SMBv1, enforce LAPS, lock RDP, MFA everywhere.

6. RESTORE (Ops + BC)
   - Restore last-known-good backups; validate data integrity (hash).
   - Restore in priority order: DCs → file → app → endpoints.

7. VERIFY (Security)
   - Scan with 2 AV/EDR engines + YARA hunt; review new logs 72h.
   - Confirm IOCs remain blocked; watch for repeat.

8. REOPEN/CLOSE (IC)
   - Declare eradicated only after 72h of clean enhanced monitoring.
```

## 14.5 Business Continuity Involvement

- **When BC activates:** core function unavailable > MTD (max tolerable downtime), e.g., Finance unable to invoice for > 8h.
- **Who calls it:** IC escalates to MGMT; MGMT invokes BC plan.
- **Coordination:** BC runs *parallel* to IR — BC restores *business*, IR restores *trust/security*. Never let BC restore infected systems before eradication.
- **Communications:** BC keeps its own cadence to operations; IR keeps technical comms; both report to IC.

---

# 15. Lessons Learned & Reporting

## 15.1 Post-Incident Review (PIR)

Conducted 1–2 weeks after closure, *not* during the crisis. Structure:

- Timeline reconstruction (everyone contributes their part).
- What went well (keep doing).
- What went wrong (fix with owners + dates).
- Gaps in detection, tooling, people, process.
- Metrics (MTTR, MTTA, detection gaps).
- Playbook/plan updates and new training.

**Ground rules:** blame-free, evidence-based, focused on *systems* not *people*.

## 15.2 Root Cause Analysis (RCA)

RCA answers "why did this happen" at the deepest actionable level. Use **5 Whys** or fishbone:

```
WHY #1: Mailbox was accessed by an attacker.
  WHY #2: Because the attacker had a valid session token.
    WHY #3: Because the token was obtained via OAuth device-code phishing.
      WHY #4: Because legacy authentication was not blocked for apps.
        WHY #5: Because org policy allowed legacy auth for a legacy scanner.
ROOT CAUSE: Legacy authentication not governed → device-code phish succeeded.
FIX: Disable legacy auth; block device-code flow; require MFA on all flows; alert on token grant anomalies.
```

## 15.3 Mock Executive Report

```
            EXECUTIVE INCIDENT SUMMARY — CONFIDENTIAL
            Case: INC-2026-83421 "Project Clearwater"
            Classification: Critical | For executives & board

WHAT HAPPENED
  On 2026-08-03, an attacker using a valid session token (obtained via
  device-code phishing) accessed the mailbox of a finance employee for
  approximately 38 minutes (09:34–10:12 UTC). A forwarding rule was
  created and later removed by our team. The account was disabled and
  sessions revoked at 10:12 UTC. Forensic evidence indicates ~2,400
  customer payment-reference records were visible to the mailbox and may
  have been copied. No other systems were compromised.

WHAT WE DID
  - Contained in 41 minutes (first alert 09:41 → containment 10:12).
  - Forensically preserved the endpoint, mailbox, and logs.
  - Notified the DPO per GDPR (within 72h) — regulator notification filed 08-05.
  - Reset credentials, revoked tokens, blocked attacker infrastructure.

BUSINESS IMPACT
  - Finance invoicing paused 4 hours on 08-03; resumed after validation.
  - No ransom, no system outage, no public exposure confirmed as of this report.
  - Regulatory risk: potential GDPR breach notification already filed.

ROOT CAUSE
  Legacy authentication (OAuth device-code flow) permitted token phishing
  to succeed without MFA challenge.

RECOMMENDATIONS (owners, target dates)
  1. Disable legacy auth + device-code flow (ID, 08-30).
  2. Enforce MFA on 100% of interactive flows (ID, 09-15).
  3. Deploy token-grant anomaly alerts (SOC, 10-01).
  4. Extend mandatory 90-day log retention to mail audit logs (IT, 09-01).
  5. Run phishing + tabletop exercise for finance (SecAware, Q4).

NEXT REVIEW: Board security briefing 2026-08-20, 09:00.
Signed: J. Nwosu (CISO)
```

## 15.4 Technical Report Structure

A forensic/IR technical report for legal or senior IR leads:

1. **Case header** — case ID, dates, examiner, status, exhibits.
2. **Executive summary** — 1 page, non-technical.
3. **Scope & authorization** — what was collected, who authorized.
4. **Timeline of events** — master timeline with sources.
5. **Methodology** — tools + versions, hashing, chain of custody.
6. **Findings by evidence item** — each exhibit: what, where, analysis, result.
7. **Analysis & correlations** — how artifacts connect (mailbox → host → network → persistence).
8. **Attribution assessment** (if any) — confidence level, not conclusions without evidence.
9. **Conclusions** — what happened, what data was at risk.
10. **Recommendations** — technical + process, prioritized.
11. **Exhibits & appendix** — evidence log, hashes, relevant tool output.

## 15.5 Metrics

Track to prove improvement (and to justify budget):

| Metric | Definition | INC-83421 actual |
|---|---|---|
| **MTTA** (mean time to acknowledge) | Alert→acknowledged | 6 min |
| **MTTR** (mean time to respond/contain) | Alert→containment | 41 min |
| **Dwell time** | Compromise→detection | 41 min (fast, user reported) |
| **MCF** (mean cost per finding) | Cost/incidents | n/a |
| **Detection gap** | % of incidents found via monitoring vs. user report | 50% (EDR) / 50% (user) |
| **False positive rate** | FP/total alerts | 12% (triage) |
| **Time to recover** | Contain→services restored | ~6h (Finance) |

## 15.6 Capability Improvement Loop

After every incident and tabletop:
1. Update **playbooks** (what did we do differently/better?).
2. Add **detections** (rule/IOC that would have caught this earlier).
3. Fix **process gaps** (e.g., who notifies regulators).
4. Train **staff** on the weak points found.
5. Re-test within 90 days.

---
# 16. Mock Full Incident Case Study — "Project Clearwater"

> **Premise (fully fictional):** FictionalCorp Inc. is a mid-sized finance-services firm. This walkthrough follows a realistic **device-code phishing → mailbox compromise → data exposure → lateral movement attempt → eradication** from first alert to lessons learned. Every name, IP, hash, and log line is fictional.

## 16.1 Executive Snapshot

| Field | Value |
|---|---|
| Incident ID | INC-2026-83421 (codename **"Project Clearwater"**) |
| Classification | Critical (Severity 5) |
| Type | Account Takeover / Possible Personal Data Breach |
| Initial access | OAuth **device-code phishing** (no MFA challenge on token flow) |
| Dwell time | ~41 minutes (09:34 → detection 09:41 → containment 10:12) |
| Systems affected | 1 endpoint, 1 user mailbox, 1 shared mailbox (limited) |
| Data at risk | ~2,400 customer payment-reference records (visible in mailbox) |
| Data loss confirmed | Not confirmed at reporting; exfil suspected but not proven |
| Recovery | Finance operations restored within ~6 hours |
| Root cause | Legacy auth / device-code flow ungoverned |

## 16.2 Master Timeline

| Time (UTC) | Phase | Event | Evidence |
|---|---|---|---|
| 09:34:19 | Initial Access | Attacker performs device-code phishing; token granted for `k.morales` (from MX) | Entra ID sign-in log, token grant event |
| 09:37:41 | Initial Access | Attacker opens mailbox via Graph API, enumerates folders | Graph audit log |
| 09:39:12 | Persistence | Attacker creates forwarding rule to `clearwater@mail-fwd.example` | Mailbox audit (rule created) |
| 09:41:05 | Detection | EDR `AUTH-impossibletravel-9f31` fires (MX login 4 min after NYC login) | EDR alert |
| 09:41:22 | Detection | Tier-1 opens INC-2026-83421; calls user (confirms fraud) | Ticket, call log |
| 09:43:57 | Exfiltration (suspect) | 812 KB single outbound transfer to `203.0.113.77` (IP associated with C2) | Netflow, proxy |
| 09:44:12 | Exfiltration (suspect) | `$Recycle.Bin` shows deleted `Invoices_2026_Q3.zip` on LAP-4821 | Recycle Bin parser |
| 09:50:12 | Scoping | SIEM finds same IP accessed shared mailbox `FinanceInvoices` at 09:41:02 | SIEM correlation |
| 09:52:04 | Lateral attempt | RDP logon `ADMIN_DOM\backup` to `OPS-SRV-DB01` (blocked by policy) | Security 4624 (failed) |
| 10:05:33 | Lateral attempt | SMB write `\\OPS-SRV-DB01\C$\Temp\` attempt — denied | Sysmon 11 / file audit |
| 10:12:00 | Containment | EDR isolate LAP-4821; account disabled; tokens revoked; forwarding rule removed; IP blocked | IR decision log |
| 10:18:00 | Containment | Quarantine VLAN applied; DNS sinkhole for 3 C2 domains | FW/change logs |
| 10:30:00 | Legal | Legal hold LH-2026-0117; regulator clock started | Legal notice |
| 14:07:00 | Preservation | Full disk image (E01) + memory image of LAP-4821 | Evidence log EV-001/2 |
| 08-04 09:12 | Analysis | Memory: `calc.exe` with injected PE + 3 HTTPS conns to C2 IP | Volatility malfind |
| 08-04 11:00 | Analysis | Mailbox export reviewed; 2,400 records visible; no rule-triggered forward executed before removal | eDiscovery export |
| 08-05 09:00 | Eradication | LAP-4821 rebuilt from gold image; creds reset; C2 blocks kept | Eradication checklist |
| 08-05 11:30 | Recovery | Finance apps validated & resumed | UAT sign-off |
| 08-05 16:00 | Legal | GDPR notification filed (within 72h) | Notification record |
| 08-11 10:00 | Lessons | PIR conducted; 5 root-cause fixes assigned | PIR minutes |
| 08-20 09:00 | Lessons | Board briefing presented | Executive report |

## 16.3 Phase-by-Phase Walkthrough

### 16.3.1 Preparation (before the incident)

- EDR deployed on 100% endpoints; Sysmon with baseline config; SIEM with 120-day retention.
- MFA mandatory for interactive logins, **but** legacy/device-code flows not governed (the gap).
- IR plan + playbooks in place; quarterly tabletop; jump bags stocked; legal hold templates approved.
- **Gap that mattered:** no alert on anomalous OAuth token grants or legacy-auth logins.

### 16.3.2 Detection & Triage

- 09:41:05 — EDR `impossible-travel` alert: login for `k.morales` from MX at 09:34, four minutes after an NYC login at 09:30.
- Tier-1 verification (09:41–09:45): confirmed with user on phone (she was at her desk), reviewed raw IdP logs, checked source IP against threat intel.
- Escalation to LH (09:45). LH expands search:
  - 09:50 — same source IP hit shared mailbox `FinanceInvoices`; forwarding rule created 09:39.
  - 09:52 — failed RDP attempt to DB server using `ADMIN_DOM\backup`.
- **Severity scored 5** (possible PII + lateral movement signals). Incident **declared Critical** at 09:55. Bridge opened, codename assigned.

### 16.3.3 Containment

Decision log (all timed, all recorded):

| 10:05 | NA confirms C2 pattern to `203.0.113.77` from LAP-4821 (netflow) |
| 10:12 | **EDR isolate LAP-4821**; disable `k.morales`; revoke all sessions/tokens; remove forwarding rule; block `203.0.113.77/32` at edge |
| 10:18 | LAP-4821 moved to quarantine VLAN 99; DNS sinkhole for 3 confirmed C2 domains |
| 10:30 | Legal hold issued; regulator clock started; BC on standby |
| 10:35 | VPN cert for user revoked |

**Containment rationale:** preserve evidence first (endpoint left powered on for live imaging), then cut network. Destructive containment (power-off) was deliberately avoided until memory acquisition was planned.

### 16.3.4 Preservation & Evidence

Acquired with documented chain of custody (Exhibit log §5.7):

- **EV-001:** full disk image of LAP-4821 (E01, write-blocked). SHA-256 verified twice.
- **EV-002:** 16 GB memory image (WinPmem). SHA-256 verified.
- **EV-003:** mailbox export for `k.morales` + `FinanceInvoices` (eDiscovery).
- **EV-004:** Entra sign-in + audit logs (48h window).
- **EV-005:** SIEM correlation extracts, netflow, proxy logs.
- **EV-006:** screenshots (phishing page, forwarding rule) captured by analyst.

### 16.3.5 Analysis (Forensics)

**Memory (Volatility 3) — LAP-4821:**
```
windows.pslist:   calc.exe PID 4324, powershell.exe PID 4508 spawned from svchost.exe
windows.malfind:  PID 4324 PAGE_EXECUTE_READWRITE + MZ header → injected code
windows.netscan:  PID 4324 → 3 ESTABLISHED to 203.0.113.77:443
windows.dlllist:  C:\Windows\Temp\svchost.tmp loaded into calc.exe
yara scan:        match on FIN7/EMOTET-family rule (fictional)
```
**Conclusion:** LAP-4821 was the *infrastructure* host: it hosted the implant that relayed token/mail actions and beaconed to C2.

**Disk (Sleuth Kit) — LAP-4821:**
```
fls/mactime:  drop of svchost.tmp 09:29; rrr.exe 09:28 in AppData\Roaming
Recycle Bin:  $I4f21.zip → Invoices_2026_Q3.zip deleted 09:44 (post-exfil cleanup)
Prefetch:     CALC.EXE run once at 09:29 referencing TEMP\SVCHOST.TMP
Registry:     Run key "svc" = C:\Windows\Temp\svchost.tmp (persistence)
```

**Mailbox (EV-003):**
- Forwarding rule created 09:39:12; **no outbound email forward executed before removal** (rule was created but the attacker's plan was disrupted at 10:12).
- 2,400 customer payment-reference records present in shared folders during the access window.
- Exfil volume (09:43, 812 KB via host) **correlates** with the Recycle-Bin zip → strong suspicion the attacker *staged* the file on the host. Whether it fully egressed remains open.

**Network (EV-005):**
- Beaconing: 1,271 connections to `203.0.113.77` over 38 min, ~2s jitter — C2 established 09:34–10:12.
- Single 812 KB transfer at 09:43:57 = exfil candidate.
- DNS: queries to `clearwater.example.c2`, `api.fakeupdate.example`.

### 16.3.6 Eradication

- Rebuilt LAP-4821 from gold image (host was untrusted — not restored).
- Removed persistence (Run key, any service/task/WMI) on related shared mail system.
- Reset passwords for `k.morales`, all finance staff who accessed shared mailbox, plus `svc-backup` and `ADMIN_DOM\backup` (both seen in lateral attempts).
- Rotated tokens/certs for machines whose credentials were in memory dumps.
- Patched the entry vector: disabled device-code flow for the affected app; removed the legacy-auth allowlist entry for the scanner.
- Kept C2 blocks + sinkholes active.

### 16.3.7 Recovery

- Restored DC/file services from immutable 08-02 backups (data validated by hash).
- LAP-4821 rebuilt and joined fresh; EDR full scan clean; YARA hunt fleet-wide: 0 hits.
- Finance UAT sign-off at 11:30 on 08-05; operations resumed.
- Enhanced monitoring (mail audit + token-grant alerts) enabled for 90 days.

### 16.3.8 Legal & Notification

- 72-hour GDPR clock started at 10:30 (awareness) 08-03; notification **filed 08-05 16:00** (within deadline) with regulator + DPO.
- Non-disclosure to public held pending confirmation of exfil; legal memo documented rationale.

### 16.3.9 Lessons Learned (PIR — 08-11)

**What went well:**
- Rapid user confirmation; strong EDR + SIEM correlation; disciplined evidence preservation before destructive containment.
- 41-minute containment prevented mailbox-forwarding from executing.

**What went wrong / gaps:**
1. **Legacy/device-code authentication ungoverned** — the actual root cause.
2. No alert on **anomalous OAuth token grants** — detection relied on lucky impossible-travel signal.
3. No **mailbox exfiltration rules** (forwarding rule changes not alerted) — found only by correlation.
4. Shared mailbox access **not scoped early** — one extra search step cost ~10 minutes.
5. RDP attempt logs reviewed late — lateral-movement attempt detected but not triaged same-hour.

**Root cause (5 Whys → §15.2):** legacy auth → device-code phish → valid token → mailbox access. Fixes below.

**Action items (owners + dates):**

| # | Action | Owner | Target |
|---|---|---|---|
| 1 | Disable legacy auth + device-code flow; require MFA on all flows | ID | 08-30 |
| 2 | Alert on token grants / new OAuth app grants | SOC | 10-01 |
| 3 | Alert on mail forwarding rules + mailbox access from new IPs | SOC | 09-15 |
| 4 | Extend mail audit log retention to 120 days | IT | 09-01 |
| 5 | Add device-code phishing module to awareness training (finance) | SecAware | Q4 |
| 6 | Annual red-team validation of auth controls | RedTeam | 12-15 |

## 16.4 Key Takeaway

> The best forensic work cannot compensate for a failed containment, and the best containment cannot compensate for a missed detection. **Project Clearwater** succeeded because each phase fed the next: strong sensors → quick triage → evidence-first containment → rigorous forensics → clean eradication → validated recovery → honest lessons learned. The single most important improvement was eliminating the authentication gap that made the initial access possible.

---

## Appendix A — Quick Reference: Key Commands

| Task | Command |
|---|---|
| Hash a file | `sha256sum file` |
| Image disk (Linux) | `dcfldd if=/dev/sda of=img.dd bs=4M hash=sha256` |
| Volatile (Windows) | `netstat -ano; tasklist /v; net session; whoami /priv` |
| Volatile (Linux) | `ps auxww; ss -tunap; last; w; cat /var/log/auth.log` |
| Memory (Windows) | `WinPmem.exe image.mem` |
| Memory (Linux) | `sudo pmem -e -o /evidence/mem.bin` |
| Volatility 3 | `python vol3 -f mem.bin windows.<plugin>.PsList` |
| File listing on image | `fls -r -o <offset> image.dd` |
| Timeline | `fls -m / -r image.dd > body; mactime -b body > tl.csv` |
| PCAP | `tshark -r cap.pcap -Y "http.request"` |
| Strings | `strings -n 8 file | grep -i http` |
| PE info | `python3 -m pefile` / `pecheck` |
| Sysmon checks | Event IDs 1,3,10,11,13,22 |
| Event log query (evtx) | `Get-WinEvent -FilterHashtable @{Path='file.evtx';Id=4624,4625}` |

## Appendix B — Severity Reference (1–5)

| Lv | Label | Example trigger | Response time |
|---|---|---|---|
| 5 | Critical | PII breach / ransomware / domain admin takeover | < 1 hr |
| 4 | High | Multi-host malware with C2 / lateral movement | < 4 hr |
| 3 | Medium | Single account/host compromise | < 24 hr |
| 2 | Low | Isolated adware / no data risk | < 72 hr |
| 1 | Info | Scans / mass phishing (blocked) | Track only |

---

*End of document. All data fictional. For training use only.*









