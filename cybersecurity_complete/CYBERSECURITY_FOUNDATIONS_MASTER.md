# CYBERSECURITY FOUNDATIONS — MASTER REFERENCE

> **Document ID:** CSEC-FND-001
> **Classification:** Educational / Internal Use
> **Audience:** Security professionals, analysts, engineers, and students building a complete cybersecurity knowledge base
> **Companion files:** See `INDEX.md` and domain-specific master files (DDoS, Password Cracking, Kali, APT tradecraft, etc.)
> **Version:** 1.0 — Entry point of the knowledge base
>
> **Notice:** All statistics, company names, IP addresses, user profiles, and incident data in this document are **fictional mock data** created for educational purposes only. Any resemblance to real entities is coincidental. Nothing herein constitutes live threat intelligence.

---

## Table of Contents

1. [What Is Cybersecurity?](#1-what-is-cybersecurity)
2. [Core Security Objectives (CIA Triad)](#2-core-security-objectives-cia-triad)
3. [The Security Mindset](#3-the-security-mindset)
4. [Threats, Vulnerabilities, and Risks](#4-threats-vulnerabilities-and-risks)
5. [Attack Vectors & Threat Landscape](#5-attack-vectors--threat-landscape)
6. [Risk Management](#6-risk-management)
7. [Security Frameworks & Models](#7-security-frameworks--models)
8. [Security Domains (CISSP Domains)](#8-security-domains-cissp-domains)
9. [Security Controls](#9-security-controls)
10. [Security Architecture](#10-security-architecture)
11. [Governance Basics](#11-governance-basics)
12. [Security Roles & Responsibilities](#12-security-roles--responsibilities)
13. [Glossary of 50+ Essential Terms](#13-glossary-of-50-essential-terms)

---

# 1. What Is Cybersecurity?

## 1.1 Definition

**Cybersecurity** is the practice of protecting systems, networks, programs, devices, and data from digital attacks, damage, or unauthorized access. It encompasses the technologies, processes, and human disciplines designed to defend against threats, detect intrusions, respond to incidents, and recover to a trusted state.

Formally, cybersecurity is:

> **"The protection of information assets (confidentiality, integrity, and availability) against threats that exploit vulnerabilities, through the application of administrative, technical, and physical controls."**

Cybersecurity is not a single product or tool. It is a **system of systems** — people, process, and technology working together.

### The People–Process–Technology Triangle

| Pillar | What it means | Example |
|--------|---------------|---------|
| **People** | The humans who operate, attack, and defend. The weakest AND strongest link. | Awareness training reduces phishing click rate from 12% to 1.8%. |
| **Process** | Procedures, policies, incident response plans, change management. | A documented patch-management SLA ensures critical CVEs patched within 72h. |
| **Technology** | Tools, controls, and platforms. | Firewalls, EDR, SIEM, MFA, encryption, backup. |

If any one pillar is missing, security fails. A billion-dollar EDR suite does not help if an employee writes their password on a sticky note.

## 1.2 Why It Matters

The world has become digital-first. Data is the new currency, and adversaries know it.

**Fictional industry figures for context (mock data):**

| Metric | Mock Figure |
|--------|-------------|
| Average total cost of a data breach | $4.8M (up 15% YoY) |
| Average time to identify a breach | 212 days |
| Average time to contain a breach | 87 days |
| % of breaches caused by human error | 34% |
| % of breaches caused by credential theft | 49% |
| Time to exploit a publicly disclosed CVE | 24 minutes (median) |
| % of SMBs that close within 6 months of a major breach | 60% |
| Unfilled cybersecurity jobs (global) | 3.5M |
| DDoS attacks observed per day (global estimate) | 42,000 |
| Ransomware attacks per hour (global estimate) | 6 |
| % of organizations that pay the ransom | 46% |
| Mean time to ransomware recovery | 23 days |

**Why organizations invest:**

1. **Financial protection** — avoid breach costs, fines, business interruption, ransom.
2. **Regulatory compliance** — GDPR, HIPAA, PCI DSS, SOX, NIST requirements.
3. **Reputation & trust** — a single breach can destroy decades of brand equity.
4. **Operational continuity** — critical infrastructure and services must stay available.
5. **Legal liability** — officers and boards face personal accountability.
6. **Intellectual property protection** — trade secrets and research.
7. **National security** — state-sponsored actors target energy, defense, telecom.

## 1.3 The Cybersecurity Landscape

The landscape is a dynamic battlefield between defenders and a diverse set of adversaries. Understanding the terrain means knowing:

- **The attack surface** — every point where an adversary can enter or extract data (internet-facing apps, email, USB, cloud APIs, humans, physical sites, supply chain).
- **The defender's assets** — what must be protected: data, IP, credentials, infrastructure, brand, people.
- **The threat environment** — who is attacking, why, and with what capabilities.
- **The regulatory environment** — what law demands of the defender.

### A Day in the Life of a SOC (Mock Telemetry)

| 06:00 | Phishing campaign targeting finance dept — 214 emails, 9 clicked, 2 creds phished |
|-------|--------|
| 08:30 | Brute-force burst on VPN gateway (44k attempts from 3 ASNs) blocked by rate-limit |
| 10:15 | WAF blocks SQLi attempt against e-commerce search endpoint |
| 13:40 | Insider download anomaly — engineer exfiltrating 12GB to personal drive flagged |
| 16:00 | Ransomware signature hit on sandboxed endpoint — contained, no propagation |
| 19:20 | C2 beaconing from a rogue IoT printer — quarantined |
| 23:55 | SIEM reports 1,204 alerts; 212 triaged; 3 escalated; 1 confirmed incident |

### The Kill Chain Overview (foreshadowing MITRE ATT&CK)

Adversaries generally follow a repeatable process (see section 7 for the full model):

```
Reconnaissance → Weaponization → Delivery → Exploitation → Installation
             → Command & Control → Actions on Objectives
```

### Convergence of Risks

Modern risk is no longer siloed. Cyber risk intersects with **operational risk, financial risk, supply-chain risk, physical risk, and geopolitical risk**. An attack on a cloud provider can take down thousands of downstream customers — a single compromised software update can touch millions of endpoints simultaneously (see *supply chain* in Section 5).

---

# 2. Core Security Objectives (CIA Triad)

The **CIA Triad** is the foundation of all information security. Every control, policy, and architecture decision ultimately supports one or more of these three objectives.

```
          ┌───────────────────────────┐
          │        AVAILABILITY      │
          │  System/data usable on   │
          │      demand, always      │
          └────────────┬─────────────┘
                       │
   CONFIDENTIALITY ────┼──── INTEGRITY
   Only authorized      │     Data is accurate &
   parties can read     │     unmodified by
   / access the data    │     unauthorized parties
```

## 2.1 Confidentiality

**Definition:** Ensuring that information is accessible only to those authorized to view it. Confidentiality preserves the *privacy* and *secrecy* of data.

**Real-world example:** A bank's customer database containing account balances and SSNs. Only account holders and authorized bank staff may view it.

**Violation scenario:** A misconfigured Amazon S3 bucket leaves 1.2M customer records publicly readable. An attacker (or a search bot) downloads all PII. Result: confidentiality breach.

**How to protect confidentiality:**

| Control | How it works |
|---------|--------------|
| Encryption at rest | AES-256 for stored data; lost disk = unreadable ciphertext |
| Encryption in transit | TLS 1.3 for all network flows |
| Access control | RBAC, least privilege, need-to-know |
| Data masking / tokenization | Mask PANs as `****-****-****-1234` |
| MFA | Prevents credential-only access |
| DLP (Data Loss Prevention) | Blocks emailing files with SSNs |
| Physical security | Locked server rooms, biometric access |

**Protection example (tokenization):**

```text
Original:  4111-1111-1111-1111
Tokenized: 6d7f2a9c-41be-4e91-9c22-3a1b0d9f72e4
```

## 2.2 Integrity

**Definition:** Ensuring that data is accurate, complete, and unmodified by unauthorized parties. Integrity also includes the *authenticity* of the data source and non-repudiation of actions (see §2.5).

**Real-world example:** A patient's prescription dosage in an EHR (Electronic Health Record). If altered, the patient could die.

**Violation scenario:** An attacker performs a **man-in-the-middle** attack on an employee connecting to a hotel Wi-Fi. The attacker injects a fake password-reset page that submits credentials to the attacker's server. Or: an attacker modifies a bank transfer amount from $1,000 to $100,000 mid-transaction. The transferred amount no longer matches the recorded amount.

**How to protect integrity:**

| Control | How it works |
|---------|--------------|
| Hashing | SHA-256 hash of a file; any change → hash mismatch |
| Digital signatures | Sign with private key; verify with public key |
| MAC / HMAC | Keyed hashes ensure message wasn't tampered with |
| Checksums / parity | Detect corruption in storage or transmission |
| Database constraints | Transactions, audit trails, immutable ledgers |
| File integrity monitoring (FIM) | Tripwire-style monitoring alerts on file changes |
| Version control & change management | Records who changed what, when |

**Integrity verification example:**

```bash
$ sha256sum config.xml
3b0f0a1f2d7f90bb1e5f92f1c1ac8f14f7c9c11c2a5e1d5b9d0e0a1b2c3d4e5f  config.xml

# After tampering:
$ sha256sum config.xml
7fa9d31bce42a8f6c49b0d17e2f8a3b0f6d9c42f11a0e9b8c7d6e5f4a3b2c1d0e  config.xml   <-- MISMATCH!
```

## 2.3 Availability

**Definition:** Ensuring that systems, services, and data are accessible to authorized users when needed. Availability is about **uptime, resilience, and continuity**.

**Real-world example:** An e-commerce checkout service. If it's down during Black Friday, the business loses revenue every second.

**Violation scenario:** A **Distributed Denial-of-Service (DDoS)** attack floods the public web server with 300 Gbps of garbage traffic. Legitimate users get "Service Unavailable." The site is down for 6 hours — a $4.2M revenue loss.

**How to protect availability:**

| Control | How it works |
|---------|--------------|
| Redundancy / failover | Multiple servers, active-passive or active-active clusters |
| Load balancing | Distribute traffic across many nodes |
| Backups & DR | RPO/RTO targets; tested restores |
| DDoS mitigation | Anycast, rate limiting, WAF, scrubbing centers |
| Capacity planning | Headroom for spikes |
| UPS & generators | Power continuity |
| Health monitoring | Alert on degradation before outage |
| Patch & change management | Prevents instability from bad changes |

**Availability metrics (RPO/RTO):**

| Metric | Definition | Mock Target |
|--------|-----------|-------------|
| **RPO** (Recovery Point Objective) | Maximum acceptable data loss | 15 minutes |
| **RTO** (Recovery Time Objective) | Maximum acceptable downtime | 4 hours |
| MTBF (Mean Time Between Failures) | Average time between failures | 5,000 hours |
| MTTR (Mean Time To Repair) | Average time to restore service | 45 minutes |
| SLA uptime | Contracted availability | 99.9% |

## 2.4 The AAA Model

Beyond CIA, the **AAA model** governs *identity and access*:

### Authentication (Who are you?)

Proving identity. Three categories ("factors"):

| Factor | Type | Examples |
|--------|------|----------|
| **Something you know** | Knowledge | Password, PIN, security question |
| **Something you have** | Possession | Smart card, phone (OTP), YubiKey |
| **Something you are** | Inherence | Fingerprint, face, iris, voice |

> **MFA** = using two or more factors. **2FA** = exactly two factors.
> Example: Password (know) + push notification to phone (have) = strong MFA.

**Mock MFA flow:**

```text
User: "jdoe" + password "D3f3nd#2026"
Auth Server: ✔ password valid
Auth Server: → push to registered device (iPhone 14, last seen 2m ago)
User: taps "Approve"
Auth Server: ✔ device possession confirmed
Auth Server: → session issued, TTL 15 min
```

### Authorization (What can you do?)

Determining the level of access once identity is proven. Implemented with:

- **DAC** — Discretionary Access Control (owner controls access; e.g., file permissions).
- **MAC** — Mandatory Access Control (system-enforced labels; e.g., TOP SECRET / SECRET / CONFIDENTIAL).
- **RBAC** — Role-Based Access Control (access by job role).
- **ABAC** — Attribute-Based Access Control (access by attributes: time, location, device, sensitivity).

**Mock RBAC matrix for "Acme Finance":**

| Role | View Salary | Approve Payments | Export Reports | Admin Users |
|------|:-----------:|:----------------:|:--------------:|:-----------:|
| HR Specialist | YES | NO | YES (own dept) | NO |
| Payroll Analyst | YES | NO | YES | NO |
| Finance Manager | NO | YES (limit $50k) | YES | NO |
| CFO | NO | YES (limit $5M) | YES | NO |
| IT Admin | NO | NO | NO | YES |

### Accounting (Audit/Accountability)

Tracking what users did — logs, audit trails, session records — to support forensics and non-repudiation.

**Mock audit log entry (a SIEM record):**

```json
{
  "event_id": "AUTH-99234",
  "timestamp": "2026-08-06T09:12:44.102Z",
  "user": "jdoe@acme.com",
  "source_ip": "10.22.4.91",
  "action": "LOGIN_SUCCESS",
  "auth_method": "PASSWORD_AND_MFA_PUSH",
  "resource": "hrms.acme.com",
  "session_id": "s_7f3a...9c21",
  "geo": "US-WA",
  "risk_score": 12
}
```

## 2.5 Non-Repudiation

**Definition:** Guaranteeing that a party cannot deny having performed an action or sent a message. Provides *proof of origin* and *proof of delivery*.

Achieved through **digital signatures** (private key signs, public key verifies) and **audit logs**.

**Example:** A contract is signed digitally. The signing entity cannot later claim "I never signed that" because the signature can be mathematically verified against their public key.

```bash
# Sign a document (Bob's private key)
openssl dgst -sha256 -sign bob_private.pem -out contract.sig contract.pdf

# Verify (anyone with Bob's public key)
openssl dgst -sha256 -verify bob_public.pem -signature contract.sig contract.pdf
Verified OK
```

---

# 3. The Security Mindset

Security professionals adopt a **defensive paranoia** — assuming failure and planning for it. This mindset is codified in the **Saltzer & Schroeder design principles** (1975), which remain the gold standard for secure system design.

## 3.1 Defense in Depth (Layered Defense)

Never rely on a single control. Layers ensure that if one control fails, others still protect the asset.

```
ATTACKER
   │
   ▼
┌───────────────────────────┐
│ L1  Perimeter (FW/NGFW)   │  ← blocks 70% of noise
├───────────────────────────┤
│ L2  Network (IDS/IPS)     │  ← inspects allowed traffic
├───────────────────────────┤
│ L3  Host (EDR/AV)         │  ← catches malware on endpoints
├───────────────────────────┤
│ L4  Application (WAF)     │  ← blocks app-layer attacks
├───────────────────────────┤
│ L5  Data (encryption/DLP) │  ← protects data even if exfiltrated
├───────────────────────────┤
│ L6  Human (awareness)     │  ← last line: the user
└───────────────────────────┘
```

**Example:** An email is the attack vector. Layered controls:
1. SPF/DKIM/DMARC blocks forged sender.
2. Antivirus scans the attachment.
3. Sandbox detonates the attachment in a VM.
4. The user's security-awareness training recognizes the red flags.
5. Even if clicked, EDR contains the malware and admin rights are restricted.

## 3.2 Least Privilege

Users, processes, and systems should have the **minimum permissions** needed to perform their function — no more.

**Example:** A helpdesk technician doesn't need domain-admin rights. Give them just enough to reset passwords and unlock accounts. A web server's service account should not be a local administrator.

**Least-privilege failure scenario:** An attacker compromises a web app. Because the app ran as `root`/`SYSTEM`, the attacker owns the entire server, pivots to the domain, and laterals to the entire network. If the app ran as an unprivileged user, the blast radius would be one process.

## 3.3 Fail-Safe Defaults

Access decisions should default to **deny**; the *default* state of a system must be secure. New accounts start locked-down; new services are closed by default.

**Examples:**
- Firewall default policy = **deny all**, allow specific flows.
- A router with no ACL allows everything — wrong. Default deny, then open only 443.
- New employee accounts created disabled until identity verified.
- Applications should not ship with default credentials (`admin/admin`).

## 3.4 Economy of Mechanism

Keep security mechanisms **simple, small, and easy to verify**. Complexity breeds bugs and hidden flaws.

**Example:** A 50-line firewall rule that is easy to review beats a 5,000-line rule set nobody understands. Simple encryption implementations with audited libraries beat hand-rolled crypto.

## 3.5 Complete Mediation

**Every** access to every object must be checked for authorization — every time. Caching results can lead to a permission bypass after a user's rights are revoked.

**Failure example:** An application caches an ACL check for an admin session. The user is demoted, but the cached "is_admin = true" persists until the cache expires. The demoted user retains admin rights — a complete-mediation failure.

## 3.6 Open Design

Security should not depend on the **secrecy of the design or implementation**. "Security through obscurity" is rejected — the security should rest in the keys, not the algorithm.

**Example:** Kerckhoffs's principle → a crypto algorithm (like AES) is publicly documented. Security relies on the secret *key*, not a secret algorithm. Proprietary, hidden algorithms are generally viewed with suspicion.

## 3.7 Separation of Duties

No single individual should be able to perform two conflicting functions. Prevents fraud and reduces error impact.

**Examples:**
- The person who *requests* a payment is not the person who *approves* it.
- The person who *writes* code does not *deploy* it to production.
- A DBA can read the DB but not change application logs; an auditor reviews both.

**Failure scenario (fraud):** A single employee can both create a vendor AND approve vendor payments. They create "Ghost Vendor Ltd." and approve a $200k payment to themselves.

## 3.8 Psychological Acceptability

Security mechanisms must be **easy to use** — if security is burdensome, users will circumvent it.

**Example:** Forcing a 40-character complex password rotated monthly leads users to write passwords on sticky notes. Better: long passphrases + MFA + password manager, minimizing friction. When MFA rollout added a single-tap push (vs. typing 6 digits), adoption rose from 41% to 96%.

## 3.9 Additional Modern Principles

| Principle | Meaning |
|-----------|---------|
| **Zero Trust** | Never trust, always verify (see §10) |
| **Privacy by Design** | Embed privacy into systems from the start |
| **Security by Default** | Secure configuration as the shipped default |
| **Secure by Design** | Security considered in architecture, not bolted on |
| **Assume Breach** | Design as if the attacker is already inside |
| **Blast Radius Reduction** | Limit the scope of a single compromise |
| **Immutable Infrastructure** | Replace, don't patch; nothing drifts |

---

# 4. Threats, Vulnerabilities, and Risks

## 4.1 Definitions and Differences

| Term | Definition | Mock Example |
|------|-----------|--------------|
| **Threat** | A potential cause of harm — an actor or event that could exploit a weakness | A ransomware group, a storm that kills power, a disgruntled employee |
| **Vulnerability** | A weakness or gap in a system that can be exploited | Unpatched CVE-2026-4421 in the VPN appliance; weak password policy |
| **Risk** | The likelihood that a threat exploits a vulnerability, times the impact | There is a HIGH risk the unpatched VPN is compromised with CRITICAL impact |
| **Threat Vector** | The path/means used to deliver the attack | Phishing email, USB drop, open port |
| **Exploit** | Actual code/technique that takes advantage of a vulnerability | The ransomware binary, a SQL injection payload |
| **Impact** | The damage if the risk materializes | $4.8M, 2 weeks downtime, 100k records leaked |

### The Relationship (visual)

```
THREAT  ───────►  exploits a VULNERABILITY  ───────►  damages ASSET  =  RISK
(attacker)          (weakness)                        (what we protect)
```

**Risk formula:**

```
              RISK = LIKELIHOOD × IMPACT

  where Likelihood = (Threat capability) × (Vulnerability exposure)
        Impact      = financial, operational, reputational, legal damage
```

## 4.2 The Risk Formula — Worked Mini-Example

| Factor | Assessment |
|--------|-----------|
| Asset | Public web server hosting customer portal |
| Vulnerability | CVE-2026-1001 — RCE in web framework, patch available, not applied |
| Threat | Internet-wide automated scanning bots; motivated attacker |
| Likelihood | **High (0.8)** — public-facing + known CVE + no patch |
| Impact | **Critical (1.0)** — full server compromise, PII exposure |
| **Risk** | **0.8 × 1.0 = 0.8 → HIGH RISK** |

> See Section 6 for the full formal quantitative treatment (SLE/ALE/ARO).

## 4.3 Threat Actor Taxonomy

Threat actors are categorized by **motivation, resources, and sophistication**. Understanding your adversaries dictates your defenses.

### Actor Categories

| Actor Type | Motivation | Resources | Sophistication | Typical Targets |
|------------|-----------|-----------|----------------|-----------------|
| **Script Kiddies** | Thrill, notoriety | Minimal | Low — copy-paste tools | Anyone; easy targets |
| **Hacktivists** | Political/social cause | Low–Moderate | Moderate | Governments, corporations with opposing views |
| **Cyber Criminals / Organized Crime** | Financial gain | High | High | Banks, healthcare, RaaS victims |
| **Nation-State Actors** | Espionage, geopolitics, sabotage | Extreme | Very High | Government, defense, critical infrastructure, tech |
| **Insider Threats** | Financial, revenge, espionage, accidental | Varies | Varies | Their own employer |
| **APTs (Advanced Persistent Threats)** | State or criminal, long-term espionage | Extreme | Very High | Strategic long-term intelligence |
| **Terrorists** | Ideology, disruption | Moderate | Moderate | Critical infrastructure, mass-disruption |
| **Cyberactivists / LulzSec-style groups** | Reputation, disruption | Low–Moderate | Moderate | High-profile brands |

### Mock Actor Profiles

**Profile 1 — Script Kiddie "xXdark_x_1337"**

```
Alias:          xXdark_x_1337
Age bracket:    15–18
Motivation:     Clout on Discord, "street cred"
Tooling:        Metasploit copy-paste, LOIC (DoS), cracked tools
Target:         School website, small shops, gaming servers
Capability:     Low — relies on tutorials, gives up when blocked
Signature:      Defacement pages, bragging on Telegram, amateur mistakes
```

**Profile 2 — Hacktivist "Epsilon Collective"**

```
Alias:          Epsilon Collective
Motivation:     Political protest (fictional: "Data Rights Now")
Tooling:        DDoS-for-hire, website defacement, doxxing
Target:         Fictional corp "MegaData Industries" over privacy stance
Capability:     Moderate — organized, media-savvy, decentralized
Signature:      Coordinated #OpDecentralize campaigns, leaked PDFs with logos
```

**Profile 3 — Organized Crime "Crimson Ransom Group (CRG)"**

```
Alias:          Crimson Ransom Group
Motivation:     Profit — RaaS affiliate model
Tooling:        Custom encryptor, leaked EDR evasion, dark-web leak site
Target:         Mid-size healthcare, manufacturing, MSPs
Capability:     High — professional ops, negotiators, media arm
Signature:      Double extortion (encrypt + leak), 72-hour negotiation window
Mock TTP:       Initial access via RDP brute-force or phishing → Cobalt Strike →
                lateral movement via PsExec → encrypt with .CRG extension
```

**Profile 4 — Nation-State "State Actor 'Volt Falcon'"**

```
Alias:          Volt Falcon (fictional attribution)
Motivation:     Strategic espionage, IP theft, infrastructure mapping
Tooling:        Custom implants, zero-day exploits, supply-chain ops
Target:         Defense contractors, semiconductor fabs, telecom
Capability:     Extreme — persistent, patient (years), well-funded
Signature:      Slow, low-noise data exfiltration; living off the land
```

**Profile 5 — Insider Threat "Maria (Accidental) / Tom (Malicious)"**

```
ACCIDENTAL (Maria — finance analyst):
  Event:       Forwarded "payroll summary.xlsx" to personal email for homework
  Cause:       Convenience, no malicious intent
  Impact:      42k records of PII on a personal device
  Control gap: DLP not covering personal webmail, no personal-device policy

MALICIOUS (Tom — ex-sysadmin):
  Event:       On final notice, Tom connected a USB drive and copied the
               AD user DB + backup encryption keys
  Cause:       Revenge after termination dispute
  Impact:      Credentials later sold; 3 domains compromised
  Control gap: No monitoring of privileged accounts, no USB control, slow offboarding
```

## 4.4 Vulnerability Severity (CVSS)

Vulnerabilities are scored using **CVSS** (Common Vulnerability Scoring System), 0.0–10.0.

| CVSS Score | Severity | Mock Example | Priority |
|-----------|----------|--------------|----------|
| 9.0–10.0 | Critical | CVE-2026-0001 — unauthenticated RCE in VPN (10.0) | Patch ≤ 24h |
| 7.0–8.9 | High | CVE-2026-1188 — SQLi in web portal (8.5) | Patch ≤ 7d |
| 4.0–6.9 | Medium | CVE-2026-2044 — XSS in admin console (6.1) | Patch ≤ 30d |
| 0.1–3.9 | Low | CVE-2026-3100 — info disclosure (3.7) | Patch ≤ 90d |

---

# 5. Attack Vectors & Threat Landscape

Attack vectors are the *paths* attackers use. A mature defender understands each vector, its typical lifecycle, and the controls that blunt it.

## 5.1 Malware

**Definition:** Malicious software designed to harm, exploit, or control systems.

| Type | What it does | Mock Example |
|------|--------------|--------------|
| **Virus** | Self-replicates by infecting files | Attachment "invoice.pdf.exe" infects Documents |
| **Worm** | Self-propagates across networks without user action | WORM spreads via SMB share in 20 minutes |
| **Trojan** | Disguised as legitimate software | Fake "Zoom_Installer.exe" |
| **Ransomware** | Encrypts data, demands payment | Files renamed `.crg`, ransom note in every folder |
| **Spyware** | Covertly observes and reports | Keylogger capturing passwords |
| **Adware** | Forced ads (annoying, low harm) | Pop-up bombardment |
| **Rootkit** | Hides itself and other malware deep in the OS | Kernel-level hook hides process list |
| **Botnet** | Enslaves machines for coordinated attacks | 40k bots ready to DDoS on command |
| **RAT** (Remote Access Trojan) | Gives attacker remote control | Attacker sees victim's screen, webcam |
| **Cryptominer** | Steals CPU/GPU to mine crypto | 85% CPU utilization overnight |
| **Wiper** | Destroys data (no ransom — pure destruction) | Database + backups zeroed |
| **Fileless Malware** | Runs in memory, leaves no file | PowerShell payload launched via macro |

### Malware Lifecycle (Mock)

```text
Phish email → user clicks → dropper downloads payload from stager domain
  → UAC bypass → executes in-memory → disables AV via AMSI patch
  → persists via registry Run key → beacons to C2 every 60s
  → exfiltrates data → encrypts files → self-deletes dropper
```

## 5.2 Phishing & Social Engineering

Social engineering exploits **human psychology**, not technology.

| Attack | Description | Mock Red Flags |
|--------|-------------|----------------|
| **Phishing** | Mass, generic deceptive emails | "Urgent", misspelled sender, fake login link |
| **Spear Phishing** | Targeted at a specific person | References their real project/manager |
| **Whaling** | Targets executives (CEO/CFO) | Fake CFO requests urgent wire transfer |
| **Smishing** | Phishing via SMS | "Your package is held — confirm here" |
| **Vishing** | Phishing via voice call | Fake "Microsoft support" asking for codes |
| **BEC** (Business Email Compromise) | Impersonated exec/partner for fraud | Domain lookalike: `acme-support.com` |
| **Quishing** | QR-code phishing | QR on a poster redirects to credential harvester |
| **Pretexting** | Fabricated scenario to gain info | Fake IT tech needs your MFA code |
| **Baiting** | Lure with physical temptation | USB drive labeled "Q3 Bonuses" left in parking lot |
| **Tailgating** | Following authorized person into a facility | Holding the door for someone "without a badge" |

### A Deconstructed Phishing Email (Mock)

```text
From:    "Accounting Dept" <accounting@acme-billing-2026.net>        ← spoofed domain
Reply-To: <verify@acme-billing-2026.net>                              ← hard redirect
Subject: URGENT: Invoice #45219 requires immediate approval

Dear Joseph,

Your invoice #45219 of $12,480.00 is past due.
Approve payment here within 24 hours to avoid a late fee:
   http://acme-billing-2026.net/Login/verify.php                         ← lookalike URL

— Accounting
```

**Detection tells:** mismatched sender domain (real is `acme.com`), urgency language, lookalike URL, generic greeting, attachment/inline login.

## 5.3 Denial of Service (DoS / DDoS)

| Type | Description | Mock Figure |
|------|-------------|-------------|
| **DoS** | Single source overwhelms target | 1 server floods another |
| **DDoS** | Many distributed sources | 500 Gbps from 200k-bot botnet |
| **Volumetric** | Saturates bandwidth | UDP amplification, SYN flood |
| **Protocol** | Exhausts server resources | Slowloris holds connections open |
| **Application-layer** | Overloads specific functions | 1M bogus login POSTs to `/login` |
| **RDoS** (Ransom DoS) | DDoS unless paid | "Pay 10 BTC or face 7 days of attacks" |

**Mock DDoS report summary:**

```text
Attack window:    2026-08-05 14:00 – 20:00 UTC (6h)
Peak volume:      642 Gbps / 78M pps
Vector mix:       62% UDP amplification (NTP/DNS), 25% SYN flood, 13% HTTP floods
Sources:          312,000 unique IPs across 54 countries
Impact:           portal downtime 41 min; mitigated by cloud scrubbing
Cost:             $830,000 revenue + $120,000 engineering effort
Mitigation:       Anycast + rate limiting + WAF rules + blackholing worst sources
```

## 5.4 Man-in-the-Middle (MITM)

Attacker secretly relays/alters communication between two parties who believe they talk directly.

| Variant | Description |
|---------|-------------|
| **Eavesdropping** | Passive listening on unencrypted traffic |
| **Session Hijacking** | Steals valid session cookie and impersonates user |
| **SSL Stripping** | Downgrades HTTPS to HTTP silently |
| **ARP Spoofing** | Attacker impersonates the gateway on a LAN |
| **Evil Twin Wi-Fi** | Fake access point with the same SSID |
| **DNS Spoofing** | Redirects a domain to attacker's IP |

**Mock evil-twin scenario:** Employee connects to "Starbucks_Guest" (evil twin). Attacker captures credentials sent in HTTP. Employee's bank login is replayed → account drained.

**Protection:** TLS everywhere, certificate pinning, HSTS, Wi-Fi with WPA2/3 + user verification, VPN for sensitive work, verify certificates.

## 5.5 Insider Threats

Insiders already have legitimate access — making them the hardest to stop. Categories: **malicious**, **accidental**, **negligent**, **compromised**.

| Type | Mock Scenario |
|------|---------------|
| Malicious | Terminated sysadmin exfiltrates keys before offboarding |
| Accidental | Analyst emails PII to wrong recipient |
| Negligent | Engineer leaves AWS keys in public GitHub repo |
| Compromised | Developer's laptop malware-steals their VPN + CI access |

**Controls:** least privilege, DLP, user/entity behavior analytics (UEBA), exit interviews, immediate offboarding, monitored privileged sessions, separation of duties.

## 5.6 Supply Chain Attacks

Attackers compromise a **trusted third party** to reach the ultimate victim. One compromise → thousands of victims.

**Fictional example timeline:**

```
Month 1:  Attackers breach small software vendor "Acme Widget Toolkit"
Month 2:  They inject malicious code into the vendor's update build pipeline
Month 3:  1,400 customer companies auto-update → receive backdoored widget.dll
Month 4:  Backdoor phones home; attackers use stolen vendor code-signing cert
Impact:   Hundreds of orgs compromised via a software they trusted
```

**Controls:** vendor risk assessments, SBOMs (Software Bill of Materials), code-signing verification, minimal trust in third-party updates, segmented integration environments, version pinning.

## 5.7 Zero-Days

**Zero-day vulnerability:** a flaw unknown to the vendor — no patch exists. "Day zero" = the day the vendor learns of it. Zero-days command high prices on dark-web markets.

| Category | Fictional Example | Mock Value |
|----------|-------------------|-----------|
| Browser RCE | Unpatched exploit in rendering engine | $250k–$1M |
| Mobile (iOS/Android) | Chain of 3 bugs for full device control | $500k–$2.5M |
| VPN/firewall RCE | Unauthenticated compromise of perimeter device | $1M–$4M |
| OS kernel LPE | Local privilege escalation to SYSTEM | $200k–$1M |

**Defense vs. zero-days (you can't patch what you don't know):** layered defense, EDR behavior detection, micro-segmentation, least privilege, sandboxing, reduced attack surface, threat intelligence, assume-breach mindset.

## 5.8 Other Notable Vectors

| Vector | Description |
|--------|-------------|
| **Credential stuffing** | Reuse of leaked username/password pairs across sites |
| **Password spraying** | Few common passwords against many accounts |
| **Brute force** | Exhaustive guessing (guarded by rate limiting) |
| **SQL injection** | Malicious SQL via input fields |
| **XSS** | Injecting client-side scripts into pages |
| **CSRF** | Forcing a logged-in user to submit an unwanted request |
| **SSRF** | Tricking the server into fetching internal resources |
| **RCE** | Executing arbitrary code on the server |
| **Privilege escalation** | Moving from low to high privileges |
| **Lateral movement** | Moving across the network after initial access |
| **IoT attacks** | Exploiting default creds on cameras/printers |
| **Cryptojacking** | Hijacking compute for mining |
| **Physical attacks** | Lock picking, badge theft, drive theft, dumpster diving |

---

# 6. Risk Management

Risk management is the systematic process of identifying, analyzing, evaluating, and treating risk to keep it within an organization's **risk appetite**.

## 6.1 The Risk Management Process (ISO 31005 / NIST SP 800-37 style)

```
 ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
 │ 1. IDENTIFY │ → │ 2. ANALYZE │ → │ 3. EVALUATE │ → │ 4. TREAT   │
 │ assets,     │   │ likelihood │   │ compare to  │   │ mitigate,  │
 │ threats,    │   │ & impact   │   │ risk appetite│  │ transfer,  │
 │ vulnerab.   │   │            │   │             │   │ accept,    │
 │             │   │            │   │             │   │ avoid      │
 └────────────┘   └────────────┘   └────────────┘   └────────────┘
        ▲                                                            │
        └────────────────── 5. MONITOR & REVIEW ◀────────────────────┘
```

### Step 1 — Identify

- **Assets:** servers, databases, applications, people, data, IP.
- **Threats:** actors and events (Section 4/5).
- **Vulnerabilities:** weaknesses (scanning, pentest, audit).
- **Controls in place:** what already protects assets.

### Step 2 — Analyze

Determine likelihood and impact for each risk. Can be **qualitative** (High/Medium/Low) or **quantitative** (dollar figures).

### Step 3 — Evaluate

Compare analyzed risk to the risk appetite/tolerance. Decide which risks need treatment now, later, or never.

### Step 4 — Treat

Choose the response (below).

### Step 5 — Monitor & Review

Risks change constantly. Reassess periodically and after major events.

## 6.2 Risk Treatment Options

| Option | Description | When to use | Mock Example |
|--------|-------------|-------------|--------------|
| **Mitigate** (Reduce) | Implement controls to lower likelihood/impact | When control cost < expected loss | Patch the VPN vulnerability (fix) |
| **Transfer** (Share) | Shift risk to a third party | When another party can absorb it | Buy cyber insurance |
| **Accept** | Acknowledge and budget for residual risk | When cost to treat > loss, or low impact | Accept risk of petty theft of public info |
| **Avoid** | Stop the activity that creates risk | When risk unacceptable and untreatable | Kill a risky legacy app; don't launch feature |

## 6.3 Qualitative vs Quantitative Risk Analysis

### Qualitative

Ranks risk using categories and expert judgment. Fast, intuitive, uses heatmaps.

| Likelihood ↓ / Impact → | Minor | Moderate | Major | Critical |
|------------------------|:-----:|:--------:|:-----:|:--------:|
| **Rare** | Low | Low | Medium | Medium |
| **Unlikely** | Low | Medium | Medium | High |
| **Possible** | Medium | Medium | High | High |
| **Likely** | Medium | High | High | Critical |
| **Almost Certain** | High | High | Critical | Critical |

**Qualitative assessment mock — e-commerce org:**

| Risk ID | Risk | Likelihood | Impact | Risk Level |
|---------|------|-----------|--------|-----------|
| R-01 | Ransomware on file server | Likely | Critical | **Critical** |
| R-02 | Phishing credential theft | Almost Certain | Major | **High** |
| R-03 | Cloud misconfiguration exposure | Possible | Major | High |
| R-04 | DDoS on checkout | Possible | Moderate | Medium |
| R-05 | Physical theft of laptops | Rare | Moderate | Low |

### Quantitative

Assigns monetary values using **ARO, SLE, ALE**, and more. Ideal for justifying budgets.

## 6.4 Full Worked Quantitative Example

**Scenario:** Organization operates a **public-facing web server** hosting the customer portal. We will assess the risk of the server being compromised via an unpatched RCE vulnerability.

### Step 1 — Asset Valuation (AV)

What is the server + its data worth? This includes revenue it generates, data it holds, and replacement cost.

| Component | Value |
|-----------|------:|
| Hardware/server replacement | $28,000 |
| Application + config rebuild | $95,000 |
| Data on server (PII for 180k customers) | $3,400,000 |
| Reputation/customer churn estimate | $620,000 |
| Regulatory exposure estimate | $180,000 |
| **Asset Value (AV)** | **$4,323,000** |

### Step 2 — Exposure Factor (EF)

What *fraction* of the asset would be lost in a single incident? Compromise of this server with PII exfiltration could realistically destroy ~40% of its value (data leaked + rebuild + fines).

```
EF = 0.40  (40% of asset value lost per incident)
```

### Step 3 — Single Loss Expectancy (SLE)

```
SLE = AV × EF
SLE = $4,323,000 × 0.40 = $1,729,200
```

### Step 4 — Annualized Rate of Occurrence (ARO)

How often is this expected to happen per year? Historical data + scanning noise suggests this class of server is hit with automated RCE attempts daily; a successful breach of a public web app happens, on average, once every 4 years.

```
ARO = 0.25  (once every 4 years)
```

### Step 5 — Annualized Loss Expectancy (ALE)

```
ALE = SLE × ARO
ALE = $1,729,200 × 0.25 = $432,300 per year
```

### Step 6 — Control ROI

The controls to fix this (patch program + WAF + segmented network + monitoring) cost $60,000/year.

```
Reduction in ALE after controls:  85%  →  new ALE = $432,300 × 0.15 = $64,845
Residual risk (ALE remaining):            $64,845
Control cost:                             $60,000
Net annual benefit:                       $432,300 − $64,845 − $60,000 = $307,455
ROI:                                      $307,455 / $60,000 ≈ 512%  →  JUSTIFIED
```

### Worked ALE table for the example environment

| Asset | AV | EF | SLE | ARO | ALE | Priority |
|-------|---:|---:|----:|----:|----:|:--------:|
| Customer portal (PII) | $4,323,000 | 0.40 | $1,729,200 | 0.25 | **$432,300** | 1 |
| Payment processing | $2,100,000 | 0.50 | $1,050,000 | 0.10 | $105,000 | 2 |
| Email/domain takeover | $950,000 | 0.30 | $285,000 | 0.33 | $94,050 | 3 |
| Dev source code theft | $1,500,000 | 0.15 | $225,000 | 0.20 | $45,000 | 4 |
| Internal file server | $640,000 | 0.25 | $160,000 | 0.10 | $16,000 | 5 |
| **Total** | | | | | **$692,350** | |

> Priority = highest ALE first. Spending decisions should target the top rows.

## 6.5 Residual vs Inherent Risk

| Risk Type | Definition |
|-----------|-----------|
| **Inherent risk** | Risk level before any controls |
| **Residual risk** | Risk level after controls are applied |
| **Control gap** | The difference — how much your controls actually reduce risk |
| **Risk appetite** | Amount of risk the org is willing to take |
| **Risk tolerance** | The acceptable deviation from appetite for a specific objective |

---

# 7. Security Frameworks & Models

Frameworks give structure: maturity models, control catalogs, and playbooks an organization can implement.

## 7.1 NIST Cybersecurity Framework (CSF 2.0)

A voluntary, risk-based framework organized into **six core functions**:

| Function | Description | Example Activities |
|----------|-------------|--------------------|
| **GOVERN** | Establish governance & strategy (added in 2.0) | Policy, risk appetite, roles, oversight |
| **IDENTIFY** | Understand assets, risks, and capabilities | Asset inventory, risk assessment, vendor mgmt |
| **PROTECT** | Implement safeguards | Access control, awareness training, data security, maintenance |
| **DETECT** | Find anomalies and events | Continuous monitoring, detection processes |
| **RESPOND** | Act on detected events | Incident response, mitigation, communication |
| **RECOVER** | Restore services after incidents | Recovery planning, improvements, communications |

**Mock CSF implementation profile (tier levels 1–4):**

| Domain | Current Tier | Target Tier | Mock Gap |
|--------|:------------:|:-----------:|----------|
| Asset inventory | 2 | 3 | Automated discovery missing |
| Vulnerability mgmt | 2 | 3 | No prioritized (CVSS+context) patching |
| Detection | 1 | 2 | SIEM deployed, no SOAR |
| Incident response | 2 | 3 | No tabletop exercises in 18 months |
| Business continuity | 1 | 2 | DR plan exists, never tested |

## 7.2 ISO/IEC 27001 (Information Security Management System)

A certification-based standard built on **Plan–Do–Check–Act (PDCA)**.

| ISO Clause | Covers |
|-----------|--------|
| 4–6 | Context, leadership, planning (risk assessment) |
| 7–8 | Support (resources, competence) & Operation (controls) |
| 9–10 | Performance evaluation, internal audit, improvement |

**Annex A controls grouped in 4 domains:**

| Domain | Example Controls (Annex A) |
|--------|-----------------------------|
| Organizational (A.5) | Policies, roles, asset mgmt, supplier security, incident mgmt |
| People (A.6) | Screening, awareness, disciplinary process |
| Physical (A.7) | Secure areas, equipment security, clear-desk policy |
| Technological (A.8) | User access, crypto, secure dev, network security, operations |

## 7.3 CIS Critical Security Controls (v8)

A prioritized set of 18 controls focused on the highest-value defensive actions.

| # | Control | Core Idea |
|---|---------|-----------|
| 1 | Inventory and Control of Enterprise Assets | Know every device |
| 2 | Inventory and Control of Software Assets | Know every app |
| 3 | Data Protection | Know & protect your data |
| 4 | Secure Configuration of Enterprise Assets & Software | Baseline hardened configs |
| 5 | Account Management | Control identities & access |
| 6 | Access Control Management | Enforce least privilege |
| 7 | Continuous Vulnerability Management | Scan, prioritize, patch |
| 8 | Audit Log Management | Collect & protect logs |
| 9 | Email and Web Browser Protections | Lock down the main attack surface |
| 10 | Malware Defenses | Prevent & contain malware |
| 11 | Data Recovery | Backups you can actually restore |
| 12 | Network Infrastructure Management | Harden network devices |
| 13 | Network Monitoring and Defense | Detect malicious activity |
| 14 | Security Awareness and Skills Training | Invest in people |
| 15 | Service Provider Management | Manage third-party risk |
| 16 | Application Software Security | Secure development lifecycle |
| 17 | Incident Response Management | Plan & rehearse response |
| 18 | Penetration Testing | Validate defenses empirically |

**Implementation groups (IG1/IG2/IG3)** scale these for small/large/regulated orgs.

## 7.4 MITRE ATT&CK®

A globally accessible knowledge base of adversary tactics and techniques based on real-world observations. Organized by **tactics (the "why") → techniques (the "how")**.

### Tactics (enterprise matrix — high level)

```
Initial Access → Execution → Persistence → Privilege Escalation
  → Defense Evasion → Credential Access → Discovery → Lateral Movement
  → Collection → Command & Control → Exfiltration → Impact
```

### Mock ATT&CK mapping — "Volt Falcon" intrusion

| Tactic | Technique ID | Technique (mock) | Fictional Evidence |
|--------|--------------|------------------|--------------------|
| Initial Access | T1190 | Exploit Public-Facing Application | CVE-2026-4421 on VPN |
| Execution | T1059.001 | PowerShell | `powershell -enc <blob>` |
| Persistence | T1547.001 | Registry Run Keys | `HKLM\...\Run\svchost_upd` |
| Privilege Escalation | T1068 | Exploitation for Privilege Escalation | UAC bypass / named-pipe |
| Defense Evasion | T1140 | Deobfuscate/Decode Files | base64 strings in memory |
| Credential Access | T1003.001 | LSASS Memory Dump | `procdump -ma lsass` |
| Discovery | T1082 | System Information Discovery | hostname, OS, AV checks |
| Lateral Movement | T1021.002 | SMB/Windows Admin Shares | PsExec to finance-01 |
| Collection | T1005 | Data from Local System | staged archives of .xlsx |
| C2 | T1071.001 | Web Protocols | HTTPS beaconing to `api.cdn-patch[.]net` |
| Exfiltration | T1048.003 | Exfil Over Unencrypted Non-C2 Protocol | staged zip → cloud storage via HTTPS |
| Impact | T1486 | Data Encrypted for Impact | `.crg` ransomware final stage |

## 7.5 OSI Security Layers (Purdue / OSI reference)

Network security controls map to OSI layers — know which controls live where.

| OSI Layer | Name | Security Concern | Example Control |
|:---------:|------|------------------|-----------------|
| 7 | Application | App vulnerabilities, injection | WAF, secure coding |
| 6 | Presentation | Encryption, encoding attacks | TLS, data validation |
| 5 | Session | Hijacking, session fixation | Secure cookies, session rotation |
| 4 | Transport | DoS, port scanning | Firewalls, TLS, rate limiting |
| 3 | Network | IP spoofing, routing attacks | ACLs, egress filtering, VPN |
| 2 | Data Link | ARP spoofing, VLAN hopping | Port security, 802.1X, VLANs |
| 1 | Physical | Theft, tapping, physical access | Locks, biometrics, cameras |

## 7.6 Other Models Worth Knowing

| Model | Purpose |
|-------|---------|
| **Cyber Kill Chain** (Lockheed Martin) | 7 stages of an intrusion (recon→actions) |
| **Diamond Model** | Analyzes intrusions via 4 vertices: adversary, victim, capability, infrastructure |
| **STRIDE** | Threat modeling (Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation) |
| **DREAD** | Risk scoring for threats (Damage, Reproducibility, Exploitability, Affected users, Discoverability) |
| **PASTA** | Process for Attack Simulation & Threat Analysis — risk-driven threat modeling |
| **OCTAVE** | Operationally Critical Threat, Asset, and Vulnerability Evaluation |
| **Zero Trust Maturity Model** | CISA/CACI progression for zero-trust adoption |

---

# 8. Security Domains (CISSP Domains)

The **CISSP (Certified Information Systems Security Professional)** organizes security into **8 domains** — the standard map of the profession.

| # | Domain | What It Covers |
|---|--------|----------------|
| 1 | **Security and Risk Management** | Confidentiality/integrity/availability, governance, compliance, BCP, ethics, security policies |
| 2 | **Asset Security** | Classification, ownership, privacy, retention, handling requirements |
| 3 | **Security Architecture and Engineering** | Secure design principles, cryptography, secure hardware/OS, models (Bell-LaPadula, Biba, Clark-Wilson) |
| 4 | **Communication and Network Security** | Secure network design, segmentation, protocols, secure channel (VPN/TLS) |
| 5 | **Identity and Access Management (IAM)** | Authentication, authorization, identity lifecycle, provisioning, federation |
| 6 | **Security Assessment and Testing** | Audits, vulnerability assessment, penetration testing, log review |
| 7 | **Security Operations** | Incident response, monitoring, investigations, disaster recovery, forensics |
| 8 | **Software Development Security** | Secure SDLC, OWASP, code review, DevOps security, software supply chain |

### Domain-by-Domain Mock Deliverable

| Domain | Mock Deliverable |
|--------|------------------|
| 1 | InfoSec policy handbook; risk register with 212 entries |
| 2 | Data classification schema; retention schedule (7yrs finance, 2yrs HR) |
| 3 | Zero-trust reference architecture; crypto standard (AES-256, RSA-3072, SHA-384) |
| 4 | Network diagram with DMZ, micro-segmented tiers, encrypted WAN links |
| 5 | Role catalog (240 roles), MFA rollout to 4,000 users, SSO via Okta |
| 6 | Quarterly pentest report; 3 audits/year; ASV scans |
| 7 | SOC 24/7, IR playbooks (14 scenarios), DR drills twice/year |
| 8 | SDLC gate: SAST/DAST mandatory; SBOM generated each release |

### Classic Security Models (for Domain 3)

| Model | Focus | Rule (mock-abstract) |
|-------|-------|----------------------|
| **Bell-LaPadula** | Confidentiality (MAC, military) | No read up, no write down |
| **Biba** | Integrity | No read down, no write up |
| **Clark-Wilson** | Integrity via transactions & separation of duties | Well-formed transactions; CDI/TP rule enforcement |
| **Brewer-Nash (Chinese Wall)** | Conflict of interest | No access to competing companies' data |
| **Goguen-Meseguer** | Non-interference | High users don't affect observable low-user behavior |

---

# 9. Security Controls

Controls are the concrete mechanisms that implement security. They're classified by **category** (how they work) and **type** (when they act).

## 9.1 Control Categories

| Category | Definition | Examples |
|----------|-----------|----------|
| **Administrative** | Policies, procedures, people-based | Security policy, awareness training, hiring screens, IR plan, risk assessments |
| **Technical (Logical)** | Hardware/software mechanisms | Firewalls, EDR, SIEM, MFA, encryption, IDS/IPS, WAF |
| **Physical** | Protecting physical assets & people | Locks, cameras, biometric access, guards, mantraps, secure disposal |

## 9.2 Control Types

| Type | When It Acts | Example |
|------|--------------|---------|
| **Preventative** | Stops the incident before it happens | Firewall rules, MFA, antivirus, access control |
| **Detective** | Discovers incidents after they start | SIEM alerts, IDS, logs, audits, FIM |
| **Corrective** | Restores systems after an incident | Backups, patching, quarantine & reimage, IR containment |
| **Deterrent** | Discourages attackers from trying | Warning banners, visible cameras, honeypots |
| **Compensating** | Alternative control when primary isn't feasible | Manual review compensating for a missing automated DLP; compensating control waiver |
| **Directive** | Guides behavior toward security | Policies, standards, procedures |
| **Recovery** | Returns to normal operations | DR plan, failover, restore from backup |

### The Control Lifecycle at a Glance

```text
PREVENTATIVE  ──► (attempt happens) ──► DETECTIVE  ──► (incident confirmed)
      ▲                                                       │
      │                                                       ▼
RECOVERY / CORRECTIVE  ◄──────────────────────────────── RESPONSE/IR
```

## 9.3 Control Selection Example

**Requirement:** Protect customer PII in a web application.

| Layer | Control | Category | Type |
|-------|---------|----------|------|
| Perimeter | WAF blocks SQLi/XSS | Technical | Preventative |
| Network | IPS inspects traffic | Technical | Preventative/Detective |
| Application | Parameterized queries, input validation | Technical | Preventative |
| Application | SAST in CI/CD pipeline | Technical | Detective |
| Data | AES-256 encryption at rest | Technical | Preventative |
| Data | DLP on outgoing email/upload | Technical | Detectative |
| Access | MFA + RBAC | Technical | Preventative |
| Human | Annual security awareness training | Administrative | Directive/Preventative |
| Physical | Locked server room + camera | Physical | Deterrent |
| Response | IR playbook for PII incidents | Administrative | Corrective |
| Recovery | Tested backup/restore | Technical | Recovery |

> A single requirement is satisfied by **defense in depth**: 10+ controls across all categories and types.

---

# 10. Security Architecture

Architecture is how you *arrange* controls and systems to make attack paths expensive and rare.

## 10.1 Zero Trust Model

**Core slogan:** *Never trust, always verify.* Assume no implicit trust based on network location.

### Zero Trust Pillars

| Pillar | Meaning | Mock Implementation |
|--------|---------|---------------------|
| **Identity** | Verify every identity, everywhere | Conditional-access MFA for every app |
| **Device** | Enforce device health | Only compliant/managed devices get access |
| **Network** | Encrypt & segment everything | Micro-segmentation, mTLS between services |
| **Application/Workload** | Least-privilege for apps | Per-app access policies |
| **Data** | Protect data itself | Encryption + DLP + data-centric security |
| **Visibility/Analytics** | Log, detect, respond | SIEM + UEBA + continuous validation |

### Continuous Verification Loop

```text
Request to access app → verify identity → verify device posture
  → verify context (time, geo, risk) → grant LEAST-PRIVILEGE access
  → session monitored → re-verify on anomaly → revoke on suspicion
```

## 10.2 Network Segmentation & the DMZ

### Segmentation

Dividing the network into zones with controlled inter-zone traffic — limits blast radius.

```
                ┌──────────────┐
                │  INTERNET    │
                └──────┬───────┘
                       │ (only 80/443 to DMZ)
                ┌──────▼───────┐
                │     DMZ      │  ← public web/app servers
                │   (semi-trust)│
                └──────┬───────┘
                       │ (restricted, e.g., only 1433 to DB, only 443 from WAF)
        ┌──────────────▼──────────────┐
        │  INTERNAL TRUSTED NETWORK   │
        │  corp users, apps           │
        └──────┬───────┬──────┬───────┘
               │       │      │
        ┌──────▼─┐ ┌───▼───┐ ┌▼───────────┐
        │  DB    │ │ Mgmt  │ │  SCADA/    │  ← highest sensitivity
        │  zone  │ │ zone  │ │  restricted│
        └────────┘ └───────┘ └────────────┘
```

**Key design rules:**
- Public servers live in the **DMZ**, never directly on the internal network.
- Database tier is reachable only from app tier on specific ports.
- Management plane (AD, SSH, patching) isolated from user traffic.
- East-west traffic between internal zones also filtered (micro-segmentation).

### DMZ Mock Rule Set (excerpt)

| Source | Dest | Port | Protocol | Purpose | Action |
|--------|------|------|----------|---------|--------|
| Internet | Web-WAF | 443 | TCP | Public HTTPS | ALLOW |
| Web-WAF | Web-App | 8080 | TCP | Internal forwarding | ALLOW |
| Web-App | DB-Cluster | 1433 | TCP | SQL queries | ALLOW (app-only account) |
| Internet | Anything (else) | Any | Any | Blocked by default | DENY |
| Web-App | Management | 22 | TCP | SSH | DENY (bastion only) |

## 10.3 Layered Architecture Reference (defense in depth stack)

| Layer | Components | Goal |
|-------|-----------|------|
| **Edge** | ISP, DNS, CDN, DDoS scrubbing | Absorb volumetric attacks |
| **Perimeter** | NGFW, WAF, VPN, IDS/IPS | Filter & inspect entry traffic |
| **Network core** | Segmentation, ACLs, VLANs, SASE | Constrain movement |
| **Host** | EDR, hardening, patch mgmt, HIPS | Harden each endpoint |
| **Application** | Secure SDLC, RASP, API gateway | Secure the logic |
| **Data** | Encryption, DLP, backups, KMS | Protect the crown jewels |
| **Identity** | IdP, MFA, PAM, SSO | Control who can do what |
| **Operations** | SIEM, SOAR, IR, threat intel | Detect & respond fast |

## 10.4 High-Availability & Resilience Architecture

- **Active/Active** — all nodes serve traffic (e.g., web tier, 3 nodes behind LB).
- **Active/Passive** — standby takes over on failure (e.g., DB cluster).
- **Multi-region** — replicate across geographic regions.
- **Immutable backup** — write-once backups resistant to ransomware.

---

# 11. Governance Basics

Security governance is the set of structures that direct and control security — policies set *what* must be done; standards/guidelines/procedures say *how*.

## 11.1 The Policy Hierarchy

```
                    ┌───────────────────────────┐
                    │      BOARD / EXECUTIVE     │
                    │   Strategic direction     │
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │        POLICY             │
                    │  "what" & "why" — high    │
                    │  level mandates           │
                    └────────────┬──────────────┘
                                 │
               ┌─────────────────┼─────────────────┐
               │                 │                 │
     ┌─────────▼─────────┐ ┌────▼────────┐ ┌───────▼────────┐
     │    STANDARDS      │ │ PROCEDURES  │ │   GUIDELINES   │
     │  "must, mandatory │ │ "step-by-   │ │  "should,      │
     │  requirements"    │ │ step how"   │ │  flexible how" │
     └─────────┬─────────┘ └────┬────────┘ └───────┬────────┘
               │                │                  │
               └────────────────┴──────────────────┘
                        BASELINES & CONFIGURATIONS
```

| Document | Binding | Answers | Mock Example |
|----------|:-------:|---------|--------------|
| **Policy** | Mandatory | WHAT & WHY | "Remote access requires MFA and approved VPN." |
| **Standard** | Mandatory | WHAT (specific requirements) | "All web servers must run TLS 1.3, disable TLS 1.0/1.1." |
| **Procedure** | Mandatory | HOW (steps) | "Step 1–6: how to onboard a user" |
| **Guideline** | Optional/recommended | HOW (suggested) | "Recommended: use passphrases of 4+ random words." |
| **Baseline** | Mandatory (config) | Concrete config state | CIS benchmark baseline applied to all Windows servers |

## 11.2 Sample Policy Document Structure

```markdown
# ACCESS CONTROL POLICY — ACME (FICTIONAL)
1. PURPOSE       — define access requirements to protect assets
2. SCOPE         — all employees, contractors, systems at ACME
3. POLICY
   3.1 All access granted on least-privilege & need-to-know
   3.2 MFA mandatory for all remote access and admin
   3.3 Access reviews conducted quarterly
   3.4 Terminations revoke access within 4 hours
4. RESPONSIBILITIES — owners, custodians, users, IT
5. COMPLIANCE    — violations → HR/disciplinary per handbook
6. RELATED DOCS  — Standard: IAM-MFA-STD-003; Procedure: ONB-PROC-011
7. REVIEW        — annual, owner: CISO
```

## 11.3 Data Classification

Data must be labeled so controls can match sensitivity.

### Mock Data Classification Table

| Classification | Definition | Examples | Security Controls |
|----------------|-----------|----------|-------------------|
| **Public** | No harm if disclosed | Marketing brochures, job postings | Minimal — availability over secrecy |
| **Internal** | Harm moderate if leaked | Org charts, internal wikis, HR policy docs | Access control, NDA |
| **Confidential** | Significant harm if leaked | Customer PII, contracts, financials | Encryption, RBAC, DLP, least privilege |
| **Restricted** | Severe/critical harm if leaked | M&A plans, source code, payment data, credentials | Encryption, air-gap, 2-person rule, monitoring |
| **Regulated** | Legal obligations apply | PHI (HIPAA), PANs (PCI DSS), EU citizen data (GDPR) | Compliance-mandated controls, breach reporting |

### Classification by Owner (mock data owner RACI)

| Data Asset | Owner | Custodian | Class | Retention |
|-----------|-------|-----------|:-----:|-----------|
| Customer PII | Privacy Officer | DBA | Confidential | 5 years |
| Payment card data | CFO | SecOps | Regulated | PCI scope |
| Employee records | HR Director | HRIS Admin | Confidential | 7 years |
| Marketing materials | CMO | Web Team | Public | Indefinite |
| Merger strategy deck | CEO | Exec Assistant | Restricted | 3 years / then destroy |

## 11.4 Security Governance Bodies (Mock)

| Body | Composition | Cadence | Mandate |
|------|-------------|---------|---------|
| **Board Risk Committee** | Independent directors | Quarterly | Oversee enterprise risk incl. cyber |
| **Executive Security Council** | CISO, CTO, CFO, CLO, COO | Monthly | Approve budget, appetite, major decisions |
| **Change Advisory Board (CAB)** | IT/security/ops | Weekly | Review security-impacting changes |
| **Incident Command** | SOC + comms + legal | On-call | Run high-severity incidents |

---

# 12. Security Roles & Responsibilities

> Full career roadmap is documented in the dedicated careers master file. This section is a brief orientation.

## 12.1 Roles Matrix

| Role | Typical Level | Core Responsibilities | Key Tools/Skills |
|------|--------------|-----------------------|------------------|
| **CISO** (Chief InfoSec Officer) | Executive | Strategy, budget, risk appetite, board reporting, compliance, culture | Risk mgmt, leadership, policy |
| **Security Director/Manager** | Senior | Program operations, team leadership, vendor mgmt, metrics | Management, audit |
| **Security Architect** | Senior/Expert | Design secure architectures, zero trust, reference models | Cloud, networks, threat modeling |
| **SOC Analyst (L1)** | Entry | Monitor alerts, triage, escalate, basic response | SIEM, case mgmt, OS basics |
| **SOC Analyst (L2/L3)** | Mid/Senior | Deep investigations, IR support, tuning rules | Forensics, MITRE, log analysis |
| **Incident Responder** | Mid/Senior | Contain/eradicate/recover during incidents | Forensics, DFIR, malware basics |
| **Threat Hunter** | Senior | Proactive hypothesis-driven hunting | EDR telemetry, MITRE ATT&CK |
| **Penetration Tester** | Mid/Senior | Authorized attacks to find weaknesses | Metasploit, Burp, Kali, scripting |
| **Red Teamer** | Senior | Full-scope adversary simulation | All offensive disciplines |
| **Blue Teamer** | Mid/Senior | Defensive operations, hardening | EDR, SIEM, firewall |
| **Purple Teamer** | Senior | Unify red+blue for continuous improvement | Both red & blue skills |
| **Security Engineer** | Mid | Build/automate controls, CI/CD security, IAM | Terraform, Python, cloud |
| **GRC Analyst** | Mid | Governance, risk, compliance, audits | NIST, ISO, compliance tools |
| **Security Auditor** | Mid | Independent assessments against standards | Audit, controls testing |
| **Forensic Analyst** | Senior | Evidence collection, analysis, reporting | EnCase/Autopsy, chain of custody |
| **DLP / IAM Specialist** | Mid | Data protection, identity lifecycle | SailPoint, DLP platforms |
| **Security Trainer/Awareness Lead** | Mid | Culture, phishing simulations, training | Awareness platforms |
| **CTI Analyst** (Cyber Threat Intelligence) | Mid | Adversary research, IOCs, reporting | OSINT, ATT&CK, intel platforms |

## 12.2 Mock Career Progression

```text
Level 1  Help Desk / Jr. SOC  (0–2 yrs)        $55k
Level 2  SOC Analyst / Jr. Engineer (2–4 yrs)  $85k
Level 3  Security Engineer / Pentester (4–7)   $125k
Level 4  Senior / Threat Hunter / Architect    $165k
Level 5  Manager / Lead                         $200k
Level 6  Director / CISO                       $250k+
```

## 12.3 The Blue Team / Red Team / Purple Team

| Team | Mission | Mindset |
|------|---------|---------|
| **Blue** | Defend, detect, respond | "Assume breach; protect the castle" |
| **Red** | Attack realistically (authorized) | "Break everything you're told to" |
| **Purple** | Red + Blue working together | "Continuous, measurable improvement" |

---

# 13. Glossary of 50+ Essential Terms

| # | Term | Definition |
|---|------|-----------|
| 1 | **Access Control** | Restricting access to resources based on policy (DAC/MAC/RBAC/ABAC) |
| 2 | **ACL (Access Control List)** | Rules defining who/what can access a resource |
| 3 | **ALE (Annualized Loss Expectancy)** | `SLE × ARO` — expected annual monetary loss |
| 4 | **APT (Advanced Persistent Threat)** | Sophisticated, long-term adversary operation |
| 5 | **ARO (Annualized Rate of Occurrence)** | Expected frequency of a loss event per year |
| 6 | **Asset** | Something of value that must be protected |
| 7 | **Asymmetric Encryption** | Public/private key pair encryption (e.g., RSA, ECC) |
| 8 | **Authentication** | Verifying claimed identity (see AAA) |
| 9 | **Authorization** | Granting verified users permission to resources |
| 10 | **Availability** | Ensuring data/services are accessible when needed (CIA) |
| 11 | **Botnet** | Network of compromised machines controlled remotely |
| 12 | **Brute Force** | Guessing credentials by trying many combinations |
| 13 | **CIA Triad** | Confidentiality, Integrity, Availability — core security goals |
| 14 | **CIS Controls** | Prioritized list of 18 essential security controls |
| 15 | **CISO** | Chief Information Security Officer — top security executive |
| 16 | **Confidentiality** | Restricting data access to authorized parties (CIA) |
| 17 | **CVE (Common Vulnerabilities and Exposures)** | Public catalog of known vulnerabilities |
| 18 | **CVSS** | Scoring system for vulnerability severity (0–10) |
| 19 | **C2 (Command and Control)** | Infrastructure used by attackers to control compromised hosts |
| 20 | **Defense in Depth** | Layered controls so one failure doesn't mean compromise |
| 21 | **DLP (Data Loss Prevention)** | Tools that detect/prevent data exfiltration |
| 22 | **DMZ** | Perimeter network hosting public-facing services |
| 23 | **DDoS (Distributed Denial of Service)** | Overwhelming a service via many sources |
| 24 | **EDR (Endpoint Detection and Response)** | Endpoint threat detection & response platform |
| 25 | **Encryption** | Transforming data so only key-holders can read it |
| 26 | **Exploit** | Code/technique that takes advantage of a vulnerability |
| 27 | **Exfiltration** | Unauthorized extraction of data from a network |
| 28 | **Firewall** | Device/filter that blocks/allows traffic by policy |
| 29 | **Hashing** | One-way function producing a fixed fingerprint of data |
| 30 | **Honeypot** | Decoy system designed to lure and study attackers |
| 31 | **IDS/IPS** | Intrusion Detection/Prevention System — monitors/blocks malicious traffic |
| 32 | **IoC (Indicator of Compromise)** | Evidence of intrusion (IP, hash, domain) |
| 33 | **Integrity** | Ensuring data is unmodified and authentic (CIA) |
| 34 | **IR (Incident Response)** | Process for handling security incidents |
| 35 | **ISO 27001** | International ISMS certification standard |
| 36 | **Least Privilege** | Granting only the minimum access required |
| 37 | **Lateral Movement** | Moving across the network after initial compromise |
| 38 | **Malware** | Malicious software (viruses, trojans, ransomware, etc.) |
| 39 | **MFA (Multi-Factor Authentication)** | Auth using two+ factors (know/have/are) |
| 40 | **MITM (Man-in-the-Middle)** | Attacker secretly relays/alters communications |
| 41 | **MITRE ATT&CK** | Knowledge base of adversary tactics & techniques |
| 42 | **Non-Repudiation** | Proof a party can't deny an action/message |
| 43 | **Patch Management** | Process of applying vendor fixes to systems |
| 44 | **Phishing** | Social engineering via deceptive messages/websites |
| 45 | **Ransomware** | Malware encrypting data and demanding payment |
| 46 | **RAT (Remote Access Trojan)** | Malware giving remote control of a host |
| 47 | **Risk** | `Likelihood × Impact` of a threat exploiting a vulnerability |
| 48 | **Risk Appetite** | Amount of risk an org is willing to accept |
| 49 | **RPO/RTO** | Recovery Point/Time Objective — DR targets |
| 50 | **Sandboxing** | Running untrusted code in an isolated environment |
| 51 | **SIEM (Security Information and Event Management)** | Aggregates & analyzes security logs/alerts |
| 52 | **SLE (Single Loss Expectancy)** | `AV × EF` — loss from a single incident |
| 53 | **Social Engineering** | Manipulating people into breaching security |
| 54 | **SOAR** | Orchestration/automation of security response |
| 55 | **Threat** | Potential cause of harm that could exploit a vulnerability |
| 56 | **Threat Intelligence** | Evidence-based knowledge about threats/actors |
| 57 | **TTP** | Tactics, Techniques, and Procedures of adversaries |
| 58 | **UEBA** | User/Entity Behavior Analytics — anomaly detection |
| 59 | **Vulnerability** | A weakness that can be exploited |
| 60 | **WAF (Web Application Firewall)** | Filters malicious web application traffic |
| 61 | **XSS (Cross-Site Scripting)** | Injecting client-side scripts into web pages |
| 62 | **Zero Day** | Vulnerability with no known patch/vendor fix |
| 63 | **Zero Trust** | "Never trust, always verify" security model |

---

## Appendix A — Recommended Learning Path (from this file)

1. Read **Sections 1–3** → build the conceptual foundation.
2. Study **Sections 4–5** → understand adversaries and attack paths.
3. Practice **Section 6** → run the worked SLE/ALE example on your own data.
4. Map **Section 7** frameworks to a real org (even a home lab).
5. Apply **Section 9–10** concepts when designing any system.
6. Use **Section 13** as a vocabulary checklist.

## Appendix B — Quick Reference Command Snippets (educational, lab use only)

```bash
# Verify integrity with hashes (Linux lab)
sha256sum important_config.txt

# Inspect listening ports
netstat -tulpn

# Scan a host with nmap (authorized lab only)
nmap -sV -sC 10.0.0.5

# Search a domain's SPF/DKIM/DMARC posture (defensive)
dig TXT acme.com SPF
```

---

*End of CYBERSECURITY_FOUNDATIONS_MASTER.md — Version 1.0.*
*All data fictional and for education. Next: see `INDEX.md` for the broader knowledge base.*
