# ENDPOINT, OS & MOBILE SECURITY — MASTER REFERENCE

**Version:** 3.2 · **Classification:** Internal / Public-Defensive
**Audience:** SOC Analysts, System Administrators, Endpoint Engineers, IT Security Teams
**Scope:** Windows · Linux · macOS · Mobile (iOS/Android) · EDR · Malware · Physical Security · Frameworks · Patching · Remote Work

> **Disclaimer:** All data, hosts, IPs, users, event IDs, and incidents in this document are **fictional** mock data created for training and reference purposes. Nothing here describes a real environment, real organization, or real attack.

---

## Table of Contents

1. [Endpoint Security Overview](#1-endpoint-security-overview)
2. [Windows Security Deep Dive](#2-windows-security-deep-dive)
3. [Linux Security Deep Dive](#3-linux-security-deep-dive)
4. [macOS Security](#4-macos-security)
5. [Endpoint Detection & Response (EDR)](#5-endpoint-detection--response-edr)
6. [Mobile Device Security](#6-mobile-device-security)
7. [Malware on Endpoints](#7-malware-on-endpoints)
8. [Physical Security of Endpoints](#8-physical-security-of-endpoints)
9. [Endpoint Hardening Frameworks](#9-endpoint-hardening-frameworks)
10. [Patch Management](#10-patch-management)
11. [Remote Work Security](#11-remote-work-security)
12. [Mock Endpoint Compromise Case Study](#12-mock-endpoint-compromise-case-study)

---

# 1. Endpoint Security Overview

## 1.1 What Is an Endpoint?

An **endpoint** is any computing device that connects to an organization's network and acts as a point of entry or interaction. Endpoints are the most attacked surface in modern enterprises because they are numerous, user-facing, and often run heterogeneous software.

| Endpoint Class | Examples | Primary Risks |
|---|---|---|
| Desktop / Laptop | Windows 11 laptop, macOS workstation | Phishing, drive-by download, stolen credentials |
| Mobile | iOS iPhone, Android Pixel | Malicious apps, spyware, device loss |
| Server (endpoint-adjacent) | Windows Server, RHEL app server | RCE, brute force, unpatched service |
| IoT / Embedded | Printer, IP camera, badge reader | Default creds, no patching cadence, botnet recruiting |
| Virtual / VDI | Citrix session, Azure Virtual Desktop | Credential stuffing, VM escape (rare) |
| BYOD | Personal phone/laptop on corporate tenant | Mixed trust, data separation, weak personal security |

> **Key concept:** In zero-trust terms, an endpoint is *not* trusted simply because it is inside the network perimeter. Trust is based on **identity + posture + device health** continuously evaluated.

## 1.2 The Endpoint Threat Landscape

### Malware (broadly)
- **Trojan:** Pretends to be legitimate (e.g., a fake invoice PDF). Classic delivery via phishing.
- **Worm:** Self-propagating malware that spreads without user interaction (e.g., across SMB shares).
- **RAT (Remote Access Trojan):** Gives the attacker a backdoor shell (e.g., XMRig mining, njRAT-style tooling).
- **InfoStealer:** Harvests credentials, cookies, browser autofill, and crypto wallets; sold on dark-web marketplaces.
- **Rootkit:** Hides its own presence from AV/EDR by hooking system calls or boot chain.

### Ransomware
- Encrypts user files (often silently exfiltrating first) and demands payment.
- Modern **double-extortion**: *"Pay or we publish your data."*
- Delivery vectors: RDP brute force, phishing with macros, exploited public-facing apps, supply chain.

### Phishing & Social Engineering
- Email (most common), SMS/smishing, voice/vishing, QR code (quishing).
- Credential harvesting pages that look identical to corporate SSO.

### Physical Theft & Loss
- Stolen laptops with unencrypted disks → full data compromise.
- Lost phones with biometrics disabled and no remote wipe → mailbox/MFA token theft.

### Insider & Accidental Risk
- Malicious insiders with legitimate access.
- Accidental: email misrouting, clicking bad links, plugging in rogue USB.

## 1.3 Endpoint Security Layers (Defense in Depth)

```
Layer 0  Identity          ── MFA, phishing-resistant auth, privileged access mgmt
Layer 1  Device Posture    ── Patch mgmt, hardening baselines, vulnerability scanning
Layer 2  Prevention        ── Antivirus/EDR, firewall, app control (AppLocker/WDAC)
Layer 3  Detection         ── EDR telemetry, Sysmon/auditd, SIEM correlation, UEBA
Layer 4  Containment       ── Network segmentation, quarantine, host isolation, NAC
Layer 5  Recovery          ── Backups, reimage, incident response runbooks, forensics
```

Each layer should be **independently testable**. If Layer 2 (AV) fails, Layer 3 (EDR/SIEM) should still catch the behavior.

## 1.4 BYOD vs Corporate-Owned

| Dimension | Corporate-Owned (COPE/COBO) | BYOD |
|---|---|---|
| Ownership & cost | Company owns, company controls | Employee owns, company controls app data only |
| Enrollment | Full MDM enrollment required | Enrollment may be optional/limited |
| Management depth | Full disk/device control | App container (MAM) + Conditional Access only |
| Data separation | Native, device-wide | Containerization or **work profile** (Android) |
| Privacy expectations | Low — employer can audit | Higher — personal data segregated |
| Risk profile | Managed patching, known image | Unmanaged patching, unknown apps |
| Wipe capability | Full device wipe available | Selective wipe of work container only |
| Typical policy | "Device must be encrypted & enrolled" | "Work apps in managed container; personal data untouched" |

**Best practice:** Use **MDM/MAM + Conditional Access** so BYOD devices are *only as trusted as their compliance state*, and never store sensitive data outside the managed container.

---

# 2. Windows Security Deep Dive

## 2.1 User Account Control (UAC)

**Purpose:** UAC separates standard-user privileges from administrator privileges. Every elevated action triggers a consent prompt, protecting against silent privilege escalation by malware running as a standard user.

### UAC Levels

| Level | Behavior | Use Case |
|---|---|---|
| Always notify | Prompt for any elevation, including settings changes | Maximum security, annoying |
| Notify app changes (default) | Prompt when apps try to make changes; don't dim desktop | Recommended for most users |
| Notify only for non-Windows binaries | Prompts when unsigned/unknown software changes settings | Slightly weaker |
| Never notify | Admin auto-elevates silently | **Never use** — UAC becomes useless |

### How Malware Bypasses UAC (UACMe-style)
- **Auto-elevating COM objects:** abuse known `ShellExecute`/auto-approval DACLs.
- **`fodhelper` / `computerdefaults` / `sdclt` hijacking:** run with `HKCU\Software\Classes\ms-settings\Shell\open\command` to spawn elevated child.

### Mock PowerShell Check
```powershell
# Query current UAC policy
Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System' |
  Select-Object EnableLUA, ConsentPromptBehaviorAdmin, PromptOnSecureDesktop

# Desired values
# EnableLUA                     = 1
# ConsentPromptBehaviorAdmin    = 2   (prompt for consent on secure desktop)
# PromptOnSecureDesktop         = 1
```

## 2.2 Local vs Domain Accounts

| Attribute | Local Account | Domain / Entra ID Account |
|---|---|---|
| Stored in | Local SAM database | Active Directory / Entra ID |
| Scope | One machine | Domain-wide / cloud tenant |
| Password policy | Local only, easy to forget | Domain Group Policy enforced |
| Credential reuse risk | Per-machine (less blast radius) | Centralized (high value target) |
| LAPS | Applies to local admin on domain-joined | n/a for the account itself |
| Best practice | Disable or randomize; use only for break-glass | Primary interactive accounts |

**Key rule:** Never use the same local admin password across machines. Use **LAPS** (below). Disable guest and ensure RID-500 Administrator is renamed and configured with LAPS.

## 2.3 Local Administrator Password Solution (LAPS)

**LAPS** randomizes and rotates the local admin password and stores it in AD (protected ACL) or Entra ID, retrievable only by authorized admins.

```powershell
# Install LAPS management
Install-WindowsFeature -Name LAPS -ComputerName Server01 -IncludeManagementTools
Invoke-LapsPolicyProcessing

# Check that a local admin is managed
Get-LapsADPassword -Identity CORP-PC0421 -AsPlainText
```

### Mock Group Policy Configuration
| Setting | Value |
|---|---|
| Enable local admin password management | Enabled |
| Do not allow password expiration longer than | 30 days |
| Password length | 20 characters |
| Password complexity | Enabled (letters+digits+symbols) |
| Restrict access to passwords to authorized admins | `DOMAIN\EndpointAdmins` |

> Also consider **Windows LAPS** (newer, built-in) and **scheduled rotation** to 72 hours for high-risk endpoints.

## 2.4 Windows Defender & EDR

### Windows Defender (Microsoft Defender for Endpoint — MDE)
- **Real-time AV** (cloud-delivered protection), tamper protection, controlled folder access.
- **EDR capabilities:** behavioral detections, attack surface reduction (ASR) rules, automated investigation and remediation.

### Mock PowerShell Hardening for Defender
```powershell
# Enable real-time protection (if disabled)
Set-MpPreference -DisableRealtimeMonitoring $false

# Turn on cloud-delivered protection + sample submission
Set-MpPreference -MAPSReporting Advanced
Set-MpPreference -SubmitSamplesConsent SendAllSamples

# ASR rules that matter most
Add-MpPreference -AttackSurfaceReductionRules_Ids
    "b2b3f03d-6ccc-4f2a-b575-00e6740974ea" -AttackSurfaceReductionRules_Actions Enabled   # block untrusted & unsigned processes
Add-MpPreference -AttackSurfaceReductionRules_Ids
    "d4f940ab-401b-4efc-aadc-ad5f3c50688a" -AttackSurfaceReductionRules_Actions Enabled   # block executable content from email/webmail

# Controlled folder access (ransomware protection)
Set-MpPreference -EnableControlledFolderAccess Enabled
Add-MpPreference -ControlledFolderAccessProtectedFolders "C:\Users\*\Documents"

# Block credential dumping activity via Defender
Set-MpPreference -PUAProtection Enabled
```

**EDR vs AV** — see Section 5.2.

## 2.5 Application Control: AppLocker & WDAC

### AppLocker
- Rule-based allowlisting by publisher, path, hash, or file attribute.
- Applies to `.exe`, `.dll`, `.msi`, `.ps1`, `.vbs`, `.js`, `.bat`, `.cmd`.

### WDAC (Windows Defender Application Control)
- Kernel-enforced, policy-driven (XML), blocks both user and kernel code not signed/trusted.
- **Stronger than AppLocker**; recommended for high-security (e.g., Domain Controllers, kiosks).

### Mock AppLocker Policy (PowerShell)
```powershell
# Allow everything for BUILTIN\Users except scripts from temp dirs
$policy = Get-AppLockerPolicy -Local
$rule = New-AppLockerPolicy -RuleType Exe -User Everyone `
  -Path "C:\Windows\*" -Action Allow -Lock
Set-AppLockerPolicy -XmlPolicy $policy.Xml -Merge
```

### Key WDAC Concept (XML snippet)
```xml
<Policy TypeID="{A244370E-44C9-4C06-B551-F6016E563076}" Name="Win11-Standard">
  <Rules>
    <FileRules>
      <Allow ID="ID_ALLOW_ALL_MS" FriendlyName="Microsoft" Publisher="O=MICROSOFT CORPORATION, L=REDMOND" />
      <Deny ID="ID_DENY_BAD" FriendlyName="BlockTool" FileName="procdump.exe" />
    </FileRules>
  </Rules>
  <SigningScenarios>
    <SigningScenario Value="12" ID="ID_SIGNING_SCENARIO_WINDOWS" FriendlyName="User Mode RHS">
      <ProductSigners>...</ProductSigners>
    </SigningScenario>
  </SigningScenarios>
</Policy>
```

## 2.6 Credential Guard

**Credential Guard** uses virtualization-based security (VBS) + Secure Enclave to isolate and protect domain credentials (hashes) even from admin-level malware. If `mimikatz` runs against a Credential Guard protected machine, LSASS-held NTLM hashes are not directly extractable (protected in LSAIso process).

```powershell
# Verify Credential Guard status
Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard |
  Select-Object VirtualizationBasedSecurityStatus, SecurityServicesRunning

# Enabling (via group policy)
# Computer Config > Admin Templates > System > Device Guard >
#   "Turn On Virtualization Based Security" = Enabled
#   Platform security level = Secure Boot / VBS
#   Credential Guard Configuration = Enabled with UEFI lock
```

**Requirements:** Windows 10/11 Enterprise, Virtualization-based security enabled in firmware, Secure Boot on.

## 2.7 BitLocker (Full Disk Encryption)

| Element | Default/Recommended |
|---|---|
| Algorithm | AES-256-XTS |
| TPM usage | TPM 2.0 + PIN for high security |
| Recovery key storage | Entra ID / AD (secured) — never on the machine |
| Pre-boot auth | TPM+PIN recommended for sensitive devices |
| Key protector | TPM, StartupKey, NumericalPassword |

```powershell
# Enable BitLocker on system drive with TPM-only protector
Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 `
  -TpmProtector -RecoveryPasswordProtector
Backup-BitLockerKeyProtector -MountPoint "C:" -KeyProtectorId (Get-BitLockerVolume -MountPoint "C:").KeyProtector[1].KeyProtectorId -RecoveryPasswordPath "\\filesrv\security\recoverykeys"

# Verify status
Get-BitLockerVolume -MountPoint C: | Select Status, EncryptionPercentage, ProtectionStatus
```

## 2.8 Event Logging — Critical Security Event IDs

### Security Log (Windows Event ID Reference)

| Event ID | Meaning | Why It Matters |
|---|---|---|
| **4624** | Successful logon | Baseline for auth; correlate unusual times, sources, NTLM vs Kerberos |
| **4625** | Failed logon | Brute force / password spray detection |
| **4688** | Process creation | Command-line telemetry; detect LOLBins, unusual parents |
| **4697** | Service installed | Persistence via new services |
| **1102** | Audit log cleared | Attacker covering tracks — **treat as critical alert** |
| 4634 / 4647 | Logoff / user-initiated logoff | Session lifecycle |
| 4648 | Logon with explicit credentials | RunAs / pass-the-hash indicator |
| 4672 | Special privileges assigned | Admin logon to a domain account |
| 4732/4733 | Member added/removed to security group | Privilege escalation — new admins |
| 4720 | User account created | Backdoor accounts |
| 7045 (System) | New service installed (service control manager) | Persistence via services |
| 4104 (Scripting/PS) | PowerShell script block logging | Malicious PowerShell command detection |
| 1 (Sysmon) | Process creation | Detailed process/image/command line |
| 3 (Sysmon) | Network connection | C2 beaconing detection |

### Mock PowerShell to Enable Key Audit Policies
```powershell
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
auditpol /set /subcategory:"Logoff" /success:enable /failure:enable
auditpol /set /subcategory:"Process Creation" /success:enable
auditpol /set /subcategory:"Security Group Management" /success:enable
auditpol /set /subcategory:"Service Creation" /success:enable

# Enable PowerShell script block + module logging (covers much of 4104/4105)
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging' `
  -Name EnableScriptBlockLogging -Value 1
```

> **Mock SIEM correlation rule:** `Event ID 4625 with 10+ failures from same source IP within 5 min → raise Medium → block source IP + require MFA re-auth.`

## 2.9 Sysmon (System Monitor)

**Sysmon** is a Microsoft Sysinternals driver that logs deep host telemetry into the Windows Event Log (`Microsoft-Windows-Sysmon/Operational`).

### Minimal Production-Ready Sysmon Config (YAML/XML)
```xml
<Sysmon schemaversion="4.90">
  <HashAlgorithms>SHA256</HashAlgorithms>
  <EventFiltering>
    <!-- Process creation -->
    <ProcessCreate onmatch="include">
      <Image condition="is">C:\Windows\System32\cmd.exe</Image>
      <CommandLine condition="contains">-enc</CommandLine>
      <Image condition="image">C:\Users\*</Image>
    </ProcessCreate>
    <!-- Network connections: capture all -->
    <NetworkConnect onmatch="include">
      <Initiated condition="is">true</Initiated>
    </NetworkConnect>
    <!-- File create: executables in unusual places -->
    <FileCreateTime onmatch="exclude"/>
    <ImageLoad onmatch="include">
      <Image condition="image">C:\Users\*</Image>
    </ImageLoad>
    <!-- Log every raw access read to LSASS (mimikatz indicator) -->
    <ProcessAccess onmatch="include">
      <TargetImage condition="is">C:\Windows\System32\lsass.exe</TargetImage>
      <SourceImage condition="image">C:\Users\*</SourceImage>
    </ProcessAccess>
    <RegistryEvent onmatch="include">
      <TargetObject condition="contains">\CurrentVersion\Run</TargetObject>
      <TargetObject condition="contains">\services</TargetObject>
    </RegistryEvent>
  </EventFiltering>
</Sysmon>
```

### Sysmon Event IDs Most Worth Watching

| Event ID | Telemetry | Detection Value |
|---|---|---|
| **1** | Process creation | Full command line — LOLBins, parent/child anomalies |
| **3** | Network connection | Beaconing to C2 IPs, unusual outbound |
| **5** | Process terminated | Rogue processes ending before analysis |
| **7** | Image loaded | Unsigned DLLs injected into trusted processes |
| **10** | Process access | **LSASS access → credential dumping signal** |
| **11** | File create | Executables in %TEMP%, WMI persistence files |
| **12/13** | Registry events | Run keys, services, autorun persistence |
| **17/18** | Named pipe events | Pipe creation (Cobalt Strike pipes) |
| **22** | DNS query | DNS tunneling / C2 domain lookups |

### Mock Install
```powershell
# Install (run as admin)
.\Sysmon64.exe -accepteula -i sysmon-config.xml -h md5,sha256
# Check running
Get-Service Sysmon | fl Name,Status
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational'; Id=1; MaxEvents=5} | fl
```

## 2.10 Windows Firewall

- Host-based, per-profile (Domain / Private / Public) filtering.
- **Recommended:** default deny inbound, allow-list only required services; enable logging.

```powershell
# Baseline hardening
Set-NetFirewallProfile -Profile Domain,Private,Public -DefaultInboundAction Block -DefaultOutboundAction Allow
Set-NetFirewallProfile -Profile Domain,Private,Public -AllowLocalFirewallRules $false

# Example: allow only RDP from management VLAN
New-NetFirewallRule -DisplayName "RDP from Mgmt" -Direction Inbound -Protocol TCP `
  -LocalPort 3389 -RemoteAddress 10.20.0.0/16 -Action Allow
New-NetFirewallRule -DisplayName "Block RDP else" -Direction Inbound -Protocol TCP `
  -LocalPort 3389 -Action Block

# Enable firewall logging to a dedicated partition
Set-NetFirewallProfile -Profile Domain -LogFileName "C:\Windows\System32\LogFiles\Firewall\pfirewall.log" -LogMaxSizeKilobytes 32768 -LogBlocked $true -LogAllowed $true
```

## 2.11 Windows Hardening — Mock PowerShell / GPO Checklist

```powershell
# 1. Disable legacy protocols (SMB1, LLMNR/mDNS responder)
Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force
Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\mDNSResponder' -Name Start -Value 4
# GPO: Computer > Admin Templates > Network > DNS Client > "Turn off multicast name resolution" = Enabled

# 2. Disable NTLMv1 and set LAN Manager level to NTLMv2-only
Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa' -Name LmCompatibilityLevel -Value 5

# 3. Remove dangerous default accounts / disable Guest
Disable-LocalUser Guest
Rename-LocalUser -Name Administrator -NewName "srv-admin-do-not-remove"

# 4. Windows Update auto-update to Active Hours
Set-ItemProperty 'HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings' -Name ActiveHoursStart -Value 8
Set-ItemProperty 'HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings' -Name ActiveHoursEnd -Value 18

# 5. Disable AutoRun/AutoPlay for removable media
Set-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer' -Name NoAutorun -Value 1

# 6. Enable Credential Guard + LSASS Protected Process Light (LSA protection)
Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa' -Name RunAsPPL -Value 1
Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa' -Name LsaCfgFlags -Value 1

# 7. Require bitlocker pre-boot PIN via GPO (fictional)
# Computer > Admin Templates > Windows Components > BitLocker Drive Encryption > OS Drives

# 8. Restrict PowerShell ExecutionPolicy to RemoteSigned for standard users
Set-ExecutionPolicy RemoteSigned -Scope LocalMachine
```

## 2.12 Common Windows Attacks (and Defense)

| Attack | Technique | Key Defenses |
|---|---|---|
| **Mimikatz / LSASS dumping** | Read LSASS memory, extract NTLM/Kerberos hashes | Credential Guard, LSA PPL, Sysmon Event 10 alert, deny ProcDump |
| **Scheduled task abuse** | `schtasks /create /tn Evil /tr cmd.exe /sc onlogon` | Audit 4698 (task created), monitor for new tasks outside scheduled path |
| **Service exploitation** | Create/modify services with weak DACLs; `sc create` backdoor | Audit 4697/7045, restrict service creation to admins, WMI/Sysmon 1 for `sc.exe` |
| **Registry persistence** | `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` etc. | Monitor Run keys (Sysmon 12/13), Autoruns review, block with WDAC |
| **Windows Management Instrumentation (WMI) persistence** | `__EventFilter` + `__EventConsumer` subscription | Audit 5857/5859 (EventFilter/EventConsumer), WMI-Activity log |
| **Pass-the-Hash / Over-Pass-the-Hash** | Replay captured hash instead of password | Credential Guard, disable NTLM where possible |
| **LOLBins** | `mshta.exe`, `regsvr32.exe /s`, `rundll32.exe` to run payloads | AppLocker/WDAC, ASR rules, Sysmon Event 1 correlation |
| **PrintNightmare-style printer RCE** | Exploit Spooler service | Disable Print Spooler on non-print servers, patch promptly |
| **SMBGhost / EternalBlue** | SMBv1 buffer overflow | Disable SMB1, patch, segment legacy devices |

### Mock Detection: Scheduled Task Abuse (PowerShell)
```powershell
# List newly created scheduled tasks in last 24h
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4698; StartTime=(Get-Date).AddDays(-1)} |
  ForEach-Object { $_.Message } | Out-String | Clip

# Hunt for malicious autorun entries
Get-CimInstance -ClassName Win32_StartupCommand | Select Name, Command, Location, User
```

---

# 3. Linux Security Deep Dive

## 3.1 Permissions: chmod, chown, ACLs

### Understanding Mode Bits

| Bits | Octal | Meaning |
|---|---|---|
| `rwx` | 7 | read, write, execute |
| `rw-` | 6 | read, write |
| `r-x` | 5 | read, execute |
| `r--` | 4 | read only |
| `---` | 0 | none |

### Mock Command Examples
```bash
# Files: 644 (rw-r--r--)  Directories: 755 (rwxr-xr-x)
chmod 644 /etc/app/config.ini
chmod 755 /opt/app/bin
chmod 700 ~/.ssh                      # private keys must be 600

# Ownership
chown appuser:appgroup /opt/app/config.ini

# Setgid directory (group inherits for team folders)
chmod 2770 /srv/team-share

# Sticky bit (only owner can delete in /tmp)
chmod 1777 /tmp
```

### POSIX ACLs
```bash
# Give developer readonly access to a file without group change
setfacl -m u:dev_alice:r-- /etc/app/config.ini
# Give service account rwx on a dir, set default ACL for new files
setfacl -d -m g:api-group:r-x /srv/shared
# View
getfacl /etc/app/config.ini
```

> **Common mistake:** executing binaries with `setuid` bit (`4755`) when not required. This is a primary privilege-escalation vector (Section 3.10).

## 3.2 sudo (Secure Configuration)

### The `/etc/sudoers` Golden Rules
```bash
# Use visudo - ALWAYS. It syntax-checks before saving.
sudo visudo

# /etc/sudoers (fictional, annotated)
# 1. Alias for the ops group
Cmnd_Alias ADMIN_CMDS = /usr/bin/systemctl, /usr/bin/apt, /usr/bin/dpkg, /bin/mount, /usr/bin/chown

# 2. Full root access ONLY for core admins, NOT the ops group
root       ALL=(ALL:ALL) ALL
%admin     ALL=(ALL:ALL) ALL

# 3. Ops group: specific commands, no password for read-only ops, password for destructive
%ops       ALL=(root) ADMIN_CMDS
%ops       ALL=(root) NOPASSWD: /usr/bin/systemctl status *

# 4. Forbid sudo to shell (breaks "sudo find . -exec /bin/sh" escapes)
%ops       ALL=(root) !/bin/sh, !/bin/bash, !/usr/bin/find -exec, !/usr/bin/vi * !:
```

### Other sudo hardening
```bash
# Require tty + no fake shell (in /etc/sudoers)
Defaults   requiretty
Defaults   !visiblepw
# Timeout, log all sudo calls to auth.log
Defaults   timestamp_timeout=5
# Keep environment clean
Defaults   env_reset
```

## 3.3 PAM (Pluggable Authentication Modules)

PAM controls *how* authentication happens (`/etc/pam.d/`). Key directives:

```bash
# /etc/pam.d/system-auth (mock excerpt)
auth        required      pam_faillock.so preauth audit silent deny=5 unlock_time=900
auth        sufficient    pam_unix.so try_first_pass nullok
auth        required      pam_faillock.so authfail audit deny=5 unlock_time=900
password    requisite     pam_pwquality.so retry=3 minlen=14 dcredit=-1 ucredit=-1 ocredit=-1
session     required      pam_limits.so
```

| Directive | Effect |
|---|---|
| `pam_faillock` | Locks account after N failures for lock time (brute-force defense) |
| `pam_pwquality` | Enforces password length/complexity |
| `pam_unix.so remember=10` | Prevents password reuse (history) |
| `pam_sssd.so` / `pam_ldap.so` | Central auth integration |

> **Rule:** In modern stacks, prefer **MFA via pam_duo/pam_google_authenticator** and **key-based auth**, making PAM password policy secondary but still enforced.

## 3.4 SELinux & AppArmor

| Aspect | SELinux (RHEL/Fedora) | AppArmor (Ubuntu/Debian/SUSE) |
|---|---|---|
| Model | MAC with labels + types | MAC with path-based profiles |
| Policy files | `/etc/selinux/`, `semanage` | `/etc/apparmor.d/`, `apparmor_parser` |
| Granularity | Very fine-grained, complex | Simpler, profile per executable |
| Default state | `enforcing` on RHEL | `enforcing` (aa-enforce) |

### SELinux Modes
| Mode | Behavior |
|---|---|
| `Enforcing` | Policy enforced; violations denied + logged |
| `Permissive` | Violations logged but **not blocked** (used for testing) |
| `Disabled` | SELinux off entirely — **not recommended in production** |

```bash
# Check/change mode
getenforce                              # Enforcing / Permissive / Disabled
setenforce 1                            # runtime only
# Permanent change
sed -i 's/^SELINUX=.*/SELINUX=enforcing/' /etc/selinux/config

# Check denials and contexts
ausearch -m avc -ts recent              # recent denials
ls -Z /var/www/html/index.html          # view context: system_u:object_r:httpd_sys_content_t:s0

# Allow httpd to read a custom web root
semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"
restorecon -Rv /srv/web
```

### AppArmor Example
```bash
sudo apt install apparmor-utils
sudo aa-status                                # list profiles + modes
sudo aa-enforce /etc/apparmor.d/bin.ping      # enforce a profile
sudo aa-complain /etc/apparmor.d/bin.ping     # log-only mode
```

## 3.5 Firewalls: ufw and firewalld

### ufw (Ubuntu)
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp        # admin SSH — prefer a management source range
ufw allow from 10.20.0.0/16 to any port 22 proto tcp
ufw allow 443/tcp
ufw enable
ufw status verbose
```

### firewalld (RHEL/CentOS/Rocky)
```bash
firewall-cmd --state
firewall-cmd --set-default-zone=drop
firewall-cmd --permanent --zone=internal --add-source=10.20.0.0/16
firewall-cmd --permanent --zone=internal --add-service=ssh
firewall-cmd --permanent --zone=public --add-service=https
firewall-cmd --reload
firewall-cmd --list-all --zone=internal
```

> **Recommendation:** Default-deny inbound; treat "management" and "user" zones separately; never leave `22/tcp` open to the whole internet.

## 3.6 SSH Hardening — Mock `sshd_config`

```
# /etc/ssh/sshd_config (production hardening)
Port 22                       # consider non-default ONLY with monitoring in place
Protocol 2
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitEmptyPasswords no
MaxAuthTries 3
MaxSessions 4
LoginGraceTime 30
AllowUsers ops_admin deploy@10.20.0.* alice@sre
AllowGroups ssh-users
X11Forwarding no
PermitTunnel no
AllowAgentForwarding no
AllowTcpForwarding no          # enable only if jump host used
ClientAliveInterval 120
ClientAliveCountMax 3
PrintMotd no
UsePAM yes
Subsystem sftp internal-sftp
Match Group sftponly
  ChrootDirectory /srv/sftp/%u
  ForceCommand internal-sftp
```

### Verify
```bash
sudo sshd -t                     # syntax check
systemctl reload sshd
ss -tlnp | grep :22
```

## 3.7 systemd Security — Jailing & Read-Only

Use `systemd-analyze security` and unit hardening directives in `[Service]`:

```ini
# /etc/systemd/system/app.service (mock)
[Service]
User=appuser
Group=appgroup
NoNewPrivileges=yes
ProtectSystem=strict                # /usr /boot /etc read-only
ReadWritePaths=/var/lib/app /var/log/app
ProtectHome=yes                     # block /home access
PrivateTmp=yes
PrivateDevices=yes
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectControlGroups=yes
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
RestrictSUIDSGID=yes
MemoryMax=1G
LockPersonality=yes
SystemCallFilter=@system-service
SystemCallFilter=~@privileged @resources
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart app.service
systemd-analyze security app.service   # prints exposure score + verdict
```

## 3.8 auditd

**auditd** records security-relevant syscalls, file access, config changes, and user activity.

```bash
# Install / status
apt install auditd
systemctl status auditd
auditctl -s

# Audit rules (fictional environment)
# Files of interest
-w /etc/passwd -p wa -k passwd_changes
-w /etc/shadow -p wa -k shadow_changes
-w /etc/ssh/sshd_config -p wa -k sshd_config
-w /etc/sudoers -p wa -k sudoers_changes
-w /var/log/ -p wa -k log_writes

# Executables invoked (success/failure of key binaries)
-w /usr/bin/su -p x -k su_exec
-w /usr/bin/sudo -p x -k sudo_exec
-w /usr/sbin/useradd -p x -k useradd_exec

# Watch for suspicious deletion of audit files
-w /sbin/auditctl -p x -k auditctl_exec

# Load rules persistently
sudo augenrules --load
```

### Useful audit queries
```bash
# Who touched /etc/passwd recently?
ausearch -k passwd_changes -ts recent
# All su/sudo executions in last 2 hours
ausearch -k sudo_exec -ts 2h | head -60
# Failed login attempts (type=USER_AUTH res=failed)
ausearch -m USER_AUTH -sv no -ts recent
```

## 3.9 Kernel Hardening — Mock sysctl

```bash
# /etc/sysctl.d/99-hardening.conf (mock, then `sysctl --system`)
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.all.rp_filter = 1                # reverse-path filtering
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_ra = 0
net.ipv4.tcp_syncookies = 1                     # SYN flood mitigation
kernel.randomize_va_space = 2                   # ASLR
kernel.kptr_restrict = 1
kernel.dmesg_restrict = 1
kernel.core_pattern = /var/crash/core.%e.%p     # core dumps to protected dir
kernel.pid_max = 65536
fs.suid_dumpable = 0
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
net.ipv4.conf.all.log_martians = 1
vm.mmap_min_addr = 65536
```

## 3.10 Common Linux Attacks

| Attack | Technique | Defenses |
|---|---|---|
| **SUID binary abuse** | Find setuid binaries (`find / -perm -4000`), exploit older ones (e.g., `pkexec`, `sudo 1.8`) | Audit setuid bits, patch quickly, `fs.suid_dumpable=0`, remove unneeded setuid |
| **Kernel exploits** | Local privilege escalation via known CVE (e.g., Dirty Pipe, overlayfs) | Rapid patching, kernel hardening, containerize to reduce host exposure |
| **Weak permissions** | World-writable files/scripts or misconfigured sudoers | Periodic `find / -perm -2`, enforce 644/755 defaults, ownership audits |
| **Rootkits** | Replace `ls`/`ps` binaries or hide with LKM (Loadable Kernel Module) | Audit hashes of critical binaries, `checkrootkit`/`rkhunter`-style scanning, secure boot / module signing, immutable auditd |
| **SSH brute force / key compromise** | Dictionary attacks, stolen private keys | Key-only auth, fail2ban, root login off, key rotation |
| **Config file secrets** | `.env` / `.git` exposure on web roots | Secrets managers, deny `.git` in nginx/apache, scanners |
| **Docker/container escape** | Privileged container → host | Least privilege, `no-new-privileges`, seccomp, no `--privileged` |

### Mock Recon Commands (for defenders to test posture)
```bash
find / -perm -4000 -type f 2>/dev/null          # setuid files
find / -perm -002 -type f 2>/dev/null           # world-writable files
find /home -name "*.pem" -o -name "id_rsa"      # exposed keys
ss -tulpn                                        # listening services
last -f /var/log/wtmp | head -20                 # recent logins
grep "Failed password" /var/log/auth.log | tail  # brute force attempts
```

## 3.11 Linux Hardening Checklist

- [ ] Remove unused packages (`apt autoremove`, `dnf remove`), disable unused services.
- [ ] Set a solid password policy in PAM; enforce MFA for admins.
- [ ] Enable SELinux/AppArmor in enforcing mode; verify no denials for core apps.
- [ ] Configure default-deny firewall (ufw/firewalld).
- [ ] SSH: key-only, root off, use `AllowUsers`, version 2 only.
- [ ] Apply kernel `sysctl` hardening and verify with `sysctl -p`.
- [ ] Enable **auditd** with rules for passwd/shadow/ssh/sudo and review logs weekly.
- [ ] Set strict file perms: 644 files / 755 dirs / 600 private keys / 700 `~/.ssh`.
- [ ] systemd unit hardening for all user-facing services (`systemd-analyze security` score < 5).
- [ ] Automatic security updates (`unattended-upgrades` / `dnf-automatic`), reboot window for kernels.
- [ ] Remove setuid bits not needed; audit quarterly.
- [ ] Backup `/etc`, `/var/www`, DBs off-box with tested restore.
- [ ] Review listening ports quarterly against an approved list.

---

# 4. macOS Security

## 4.1 System Integrity Protection (SIP)

- Kernel-level protection preventing modification of system files, directories, and processes, even by root.
- Protects `/System`, `/usr`, `/bin`, `/sbin`, and preinstalled Apple apps.
- **Status check:**
```bash
csrutil status
# System Integrity Protection status: enabled.
```
- SIP should **never** be disabled for normal production machines. Only sanctioned by security team for approved research devices.

## 4.2 Gatekeeper & Notarization

- **Gatekeeper:** Ensures apps run only if from the App Store or signed by a Developer ID, or explicitly approved via `Right-Click → Open`.
- **Notarization:** Apple server-side malware scan; notarized apps ship with a ticket.
```bash
# Check Gatekeeper state
spctl --status
# Check an app's signature + notarization
codesign --verify --deep --strict /Applications/App.app
spctl --assess --type execute -v /Applications/App.app
# Bypass a single app (user-driven, not recommended)
xattr -d com.apple.quarantine /Applications/Suspicious.app
```

## 4.3 TCC Privacy (Transparency, Consent & Control)

TCC governs access to sensitive data (Camera, Microphone, Photos, Contacts, Full Disk Access, Accessibility, Screen Recording).

- Each app must be **explicitly granted** by the user.
- The database lives at `~/Library/Application Support/com.apple.TCC/TCC.db` (user) and `/Library/Application Support/com.apple.TCC/TCC.db` (system) — heavily protected.

### Mock TCC Query
```sql
-- Requires Full Disk Access + com.apple.TCC access; for security audit use MDM/EA tools
SELECT client, service, auth_value, auth_reason
FROM access WHERE service IN ('kTCCServiceMicrophone','kTCCServiceScreenCapture');
```

### Why It Matters
TCC bypass attacks (e.g., abusing Terminal/Accessibility permissions) are the #1 macOS local privilege-escalation theme — protect TCC DBs, restrict Accessibility/Screen Recording to trusted apps, monitor MDM for unexpected grants.

## 4.4 FileVault (Disk Encryption)

- Full-disk encryption using XTS-AES-128 with recovery key escrowed to your MDM/IdP.
```bash
fdesetup enable -defer -forceatlogin 0 -outputpath /var/tmp/escrow.plist
fdesetup status
# MDM command: Require FileVault on all devices + escrow keys
```
- Enforcement via MDM configuration profile: `RequireFileVault` + `EscapeKeyInstitution` + `PersonalRecoveryKeyEscrowInstitution` → organization escrow.

## 4.5 XProtect & macOS Security Features

| Feature | Purpose |
|---|---|
| XProtect | Built-in signature-based malware detection at Gatekeeper/execution time |
| Notarization check | Blocks un-notarized apps by default |
| Malware Removal Tool (MRT) | Auto-removes known malware |
| Transparency Consent Control (TCC) | Data access authorization |
| Library Validation | Blocks code injection into hardened runtime apps |
| ContentFilter | EDR hooks for network flow inspection |

## 4.6 MDM (Mobile Device Management) on macOS

Profiles distributed via MDM enforce baseline security. A hardened profile typically sets:

```xml
<!-- mock MDM payload keys -->
<key>PayloadType</key><string>com.apple.security</string>
<key>EnableAssessment</key><true/>            <!-- Gatekeeper enforcement -->
<key>AllowUserToModifyLoginWindow</key><false/>
<key>com.apple.softwareupdate</key>           <!-- automatic updates -->
<key>AutomaticCheckEnabled</key><true/>
<key>ConfigDataInstall</key><true/>
<key>CriticalUpdateInstall</key><true/>
```

Managed settings to enforce: FileVault, firewall on, FileVault recovery key escrow, Gatekeeper + Notarization, SIP enabled, software update deferred install (N days), screen lock + inactivity, disable iCloud Keychain on shared devices.

## 4.7 macOS Hardening Baseline (Checklist)

- [ ] SIP **enabled** (`csrutil status`).
- [ ] FileVault enabled + key escrowed to MDM.
- [ ] Gatekeeper + Notarization enforced (`spctl --global-enable`).
- [ ] Automatic updates ON (security + critical).
- [ ] macOS Firewall ON (`/usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on`), stealth mode ON.
- [ ] Screen lock: < 5 min idle, require password immediately after sleep.
- [ ] Disable automatic login (`/Library/Preferences/com.apple.loginwindow AutoLoginUser` removed).
- [ ] TCC grants audited; limited Accessibility/Screen Recording.
- [ ] Local admin account with unique password (LAPS-style via Jamf/DEP).
- [ ] **MDM enrollment mandatory** (no BYOD mac without compliance).
- [ ] FileVault PRK rotation; no FileVault bypass (disable Target Disk Mode for high risk).
- [ ] Block sideloaded kernel extensions (kext) — use DriverKit/DEXT only.

## 4.8 Common macOS Attacks

| Attack | Technique | Defenses |
|---|---|---|
| **TCC bypass** | Exploit Accessibility/Screen Recording, `kTCCService` enumeration, dynamic TCC dylib injection | Strict TCC grants, MDM monitoring, keep macOS patched, hardened runtime apps |
| **Gatekeeper bypass** | Unsigned `dylib` injection, symlink tricks, quarantine bypass via `xattr -d` | MDM blocking unsigned apps, EDR app-level, disable legacy install |
| **Malware with signed-but-malicious dev ID** | Legit Developer ID abused (e.g., fake cracked apps) | Notarization + reputation checks, block ad-hoc signing, MDM blocklist |
| **Password reset / firmware theft** | Wipe via Recovery, FileVault bypass on unlocked session | FileVault, firmware password (`csrutil disable` is blocked by firmware pass), Find My + MDM wipe |
| **Spyware (e.g., mercenary grade)** | Zero-click exploits, browser exploits | Rapid patching, lockdown mode for high-value targets |

**Apple Lockdown Mode** — high-security mode disabling JS JIT, file downloads, incoming FaceTime, USB accessories; strongly consider for executives, journalists, researchers.

---

# 5. Endpoint Detection & Response (EDR)

## 5.1 How EDR Works

EDR combines **telemetry collection**, **behavioral analysis**, and **response actions** on the endpoint.

### Pipeline
```
Sensor (ring-0 driver + user-mode agent)
   │  events: processes, files, registry, network, memory, scripts, USB, drivers
   ▼
Local analytics engine (rules + ML models) ──► local quarantine / blocking
   │  batched + streamed to cloud/SIEM
   ▼
Threat intel + behavioral baselining (UEBA) ──► alerts, case creation
   ▼
Response actions: isolate host, kill process, rollback file, quarantine, block hash
```

| EDR Capability | Example Evidence Used | Response Action |
|---|---|---|
| Process telemetry | Parent `cmd.exe` spawning `powershell -enc` | Kill + terminate parent chain |
| File telemetry | New EXE dropped to `%TEMP%`, hash unknown | Quarantine hash, block execution |
| Registry telemetry | Run key added at 03:00 by `svchost.exe` child | Isolate host, revoke credentials |
| Network telemetry | Beacon to `185.199.x.x:443` every 60s | Block IP, isolate, alert SOC |
| Memory analysis | Remote thread injected into `explorer.exe` | Memory scan, kill process, forensic capture |
| Script telemetry | PowerShell script block flagged | Full script block capture, block pattern |

## 5.2 EDR vs Traditional AV

| Dimension | Traditional AV | Modern EDR |
|---|---|---|
| Detection basis | Signatures + heuristics | Behavioral + ML + TTP hunting |
| Visibility depth | Shallow (file scan) | Deep (process tree, memory, network, script) |
| Response | Quarantine file | Full response: isolate, rollback, investigate |
| Data collection | Little | High-volume telemetry |
| Detection speed | Fast on known | Slower but catches *unknown/novel* |
| Evasion | Easier | Harder (kernel sensor, tamper protection) |
| Cost/complexity | Low | Higher ops overhead |

> Best practice is **not** "AV or EDR" but layered: AV signatures for commodity malware **and** EDR behavioral for novel tactics.

## 5.3 EDR Bypass Techniques (and Countermeasures)

| Bypass | How It Works | EDR Countermeasure |
|---|---|---|
| **DLL sideloading** | Load malicious DLL into trusted signed process | Trusted publisher validation, image load monitoring (Sysmon 7) |
| **Memory-only payloads** | No file on disk (process injection, shellcode) | Memory scanning, ETW kernel telemetry, thread stack analysis |
| **Living-off-the-land (LOLBins)** | Use `powershell`, `mshta`, `cscript` legitimately | Command-line analytics, ASR rules, allowlist app control |
| **Timing / process hollowing** | Hollow `svchost.exe`, inject, resume | Parent-child anomaly detection, hollowing heuristics |
| **Patch EDR / kill sensor** | Disable service, clear ETW, drop driver | Tamper protection, kernel callback monitoring, heartbeat fail-alerts |
| **Indirect syscalls** | Bypass user-mode hooks with direct NT syscalls | Kernel-level sensors, VBS/ETW protection |
| **Encrypted/obfuscated payloads** | Packed binaries evade static scan | Sandbox detonation, ML on behavior |
| **Bypass via valid signing cert** | Sign payloads with stolen/abused dev certs | Reputation, code-signing policy, notarization |

**Defense in depth:** Even a bypassed EDR should be caught by a second layer — Sysmon+SIEM, network IDS on C2, or endpoint isolation triggered by behavioral UEBA.

## 5.4 EDR Deployment Best Practices

1. **Start with AV + EDR on a pilot fleet** (10–50 hosts) before org-wide rollout.
2. **Tune exclusions carefully** — exclude only legitimate dev/build paths; never exclude entire `C:\Windows`.
3. **Alert triage SLAs:** define severity → response owner mapping.
4. **Integrate with SIEM** (Syslog/CEF/JSON) and SOAR for auto-enrichment.
5. **Enable tamper protection** and define who can disable the agent.
6. **Baseline your environment:** use 30 days of passive telemetry to calibrate false positives.
7. **Test the bypass surface quarterly** (purple-team scenarios against your own agents).
8. **Response playbooks:** isolate, kill, rollback, reimage, credential rotation.
9. **Log retention:** store telemetry 12+ months for advanced hunting.
10. **EDR as data source, not oracle:** pair with SIEM rules and threat hunts, not just alerts.

---

# 6. Mobile Device Security

## 6.1 iOS vs Android Security Models

| Aspect | iOS | Android (modern, 10+) |
|---|---|---|
| App distribution | Single store (App Store), review + signing | Play Store + authorized OEM stores; sideloading controlled |
| Sandboxing | Per-app sandbox, hardened kernel, PAC, pointer auth | SELinux-based per-app sandbox (Zygote), API level gating |
| Updates | Direct from Apple, uniform | OEM/carrier dependent; Project Mainline modular updates |
| Bypass risk | Jailbreak required, increasingly hard | Rooting possible; bootloader unlock gates many features |
| MDM depth | Very deep via supervised mode | Deep via Device Owner/Work Profile |
| Security patch model | Whole-OS versioned | Security Patch Level (SPL) monthly |
| Exploit value | High (high value targets) | High (volume targets) |

## 6.2 App Sandboxing

- **iOS:** each app runs in its own sandbox; no direct file-system access to other apps; `TCC` mediates data permissions; entitlements limit APIs.
- **Android:** each app = own Linux UID; SELinux enforces app isolation; scoped storage limits access; permissions requested at runtime.

### Mock Android Runtime Isolation View
```
app com.bank.app (uid 10123) ──(SELinux domain: untrusted_app)──► /data/data/com.bank.app ✓
                                                            └──► /data/data/other.app ✗ (denied)
                                                            └──► /data/user/0/../media (scoped storage rules)
```

## 6.3 App Stores vs Sideloading

| Channel | iOS | Android |
|---|---|---|
| Primary | App Store (review, notarization, JIT hardening) | Google Play (Play Protect scan) |
| Sideloading | Very limited (Enterprise certs, TestFlight) | APK sideloading possible; warning + Play Protect optional |
| Risk | Lower by default | Higher with sideloads; fake apps/mods common |
| Enterprise alternative | Custom apps via MDM (VPP + distribution) | Private apps via Managed Google Play |

> **Defensive stance:** Disable sideloading for corporate devices; if an app isn't in the approved catalog, it doesn't run on a corporate profile.

## 6.4 Jailbreaking / Rooting Risks

| Action | Risk | Detection |
|---|---|---|
| Jailbreak (iOS) | Removes sandbox, allows root access, can hide itself (jailbreak-detection evasion) | Check for Cydia/Frida/substrate, suspicious entitlements, `amfid` patch |
| Rooting (Android) | Bootloader unlock, root shell, can spoof SafetyNet/Play Integrity | `Play Integrity` attestation, detect Magisk, verify boot state |
| Enterprise impact | Attestation fails → Conditional Access denies; sensitive app container exposure | MDM compliance + attestation checks on every access |

**Attestation:** use Play Integrity (Android) / DeviceCheck+MDM (iOS) so Conditional Access can deny non-compliant devices **before** granting data access.

## 6.5 Mobile Device Management (MDM)

Core MDM workflows:

```
Enrollment (DEP/zero-touch / QR) ──► Compliance check
   ├─ iOS: Supervised mode, restrictions profile, per-app VPN
   ├─ Android: Work Profile (BYOD) or Device Owner (corporate)
   └─ Profile contents:
        • Passcode policy (min length, failed attempts, auto-lock)
        • Encryption requirement
        • App catalog + blocklist
        • Wi-Fi/VPN config
        • Remote lock / remote wipe (full or selective)
        • Certificate provisioning (identity + root CA)
```

### Mock MDM Compliance Policy (simplified JSON)
```json
{
  "device_os_versions": { "ios": ">=17.0", "android": ">=13 with SPL>=2026-03" },
  "enrollment": { "required": true, "supervised_ios": true, "work_profile_android": true },
  "passcode": { "min_length": 8, "max_fail_attempts": 5, "auto_lock_minutes": 5 },
  "encryption": { "required": true },
  "attestation": { "play_integrity": "MEETS_DEVICE_INTEGRITY", "tcc_health": "ok" },
  "actions": {
    "non_compliant": ["block_access", "notify_user"],
    "lost_device": ["remote_lock", "remote_wipe"]
  }
}
```

## 6.6 BYOD Policies for Mobile

- **Mandate Work Profile / managed container** — personal apps untouched, corporate data isolated.
- **No personal device access to admin consoles** without MDM container + attestation.
- **Selective wipe** on the work container, never full wipe (legal/privacy).
- **Require MFA + Conditional Access** regardless of device trust.
- **Screen lock & encryption** minimums enforced at enrollment.
- **No rooted/jailbroken devices** — enforce via attestation every access attempt.
- **Define data categories:** what may live on personal devices vs corporate devices (DLP).

## 6.7 Mobile Threats

| Threat | Example | Mitigation |
|---|---|---|
| Spyware / stalkerware | Silent mic/camera/call logging | App vetting, restricted permissions, TCC-like controls, MDM blocklist |
| Malicious apps | Fake banks, crypto miners, credential stealers | Catalog-only installs, Play Protect/App Review, vetting |
| OS vulnerabilities | Zero-day in WebKit / kernel / modem | Rapid patch SLAs, version gates, exploit mitigations |
| Phishing (smishing/quishing) | QR to fake SSO page | MFA, FIDO2 passkeys, URL filtering, training |
| SIM swap / account takeover | Port-out to attacker, reset MFA | Number port protection, passkeys, device attestation |
| Mobile APT / mercenary spyware | Zero-click delivery chains | Lockdown mode, quick patching, EDR for mobile |
| Stolen device | Lock screen bypass, credential theft | Encrypted storage, remote wipe, biometrics + PIN, Find My |

## 6.8 Mobile Endpoint Protection (MTD)

- **MTD (Mobile Threat Defense)** e.g., Zimperium, Lookout, Microsoft Defender for Endpoint on mobile.
- Adds on-device **app risk scoring**, network protection (on-device VPN for DNS filtering), web protection, phishing detection, and jailbreak/root detection feeding attestation.
- Integration: MTD signals → MDM compliance → Conditional Access gate → **deny if score too high**.

---

# 7. Malware on Endpoints

## 7.1 Persistence Mechanisms

### Windows
| Mechanism | Registry/Path | Detection |
|---|---|---|
| Run/RunOnce keys | `HKCU\...\Run`, `HKLM\...\Run`, `RunOnce` | Autoruns, Sysmon 12/13 |
| Services | `HKLM\SYSTEM\...\Services\Evil` | Event 7045/4697, `sc query` |
| Scheduled tasks | `schtasks /query /fo CSV` | Event 4698, Task Scheduler log |
| WMI subscriptions | `root\Subscription` `__EventFilter/Consumer` | WMI Activity log, Event 5857 |
| Startup folders | `shell:startup`, `shell:common startup` | Autoruns |
| Image file execution options | `HKLM\...\Image File Execution Options` | Sysmon registry, Sysinternals |
| Boot execute / driver | `HKLM\SYSTEM\...\BootExecute`, malicious driver | DriverSigning, Sigcheck, Defender blocklists |
| COM hijacking | `HKCU\...\CLSID\{guid}\InprocServer32` | Autoruns COM hijack tab |

### Linux
| Mechanism | Location | Detection |
|---|---|---|
| Cron jobs | `/etc/cron.*`, `/var/spool/cron/crontabs` | `crontab -l`, auditd `-w /etc/cron.d` |
| systemd units | `/etc/systemd/system/*.service` | `systemctl list-units --type=service` |
| rc.local / init scripts | `/etc/rc.local`, `/etc/init.d` | file integrity monitoring |
| LD_PRELOAD | `/etc/ld.so.preload` | `ldd`, FIM on that file |
| Authorized SSH keys | `~/.ssh/authorized_keys` | periodic audit, login review |
| `/etc/ld.so.preload` malware | rootkit hooking `open()` | tripwire/hashes, rkhunter |

## 7.2 Detection — Autoruns

```powershell
# Sysinternals Autoruns (Windows) — review Enabled=true entries, signer verification
.\Autorunsc.exe -a * -h -ct -v -accepteula /accepteula | Out-File autoruns.txt

# PowerShell native: dump startup commands
Get-CimInstance Win32_StartupCommand | Select Name, Command, Location
# Look for: temp paths, encoded commands, unsigned EXEs, unusual names
```

### Linux autostart equivalents
```bash
find /etc/systemd/system /lib/systemd/system -name "*.service" -newermt "-30 days"
crontab -l; ls -la /etc/cron.* 
cat /etc/ld.so.preload
ss -tulpn | grep -v LISTEN   # outbound connections
```

## 7.3 Detection — Process Analysis

### Mock process tree triage
```powershell
# Show parent-child hierarchy with command lines (Sysmon Event 1-style)
Get-WinEvent -LogName 'Microsoft-Windows-Sysmon/Operational' -FilterXPath "*[System[EventID=1]]" -MaxEvents 200 |
  ForEach-Object {
    $e = [xml]$_.ToXml()
    [pscustomobject]@{
      Time  = $_.TimeCreated
      PID   = $e.Event.EventData.Data[4].'#text'
      PPID  = $e.Event.EventData.Data[6].'#text'
      Image = $e.Event.EventData.Data[10].'#text'
      Cmd   = $e.Event.EventData.Data[11].'#text'
    }
  } | Sort Time | Format-Table -Auto
```
**Look for:** `cmd.exe` → `powershell -enc`, office apps spawning `wscript`, unusual `mshta.exe`, `rundll32` with no argument, `svchost` with high CPU, unknown vendor EXEs.

### Linux equivalent
```bash
ps -eo pid,ppid,user,cmd --sort=-%cpu | head -20
pstree -a -p | head -40
# historical: auditd exec records
ausearch -m EXECVE -ts recent | grep -E 'python|curl|wget|bash -i'
```

## 7.4 Detection — Network Connections

```powershell
# All outbound connections with owning process
Get-NetTCPConnection -State Established |
  ForEach-Object {
    $p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    [pscustomobject]@{ Local=$_.LocalAddress; Remote="$($_.RemoteAddress):$($_.RemotePort)"; PID=$_.OwningProcess; Proc=$p.ProcessName }
  } | Sort-Object Remote

# Sysmon DNS Event 22 hunting
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational'; Id=22} -MaxEvents 100 |
  Select -Expand Message | Select-String "dns\|domain"
```
**Red flags:** connections to non-standard ports (443 to residential IPs, 4444, 8080), DNS names with high entropy subdomains, beacons with fixed intervals.

```bash
# Linux: established outbound
ss -tunap | grep ESTAB | grep -v ':22\b'
# tcpdump capture for forensics (mock)
tcpdump -i eth0 -nn -w /forensics/capture.pcap 'tcp port not 22 and not 443'
```

## 7.5 Ransomware Specifics

### Behavior Signature
- Rapid file enumeration + modification (encryption) — **MFT/syscall bursts**.
- Deletes shadow copies: `vssadmin delete shadows /all /quiet`, `wbadmin delete`, `bcdedit /set {default} recoveryenabled No`.
- Disables AV/EDR + firewall.
- Drops ransom note (`DECRYPT-ME.txt`, `.html`) and changes wallpaper.
- (Double extortion) exfiltrates data first via Rclone/curl to storage provider.

### Mock Indicators
| Indicator | Example (fictional) |
|---|---|
| Hashes (SHA-256) | `9f2c1b0aa3d5e1f7a4c6e8b0d1f3a5c7e9b2d4f6a8c0e2b4d6f8a0c2e4b6f8a` |
| C2 domain | `secure-update-cdn.example-invalid.com` |
| Process names | `msbuild.exe`, `rclone.exe`, `wscript.exe` |
| File extensions | `.cryptlock`, `.payg8`, `.enc4` |
| Note names | `HOW_TO_DECRYPT.txt`, `READ-ME-FOR-KEY.html` |

### Ransomware Defense Stack
1. **Prevent** — EDR+ASR, app control, macro blocking, patch, least privilege, remove local admin.
2. **Detect** — behavior rules (mass file rename, shadow copy deletion, EDR anti-ransomware rules), honeypot files.
3. **Contain** — immediate host isolation, block outbound exfil IPs, disable lateral SMB.
4. **Recover** — offline/immutable backups (3-2-1), tested restore, no-payment policy.

### Mock SIEM Detection Rule (pseudo)
```
WHEN (process=("vssadmin","wbadmin","bcdedit") OR file_ops>5000_files_in_5min
      OR new_process="rclone.exe" OR shadow_copies_deleted=TRUE)
      FOR any endpoint WITHIN 10 minutes
THEN severity=Critical; action=isolate_host; notify=oncall
```

---

# 8. Physical Security of Endpoints

## 8.1 Drive Encryption

| OS | Tool | Notes |
|---|---|---|
| Windows | BitLocker | TPM 2.0 + PIN recommended; escrow recovery keys |
| macOS | FileVault | Key escrow to MDM |
| Linux | LUKS (`cryptsetup`) | Encrypt at install or `luksconvert`; bind to TPM optionally |
| Mobile | iOS hardware AES + FileVault equivalent; Android FBE (File-Based Encryption) | Always on for modern devices |

```bash
# Linux LUKS example
cryptsetup luksFormat /dev/sdb1
cryptsetup open /dev/sdb1 encdata
mkfs.ext4 /dev/mapper/encdata
# Add a second key / emergency passphrase
cryptsetup luksAddKey /dev/sdb1
```

> **Key rule:** Encryption is useless if the OS decrypts at login with a weak password, or if keys are escrowed insecurely. Combine with strong boot password / PIN.

## 8.2 Theft Protection

- **Laptop:** Kensington lock, GPS/asset tags, BIOS lock + disk encryption so a stolen disk yields nothing.
- **Mobile:** Remote lock + wipe (Find My / MDM), SIM PIN, no biometric-only unlock (always require device passcode after reboot).
- **Procedures:** incident reporting within X hours, remote lock/wipe playbook, no plaintext creds written on devices, DLP on removable media.

## 8.3 BIOS/UEFI Security

- Set a **BIOS/UEFI administrator password** (prevents boot-order changes, firmware settings tamper).
- Set a **firmware/boot password** (prevents booting to external media, decrypting at boot).
- Enable **Secure Boot** and lock down boot device order to internal disk only.
- Disable USB boot if not needed.
- Enable **BIOS/UEFI update signing/verification** (vendor tool), and update firmware through patched channel.

## 8.4 Secure Boot

- **UEFI Secure Boot:** validates bootloader/kernel signatures against enrolled keys (PK/KEK/DB).
- Windows + BitLocker: use TPM2 + Secure Boot so boot chain integrity is measured.
- Linux: `sbverify`, `sbctl` for signing; enable in firmware.
- Servers: enforce on all bare-metal; verify with vendor tools.

### Mock verification commands
```bash
# Windows: check Secure Boot status
Confirm-SecureBootUEFI

# Linux: verify a kernel image signature
sbverify --list /boot/vmlinuz-$(uname -r)
```

## 8.5 Device Tracking

- **Corporate:** MDM asset records, GPS (optional, consent-based), Find My / Android Device Manager tied to managed accounts.
- **Lost-mode:** remote lock + display contact message; geolocation only via policy-approved channels.
- **Offboarding:** wipe + revoke certificates + disable user accounts **before** reassigning hardware.

---

# 9. Endpoint Hardening Frameworks

## 9.1 CIS Benchmarks

- **CIS (Center for Internet Security)** publishes free, vendor-specific hardening benchmarks (Windows 11, macOS, Linux distros, Android, iOS).
- Each benchmark lists controls with levels:
  - **Level 1:** broad, low-impact hardening (recommended baseline).
  - **Level 2:** stronger, may reduce usability (for high-security environments).
- Practical use: implement Level 1 everywhere; use **CIS-CAT** to assess compliance.

```bash
# CIS-CAT assessment (mock command)
java -jar CIS-CAT.jar -a -b "cis_benchmarks_microsoft_windows_11" -o output-dir
```

### Mock excerpt (Windows CIS Level 1)
| Section | Control | Expected |
|---|---|---|
| 1.1 | Ensure 'Enforce password history' ≥ 10 | 10 |
| 1.2 | Ensure 'Maximum password age' ≤ 365 | 60 |
| 2.2.1 | Ensure 'LAPS' password rotation enabled | Enabled |
| 2.3.15 | Ensure 'Always notify' UAC | Enabled |
| 2.3.17 | Ensure 'Require trusted path for credential entry' | Enabled |
| 18.9 | Ensure 'Windows Firewall' default inbound = Block | Enabled |

## 9.2 Microsoft Security Baseline

- **Microsoft Security Compliance Toolkit** provides GPOs + baselines for Windows client/server.
- Includes **attack surface reduction (ASR)** recommendations and Security Management baseline (Intune).
- Often aligned with CIS + STIG; apply with phased deployment and monitor app compatibility.

## 9.3 DISA STIGs

- **STIGs (Security Technical Implementation Guides)** from DISA (US DoD) — hyper-strict, compliance-driven baselines per product.
- Levels: CAT I (critical), CAT II (significant), CAT III (minor).
- Tools: **SCAP Workbench** (openscap) on Linux, **STIG viewer / ComplianceAsCode** for scanning.

```bash
# RHEL STIG scan with openscap (mock)
oscap xccdf eval --profile xccdf_org.ssgproject.content_profile_stig \
  --results results.xml --report report.html /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml
```

## 9.4 NIST 800-53 Controls (Endpoint-Relevant)

| Control ID | Family | Endpoint Relevance |
|---|---|---|
| **AC-2** | Account management | Account provisioning, LAPS, least privilege |
| **AC-6** | Least privilege | Admin separation, UAC, sudo rules |
| **IA-5** | Authenticator management | MFA, password policy, key management |
| **SC-7** | Boundary protection | Host firewalls, segmentation |
| **SC-28** | Protection of information at rest | BitLocker/FileVault/LUKS |
| **SI-2** | Flaw remediation | Patch management program |
| **SI-4** | System monitoring | EDR/SIEM, event correlation |
| **SI-5** | Security alerts | Alerting + response SLAs |
| **SI-7** | Software integrity | App control, FIM |
| **AU-2/AU-6** | Audit logging | Event log collection + review |

### Framework Comparison

| Framework | Focus | Strictness | Best For |
|---|---|---|---|
| CIS Benchmark | Practical hardening | Medium | General enterprises |
| MS Security Baseline | Microsoft products | Medium-High | Windows/Intune orgs |
| DISA STIG | Compliance/DoD | Very High | Regulated/gov environments |
| NIST 800-53 | Risk/control framework | Varies by system | Overall risk program |

---

# 10. Patch Management

## 10.1 Patching Strategies

| Strategy | Description | Pros | Cons |
|---|---|---|---|
| Auto-update everything | Apply all patches immediately | Lowest risk, fast | Breakage, no control |
| Ring/cohort rollout | Small pilot ring → broad → late | Controlled risk | Slower |
| Maintenance window batch | Patch in monthly windows | Predictable | Exploit window until window |
| Risk-based (vulnerability-driven) | Prioritize critical/exposed CVEs | Focused effort | Requires scanning maturity |
| Phased by asset class | Servers, then workstations, then OT | Aligns to impact | Complex scheduling |

### Recommended Modern Approach
```
Day 0    Receive CVE + vendor patch info
Day 0-1  Triage: is it exploited in the wild? assets exposed?
Day 1    Patch "Tier 0" (internet-facing, DCs, domain admin hosts) — emergency if EITW
Day 3    Patch "Tier 1" (all workstations) in rings: 5% → 25% → 100%
Day 7-14 Patch "Tier 2" (non-critical internal), verify post-patch health
```

## 10.2 Vulnerability Scanning of Endpoints

| Scanner | Scope | Typical Cadence |
|---|---|---|
| Qualys/Tenable/Rapid7 | Authenticated host vuln scan | Weekly/monthly |
| Microsoft Defender / Intune | OS update compliance | Continuous |
| OpenSCAP / Lynis | Config + patch compliance | Monthly |
| Software inventory | Third-party app versions (Chrome, Java, Acrobat) | Continuous + monthly report |

### Mock scan workflow
```powershell
# Identify missing updates (Windows)
Get-HotFix | Sort InstalledOn
# Query WSUS/MECM for required patches on a fleet
Get-WmiObject -Namespace root\ccm\ClientSDK -Class CCM_SoftwareUpdate | 
  Where Status -eq 1 | Select Name, KBArticleID
```
```bash
# Linux: list available + installed
apt list --upgradable
yum list updates
dnf check-update
reboot-notifier / NeedsRestarting
```

## 10.3 Patch Testing

- **Test on golden image** + a small ring of volunteer endpoints.
- **Validate:** application compatibility (top 20 apps), driver stability, auth/services health.
- **Rollback plan:** use snapshots (VMs), Windows Update rollback, package downgrades for Linux.
- **Exceptions:** documented waivers with compensating controls (e.g., "Acrobat not patched due to line-of-business; mitigated by ASR rule + app container").

## 10.4 Mock Patching Schedule

| Patch Class | Apply Window | Rings | Rollout Example (fictional org) |
|---|---|---|---|
| OS critical/exploited (EITW) | Within 48h | 3 rings, 24h apart | Ring1: IT staff (20) → Ring2: Finance+Eng (300) → Ring3: all (1500) |
| OS monthly cumulative | Monthly, 1 week after MS Patch Tuesday | 4 rings | 5% → 25% → 60% → 100% |
| Browser/plugin | Within 7 days | Auto-update + fleet verify | Chrome/Firefox managed update; report compliance |
| Linux kernel | 14 days (or emergency) | Per pool | Dev pool → prod pool → OT |
| Firmware/drivers | Quarterly with change window | Vendor + pilot | Test on 5 → batch to all |
| Mobile OS | 14 days of release | MDM compliance gate | Auto install non-critical; enforce by version gate |

### Mock KPI Dashboard
```
Patch compliance (30-day): Windows 96.4% · Linux 98.1% · macOS 92.3% · Mobile 88.7%
Median time-to-patch critical: 2.1 days
Exception requests: 14 (all with compensating controls)
```

---

# 11. Remote Work Security

## 11.1 Secure Laptops for Remote Work

- **Corporate image only:** no personal software, restricted admin rights, disk encryption enforced.
- **EDR + VPN posture required** before network access.
- **No split-tunneling** (see below) for sensitive workloads.
- **Web filtering/DNS protection** on device, not just at HQ edge.
- **Cable/badge aware:** remote users at risk of shoulder surfing / theft — enforce lock-after-5min, auto-brightness on lock.

## 11.2 VPN Posture

| Posture | Behavior | Risk |
|---|---|---|
| Full-tunnel | All traffic through corporate VPN | Slower, but everything inspected |
| Split-tunnel | Only corporate IPs through VPN, rest direct | Faster, but corporate network invisible to controls |
| Zero-trust / SASE | Policy-based, app-level access (no VPN at all) | Modern approach, least exposure |

> **Recommendation:** For remote work, prefer **full-tunnel** or **per-app tunnel (SASE)**. If split tunneling is business-critical, add **device-level DNS/EDR coverage** for the direct path and block high-risk destinations regardless.

## 11.3 Split Tunneling Risks

- Malware on the laptop can exfiltrate via direct internet while VPN covers only some routes.
- C2 can route outside inspection; user DNS bypasses filtering.
- Compliance gaps: regulations requiring "data at rest protected + transit encrypted" may be violated on unmanaged egress.

### Mock mitigation configuration (WireGuard/IPsec concept)
```ini
# Client config: send all traffic via tunnel
AllowedIPs = 0.0.0.0/0, ::/0
# And in firewall: block outbound from LAN except tunnel
iptables -A OUTPUT -o eth0 -j REJECT
```

## 11.4 Remote Wipe

- **Endpoint:** trigger wipe via MDM/EDR or Intune when device lost/stolen/offboarded.
- **Mobile:** remote lock first, then full or selective wipe.
- **Caveat:** device must be online to receive commands; use "lost mode" that locks on next check-in; offline devices should wipe after N failed attempts or after X days offline (configured).

### Mock MDM command (fictional API)
```json
POST /api/devices/{id}/wipe
{
  "type": "full_device_wipe",
  "reason": "reported_lost",
  "approved_by": "security-ops@fictionalcorp",
  "ticket": "SOC-4471"
}
```

## 11.5 Endpoint Compliance Enforcement

Enforce at **access decision time** using device signals:

| Signal | Condition | Action |
|---|---|---|
| OS version / patch level | Below threshold | Block + direct to updates |
| Disk encryption | Off | Block sensitive app access |
| EDR agent | Not reporting / tampered | Block + alert SOC |
| Jailbreak/root | Detected | Deny + quarantine user |
| Compliance (CIS) score | < 85% | Warn → restrict |
| Location | Geo-unexpected | Step-up MFA |

### Mock Conditional Access policy (concept)
```
IF device is not compliant
   AND resource = (Email|VPN|SaaS-admin)
THEN deny access
      with remediation link to enrollment/updates
ALWAYS enforce MFA at first access per session
```

---

# 12. Mock Endpoint Compromise Case Study

> **WARNING:** Entirely fictional. Names, IPs, hashes, and organizations are invented for training.

## 12.1 The Setup (Fictional Org: "Acme Financial Holdings")

- 2,400 workstations (Windows 11), 40 Linux web/API servers, 300 iOS + 200 Android devices.
- EDR: fictional "SentinelCore" agent. SIEM: fictional "PulseLog". MDM: fictional "MobileTrust".
- Endpoint baselines: BitLocker on, AppLocker (enterprise), Credential Guard enabled, Sysmon v4.90 config deployed, patching monthly with 96% compliance.

## 12.2 Attack Chain Timeline

| Time (fictional) | Event |
|---|---|
| Mon 09:12 | `user_k.mendez@acmefin` opens "Invoice_AUG.pdf" from a **spear-phish** email (subject: "Urgent: Overdue Invoice #8842") |
| 09:12 | PDF exploits a **zero-day in reader** (mock CVE-2026-1827) → drops `%TEMP%\8f2a.hta` |
| 09:13 | `mshta.exe 8f2a.hta` runs; PowerShell `-enc` downloads stage 2 from `update-dl.acme-cdn-support.invalid` |
| 09:15 | Stage 2 is a **Cobalt Strike-style beacon** (fictional) injected into `svchost.exe`; C2 `beacon.c2-fake-corridor.io:443` (IP `185.14.22.9`), 60s beacon interval |
| 09:16 | Beacon executes **`reg.exe add HKLM\...\Run`** persistence + **scheduled task "WindowsUpdateManager"** |
| 09:20 | Adversary **dumps LSASS** with a signed-but-stolen driver chain tool (mimikatz variant) |
| 09:22 | Uses harvested creds `ACME\svc_backup` to **RDP lateral movement** to `ACME-FILESRV-02` |
| 09:25 | Enables **SMBv1** via registry on file server, stages encrypted archive to `C:\Windows\Temp` for exfil |
| 09:40 | Exfil staged archive via HTTPS to C2; attacker preps ransomware staging |

## 12.3 The Forensic Trail (What Logs Show)

| Artifact | Location | Evidence |
|---|---|---|
| Email | Mail gateway log | `Invoice_AUG.pdf` from `accounts@acme-fake-invoices.invalid` (Spoofed sender; DMARC FAIL) |
| PDF download | Browser + proxy | `GET /Invoice_AUG.pdf` from same domain, 09:12 |
| `8f2a.hta` drop | EDR file telemetry / Sysmon 11 | File created in `%TEMP%` by reader process, hash unknown |
| `mshta` run | Sysmon Event 1 | `mshta.exe` parent = reader process; command line shows `.hta` path |
| Encoded PS | Event 4104 + Sysmon 1 | `powershell -enc <base64>`; decoded string contains downloader URL |
| Injection | Sysmon 8/10 + EDR memory | Remote thread created in `svchost.exe` (PID 2816) by `mshta` |
| C2 beacon | Sysmon 3 + DNS 22 | 60s HTTPS beacon to `beacon.c2-fake-corridor.io` resolved to `185.14.22.9` |
| Persistence | Sysmon 12/13 + Event 4698 | `HKLM\...\Run\WindowsUpdateManager` + new scheduled task 09:16 |
| LSASS dump | Sysmon 10 | `ProcessAccess` target `lsass.exe` by unknown signed tool, 09:20 |
| Lateral | Security 4624 (type 3 network logon), IP `10.30.4.17` | Logon with `ACME\svc_backup`, source `WS-KMENDEZ` |
| SMB enable | Registry change | `HKLM\SYSTEM\...\LanmanServer\Parameters\SMB1 = 1` on file server |
| Exfil | Proxy + EDR network | 42 MB `backup_enc.zip` → C2 IP, 09:40 |
| Ransom note (prevented) | n/a — attack stopped at 09:41 | EDR auto-isolated host on ransomware preparation |

### Mock Log Snippet (Sysmon Event 1, fictional)
```
Event ID: 1
UtcTime: 2026-08-03 09:13:17.284
ProcessId: 2210
ParentProcessId: 1488          # reader process
Image: C:\Windows\System32\mshta.exe
CommandLine: mshta.exe C:\Users\k.mendez\AppData\Local\Temp\8f2a.hta
Hashes: SHA256=1f2a93c4b0d5e8f7a6c1b2d4e6f8a0c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a
ParentImage: C:\Program Files\AcmeReader\reader.exe
```

## 12.4 Defenses That Would Have Stopped It

| Stage | Defense | Would Have Stopped At |
|---|---|---|
| Phishing delivery | Email gateway DMARC enforcement + URL sandboxing | 09:12 |
| PDF exploit | Patching reader (zero-day mitigation via **macro/JS blocking** + AppLocker for reader add-ons) | 09:12 |
| `.hta` execution | **AppLocker/WDAC** deny `mshta` from `%TEMP%`; ASR rule "block execution from email/webmail" | 09:13 |
| Encoded PowerShell | **Script block logging + Constrained Language Mode** (CLM) blocked | 09:13 |
| Stage 2 download | DNS filter + firewall default-deny outbound to non-allowlisted IPs | 09:15 |
| Injection into svchost | EDR memory monitoring + **Credential Guard** (no hashes to steal) | 09:16 |
| Persistence | Autoruns baseline + Sysmon registry rules; **boot-stage baseline diffing** | 09:16 |
| LSASS dump | **LSA PPL + Credential Guard**; deny signature; Sysmon 10 alert → auto-isolate | 09:20 |
| Lateral movement | **LAPS** (randomized local admin), least privilege on `svc_backup`, network segmentation, 4624 correlation | 09:22 |
| SMB enable | Baseline registry monitoring + disabled SMB by policy | 09:25 |
| Exfiltration | Egress proxy + DLP on archive size; host isolation rule | 09:40 |
| Ransomware stage | EDR anti-ransomware + **controlled folder access** | 09:41 |

## 12.5 Post-Incident Learnings (Fictional)

1. **Zero-day assumption:** add hardening rings that assume a patch gap; AppLocker/WDAC would have killed stage 1 regardless.
2. **Credential Guard is the highest ROI control** — blocked the only credential theft here.
3. **Honeypot local admin accounts + LAPS** prevented pivot even when one account was guessed.
4. **Log discipline saved the day:** Sysmon + 4104 + security 4624 gave a full kill-chain in under 2 hours.
5. **Action items:** (a) enforce CLM for standard users, (b) default-deny outbound firewall on workstations, (c) automated host isolation on `svc_backup` logon anomalies, (d) quarterly purple-team of the same playbook.

---

## Appendix A — Quick Command Reference

### Windows
```powershell
# BitLocker, Defender, Firewall, Autoruns, Sysmon, audit
Get-BitLockerVolume
Get-MpPreference | Select DisableRealtimeMonitoring, EnableControlledFolderAccess
Get-NetFirewallProfile | Select Name, DefaultInboundAction
Get-CimInstance Win32_StartupCommand
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational'; Id=1; StartTime=(Get-Date).AddDays(-1)}
auditpol /get /category:*
```

### Linux
```bash
sudo systemd-analyze security app.service
sudo journalctl -u app.service -b --no-pager | tail -50
sudo ausearch -m avc -ts recent
sudo grep "Accepted publickey" /var/log/auth.log | tail
sudo ss -tulpn
```

### macOS
```bash
csrutil status
spctl --status
fdesetup status
system_profiler SPHardwareDataType
sudo log show --last 1h --predicate 'process == "mds" OR eventMessage CONTAINS[c] "TCC"'
```

## Appendix B — Key Event IDs & Logs Cheat Sheet

| Log | Event / Keyword | Meaning |
|---|---|---|
| Security | 4624 | Successful logon |
| Security | 4625 | Failed logon |
| Security | 4688 | Process creation |
| Security | 4697 | Service installed |
| Security | 1102 | Audit log cleared (critical) |
| Security | 4720 | New user account |
| Security | 4732 | Member added to group |
| System | 7045 | New service installed |
| PowerShell | 4104 | Script block logged |
| Sysmon | 1, 3, 10, 11, 12/13, 22 | Process, network, LSASS access, file, registry, DNS |
| auth.log (Linux) | "Failed password", "Accepted publickey" | Brute force / successful key logins |
| auditd | type=USER_AUTH, type=EXECVE | Auth events, command execution |
| macOS unified | TCC, spctl, fdesetup | Privacy, Gatekeeper, FileVault |

## Appendix C — Glossary

- **Endpoint:** any user/device-facing computing device connected to the network.
- **EDR:** Endpoint Detection & Response — continuous telemetry + behavioral response on the host.
- **LAPS:** Local Administrator Password Solution — randomizes local admin passwords.
- **UAC:** User Account Control — Windows privilege boundary.
- **WDAC:** Windows Defender Application Control — kernel-level app allowlisting.
- **TCC (macOS):** Transparency, Consent & Control — privacy data access permissions.
- **SIP (macOS):** System Integrity Protection — protects system files from modification.
- **BYOD:** Bring Your Own Device.
- **MDM/MAM:** Mobile Device Management / Mobile Application Management.
- **MTD:** Mobile Threat Defense.
- **ASR:** Attack Surface Reduction (Defender rules).
- **C2:** Command & Control.
- **IOC / TTP:** Indicator of Compromise / Tactics, Techniques & Procedures.

---

*End of document. All data fictional. Review periodically and align with your organization's risk tolerance, compliance obligations (NIST, CIS, ISO 27001, etc.), and tooling.*
