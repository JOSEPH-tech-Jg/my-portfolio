# Cybersecurity Complete — Master Index

A comprehensive, self-contained cybersecurity curriculum library. 16 master files covering every major domain, written in professional depth with mock data, tables, practical command examples, and case studies.

> **Notice:** All case studies, companies, data, and outputs in these documents are fictional and for educational/reference purposes only. No real systems, people, or data are described. Any testing guidance assumes proper authorization.

---

## Foundations & Core

| File | Coverage | Lines |
|------|----------|-------|
| [CYBERSECURITY_FOUNDATIONS_MASTER.md](CYBERSECURITY_FOUNDATIONS_MASTER.md) | CIA triad, AAA, Saltzer & Schroeder, threat actors, risk math (SLE/ALE/ARO), frameworks, CISSP domains, controls, zero trust, governance | 1,435 |
| [CRYPTOGRAPHY_MASTER.md](CRYPTOGRAPHY_MASTER.md) | Symmetric/asymmetric crypto, AES-CBC worked example, RSA math, hashing, password security, PKI, TLS, attacks, tools, crypto policy | 1,503 |
| [NETWORKING_INFRASTRUCTURE_SECURITY_MASTER.md](NETWORKING_INFRASTRUCTURE_SECURITY_MASTER.md) | OSI/TCP models, devices, subnetting, protocols, firewalls, segmentation, wireless, VPN, monitoring, DNS security, hardening | 1,610 |

## Domains

| File | Coverage | Lines |
|------|----------|-------|
| [APPLICATION_WEB_SECURITY_MASTER.md](APPLICATION_WEB_SECURITY_MASTER.md) | SSDLC/STRIDE, OWASP Top 10 + exploits/fixes, auth/sessions, API security, headers, secure coding, SAST/DAST, WAF, mobile | 2,286 |
| [CLOUD_CONTAINER_SECURITY_MASTER.md](CLOUD_CONTAINER_SECURITY_MASTER.md) | Cloud models, shared responsibility, AWS/Azure/GCP, container/Docker hardening, Kubernetes, container escapes, IaC, DevSecOps, serverless | 1,684 |
| [ENDPOINT_OS_MOBILE_SECURITY_MASTER.md](ENDPOINT_OS_MOBILE_SECURITY_MASTER.md) | Windows/Linux/macOS hardening, EDR, mobile (iOS/Android), malware persistence, patching, remote work, physical | 1,636 |
| [IDENTITY_ACCESS_MANAGEMENT_MASTER.md](IDENTITY_ACCESS_MANAGEMENT_MASTER.md) | IAM lifecycle, auth factors, MFA, RBAC/ABAC, SSO/SAML/OIDC, AD attack paths, PAM, service accounts, zero trust identity, CIAM, governance | 1,522 |
| [IOT_OT_ICS_SECURITY_MASTER.md](IOT_OT_ICS_SECURITY_MASTER.md) | OT vs IT vs IoT, Purdue Model, SCADA/DCS/PLC, Modbus/OPC, ISA/IEC 62443, PLC hardening, OT monitoring/IR, industrial ransomware | 1,259 |

## Operations & Defense

| File | Coverage | Lines |
|------|----------|-------|
| [SOC_MONITORING_THREAT_HUNTING_MASTER.md](SOC_MONITORING_THREAT_HUNTING_MASTER.md) | SOC tiers/metrics, log management, SIEM, detection engineering + Sigma, per-attack detections, threat hunting, SOAR, NSM, cloud monitoring, playbooks | 3,005 |
| [INCIDENT_RESPONSE_DIGITAL_FORENSICS_MASTER.md](INCIDENT_RESPONSE_DIGITAL_FORENSICS_MASTER.md) | NIST 800-61 IR lifecycle, IR team/ops, evidence & chain of custody, memory/disk/network forensics, Windows/Linux artifacts, malware triage, mock incident | 2,118 |
| [THREAT_INTELLIGENCE_MASTER.md](THREAT_INTELLIGENCE_MASTER.md) | Intel types, actors/motivations, Kill Chain, MITRE ATT&CK, Diamond Model, IoCs, Pyramid of Pain, MISP, STIX/TAXII, intelligence-driven defense | 1,454 |

## Governance & Program

| File | Coverage | Lines |
|------|----------|-------|
| [GOVERNANCE_RISK_COMPLIANCE_MASTER.md](GOVERNANCE_RISK_COMPLIANCE_MASTER.md) | GRC fundamentals, policy hierarchy, risk management (RMF/FAIR), BIA/BC/DR, GDPR/HIPAA/PCI/SOX, ISO 27001, NIST CSF, audit, privacy, vendor risk | 1,926 |
| [SECURITY_AWARENESS_HUMAN_FACTOR_MASTER.md](SECURITY_AWARENESS_HUMAN_FACTOR_MASTER.md) | Human risk, social engineering psychology, building awareness programs, phishing simulations, metrics, culture, specialized audiences | 1,937 |

## Offense & Specialized

| File | Coverage | Lines |
|------|----------|-------|
| [OFFENSIVE_SECURITY_PENTEST_REDTEAM_MASTER.md](OFFENSIVE_SECURITY_PENTEST_REDTEAM_MASTER.md) | Ethics/RoE/authorization, PTES/OWASP/NIST methodologies, recon → exploitation, web/infra/AD testing, red team ops, purple team, reporting | 2,103 |
| [EMERGING_TECH_SECURITY_MASTER.md](EMERGING_TECH_SECURITY_MASTER.md) | AI/ML adversarial security, LLM prompt injection, quantum + PQC (NIST standards, migration), blockchain/smart contracts, IoT, 5G/edge, biometrics, deepfakes | 2,502 |

## Career & Professional

| File | Coverage | Lines |
|------|----------|-------|
| [CAREER_CERTIFICATIONS_TRAINING_MASTER.md](CAREER_CERTIFICATIONS_TRAINING_MASTER.md) | Career paths, skills, learning paths, full certification landscape (entry → advanced), hands-on vs knowledge certs, job search, advancement | 993 |

---

## Suggested Reading Paths

**New to cybersecurity:** FOUNDATIONS → NETWORKING → CRYPTOGRAPHY → APPLICATION_WEB → ENDPOINT_OS_MOBILE

**Defensive career (SOC/IR):** FOUNDATIONS → NETWORKING → ENDPOINT_OS_MOBILE → SOC_MONITORING_THREAT_HUNTING → INCIDENT_RESPONSE_DIGITAL_FORENSICS → THREAT_INTELLIGENCE

**Offensive career (pentest/red team):** FOUNDATIONS → NETWORKING → APPLICATION_WEB → OFFENSIVE_SECURITY_PENTEST_REDTEAM → IOT_OT_ICS_SECURITY (extras: `../apt_knowledge_base/`, `../tools.md` in project root)

**Leadership/GRC:** FOUNDATIONS → GOVERNANCE_RISK_COMPLIANCE → SECURITY_AWARENESS_HUMAN_FACTOR → IDENTITY_ACCESS_MANAGEMENT → CLOUD_CONTAINER_SECURITY

**Technical breadth:** CLOUD_CONTAINER_SECURITY → IDENTITY_ACCESS_MANAGEMENT → IOT_OT_ICS_SECURITY → EMERGING_TECH_SECURITY

---

**Stats:** 16 files, ~28,900 lines total. All data fictional.
