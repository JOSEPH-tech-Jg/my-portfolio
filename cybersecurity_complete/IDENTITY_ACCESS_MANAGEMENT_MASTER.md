# Identity & Access Management (IAM) Master Reference

> **Document classification:** Internal — Security Engineering Reference
> **Version:** 1.0
> **Author:** Security Architecture Team
> **Last updated:** 2026-08-06
>
> **Disclaimer:** All companies, people, IP addresses, domains, phone numbers, account names, and data in this document are **fictional** and used solely for illustration. Any resemblance to real organizations is coincidental.

---

## Table of Contents

1. [IAM Fundamentals](#1-iam-fundamentals)
2. [Identity Types](#2-identity-types)
3. [Authentication](#3-authentication)
4. [Authorization Models](#4-authorization-models)
5. [Single Sign-On (SSO)](#5-single-sign-on-sso)
6. [Federation & Directories](#6-federation--directories)
7. [Privileged Access Management (PAM)](#7-privileged-access-management-pam)
8. [Service Accounts & Machine Identity](#8-service-accounts--machine-identity)
9. [Active Directory Security](#9-active-directory-security)
10. [Zero Trust Identity](#10-zero-trust-identity)
11. [Identity Governance](#11-identity-governance)
12. [Customer Identity & Access Management (CIAM)](#12-customer-identity--access-management-ciam)
13. [Identity Attacks & Defense](#13-identity-attacks--defense)
14. [IAM Implementation Checklist](#14-iam-implementation-checklist)
15. [Mock IAM Maturity Assessment](#15-mock-iam-maturity-assessment)

---

# 1. IAM Fundamentals

## 1.1 What is IAM?

**Identity and Access Management (IAM)** is the discipline and technology stack that ensures the **right people and machines** have the **right access** to the **right resources**, at the **right time**, for the **right reasons**, and that this access is **provable, revocable, and auditable**.

IAM answers three core questions for every access attempt:

| Question | IAM Component |
|---|---|
| **Who are you?** | Identity lifecycle & provisioning |
| **Prove it.** | Authentication |
| **What may you do?** | Authorization / policy engine |
| **What did you do?** | Auditing, logging, and governance |

IAM is no longer just "a directory of users and passwords." It is the enforcement plane for every application, API, cloud workload, and data store.

## 1.2 Identity vs. Access

| Term | Definition | Example |
|---|---|---|
| **Identity** | A unique representation of a person or machine with attributes that describe it | `jdoe@meridian-labs.com`, `SVC_AWS_BATCH01` |
| **Access** | The set of permissions/entitlements granted to that identity | Can read `s3://hr-payroll-2026`; can reset passwords in HR domain |
| **Authentication** | Proving the identity claim is genuine ("prove you are who you say you are") | Password + push approval |
| **Authorization** | Determining what the verified identity may do ("you may read, but not write") | RBAC role `PayrollAdmin` allows only read |
| **Auditing** | Recording who accessed what, when, from where, with what outcome | `05:12:03 UTC jdoe DENIED s3://hr-payroll-2026` |

An identity can exist without access (e.g., an employee on day one with an account but zero entitlements). Access without a verifiable identity (e.g., a shared generic account) is a severe control gap.

## 1.3 The IAM Lifecycle: Joiner / Mover / Leaver

The IAM lifecycle tracks an identity from creation to destruction. The acronym **JML** (joiner–mover–leaver) describes the three trigger states.

```
        +------------------+      +------------------+      +------------------+
        |   JOINER         |      |   MOVER          |      |   LEAVER         |
        |  (hire/hire)     |      |  (transfer/promo)|      |  (terminate/exit)|
        +------------------+      +------------------+      +------------------+
                 |                         |                         |
                 v                         v                         v
        +------------------+      +------------------+      +------------------+
        | Provision        |      | Re-provision     |      | De-provision     |
        | accounts, MFA,   |      | modify roles,    |      | revoke access,   |
        | roles, device    |      | transfer assets  |      | disable account, |
        |                 |      |                  |      | archive mailbox  |
        +------------------+      +------------------+      +------------------+
```

### Mock lifecycle event — JOINER

`HR Workday → EventBus → Identity Automation (SailPoint)`:

```json
{
  "eventType": "EMPLOYEE_ONBOARDED",
  "employee": {
    "employeeNumber": "EMP-204891",
    "firstName": "Priya",
    "lastName": "Natarajan",
    "email": "priya.natarajan@meridian-labs.com",
    "department": "Finance",
    "costCenter": "CC-0712",
    "location": "LON",
    "startDate": "2026-08-10",
    "manager": "r.brooks@meridian-labs.com",
    "employmentType": "PERMANENT",
    "country": "GB"
  }
}
```

Automated downstream actions:

```powershell
# Mock: provision identity in Entra ID + group memberships
New-MgUser -DisplayName "Priya Natarajan" -UserPrincipalName "priya.natarajan@meridian-labs.com" `
    -MailNickname "priya.natarajan" -PasswordProfile @{ForceChangePasswordNextSignIn=$true}

# Add to baseline groups
$Groups = @("grp-AllStaff", "grp-Finance", "grp-LondonSite", "grp-Finance-ReadOnly")
foreach ($g in $Groups) {
    Add-MgGroupMember -GroupId $g -DirectoryObjectId $newUserId
}

# Assign a device + MFA enrollment via policy (device trust requires MFA at first login)
```

### Mock lifecycle event — LEAVER (termination)

```powershell
# Mock: day-of-exit automation (triggered by HR TERMINATION event)
Disable-MgUser -UserId "priya.natarajan@meridian-labs.com"      # blocks sign-in
Revoke-MgUserAllRefreshToken -UserId "priya.natarajan@meridian-labs.com"
Remove-MgUserGroupMember -GroupId "grp-Finance-Admin" ...        # revoke privileged roles
# Mailbox retained per legal hold (7 years, UK)
# Asset owner reassigned to manager
# Account object soft-deleted, then hard-deleted after 90 days (retention policy)
```

**Common JML failures (and why they are critical):**

| Failure | Risk |
|---|---|
| Leaver account not disabled | Orphaned account → dormant backdoor |
| Mover retains old-department roles | Horizontal privilege accumulation |
| Joiner gets manager's entitlements via "like me" | Excessive privilege from day one |
| Contractor access persists after contract end | Shadow access outside compliance window |

## 1.4 IAM Architecture Components

```
                    +------------------------------------------------------+
                    |                  IAM CONTROL PLANE                     |
                    +------------------------------------------------------+
                                        |
         +------------+  +-------------+  +-------------+  +-------------+
         |  Directory |  | AuthN       |  | AuthZ       |  | Governance |
         |  (source   |  | (MFA, SSO,  |  | (RBAC/ABAC, |  | (reviews,  |
         |  of truth) |  | passkeys)   |  | policies)   |  | JML, SoD)  |
         +------------+  +-------------+  +-------------+  +-------------+
                                        |
                    +------------------------------------------------------+
                    |                 DATA / RESOURCE PLANE                 |
                    |  Apps · APIs · SaaS · Cloud (AWS/Azure/GCP) · Data    |
                    +------------------------------------------------------+
                                        |
                    +------------------------------------------------------+
                    |               AUDIT & DETECTION PLANE                 |
                    |  Logs · SIEM · UEBA · Threat Intel · Compliance       |
                    +------------------------------------------------------+
```

**Core architectural components:**

| Component | Purpose | Typical Products |
|---|---|---|
| **Identity Provider (IdP)** | Source of truth for identities and authenticates users | Entra ID, Okta, Ping Identity, Keycloak |
| **Directory service** | Stores identities, attributes, groups, policies | Active Directory, Entra ID, OpenLDAP |
| **Provisioning engine** | Automates account creation/modification/removal | SailPoint, Saviynt, Microsoft Identity Manager |
| **Access management** | AuthN + AuthZ for apps (SSO, MFA, policy) | Okta, Entra ID Conditional Access, Auth0 |
| **Privileged access (PAM)** | Manages admin/break-glass access, vaulting | CyberArk, BeyondTrust, Delinea, HashiCorp Vault |
| **Governance & administration (IGA)** | Reviews, certifications, SoD, role mining | SailPoint, Saviynt, One Identity |
| **Directory sync** | Syncs on-prem AD ↔ cloud IdP | Entra Connect / Microsoft Entra Cloud Sync |
| **SIEM / UEBA** | Detects identity anomalies and attacks | Microsoft Sentinel, Splunk, CrowdStrike Identity |

## 1.5 Why IAM Is Now the Security Perimeter

The traditional perimeter ("castle and moat" — firewalls, VPN, DMZ) is gone. Reasons:

1. **Cloud & SaaS** — data lives in AWS, Salesforce, GitHub, Microsoft 365 — not in your datacenter.
2. **Remote/hybrid work** — users connect from anywhere; the network no longer implies trust.
3. **Zero Trust** — "Never trust, always verify." Identity becomes the new firewall.
4. **API economy** — APIs are the new entry points; every API call carries a bearer token, not a network packet filter.
5. **Credential compromise is the #1 breach vector** — the Verizon DBIR consistently ranks credentials as the top attack action. An attacker with valid credentials bypasses every network control.
6. **M&A / contractor sprawl** — identities outnumber employees; non-employee access must be governed like employees.

> **Rule of thumb:** If you can't answer "who is `svc-synapse-prod` and why does it have `DCSync` rights?", you do not have IAM security — you have a password file.

---

# 2. Identity Types

## 2.1 Identity Taxonomy

```
                     IDENTITIES
                         |
        +----------------+----------------+----------------+----------------+
        |                |                |                |                |
   USER IDENTITIES  MACHINE/ NON-HUMAN  FEDERATED ID   PRIVILEGED ID
        |                |                |                |
   +----+-----+     +---------+----+     |                |
   |   |      |     |         |    |     |                |
Employee Contractor Customer Service   API Keys   Cloud    Federated   Admin  Break
                        Accounts                      Workload   users     Glass
```

## 2.2 User Identities

### Employees

- Fully managed in the HR-fed identity lifecycle (JML).
- Governed by employment contracts, data classification, and internal policy.
- Subject to continuous access reviews.

### Contractors / Third parties

- Time-boxed access (contract end date = account expiry).
- Approved by business + supplier security due diligence.
- Often federated from the partner's own IdP (see §6).

Mock contractor profile:

```json
{
  "identityType": "CONTRACTOR",
  "externalId": "CNT-88231",
  "vendor": "Globex Consulting LLP",
  "name": "Dmitri Volkov",
  "email": "d.volkov@globex-consulting.example",
  "fed": true,
  "start": "2026-09-01",
  "end": "2026-12-31",
  "maximumSensitivity": "INTERNAL",
  "requiresNDA": true,
  "mfaLevel": "PHISH_RESISTANT",
  "reviewer": "h.okafor@meridian-labs.com"
}
```

### Customers (see §12 CIAM)

- High volume, self-service, low-touch.
- Governed by consent, privacy law (GDPR/CCPA), and fraud controls.

## 2.3 Machine / Non-Human Identities

Non-human identities (NHIs) now outnumber human identities ~45:1 in large enterprises. They are **silent privileges** — they never sleep, never change passwords voluntarily, and are rarely reviewed.

### Service accounts

- Named after purpose, not a person: `svc-ad-sync`, `svc-api-gateway`, `SVC_AWS_BATCH01`.
- One-to-many risk: a single compromised service account can move laterally (e.g., account with `Replicate Directory Changes All` → DCSync).

### API keys & tokens

- Static secrets with long lifetimes. Stolen keys are hard to detect because usage looks "normal."

### Certificates

- x.509 identity for TLS mTLS, code signing, and device auth.

### Cloud workload identities

- AWS IAM Roles, Azure Managed Identities, GCP Service Accounts. Preferred over keys because they are **short-lived and rotated automatically**.

Mock workload identity (Azure):

```json
{
  "resourceId": "aks-prod-cluster-01",
  "identity": {
    "type": "UserAssignedManagedIdentity",
    "clientId": "23f4d1a8-9c10-4e5f-8a1b-2c3d4e5f6a7b",
    "resource": "app.meridian-labs.com"
  },
  "scopes": [
    "https://storage.azure.com/.default",
    "https://keyvault.azure.net/.default"
  ],
  "secretStorage": "WorkloadIdentityFederation (no static secrets)"
}
```

## 2.4 Federated Identities

- An identity **owned and managed by a third-party IdP** (work/school/Google/GitHub) that is trusted via a federation relationship (SAML/OIDC).
- No password stored in your directory — trust is delegated to the external IdP.
- Risks: trust in the external IdP's security posture, account takeovers there cascade in.

## 2.5 Privileged Identities

- Human and machine accounts with elevated rights: domain admins, enterprise admins, DBAs, cloud subscription owners, break-glass.
- Highest-value targets; **protected 24/7 by PAM** (§7).

| Privileged identity type | Example | Why it matters |
|---|---|---|
| Domain Admin (`DA`) | `MERIDIAN\administrator` | Full control of every joined computer |
| Enterprise Admin (`EA`) | `MERIDIAN\enterpriseadmins` | Root of the forest trust model |
| Cloud Owner/Contributor | `alice.admin@...` Azure Owner role | Deploy, modify, delete any resource |
| DBA | `MERIDIAN\dbadmin` | Read/write all databases including backups |
| Break-glass | `BG-ADM-01` (randomized creds) | Emergency access when IdP is down |
| Service account w/ admin rights | `svc-patching` | Often unwittingly Domain-Admin-equivalent |

---

# 3. Authentication

## 3.1 Authentication Factors

Authentication is proving a claimed identity. Factors fall into categories:

| Factor | Category | Examples | Strength | Notes |
|---|---|---|---|---|
| **Knowledge** | Something you **know** | Password, PIN, security question | Low–Medium | Most phishable, most reused |
| **Possession** | Something you **have** | Phone, hardware token, smartcard, passkey-bound device | Medium–High | Can be SIM-swapped/stolen |
| **Inherence** | Something you **are** | Fingerprint, face, iris, voice | Medium | Privacy concerns, can be spoofed |
| **Location** | Somewhere you **are** | Geolocation, trusted network, trusted device | Low (adjunct) | Used for risk scoring, not alone |
| **Behavior** | Something you **do** | Typing rhythm, mouse movement, gait | Medium | UEBA/continuous auth |

**MFA composition:** combine at least **two distinct categories**. Two passwords is not MFA. "Possession + knowledge" is the classic strong pair.

## 3.2 Password Security

### Password anatomy & cracking times (mock estimate, ~2026 hardware)

| Password | Entropy (bits) | Cracking time (GPU cluster, 10^11 guesses/s) |
|---|---|---|
| `Summer2026!` | ~28 | seconds–minutes |
| `Meridian2026` | ~35 | hours |
| `P@ssw0rd!` | ~30 | minutes (dictionary) |
| `correct horse battery staple` | ~44 | years |
| `X7#k2$mQ9!vP4z` | ~78 | billions of years |

### Password policy best practice (NIST SP 800-63B-aligned)

- **Length over complexity**: minimum 12–16 characters; complexity rules are less important.
- **Blocklist** breached/common passwords (e.g., Have I Been Pwned / Entra Password Protection).
- **No forced periodic rotation** for normal users (promotes weak new passwords) — except where mandated (PAM, after breach).
- **Allow paste** to support password managers.
- **Deny** common substitutions, username-in-password, sequential/repeated characters.
- **MFA mandatory** so passwords are only one factor.

Mock Entra ID password protection policy:

```json
{
  "passwordProtection": {
    "customBannedPasswords": [
      "Meridian2026", "Meridian123", "Summer2026!", "M3ridian!"
    ],
    "customBannedPasswordsProtectionState": "enforced",
    "policyMode": "enforced",
    "commonPasswordCheck": true,
    "minLength": 14
  }
}
```

## 3.3 Passkeys (Passwordless / FIDO2)

**Passkeys** replace passwords with **public-key cryptography**:

- The private key is bound to the user's device (phone/computer/security key).
- The public key lives with the relying party (app).
- Sign-in requires a **local gesture** (biometric or PIN) — so no password is ever sent, and nothing is phishable.

```
USER DEVICE                         RELYING PARTY (app)
  |-- private key (TPM/Secure Enclave) --|   |-- public key stored --|
  |                                      |   |                        |
  |<------ challenge ---------------------|   |                        |
  |-- gesture (biometric/PIN) ----------->|   |                        |
  |-- signed response ---------------------->|  verify signature with |
  |                                          |  public key -> AUTH OK  |
```

**Passkey advantages:** phishing-resistant, no shared secret to steal, resists replay/relay, works across passwordless + hardware key scenarios. Risks: device loss (need recovery), platform ecosystem lock-in, still requires a recovery story.

## 3.4 Multi-Factor Authentication (MFA)

### MFA types — security comparison table

| Method | Phish-resistance | User friction | Cost | Common attacks | Verdict |
|---|---|---|---|---|---|
| **SMS/voice OTP** | Low | Low | Low | SIM swap, SS7, phishing via fake login page | **Deprecate where possible** |
| **OTP app (TOTP)** | Medium | Medium | Free | Phishing for 6-digit code, token theft from device, MFA fatigue | Acceptable interim; not phish-resistant |
| **Email OTP** | Low | Low–Medium | Low | Mailbox compromise = factor compromise | Avoid for high-value |
| **Hardware OTP token (YubiKey OTP)** | Medium | Medium | Medium | Requires physical theft | Good for privileged |
| **Push approval** | Medium–High | Low | Low | **MFA fatigue bombing** (spam pushes) | Good but needs number matching |
| **FIDO2/WebAuthn (passkey)** | **High** | Medium | Medium | Very few (session attacks only) | **Gold standard** |
| **Smartcard/PIV (physical, PKI)** | High | High | High | Physical theft + PIN | Standard for gov/military |
| **Biometric (platform, e.g. Face ID)** | Medium–High | Low | Low | Photo/video spoof (less on secure enclaves), privacy | Good as passkey gesture |

> **Phish-resistant MFA ≠ MFA.** SMS OTP is MFA but is defeated by a convincing fake login page. If you must defend against phishing, use FIDO2 passkeys, PKI smartcards, or (minimally) TOTP + device-bound push with number matching.

### Mock MFA enrollment policy

```json
{
  "policy": "MFA Enrollment — Meridian Labs",
  "authenticationMethods": {
    "allowed": ["fido2", "microsoftAuthenticator", "hardwareOtp", "temporaryAccessPass"],
    "defaultForSignIn": ["fido2", "microsoftAuthenticator"],
    "sms": { "allowed": false },
    "emailOtp": { "allowed": false }
  },
  "enforcement": {
    "allUsersMustRegister": true,
    "gracePeriodDays": 14,
    "postEnrollmentVerification": true,
    "numberMatchingRequired": true,
    "maxPushAttemptsPerSession": 3,
    "proneToFatigueLockoutMinutes": 10
  },
  "exemptions": [],
  "exceptions": ["break-glass accounts (use hardware keys, never SMS)"]
}
```

## 3.5 Adaptive / Risk-Based Authentication (RBA)

RBA evaluates **signals** at login and adjusts the authentication burden:

| Signal | Risk indicator |
|---|---|
| Impossible travel (login in NY, 4 min later in London) | High |
| New device / new OS fingerprint | Medium |
| Failed password attempts / ATO indicators | High |
| Anonymous proxy / Tor / high-risk IP | High |
| Login from sanctioned country | High |
| Known device + known network + low-sensitivity app | Low |

### Mock Conditional Access policy (Entra ID)

```json
{
  "name": "CAP-RiskBased-Auth",
  "assignments": {
    "users": { "includeAll": true, "exclude": ["bg-admins"] },
    "targetResources": { "apps": ["all"] }
  },
  "conditions": {
    "signInRisk": { "levels": ["high"], "enabled": true },
    "userRisk": { "levels": ["high"], "enabled": true },
    "locations": { "includeCountries": ["KZ", "KP", "RU"], "excludedCountries": [] },
    "clientApps": { "blockLegacyAuth": true }
  },
  "grantControls": {
    "operator": "OR",
    "controls": ["RequirePhishResistantMFA", "RequireCompliantDevice"]
  },
  "sessionControls": {
    "signInFrequency": "1 hour per session for HIGH risk",
    "persistentBrowserSession": "never"
  },
  "access": "BLOCKED or step-up MFA"
}
```

**Risk-scored flow example:**

```
User: alice@meridian-labs.com
  signal: New device (iPad Pro), known geo (London), app = SalesForce (LOW sensitivity)
  risk score: 12/100 (LOW)   ->  Passwordless (passkey) only

User: bob@meridian-labs.com
  signal: Known laptop, geo = London, app = HRPayroll (HIGH sensitivity)
  risk score: 34/100 (MEDIUM) -> Passkey + step-up (TOTP)

User: eve@meridian-labs.com
  signal: Impossible travel, new device, Tor exit node, 5 failed attempts
  risk score: 89/100 (HIGH)   -> BLOCKED + admin alerted + user risk marked high
```

## 3.6 Common Authentication Attacks

### Credential stuffing

- **What:** Attacker replays username/password pairs leaked from another breach across many sites, relying on password reuse.
- **Mock scenario:** `breached@example.com : Winter2025!` tried against 1,200 accounts in Meridian SSO; 14 succeed because users reused the password.
- **Mitigations:** Password blocklists, MFA (blocks most stuffing), IP throttling/rate limiting, account lockout with alerts, credential monitoring (Entra Password Protection, HIBP for corp email).

### Phishing (incl. MFA phishing)

- **What:** Fake login page harvests credentials; advanced kits (Evilginx) proxy the session and relay OTP/passkeys in real time ("AiTM" — adversary in the middle).
- **Mock scenario:** User receives email "Your Meridian mailbox is full — verify now" linking to `meridian-labs.com.verify-now.example`. They enter password; attacker relays to the real IdP, completes MFA with the user, then uses the stolen session token.
- **Mitigations:** FIDO2 passkeys (defeat AiTM), DMARC/DKIM, URL filtering + browser security, security awareness, session binding (conditional access ties token to device), sign-in session duration limits.

### SIM swap

- **What:** Attacker social-engineers the mobile carrier to port the victim's number to an attacker SIM → receives SMS OTPs.
- **Mock scenario:** Victim's phone loses service at 3 AM; attacker logs into banking with username/password + SMS OTP now delivered to their SIM.
- **Mitigations:** Ban SMS OTP for high-value accounts; use hardware keys/authenticator apps; carrier-level number-change protections; monitor for SIM-swap indicators.

### Pass-the-hash (PtH)

- **What:** Attacker steals an **NTLM password hash** from memory (`mimikatz`/LSASS) and authenticates with the hash directly — no plaintext needed. (Also see §9.)
- **Mitigations:** Restrict/disable NTLM, use Kerberos with AES, protect LSASS (Credential Guard), tiered admin model, monitor `4624/4625` anomalous logons, eliminate local admin on end-user workstations.

---

# 4. Authorization Models

Authorization answers: **"Given a verified identity, what are they allowed to do?"** Models differ in who decides and how policy is expressed.

## 4.1 Discretionary Access Control (DAC)

- **Owner** of an object decides who may access it (e.g., Unix file permissions, NTFS owner).
- **Pros:** Flexible, quick. **Cons:** Central policy is weak; owners may grant too much; no system-wide consistency.
- **Example:** `alice` owns `report.xlsx` and grants read to `bob`.

## 4.2 Mandatory Access Control (MAC)

- Access is decided by **security labels/clearances** (e.g., TOP SECRET / SECRET / CONFIDENTIAL), enforced by the system, not the owner.
- **Example (SELinux/MLS):** Process labeled `httpd_t` cannot read file labeled `finance_data_t` regardless of Unix permissions.
- **Pros:** Strong, tamper-resistant. **Cons:** Complex to administer, poor fit for business agility.

## 4.3 Role-Based Access Control (RBAC) — the workhorse

Permissions are grouped into **roles**; users get roles; roles get permissions. (NIST INCITS 359 RBAC.)

```
USER ----inherits----> ROLE ----grants----> PERMISSION ----on----> RESOURCE
```

### Mock RBAC role definitions (YAML)

```yaml
roles:
  - name: FIN-PAYROLL-ADMIN
    description: "Manage payroll batch runs and pay data (segregated from hire/fire)"
    permissions:
      - payroll:batch:run
      - payroll:payrun:approve
      - payroll:read-sensitive
    scope: "CC-0712"
    sod: ["HR-HIRE-FIRE"]                # cannot hold with HR-HIRE-FIRE
  - name: FIN-PAYROLL-VIEWER
    permissions: [payroll:read]
    scope: "CC-0712"
  - name: HR-HIRE-FIRE
    permissions: [hr:hire, hr:fire, hr:contract:sign]
    sod: ["FIN-PAYROLL-ADMIN"]
  - name: IT-SEC-READONLY
    permissions: [soc:read-alerts, ad:read-audit]
```

### RBAC principles

- **Least privilege:** grant only what the job needs.
- **Separation of duties (SoD):** conflicting roles (e.g., requisitioner vs. approver) must not coexist.
- **Role explosion:** too many fine-grained roles become unmanageable → use role mining (§11) and composite roles.

## 4.4 Attribute-Based Access Control (ABAC)

Access decisions use **attributes** of subject, resource, action, and context — evaluated by a policy engine (XACML-style: PEP → PDP → PAP → PIP).

### Mock ABAC policy (JSON — XACML-inspired)

```json
{
  "policyId": "POL-PAYROLL-READ",
  "rule": "deny-unless-permit",
  "target": {
    "resource": "urn:meridian:payroll:records"
  },
  "conditions": [
    {
      "effect": "permit",
      "subject": {
        "department": "Finance",
        "employeeStatus": "active"
      },
      "action": { "name": "read" },
      "resource": {
        "classification": ["INTERNAL", "CONFIDENTIAL"]
      },
      "context": {
        "network": "trusted",
        "mfaLevel": ["phishResistant", "strong"],
        "device": "compliant",
        "time": { "within": "00:00-23:59" },
        "geo": { "allowedCountries": ["GB", "US", "DE", "NL"] }
      }
    }
  ]
}
```

**ABAC vs RBAC:** ABAC is finer-grained and context-aware (geo, time, device) but harder to audit and model. Many enterprises use **RBAC + ABAC overlay** (roles for structure, attributes for conditions).

## 4.5 Policy-Based / PBAC

- Superset of ABAC; policies can include **risk, consent, and delegated administration**.
- Enforced via a policy engine (OPA, Cedar, AWS Verified Permissions) often written as Rego/Cedar.

Mock Cedar-style policy (AWS Verified Permissions):

```cedar
permit (
    principal in Meridian::Group::"FinancePayroll",
    action in [Payroll::Action::"Read", Payroll::Action::"Approve"],
    resource in Meridian::Application::"Payroll"
)
when {
    context.request_ip in trusted_networks &&
    context.authentication.mfa == "phishResistant"
};
```

## 4.6 Model Comparison Table

| Criterion | DAC | MAC | RBAC | ABAC / PBAC |
|---|---|---|---|---|
| Who sets policy | Object owner | System/administrator | Central admin (role definitions) | Policy engine / attributes |
| Granularity | Per object | Per label | Per role | Per attribute combination |
| Scale | Poor | Poor | Good | Excellent |
| Admin overhead | Low | Very high | Medium | High (policy authoring) |
| Dynamic context (geo, time, risk) | No | No | Limited | Yes |
| Auditability | Weak | Strong | Medium | Strong |
| Typical use | Files, shared drives | Gov/military, Linux MLS | Enterprise apps, IGA | Cloud, APIs, IoT, zero trust |

## 4.7 Authorization Attacks

### Privilege escalation

- **What:** Gaining more rights than intended — vertical (user → admin) or horizontal (user A → user B).
- **Mock:** Attacker exploits a vulnerable role API: `PUT /api/v1/roles/100/members` with a crafted `groupId` to add themselves to `Domain Admins` because the API lacks server-side authorization (only UI hid the button).
- **Defense:** Server-side authorization on every endpoint, RBAC/ABAC policy checks, PIM/PAM for elevated roles, API security testing.

### Insecure Direct Object References (IDOR)

- **What:** App exposes object IDs in URLs; attacker changes the ID to access others' data.
- **Mock:** Invoice app uses sequential IDs: `GET /invoices/10482`. User changes to `GET /invoices/10481` and reads another customer's invoice because the endpoint never checks ownership.
- **Defense:** Ownership checks (authorization per object), opaque/UUID identifiers, tenant isolation, automated DAST scans for IDOR patterns.

### Broken access control

- **What:** Misconfigured or absent access control (verb tampering, missing authorization on "hidden" endpoints, CORS misconfig).
- **Mock:** Admin-only function `POST /api/admin/exportUsers` accessible without a session because the app only hides the menu item.
- **Defense:** Default-deny authorization middleware, enforced method checks, security headers, penetration testing.

---

# 5. Single Sign-On (SSO)

## 5.1 What SSO Is

SSO lets a user authenticate **once** to an Identity Provider (IdP) and then access many applications without re-authenticating. It centralizes authentication, MFA, and lifecycle management.

## 5.2 SSO Protocols

### SAML 2.0 (Security Assertion Markup Language)

- XML-based, **browser redirect** flow, uses signed **assertions**.
- Primary for **enterprise SSO** into legacy/SaaS apps.

### OAuth 2.0

- **Delegated authorization** framework — grants scoped access to resources *without sharing credentials* (e.g., "app may read my calendar").
- Issues **access tokens**; not an identity protocol by itself.

### OpenID Connect (OIDC)

- Identity layer **on top of OAuth 2.0**. Adds an **ID token** (JWT) containing the user's identity claims.
- Modern default for web/mobile/cloud identity.

| Protocol | Purpose | Token format | Flows |
|---|---|---|---|
| SAML 2.0 | AuthN + attributes between IdP & SP | XML assertion (signed) | Redirect/POST binding |
| OAuth 2.0 | Authorization (delegation, scopes) | Opaque or JWT access token | Authorization code, client credentials, PKCE |
| OIDC | Identity on top of OAuth2 | JWT ID token (+ OAuth access token) | Authorization code + PKCE, implicit (deprecated) |

## 5.3 How SSO Works — text flow diagrams

### SAML redirect flow (SP-initiated)

```
1. User clicks "Sign in" on app (Service Provider, SP)
2. SP redirects browser to IdP: https://idp.example/sso/saml?RelayState=...
3. User authenticates at IdP (+ MFA as policy requires)
4. IdP redirects browser back to SP AssertionConsumerService URL,
   carrying a signed SAML assertion
5. SP validates signature, extracts attributes, creates local session
6. User is signed in. No password was ever shared with the SP.
```

```
[USER/BROWSER] --1. click sign-in--> [SP: Salesforce]
       <--2. 302 to IdP URL---        |
       --3. auth + MFA--> [IdP: Okta] |
       <--4. 302 w/ SAML Assertion---
       --5. POST assertion to SP ACS-->|
```

### OIDC authorization code + PKCE flow (mobile/SPA)

```
1. App requests auth:  https://idp.example/oauth2/authorize?
                        response_type=code&
                        client_id=web-app&
                        redirect_uri=https://app.example/cb&
                        code_challenge=<sha256(verifier)>&
                        scope=openid profile email
2. User authenticates + consents
3. IdP redirects to app with ?code=<authcode>&state=...
4. App exchanges code for tokens:
   POST https://idp.example/oauth2/token
      grant_type=authorization_code&code=...&code_verifier=...
5. IdP returns:
   { "access_token": "eyJ...", "id_token": "eyJ...", "refresh_token": "..." }
6. App validates id_token signature, decodes claims, session established
```

## 5.4 Mock SAML Assertion (XML)

```xml
<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                ID="_c96f2c0d-2f6f-4c8f-9e2a-4a4a4a4a4a4a"
                Version="2.0" IssueInstant="2026-08-06T09:30:00Z"
                Destination="https://salesforce.meridian-labs.com/acs">
  <saml:Issuer>https://idp.meridian-labs.com</saml:Issuer>
  <samlp:Status>
    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
  </samlp:Status>
  <saml:Assertion ID="_a1b2c3d4e5f6" Version="2.0"
                  IssueInstant="2026-08-06T09:30:00Z">
    <saml:Issuer>https://idp.meridian-labs.com</saml:Issuer>
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
      <ds:SignedInfo>
        <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
        <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
        <ds:Reference URI="#_a1b2c3d4e5f6"/>
      </ds:SignedInfo>
      <!-- base64 RSA-SHA256 signature over the assertion -->
    </ds:Signature>
    <saml:Subject>
      <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
        alice.morgan@meridian-labs.com
      </saml:NameID>
      <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
        <saml:SubjectConfirmationData NotOnOrAfter="2026-08-06T09:35:00Z"
                                      Recipient="https://salesforce.meridian-labs.com/acs"
                                      InResponseTo="_rqst_9941"/>
      </saml:SubjectConfirmation>
    </saml:Subject>
    <saml:Conditions NotBefore="2026-08-06T09:29:30Z"
                     NotOnOrAfter="2026-08-06T09:35:00Z">
      <saml:AudienceRestriction>
        <saml:Audience>https://salesforce.meridian-labs.com</saml:Audience>
      </saml:AudienceRestriction>
    </saml:Conditions>
    <saml:AuthnStatement AuthnInstant="2026-08-06T09:30:00Z">
      <saml:AuthnContext>
        <saml:AuthnContextClassRef>
          urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
        </saml:AuthnContextClassRef>
      </saml:AuthnContext>
    </saml:AuthnStatement>
    <saml:AttributeStatement>
      <saml:Attribute Name="email">
        <saml:AttributeValue>alice.morgan@meridian-labs.com</saml:AttributeValue>
      </saml:Attribute>
      <saml:Attribute Name="department">
        <saml:AttributeValue>Marketing</saml:AttributeValue>
      </saml:Attribute>
      <saml:Attribute Name="groups">
        <saml:AttributeValue>Marketing-All</saml:AttributeValue>
        <saml:AttributeValue>Brand-Approvers</saml:AttributeValue>
      </saml:Attribute>
      <saml:Attribute Name="mfaMethod">
        <saml:AttributeValue>webauthn-passkey</saml:AttributeValue>
      </saml:Attribute>
    </saml:AttributeStatement>
  </saml:Assertion>
</samlp:Response>
```

**Note:** The assertion is **signed** (never share unsigned test assertions in production), has a short `NotOnOrAfter` lifetime, an audience restriction, and carries only the attributes the SP needs.

## 5.5 OIDC Tokens

### Decoded ID token (JWT payload)

```json
{
  "iss": "https://idp.meridian-labs.com",
  "sub": "904c2f0a-1b23-4c5d-9e01-abcdef012345",
  "aud": "web-app-meridian",
  "exp": 1754527800,
  "iat": 1754524200,
  "nonce": "n-0S6_WzA2Mj",
  "auth_time": 1754524187,
  "acr": "urn:meridian:acr:phishresistant",
  "amr": ["webauthn", "swk"],
  "email": "alice.morgan@meridian-labs.com",
  "email_verified": true,
  "preferred_username": "alice.morgan",
  "groups": ["Marketing-All", "Brand-Approvers"],
  "roles": ["brand-approver"],
  "sid": "9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d"
}
```

### OIDC token security rules

- Validate **signature, issuer, audience, expiry, nonce**.
- Keep access tokens out of URLs; use Authorization headers.
- Use **PKCE** on all public clients.
- Short access-token lifetimes; refresh tokens bound to device/session (token binding); rotate refresh tokens.
- Bind `sid` to server-side session to enable instant revocation.

## 5.6 SSO Benefits & Risks

| Benefit | Risk (and mitigation) |
|---|---|
| One credential set → fewer passwords to phish/reuse | **Single point of compromise** → enforce MFA + risk-based auth at the IdP |
| Central MFA & policy enforcement | IdP outage = mass outage → high-availability design, break-glass (§7.6) |
| Faster onboarding, fewer password resets | **Session token theft** = broad access → short sessions, token binding, device trust |
| Better audit trail (single auth log) | Overly long sessions → sign-in frequency controls |
| Reduces shadow IT (unmanaged apps) | Misconfigured SP trust = phishing door → strict app catalog + certificate pinning/metadata validation |

## 5.7 SSO Implementation Best Practices

1. **One IdP as source of trust** — federate the rest to it (avoid 15 disjoint SSO tools).
2. **Enforce MFA at the IdP**, not per-app.
3. **Validate SAML metadata & certificates**; never accept unsigned assertions.
4. **Use OIDC + PKCE for new apps**; SAML only for legacy/SaaS integration.
5. **Scoped claims** — send only attributes the SP needs (least disclosure).
6. **Short token lifetimes + session policies** tied to risk.
7. **App catalog governance** — who may add an SP; review trust relationships regularly.
8. **Monitor** IdP sign-in logs in SIEM; alert on new SP registration, new MFA method, impossible travel.
9. **Plan for IdP failure**: break-glass, local fallback auth, documented playbook.
10. **Certificate rotation automation** for signing certs (avoid last-minute expiry emergencies).

---

# 6. Federation & Directories

## 6.1 Active Directory (on-premises)

### Directory objects

| Object class | Purpose |
|---|---|
| `user` | Person or some service accounts |
| `computer` | Domain-joined workstation/server identity |
| `group` | Security groups (authz) / distribution groups (mail) |
| `OU` (Organizational Unit) | Container for delegation + GPO scope |
| `gmsa` / `msDS-GroupManagedServiceAccount` | Machine identity with auto-rotating passwords |
| `trustedDomain` | Trust to another domain/forest |
| `serviceConnectionPoint` | Service advertisement |

### Domain & forest model

```
FOREST: meridian.local
 ├─ DOMAIN: meridian.local (root)
 │   ├─ OU: Users, OU: Computers, OU: Servers, OU: ServiceAccounts
 │   └─ Trusts: (implicit, bidirectional parent-child)
 ├─ DOMAIN: corp.meridian.local
 └─ DOMAIN: eu.meridian.local
        └─ EXTERNAL TRUST → acme-eu.local (partner, selective auth)
```

- **Domain** = replication boundary + security boundary (GPO, admin scope).
- **Forest** = outermost security boundary — contains domains sharing a **schema, GC catalog, and configuration**.
- **Trusts** = authentication paths between domains/forests; can be **transitive** (flow through) or **explicit**, one-way or two-way, and support **selective authentication**.

### Kerberos — how AD authentication actually works

```
1. User authenticates to KDC (Domain Controller) with password hash
2. KDC returns a TGT (Ticket Granting Ticket) — encrypted with KDC's key,
   contains the user's Session Key (SK_TGT) — and user's copy of SK_TGT
3. To reach a service (e.g., file share), user presents TGT to KDC + requests a TGS
4. KDC returns a Service Ticket encrypted with the SERVICE's long-term key,
   containing the user's SK_Service
5. User presents Service Ticket to the service
6. Service decrypts it (it has its own key), authenticates the user, both
   use SK_Service for the session
```

```
[USER] --AS-REQ (name + timestamp/authenticator)--> [KDC]
[USER] <--AS-REP (TGT + session key)---------------- [KDC]
[USER] --TGS-REQ (TGT, SPN=service)---------------> [KDC]
[USER] <--TGS-REP (Service Ticket)----------------- [KDC]
[USER] --Service Ticket + Authenticator-----------> [SERVICE]
```

Kerberos is **ticket-based and password-free at the service tier** (no password sent after AS-REQ). Its weakness: tickets are reusable; if an attacker extracts a **TGT** or **service ticket** from memory, they can replay it (→ golden/silver tickets, §9.1.6/9.1.7).

### AD replication & DCSync relevance

Domain Controllers replicate directory changes using `Replicate Directory Changes All` rights. The `DRSUAPI` protocol (`DsGetNCChanges`) allows any account with that right to **pull password hashes for any user** — this is the **DCSync** attack (see §9.1.3). Kerberos itself only proves identity; **authorization still relies on group membership evaluated at the resource**.

## 6.2 Entra ID (formerly Azure AD)

- Cloud-native IdP; **not a domain controller**. No Kerberos/Kerberoasting surface in the same way.
- Identity model: **Users, Groups, Service Principals, Managed Identities, Devices**.
- Features: Conditional Access, PIM (privileged identity management), identity protection/risk detection, app gallery SSO, B2B/B2C.

**Hybrid identity options:**

| Option | Description | Best for |
|---|---|---|
| **Entra Connect (synchronization)** | Syncs on-prem AD → Entra ID incl. password hashes (PHS) or pass-through auth (PTA) | Existing AD estate, most common |
| **Entra Cloud Sync** | Lightweight agent-based sync for subsets (M&A, departmental) | Disconnected ADs, quick wins |
| **Federation (AD FS)** | On-prem AD FS as IdP for Entra ID sign-in | Legacy apps requiring AD FS, existing federation |
| **Cloud-only** | No on-prem AD; identities born in Entra | Net-new cloud-first orgs |

### Password Hash Sync — why it matters

PHS synchronizes a **SHA256 iterated hash** of each AD password into Entra ID, enabling **Hybrid Entra ID join + MFA + Identity Protection risk checks on cloud sign-ins** without exposing plaintext. It also enables **Seamless SSO** so on-prem users sign in to cloud apps with their corp password.

## 6.3 LDAP

- **Lightweight Directory Access Protocol** — the standard protocol to query/modify directory data (AD supports LDAP; OpenLDAP is the open-source directory).
- Operations: `bind` (auth), `search`, `add`, `modify`, `delete`.
- Commonly the protocol for non-Windows apps to reach AD for authZ lookups (`ldapsearch`).
- LDAP over TLS (LDAPS port 636) and Simple Auth are attack vectors if misconfigured — **require LDAPS, disable anonymous binds**, restrict service bind accounts.

```
ldapsearch -H ldaps://dc01.meridian.local -D "CN=svc-ldap-bind,OU=ServiceAccounts,DC=meridian,DC=local" \
  -b "DC=meridian,DC=local" "(&(objectClass=user)(memberOf=CN=VPN-Users,OU=Groups,DC=meridian,DC=local))" sAMAccountName
```

## 6.4 Directory Sync & Provisioning

- **HR is source of truth** (joiner/mover/leaver) → IGA system → directory sync to cloud + on-prem + SaaS.
- Attribute flows: name, email, department, manager, groups.
- **Sync errors are silent access bugs** — monitor provisioning status and reprovision failures.

```
Workday ──> SailPoint IdentityNow ──> Entra Connect ──> Entra ID
                        └──────────> AD (on-prem) ──> apps via LDAP/Kerberos
                        └──────────> SaaS (Salesforce, GitHub, AWS SSO)
```

## 6.5 Trust Relationships — and Their Risks

| Trust type | Meaning | Risk |
|---|---|---|
| Parent–child (transitive) | Child domain trusts root implicitly | Compromise of a child DC/domain can extend to parent (if misadministered) |
| Forest trust (transitive) | Two forests trust each other's domains | If **SID filtering** is off, an attacker with a child-forest admin can forge SIDs to cross into the trusted forest |
| External trust | Point-to-point trust with another forest/domain | If left `SIDHistory`-capable or with broad auth, lateral movement |
| Selective authentication | Trust requires explicit per-user authz | Reduces exposure — use it |

**Classic trust attack:** Attacker compromises a domain with `SIDHistory` enabled, adds `S-1-5-21-...-512` (Enterprise Admins of the root domain) to their token's SIDHistory → authenticates across the forest trust as a root admin. **Mitigation:** SID filtering, selective auth, forest trust hardening, monitoring for anomalous SIDHistory.

---

# 7. Privileged Access Management (PAM)

## 7.1 What Are Privileged Accounts?

Accounts with elevated capabilities: Domain/Enterprise Admins, server-local admins, cloud subscription/role owners, DBA, break-glass, and service accounts with admin rights. Also includes **nested group membership** that makes an unremarkable user effectively admin.

## 7.2 Why Privileged Accounts Are Targeted

- **Amplification:** one DA compromise = entire estate.
- **Credential reuse:** admins often have the same password across DA, cloud, and personal.
- **Persistence:** attackers plant admin accounts/backdoors and return.
- **Stealth:** privileged activity often bypasses normal app-level logging.

## 7.3 PAM Solution Components

| Capability | Purpose |
|---|---|
| **Credential Vault** | Stores privileged passwords/secrets encrypted; checks out only on demand with approval & audit |
| **Session Management / Recording** | Intercepts RDP/SSH/Web sessions, records keystrokes & video, allows live monitoring |
| **Just-In-Time (JIT) Access** | Elevates only for the task window, then auto-removes |
| **Password Rotation** | Auto-randomizes passwords after use / on schedule |
| **Approval Workflows** | Manager/security approval before checkout |
| **Analytics & Alerts** | Detect anomalous privileged use (new device, odd hours, impossible travel) |
| **Break-glass Management** | Physical-sealed, randomized, audited emergency credentials |

## 7.4 Standing vs. Just-in-Time (JIT) Access

| Attribute | Standing privilege | JIT |
|---|---|---|
| Persistence | Permanent admin rights | Temporary, time-boxed elevation |
| Attack surface | Always present to be stolen | Near-zero when not in use |
| Password vaulting | Required regardless | Central (authZ driven) |
| Example | Bob is DA 24/7 | Bob requests `DA` for 30 min via PIM |
| Verdict | **Eliminate for humans**; only break-glass stands | **Standard model** |

## 7.5 Mock PAM Workflow (CyberArk-style)

```
1. Engineer requests:  cadoi@meridian → PAM console
   Target: PROD-SQL01 (local admin)
   Reason: "Apply SQL patch KB-2042, window 02:00-02:30 UTC"
   Duration: 60 min   Approver: dbadmgr

2. Approval engine:
   - Manager approved? yes
   - Time window valid? yes
   - Change ticket CHG-88 412 linked? yes
   - No active SoD conflict? yes
   → APPROVED

3. Checkout:
   PAM rotates SQL local-admin password, checks it out to a
   one-time session credential (not revealed to user as plaintext
   in UI for recorded sessions)

4. Session:
   RDP to PROD-SQL01 recorded; keystrokes + video archived;
   clipboard restricted; downloads blocked

5. Expiry:
   02:45 — session ends; PAM immediately rotates password again;
   alert to security if checkout duration exceeded or retry attempts
```

PAM session audit record (mock):

```json
{
  "sessionId": "PAM-2026-0806-00421",
  "user": "cadoi@meridian-labs.com",
  "target": "PROD-SQL01.local",
  "protocol": "RDP",
  "start": "2026-08-06T02:00:12Z",
  "end": "2026-08-06T02:43:58Z",
  "reason": "Apply SQL patch KB-2042",
  "ticket": "CHG-88412",
  "approvedBy": "dbadmgr@meridian-labs.com",
  "passwordRotatedAfter": true,
  "recordingPath": "vault://recordings/PAM-2026-0806-00421.ckp",
  "riskFlags": []
}
```

## 7.6 Break-Glass Accounts

- **Purpose:** emergency access when IdP, PAM, or MFA infrastructure is down — the only acceptable **standing** privileged accounts.
- **Design rules:**
  - Very few (1–2 per region per scope), clearly named (`BG-ADM-EMEA`).
  - **Random 20+ char passwords**, stored in sealed envelopes in a safe AND split in a second vault; only senior managers know locations.
  - **Hardware-key MFA** (never SMS).
  - Activity **emailed + logged to SIEM** immediately; used = incident review.
  - Tested (safely) quarterly; password rotated after every use and annually.
- **Never** use break-glass as "convenient extra admin account."

Mock break-glass usage alert:

```json
{
  "alert": "BREAK_GLASS_USED",
  "severity": "CRITICAL",
  "account": "BG-ADM-EMEA",
  "time": "2026-08-06T03:11:40Z",
  "initiator": "PENDING_VALIDATION",
  "expected": "IdP incident INC-5591",
  "requiredActions": [
    "Acknowledge within 15 minutes",
    "Open incident ticket",
    "Validate with Chief Security Officer on call",
    "Rotate password now",
    "Schedule 48h review of all actions performed"
  ]
}
```

---

# 8. Service Accounts & Machine Identity

## 8.1 Service Account Risks

- **Long-lived static passwords** that nobody rotates (or rotates by hand).
- **Admin rights creep:** service accounts granted `Domain Admins` membership "to make it work."
- **Not governed:** nobody owns/reviews them; they survive org changes (orphans).
- **Credential harvesting:** service account passwords often sit in scripts, config files, CI variables, or LSASS.
- **One account, many consumers:** impossible to attribute actions to a single person/app.

| Risk | Likelihood | Impact | Control |
|---|---|---|---|
| Static credential theft | High | High | gMSA / workload identity, vault rotation |
| Excessive privileges | High | High | Least privilege, tiering, reviews |
| No ownership / orphan | Medium | High | Service account registry + annual reviews |
| Password in code/config | High | High | Secrets scanning, Vault, no plaintext |
| No monitoring | High | Medium | Baseline + UEBA on service account logons |

## 8.2 Group Managed Service Accounts (gMSA)

- AD feature for a **password automatically rotated by the domain** (nobody knows it).
- The password is derived from the domain's root key + account attributes; only **authorized principals** can retrieve/use it.
- Ideal for Windows services, scheduled tasks, IIS app pools.

```powershell
# Mock: create a gMSA and grant a host the right to use it
New-ADServiceAccount -Name "svc-gmsa-batch" -DNSHostName "batch.meridian.local" `
    -PrincipalsAllowedToRetrieveManagedPassword "SRV-BATCH01","SRV-BATCH02" `
    -KerberosEncryptionType AES128,AES256

# Install on a host
Install-ADServiceAccount -Identity "svc-gmsa-batch"
Test-ADServiceAccountIdentity -Identity "svc-gmsa-batch"

# Use in a scheduled task / service identity as domain\svc-gmsa-batch$
```

**gMSA rules:** requires a KDS root key; can't be used for some LDAP-simple-bind apps; ensure hosts' clocks sync (Kerberos).

## 8.3 API Keys & Long-Lived Tokens

API keys are **static bearer credentials** — possession == authentication. Best practice:

- Short lifetimes; rotate frequently (or use short-lived JWTs).
- Store in a **secrets manager** (Vault, Key Vault, Secrets Manager) — never in code.
- Scope to minimal permissions; **no wildcard scopes**.
- Bind keys to a **service identity** (app registration/workload) so you can revoke cleanly.
- Monitor usage; **key rotation triggers** (user exit, project decommission, suspected leak).

Mock API key policy:

```yaml
api_key_policy:
  maxLifetimeDays: 90
  minRotationDays: 30
  allowedScopes: ["metrics:read", "jobs:submit"]
  forbiddenScopes: ["*", "admin:*"]
  storage: "vault://secrets/app-gw"
  alertOn: ["usage from new ip-range", "first use after 30 days idle", "403 bursts"]
  ownerRequired: true
  reviewCadence: "quarterly"
```

## 8.4 Certificates for Machine Identity

- mTLS: both sides present certs (service-to-service).
- Code signing, device attestation.
- **Pitfall:** cert expiry outages & short-lived certs need automation (ACME/EST + private CA).
- Rotation via SCEP/ACME; inventory via CMP/Vault PKI.

## 8.5 Workload Identity (Cloud-Native)

Preferred over keys where available:

| Platform | Mechanism | Notes |
|---|---|---|
| AWS | IAM Roles / IRSA (OIDC federation for EKS) | Role assumed via OIDC token; no static keys |
| Azure | Managed Identities (system/user assigned) | Token from IMDS endpoint, auto-rotated |
| GCP | Service Accounts + Workload Identity Federation | Federation instead of downloaded keys |
| K8s | Workload Identity federation with cloud IdPs | Map KSA → cloud identity |

```
Pod (K8s) --projected SA token--> OIDC discovery -> AWS STS AssumeRoleWithWebIdentity
                                 -> short-lived AWS creds (max 1h) -> S3 bucket
No static keys. Ever.
```

## 8.6 Machine Identity Management Program

1. **Registry:** inventory every service account, cert, API key, workload identity — owner, purpose, risk tier.
2. **Ownership:** every NHI has an accountable owner (else decommission).
3. **Risk tiering:** Tier 0 (domain/cloud admin-equivalent) = highest scrutiny.
4. **Lifecycle:** create → scope → rotate → review → decommission (no zombies).
5. **Detection:** alert on abnormal NHI usage (logon from new host, off-hours bursts, PowerShell on service account).
6. **Ratification:** quarterly self-certification of registry entries.

---

# 9. Active Directory Security

## 9.1 AD Attack Paths — explanation, mock attack, mitigation

### 9.1.1 Kerberoasting

- **What:** Attackers request a **TGS for a service account's SPN** (any user can request a service ticket), extract the **encrypted service-ticket hash**, and **offline brute-force** the service account password (RC4/AES crackable off-credential).
- **Attack chain:**
  1. Attacker (any domain user) enumerates SPNs: `Get-UserSPNs -Domain meridian.local`
  2. Requests TGS for `svc-sql-app/DB01` (SPN account)
  3. Dumps the ticket: `Invoke-Kerberoast`
  4. Cracks offline: `hashcat -m 13100 -a 0 hashes.txt rockyou.txt`
  5. `svc-sql-app` password = `SQLs3rvice2024` → attacker logs in as that service account
- **Mock detection query (SIEM):**
  ```kql
  SecurityEvent
  | where EventID == 4769
  | where AccountName !has "$"
  | where ServiceName has "$"
  | summarize count() by Account, ServiceName, TimeGenerated
  | where count_ > 5
  ```
- **Mitigations:** strong random passwords on service accounts (120+ bits), disable RC4, enable AES Kerberos, managed service accounts (gMSA) for eligible services, hunt for anomalous TGS requests, remove unnecessary SPNs.

### 9.1.2 AS-REP Roasting

- **What:** Users with **"Do not require Kerberos preauthentication"** enabled expose a pre-auth hash (`AS-REP`) that can be offline-cracked — the attacker needs only a username.
- **Attack:** `Rubeus asreproast /user:finance.user1` → crack hash → get plaintext password for an account that never needed to present its timestamp.
- **Mitigations:** ensure preauth is enabled for all accounts (default), audit for accounts with `DONT_REQ_PREAUTH`, strong passwords, tiered service accounts.

### 9.1.3 DCSync

- **What:** An account with `Replicate Directory Changes All/Filtered` can use `Mimikatz lsadump::dcsync` to pull **any password hash** (including `krbtgt`, DAs) straight from a DC without code execution on the DC.
- **Mock attack:**
  ```
  mimikatz # lsadump::dcsync /domain:meridian.local /user:krbtgt
  SAM & LSA HASHES:
  User : krbtgt   Domain : meridian.local
  Hash NTLM: 3f6b1a9c2d7e4f5a1b3c5d7e9f0a1b2c
  ```
- **Mitigations:** audit DCSync permissions (who holds Replicate Directory Changes All — typically DCs only), monitor `4662`/DS replication events, enforce tiering so Tier-0 accounts only run on Tier-0 hosts, RBAC on replication rights.

### 9.1.4 Pass-the-Hash (PtH)

- **What:** Reuse a stolen NTLM hash to authenticate (LSASS memory theft → `sekurlsa::pth`).
- **Mock:**
  ```
  mimikatz # sekurlsa::pth /user:jdoe /domain:meridian /ntlm:9f4c... /run:cmd.exe
  → new cmd.exe process authenticates to DC as jdoe (NTLM) without the password
  ```
- **Mitigations:** disable NTLM where possible (Kerberos-only), Credential Guard, disable WDigest, restrict local admin, LAPS for local admin passwords, monitor for `4624` with logon type 3 + NTLM events (`8004`).

### 9.1.5 Golden Ticket

- **What:** With the **krbtgt hash**, attacker forges their own **TGT** — full domain access, valid for years, undetectable by normal ticket validation.
- **Mock:**
  ```
  mimikatz # kerberos::golden /user:attacker /domain:meridian.local
             /sid:S-1-5-21-1234567890 /krbtgt:3f6b1a9c... /ptt
  → attacker now has a 10-year valid TGT as "attacker" with DA SIDs
  ```
- **Mitigations:** krbtgt password must be **rotated twice, 12+ hours apart, only during a real incident**; monitor `4768` anomalies; limit accounts able to reach DA; protect Tier-0.

### 9.1.6 Silver Ticket

- **What:** Forge a **service ticket** using a compromised **service account's key** → impersonate any user **against that one service**.
- **Mitigations:** strong service account keys, service isolation, monitor `4769` for forged-ticket indicators, restrict which accounts can run sensitive services.

### 9.1.7 NTLM Relay

- **What:** Attacker relays NTLM authentication from a victim to another server (SMB→LDAP/SMB), acting as the victim **without cracking anything** (often via **Responder + ntlmrelayx** poisoning LLMNR/mDNS).
- **Mock:** Victim triggers an SMB auth to attacker's spoofed name; attacker relays to `DC01` over LDAP with signing/chanbinding disabled → adds attacker to `Domain Admins`.
- **Mitigations:** disable NTLM, **require SMB signing & LDAP channel binding/signing**, disable LLMNR/mDNS/NBT-NS, patch MS16-077+, local admin LAPS.

### 9.1.8 Delegation Abuse (Unconstrained / Constrained / Resource-Based)

- **What:** Kerberos delegation lets a service act on behalf of a user. **Unconstrained delegation** caches users' TGTs on the service host → steal them. **Constrained/RBCD** with weak protocols → **silver tickets** or protocol transition abuse.
- **Mitigations:** eliminate unconstrained delegation (or isolate on Tier-0 hosts), use **gMSA + RBCD** where possible, restrict delegation to least privilege, monitor for delegation-enabled accounts, tier service hosts.

### 9.1.9 ADCS (Active Directory Certificate Services) Abuse

- **What:** Misconfigured certificate templates let attackers request a **certificate that authenticates as Domain Admin** (e.g., `ESC1` — machine template with `CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT` and ClientAuth EKU; `ESC4` — template access control lets attacker grant themselves enrollment; `ESC8` — NTLM relay to the ADCS web enrollment endpoint → machine certificate).
- **Mock (ESC1):**
  1. Template `Computers` allows requester-supplied subject + client auth.
  2. Attacker: `certipy req -u lowpriv -p 'P@ssw0rd1!' -ca meridian-CA -template Computers -upn Administrator@meridian.local`
  3. Uses the cert to get a DA Kerberos ticket via PKINIT.
- **Mitigations:** audit certificate templates & ACLs (Certify/Certipy scans), set `Enrollee Supplies Subject` off for machine templates, enable CA role separation, require manager approval for enrollment, block NTLM to ADCS endpoints, monitor enrollment events `4886/4887`.

### 9.1.10 AD Attack Path Quick-Reference

| Attack | Requires | Output | Top mitigation |
|---|---|---|---|
| Kerberoasting | Any user + SPN account | Cracked service password | Strong/gMSA service passwords |
| AS-REP Roasting | User w/o preauth | Cracked user password | Enforce preauth |
| DCSync | Replication right | All hashes | Audit replication rights |
| PtH | NTLM hash | Session as victim | Kill NTLM, Credential Guard |
| Golden ticket | krbtgt hash | Forge any user/DA TGT | Protect/rotate krbtgt |
| Silver ticket | Service key | Forge per-service ticket | Strong service keys |
| NTLM relay | NTLM capture | Auth relay → admin | SMB signing + LDAP binding |
| Delegation abuse | Delegation config | Act as user | Remove unconstrained delegation |
| ADCS abuse | Weak template | CA-issued cert as admin | Template hardening |

## 9.2 AD Hardening Checklist

- [ ] Run **BloodHound**/PingCastle scans quarterly; remediate top attack paths.
- [ ] **Remove** unconstrained delegation; audit constrained.
- [ ] Disable **NTLM** (or at least LAN Manager + NTLMv1).
- [ ] Enable **SMB signing** + **LDAP signing/channel binding**.
- [ ] Deploy **LAPS** (or Windows LAPS) for all local admin passwords.
- [ ] Protect **LSASS** with Credential Guard; restrict `secretsdump`-style access.
- [ ] Tier 0 accounts are **protected users** + restricted to Tier-0 hosts.
- [ ] Remove **DCSync** rights from non-DCs; audit `Get-ADGroup "Domain Controllers"`.
- [ ] Disable **LLMNR/mDNS/NBT-NS**.
- [ ] Disable **SIDHistory** across trusts; enable SID filtering.
- [ ] Remove stale computer objects, service accounts, and **orphaned SIDs**.
- [ ] Audit domain admin memberships & nested groups weekly.
- [ ] **Rotate krbtgt** per incident-response policy (dual rotation).
- [ ] Patch DCs monthly; ADCS/domain controllers are Tier-0 assets.
- [ ] Implement **DCPromo-tiering** so no admin sessions run on user workstations.
- [ ] Monitor key event IDs: `4624/4625` (logon), `4768/4769` (tickets), `4742/4743` (computer), `5136/5137` (directory), `4662` (DS operations), `4886/4887` (cert enrollment).

## 9.3 Tiered Administration Model (Microsoft Tiering)

```
+-----------------------------------------------+
| TIER 0  = Identity store & controls           |
|   Domain Controllers, AD, Entra ID Global     |
|   Admin, PKI/CA, identity providers           |
+-----------------------------------------------+
| TIER 1  = Server & app control plane          |
|   Member servers, app servers, DBA accounts,  |
|   cloud subscription owners                   |
+-----------------------------------------------+
| TIER 2  = End-user workstations               |
|   Help desk, standard user sessions           |
+-----------------------------------------------+
```

**Rules:**
- An account's tier = the tier of the **highest** asset it can administer.
- **No cross-tier session hopping:** never log into a Tier-1/0 host from a Tier-2 workstation with a privileged account.
- Use **dedicated admin hosts (PAW / bastion / PAM)** for Tier-0/1.
- Privileged accounts use **separate forest** (ESAE / red forest) where feasible.
- Enforce at both account level (groups) and **logon restriction** (GPO/conditional access).

---

# 10. Zero Trust Identity

## 10.1 Zero Trust Principles Applied to Identity

From NIST SP 800-207 and Microsoft's model — **never trust, always verify**:

| Principle | Identity translation |
|---|---|
| Verify explicitly | Every access = authenticated + authorized + risk-scored (even inside the network) |
| Use least privilege | JIT/JEA, no standing admin, scoped roles |
| Assume breach | Treat every session as potentially compromised: continuous validation, short sessions |
| Verify identity at every hop | Every service re-verifies the caller (not just the edge) |
| Data-centric | Access decided per resource/API, not per network |

## 10.2 Conditional Access (the enforcement engine)

- Combines **signals** (risk, device, location, app, legacy protocol, user/group) → **decision** (grant/block/step-up) → **session controls** (sign-in frequency, session lifetime, app control).

Mock policy set (Entra ID):

```json
{
  "policies": [
    {
      "name": "CAP-Block-LegacyAuth",
      "assignments": { "users": ["all"] },
      "conditions": { "clientApps": ["legacy"] },
      "access": "BLOCK"
    },
    {
      "name": "CAP-RequireMFA-All",
      "assignments": { "users": ["all"], "apps": ["all"] },
      "grantControls": ["RequireMFA", "RequireCompliantDevice"],
      "access": "GRANT"
    },
    {
      "name": "CAP-Privileged-StepUp",
      "assignments": { "roles": ["Global Admin", "Privileged Role Admin"] },
      "grantControls": ["RequirePhishResistantMFA"],
      "sessionControls": { "signInFrequencyHours": 4, "persistentBrowser": "never" },
      "access": "GRANT"
    }
  ]
}
```

## 10.3 Continuous Verification (not just at login)

- Re-check risk **during** the session: UEBA signals (impossible travel mid-session, new IP, token replay), device health compliance drift, app risk.
- Enforce via short-lived tokens + session revocation, token binding, session cookie invalidation on risk event.
- **Continuous Access Evaluation (CAE):** cloud platforms push token expiry on security events (password change, admin revokes access) instead of waiting for token expiry.

## 10.4 Least Privilege Enforcement

- Default-deny entitlement model; approvals for any privileged role.
- **JEA (Just Enough Admin)** / role-based elevation: users get a bounded "operation" not full admin.
- Automated **right-sizing**: revoke unused entitlements (last-use analytics).
- **PIM:** elevate roles on demand with time limits and approval (Azure PIM, Okta, CyberArk).

```
Mock PIM activation:
 user: cadoi  role: Azure "Contributor" on sub-prod-eu
 duration: 2h  justification: "KB-2042 SQL patch"
 justificationVerified: linked to CHG-88412
 → role granted, notified to secops, revoked after 2h, audited
```

---

# 11. Identity Governance (IGA)

## 11.1 What IGA Covers

- Access **reviews/certifications**
- **Entitlement management** (catalog + requests + approvals)
- **Separation of duties (SoD)**
- **Role mining & governance**
- Lifecycle automation (joiner/mover/leaver)
- Compliance (SOX, GDPR, ISO 27001)

## 11.2 Access Reviews / Certifications — mock process

Trigger: **Quarterly** — every user's entitlements certified by their manager.

```
Access Certification Campaign Q3-2026
Scope: All 4,210 users with any privileged or Finance-tagged entitlement
Approve workflow: Manager-of-record → (escalation) CISO for privileged certs
Reminder cadence: day 0, 7, 14; auto-escalation day 21; auto-revoke if uncertified day 30
```

Mock certification decision record:

```json
{
  "campaign": "Q3-2026-RECERT",
  "certificationId": "CERT-33218",
  "user": "priya.natarajan@meridian-labs.com",
  "certifier": "r.brooks@meridian-labs.com",
  "due": "2026-09-30",
  "decisions": [
    { "entitlement": "FIN-PAYROLL-ADMIN", "decision": "KEEP" },
    { "entitlement": "grp-Finance-ReadOnly", "decision": "REVOKE", "reason": "moved to FP&A; read-only needed" },
    { "entitlement": "Azure:Contributor:sub-prod-eu", "decision": "MODIFY", "to": "Azure:Reader" }
  ],
  "status": "CERTIFIED",
  "remediation": ["Revoke grp-Finance-ReadOnly", "Change Azure role to Reader"]
}
```

**Review frequency by risk:**

| Entitlement class | Frequency | Certifier |
|---|---|---|
| Standard user access | Annual | Line manager |
| Finance/HR/legal sensitive | Quarterly | Line manager + control owner |
| Privileged / admin / cloud owner | **Monthly or continuous** | Security + business owner |
| Service accounts / machine identities | Quarterly | Named owner |
| Break-glass | Quarterly test + annual | CISO |

## 11.3 Entitlement Management

- A **catalog** of governed roles/resources; users **request** via self-service; policy-driven **approval** (manager, owner, or auto-approve for standard) + **delivery** via provisioning + **reconciliation** to remove drift.

Mock request:

```json
{
  "requestId": "REQ-20260806-01",
  "requestor": "s.ahmad@meridian-labs.com",
  "items": [
    { "catalogItem": "Role: Jira-ScrumMaster", "reason": "new sprint ownership" },
    { "catalogItem": "Role: DataLake-Read-Prod", "reason": "BI dashboard refresh", "sensitivity": "CONFIDENTIAL" }
  ],
  "approvals": [
    { "step": 1, "approver": "manager", "outcome": "APPROVED", "time": "2026-08-06T11:02:11Z" },
    { "step": 2, "approver": "data-owner", "outcome": "APPROVED", "time": "2026-08-06T13:45:00Z" }
  ],
  "provisioning": { "status": "COMPLETED", "systems": ["Jira", "Databricks"] },
  "expiry": "2027-08-06",
  "sodCheck": "PASSED"
}
```

## 11.4 Separation of Duties (SoD)

- Prevents a single person from executing conflicting steps (e.g., creating a vendor **and** approving payment to it).
- Enforced at **request time** (conflict matrix) and at **run time** (policy engine).

Mock SoD conflict matrix (subset):

```yaml
sod_matrix:
  - left: "FIN-AP-VENDOR-CREATE"
    right: "FIN-AP-PAYMENT-APPROVE"
    severity: "critical"
  - left: "FIN-PAYROLL-ADMIN"
    right: "HR-HIRE-FIRE"
    severity: "critical"
  - left: "IT-CHANGE-MANAGER"
    right: "IT-CHANGE-IMPLEMENTER"
    severity: "high"
  - left: "SYSADMIN-DB-PROD"
    right: "AUDIT-LOG-ADMIN"
    severity: "high"
```

Mock violation alert:

```json
{
  "alert": "SOD_VIOLATION_ATTEMPTED",
  "request": "REQ-20260806-02",
  "user": "t.williams@meridian-labs.com",
  "conflict": {"left": "FIN-AP-VENDOR-CREATE", "right": "FIN-AP-PAYMENT-APPROVE"},
  "action": "BLOCKED — approver reassigned to peer",
  "time": "2026-08-06T14:20:00Z"
}
```

## 11.5 Role Mining

- **Analyze** existing user→entitlement data (often messy "like me" provisioning) → **cluster** into proposed roles → **review/dedup** → publish governed roles.
- Reduces role explosion and ghost entitlements.

Mock role mining output:

```yaml
role_mining_result:
  analysisDate: "2026-07-31"
  sourceAccess: 18,742 raw entitlements
  proposedRoles: 34 (down from 210 ad-hoc groups)
  topCandidate: "DATA-ENG-CONFIDENTIAL" (users with Databricks-Edit + Lakehouse-Confidential + Airflow-Operator)
  orphansDetected: 412 entitlements unused >180 days → flagged for revocation
  suggestedRemediation: "replace 210 groups with 34 roles; certify each role owner"
```

## 11.6 Identity Lifecycle Automation

- Event-driven provisioning (HR event → IGA → systems) with **error handling and reconciliation**.
- **Joiner:** auto-create accounts, MFA, baseline groups.
- **Mover:** transfer roles, revoke old-dept access.
- **Leaver:** disable, revoke tokens, retain data per policy.
- **Reconciliation:** nightly compare of authoritative store vs. target systems; drift → auto-correct or alert.

## 11.7 Compliance Angle

### SOX (Sarbanes–Oxley)

- ITGCs: access provisioning/revocation controls, SoD, change management, review of privileged access — all must be **evidenced**.
- Auditors want: sign-off on quarterly certifications, no unapproved admin access to financial systems, evidence of account management for financial apps.

### GDPR / Privacy

- **Right of access & erasure:** prove exactly who holds what PII and remove it on request (identity-centric data mapping).
- Consent records for customer data; access logging for PII retrieval.
- Data Processor obligations: know all system access to personal data.
- **Privacy by design:** minimal data collection, purpose limitation, role-based access to PII.

### Other frameworks

| Framework | IAM-relevant control area |
|---|---|
| ISO/IEC 27001 | A.5.15 (access control), A.5.18 (access rights), A.8 (asset mgmt) |
| NIST 800-53 | AC, IA control families |
| PCI DSS 4.0 | Req 7 (access), 8 (identity & authn), 10 (log & monitor) |
| SOC 2 | CC6 (logical access), CC7 (monitoring) |

---

# 12. Customer Identity & Access Management (CIAM)

## 12.1 What CIAM Is

- Identity management for **external users**: customers, citizens, patients, members, app end-users.
- Differs from workforce IAM: high volume, self-service, consent-driven, fraud-focused, great UX, low admin touch.

| Aspect | Workforce IAM | CIAM |
|---|---|---|
| Volume | Thousands | Millions |
| Trust | Directory-controlled | Consent + verification |
| Friction | Acceptable | Must be minimal |
| Fraud | Insider risk focus | Bot/synthetic/ATO focus |
| Compliance | SOX/ISO | GDPR, CCPA, PSD2, HIPAA |
| Lifecycle | HR-driven | Self-service / event-driven |
| Identity proofing | Employer verified | Varied (email/SMS→KYC) |

## 12.2 Registration & Login Options

| Method | Friction | Risk | Use case |
|---|---|---|---|
| Email + password (+ MFA opt) | Medium | Medium (phishing/reuse) | Default |
| Social login (Google/Apple/GitHub OIDC) | Low | Medium (trusts provider, shadow accounts) | Growth |
| Passwordless (magic link / OTP) | Low | Medium (email/phone takeover) | Convenience |
| Passkeys (FIDO2) | Low | **Low** | Modern standard |
| Device biometric inside app | Low | Medium (app-level) | Mobile |

### Social login risks

- **Account linking attacks:** attacker creates account with same email on Google to hijack your social login (email not verified on your side).
- **Shadow accounts:** same user registers multiple identities → messy profiles, data leaks between accounts.
- **Provider dependency:** Google outage = your login outage.
- **Mitigations:** always verify claimed email with a confirmation step, use verified identity claims, dedupe accounts, provide account-unification/merge flow, fallback auth methods.

## 12.3 Identity Verification & Fraud Prevention

### Verification levels (NIST IAL 1–3 style)

| Level | What's verified | Typical methods |
|---|---|---|
| IAL1 | Something (email) | Verified email magic link |
| IAL2 | Real person, linked to a real record | ID document scan + selfie liveness, bank verification, credit-bureau knowledge checks |
| IAL3 | In-person / supervised proofing | Notarized/KYC, video agent, biometric |

### Fraud signals & controls

| Threat | Signal | Control |
|---|---|---|
| Synthetic identity | New email + new device + fast funnel | Device risk scoring, velocity limits, proofing step-up |
| Credential stuffing | Many logins, low success, distributed IPs | Rate limiting, CAPTCHA, breach-list check, MFA step-up |
| Account takeover (ATO) | Impossible travel, password reset + login burst | Risk-based auth, session risk checks, anomaly alerts |
| Bot signups | Headless browser, high burst | Bot detection, fingerprinting, behavioral challenges |
| Promo abuse | Multiple accounts same device/email pattern | Device/network link analysis, velocity rules |

Mock CIAM risk decision:

```json
{
  "request": {
    "email": "new.user@customer-mail.example",
    "deviceId": "drv_9f3a21",
    "ip": "198.51.100.42",
    "funnel": "signup"
  },
  "riskSignals": {
    "deviceSeenBefore": false,
    "ipReputation": "neutral",
    "velocitySignupsThisHour": 3,
    "emailDisposable": false
  },
  "score": 28,
  "action": "ALLOW_PASSWORDLESS_MAGIC_LINK",
  "policyNote": "step-up to document verification if score > 60"
}
```

## 12.4 CIAM Consent & Privacy

- Consent capture: separate purposes (marketing vs. analytics), granular, revocable.
- Right to be forgotten: delete account + cascade delete associated PII across microservices (async, idempotent).

```
Consent model (mock):
  purpose.marketing.newsletter       = GRANTED (opt-in)
  purpose.analytics.productUsage     = GRANTED
  purpose.thirdParty.sharing         = DENIED
  consentVersion                     = "v2026.1"
  withdrawFlow                       = "self-service account settings → immediate + 30d data purge"
```

---

# 13. Identity Attacks & Defense

## 13.1 Credential Phishing — mock attack + defense

**Mock scenario (Meridian Labs):**
```
Day 0:  Attacker sends spear-phish to 12 finance users:
        "Your Payroll Direct-Deposit was updated — verify now"
        Link: https://payroll-meridian.verify-now.example (AiTM proxy)
Day 0:  3 users enter password + approve MFA push (real-time relay)
Day 0:  Attacker uses stolen session to open a NEW account in the HR portal,
        set up a fake vendor, and route a payment of $48,200 to it
Day 2:  Finance spots discrepancy; IR begins
```
**Defenses that stop it (stacked):**
1. **Phish-resistant MFA (FIDO2)** — AiTM proxy cannot relay a passkey tied to the user's device & origin.
2. **DMARC/DKIM/DMARC alignment + URL filtering** — email never reaches inbox or link blocked.
3. **Security awareness** — periodic + targeted simulated phishing.
4. **Session token binding + short-lived sessions** — stolen token expires quickly and can't be replayed cross-device.
5. **Detect second logon from new device / IP** — Conditional Access block.
6. **Financial control** — change of bank details requires out-of-band confirmation (not email/portal alone).

## 13.2 Session Hijacking / Token Theft — mock + defense

**Mock scenario:**
```
User authenticates via OIDC on corporate Wi-Fi. Malicious client-side JS
(exfiltrated via compromised CDN dependency) steals the access token from
localStorage. Attacker replays token to call admin APIs.
```
**Defenses:**
- Tokens in **HttpOnly + Secure cookies**, not localStorage.
- Short-lived access tokens (5–15 min) + **refresh token rotation** + reuse detection (revoke on reuse).
- **Token binding** to device/certificate (as available).
- **CSP** (Content-Security-Policy), SRI for third-party scripts, dependency scanning (SCA).
- UEBA detects token replay (impossible geography).

## 13.3 Shadow Admins — mock + defense

**Mock scenario:**
```
Bob, a long-time engineer, left the company 18 months ago but his
AWS IAM user still has AdministratorAccess via an un-removed
inline policy. Attacker finds the leaked key pair in a public
GitHub gist → full AWS takeover.
```
**Defenses:**
- JML deprovisioning completeness (don't skip machine/cloud accounts).
- **Secrets scanning** (pre-commit + repo scans) for AWS/Azure/GCP keys.
- **Shadow admin hunt:** analyze entitlement vs. group membership drift; flag inline policies; use IAM access analyzer.
- Machine identity registry covers cloud principals, not just AD.

## 13.4 Orphaned Accounts — mock + defense

**Mock scenario:**
```
Priya resigned in Jan 2026. The HR→IGA→AD flow ran, but the Salesforce
connector failed silently (integration broken) — her Salesforce admin
profile stays active for 11 months. Attacker uses her leaked email+password
from a 2023 breach (she reused it) → reads customer data.
```
**Defenses:**
- **Provisioning success/failure alerting** + reconciliation (nightly compare target vs. source; orphan = alert).
- Last-usage analytics: accounts inactive >90 days → auto-review/disable.
- Breach-list monitoring for corporate emails.
- Quarterly certification catches stale profiles.
- Central **account ownership** so deprovisioning is one API call, not per-app.

## 13.5 Attack–Defense Matrix

| Attack | Primary defense | Detect via |
|---|---|---|
| Credential phishing | FIDO2/passkeys, DMARC | Sign-in risk, new device |
| AiTM phishing | Phish-resistant MFA | Impossible travel, session reuse |
| Credential stuffing | MFA, blocklists, rate-limit | High failed-login volumes |
| MFA fatigue | Number matching, limit pushes | Push-approval clusters |
| SIM swap | No SMS MFA for high-value | Carrier alert, device change |
| Session/token theft | Short tokens, rotation, binding | Token replay / IP change |
| Pass-the-hash | Kill NTLM, Credential Guard | NTLM logon events |
| Kerberoasting | Strong/gMSA SPNs | TGS request anomalies |
| Golden/silver tickets | Protect krbtgt, tiering | Ticket anomalies, tier-0 telemetry |
| DCSync | Restrict replication rights | 4662 replication audits |
| IDOR / broken access | Server-side authZ, opaque IDs | DAST findings, misuse |
| Privilege escalation | Least privilege, PIM | Role-change anomalies |
| Orphaned/shadow accounts | Lifecycle + reconciliation | Last-usage, drift reports |

---

# 14. IAM Implementation Checklist

## Strategy & Governance
- [ ] IAM strategy approved by leadership; IAM is an **executive** security topic.
- [ ] Clear **accountability**: IAM owner, privileged-access owner, IGA owner, CIAM owner.
- [ ] Risk-classification of systems (Tier 0/1/2; sensitivity) published.
- [ ] Written policies: identity lifecycle, access approval, privilege, break-glass, service accounts, CIAM.

## Identity Lifecycle (JML)
- [ ] HR system is authoritative source; events auto-trigger provisioning.
- [ ] Automated joiner (account, MFA, baseline access) with SLA.
- [ ] Automated mover (role changes, revoke old access).
- [ ] Automated leaver: disable + revoke tokens + data retention + asset reassignment, same day.
- [ ] **Reconciliation** nightly; provisioning failures alert.
- [ ] Non-employee/contractor lifecycle with expiry enforced.

## Authentication
- [ ] MFA **enforced for all users** (no exceptions beyond documented break-glass).
- [ ] **Phish-resistant MFA** for privileged & finance.
- [ ] Passwordless (passkeys) available; SMS OTP deprecated.
- [ ] Breached-password blocklist active.
- [ ] Risk-based authentication with step-up for high risk.
- [ ] Legacy auth protocols blocked.
- [ ] Single sign-on centralized at one IdP.

## Authorization
- [ ] RBAC baseline established; ABAC for high-friction cases.
- [ ] Least privilege default; **no standing admin** for humans.
- [ ] SoD conflict matrix enforced at request & runtime.
- [ ] Server-side authorization on all endpoints/APIs (no client-side-only).
- [ ] Opaque identifiers; IDOR testing in CI (DAST/SAST).

## PAM
- [ ] Credential vault with checkout/rotation for all privileged accounts.
- [ ] Session recording for interactive privileged sessions.
- [ ] JIT elevation (PIM); standing privilege only for break-glass.
- [ ] Break-glass accounts sealed, randomized, tested quarterly.
- [ ] Local admin passwords via LAPS.

## Service / Machine Identity
- [ ] Registry with owner, purpose, risk tier for every NHI.
- [ ] gMSA/workload identities preferred over static passwords/keys.
- [ ] API keys short-lived, scoped, vaulted; rotation policy.
- [ ] Certificates inventoried with automated rotation.
- [ ] Quarterly review of service accounts; decommission orphans.

## Active Directory
- [ ] Quarterly BloodHound/PingCastle assessments + remediation.
- [ ] NTLM disabled/minimized; SMB signing; LDAP channel binding.
- [ ] Tiered admin model enforced (no cross-tier hop).
- [ ] No unconstrained delegation; gMSA + RBCD where possible.
- [ ] ADCS templates hardened; enrollment monitored.
- [ ] krbtgt rotation playbook documented.

## Zero Trust
- [ ] Conditional Access policies for MFA, device compliance, risk.
- [ ] Session risk evaluated continuously (not just at login).
- [ ] Continuous Access Evaluation enabled where available.

## Governance & Compliance
- [ ] Access reviews/certifications on schedule by risk tier.
- [ ] SoD monitoring reports to audit/leadership.
- [ ] Entitlement catalog + request/approval workflow live.
- [ ] Role mining every 6 months to control role explosion.
- [ ] SOX/GDPR evidence collection automated (audit trails retained per policy).

## Monitoring & Response
- [ ] Identity logs (IdP sign-ins, AD events, PAM, CIAM) in SIEM.
- [ ] UEBA detects impossible travel, token reuse, privilege spikes.
- [ ] Playbooks: account takeover, leaked credentials, break-glass use, mass phishing.
- [ ] Quarterly red-team/purple-team on identity paths.

---

# 15. Mock IAM Maturity Assessment

## 15.1 Fictional Company

**Northwind Analytics Inc.** (fictional) — 4,200 employees, 1,800 contractors, ~1.2M customer accounts. Systems: 1 AD forest (2 domains), Entra ID (hybrid, Entra Connect), Salesforce, Workday, 4 AWS accounts, 120+ SaaS apps. Regulatory: SOX (public), GDPR (EU customers).

## 15.2 Capability Ratings (1–5)

| Capability | Score (1–5) | Summary |
|---|---|---|
| Identity lifecycle automation | 2 | HR→AD works; SaaS connectors flaky; no mover automation |
| Authentication & MFA | 2 | MFA on VPN/cloud only; SMS used for finance; no passkeys |
| SSO | 3 | 60% of apps on Okta; legacy apps still password-per-app |
| Authorization models | 2 | Ad-hoc groups, "like me" provisioning; no RBAC governance |
| PAM | 2 | No vault; DA/EA passwords in IT's password manager; JIT absent |
| Service/machine identity | 1 | Hundreds of svc accounts; no registry; svc-PROD-DB is Domain Admin |
| AD security | 2 | NTLM enabled, unconstrained delegation on 2 servers, no LAPS |
| Zero Trust / conditional access | 2 | Basic MFA CA only; no risk-based step-up |
| Identity governance (IGA) | 2 | Annual spreadsheet reviews; no SoD enforcement |
| CIAM | 3 | Okta-based customer login; no bot/ATO detection; social login unverified |
| Monitoring & detection | 2 | Identity logs not in SIEM; no UEBA |
| **Overall maturity** | **2.1 / 5** | **"Ad-hoc / repeatable with gaps"** |

## 15.3 Top Findings (mock)

1. **CRITICAL — Unvaulted Domain/Enterprise Admin credentials** exist in plaintext in a shared IT password manager; no rotation; no session recording.
2. **CRITICAL — `svc-PROD-DB` is a member of Domain Admins** (legacy config); service account password static since 2021, present in a public gist.
3. **CRITICAL — No SoD enforcement in AP/Payroll**; one user both creates vendors and approves payments.
4. **HIGH — MFA gaps:** finance uses SMS OTP; 22 admin accounts have no MFA at all; MFA-fatigue susceptible.
5. **HIGH — AD exposure:** NTLM enabled domain-wide, 2 unconstrained-delegation hosts, no LAPS → pass-the-hash/relay likely.
6. **HIGH — Orphaned/ghost entitlements:** 412 SaaS profiles for departed employees still active (reconciliation failed silently).
7. **MEDIUM — CIAM account linking vuln:** social login does not verify email claim → account-hijack exposure.
8. **MEDIUM — No UEBA:** token replay and impossible travel undetected.

## 15.4 Roadmap (18 months)

### Phase 1 — Contain the bleeding (0–3 months)
- Rotate **all** DA/EA/service account credentials; remove `svc-PROD-DB` from Domain Admins.
- Deploy **PAM vault** (CyberArk/Entra PIM) for all privileged accounts; enable session recording.
- Enforce **phish-resistant MFA** on the top 200 privileged accounts; remove SMS for finance.
- Enable **LAPS** domain-wide; disable NTLMv1/LM.
- Fix **reconciliation**; run clean-up of all 412 orphaned SaaS profiles.
- Put identity logs into SIEM; alert on the top 10 identity risk patterns.

### Phase 2 — Build the baseline (3–9 months)
- MFA for **all** users; passwordless (passkeys) for high-risk groups.
- RBAC role model published; **SoD conflict matrix** enforced for AP/Payroll/HR.
- **JIT/JEA** for admin; no standing human admin.
- Remove unconstrained delegation; enforce **tiered admin** (PAW).
- Full SSO onboarding of remaining 40% of apps; disable per-app passwords.

### Phase 3 — Govern and harden (9–18 months)
- IGA with **continuous certification** for privileged; quarterly for sensitive; annual baseline.
- **Role mining** program to collapse 210 ad-hoc groups → governed roles.
- CIAM upgrade: email verification, device risk, bot/ATO detection, passkey support.
- UEBA deployment; **Continuous Access Evaluation**; token/session hardening.
- Quarterly **purple-team** exercises against identity attack paths; ADCS/BloodHound baseline.

### Phase 4 — Zero trust steady state (18+ months)
- Every access decision risk-based + context-aware (ABAC overlay).
- Full **machine identity program** (workload identity everywhere, zero static keys).
- Continuous monitoring with documented incident playbooks for identity events.
- Maturity target: **4.0+ / 5.0** across all capabilities.

---

## Appendix A — Reference Standards

| Standard | Topic | Relevance |
|---|---|---|
| NIST SP 800-63B | Digital Identity Guidelines — Authentication | Password, MFA, verification |
| NIST SP 800-207 | Zero Trust Architecture | Zero-trust identity principles |
| NIST SP 800-53 / 800-137 | Security & Privacy Controls / InfoSec Continuous Monitoring | Control baselines |
| NIST INCITS 359 | RBAC standard | Role model definition |
| ISO/IEC 27001:2022 | ISMS | Access control requirements |
| SOC 2 (AICPA) | Trust Services Criteria (CC6) | Logical access evidence |
| PCI DSS v4.0 | Payment card industry | AuthN (Req 8), access (Req 7) |
| OWASP ASVS | Application Security Verification | AuthN/AuthZ API checks |
| MITRE ATT&CK | Tactic/technique knowledge base | Identity techniques (T1078, T1558, T1621...) |

## Appendix B — Glossary (short)

| Term | Definition |
|---|---|
| **IdP** | Identity Provider — authenticates users and issues tokens/assertions |
| **SP** | Service Provider — consumes identity/assertions from the IdP |
| **TGT** | Kerberos ticket granting ticket |
| **TGS** | Kerberos service ticket |
| **SPN** | Service Principal Name — identifies a service in Kerberos |
| **gMSA** | Group Managed Service Account — auto-rotated AD service account |
| **JIT/JEA** | Just-in-Time / Just-Enough Admin — time-boxed, scoped elevation |
| **PAM** | Privileged Access Management |
| **IGA** | Identity Governance & Administration |
| **CIAM** | Customer Identity & Access Management |
| **SoD** | Separation of Duties |
| **JML** | Joiner–Mover–Leaver lifecycle |
| **PIM** | Privileged Identity Management (Microsoft) |
| **RBA/CA** | Risk-Based Authentication / Conditional Access |
| **AiTM** | Adversary-in-the-Middle (phishing proxy) |
| **NHI** | Non-Human Identity (service accounts, keys, certs, workloads) |

---

*End of document — 15 sections + appendices. All data is fictional and for professional reference/education only.*
