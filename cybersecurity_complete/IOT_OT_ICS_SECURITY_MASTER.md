# IoT, OT, and ICS Security — Master Reference

> **Version:** 1.0  
> **Classification:** Public Educational Reference  
> **Scope:** Security of the Internet of Things (IoT), Operational Technology (OT), and Industrial Control Systems (ICS)  
> **Compliance mapping:** ISA/IEC 62443, NIST SP 800-82, NERC CIP, ISO/IEC 27001, NISTIR 8228, ETSI EN 303 645  

---

## Table of Contents

1. [Understanding OT vs IT vs IoT](#1-understanding-ot-vs-it-vs-iot)
2. [ICS Components & Architectures](#2-ics-components--architectures)
3. [OT Threat Landscape](#3-ot-threat-landscape)
4. [Known ICS Attack Vectors](#4-known-ics-attack-vectors)
5. [IoT Security](#5-iot-security)
6. [Securing OT/ICS Networks](#6-securing-otics-networks)
7. [ISA/IEC 62443](#7-isaiiec-62443)
8. [Securing PLCs & Controllers](#8-securing-plcs--controllers)
9. [OT Monitoring & Detection](#9-ot-monitoring--detection)
10. [OT Incident Response](#10-ot-incident-response)
11. [Industrial Ransomware & Extortion](#11-industrial-ransomware--extortion)
12. [Physical Security & Safety](#12-physical-security--safety)
13. [Supply Chain & Third-Party Risk in OT](#13-supply-chain--third-party-risk-in-ot)
14. [IoT/OT Security Program Build-Out](#14-iotot-security-program-build-out)
15. [Mock OT Assessment / Case Study](#15-mock-ot-assessment--case-study)

---

## 1. Understanding OT vs IT vs IoT

### 1.1 Definitions

| Term | Definition | Primary Owners | Example Devices |
|------|-----------|----------------|-----------------|
| **IT** (Information Technology) | Systems that process, store, and transmit **business data**. Focus is on data confidentiality and integrity. | CIO / CISO | Servers, endpoints, laptops, databases, email, cloud apps |
| **OT** (Operational Technology) | Hardware and software that **monitors and controls physical processes** (machinery, valves, motors, chemical reactors). Focus is on uptime, reliability, and safety. | Plant Manager / Process Control Engineers | PLCs, RTUs, DCS, HMIs, historians, sensors, actuators |
| **IoT** (Internet of Things) | Networked physical devices with embedded sensors/software that connect to the internet and exchange data. | Varies (Product, Engineering, IT) | Smart cameras, smart thermostats, wearable devices, industrial sensors |
| **ICS** (Industrial Control System) | A general term for the systems used to control industrial processes; **encompasses SCADA, DCS, PLC, RTU, HMI**. | Process Control | Everything in an industrial control environment |
| **SCADA** (Supervisory Control And Data Acquisition) | A centralized system that **supervises geographically dispersed** sites (pipelines, water grids, power lines) collecting data from remote RTUs/PLCs. | Control Center Operators | SCADA servers, remote RTUs, comms links |
| **DCS** (Distributed Control System) | A control system for **continuous, complex processes within one site** (refineries, chemical plants) where controllers are distributed across the plant. | Process Control | DCS controllers, field I/O, redundant control networks |
| **PLC** (Programmable Logic Controller) | A rugged industrial computer that **runs the control logic** (ladder logic) for a specific machine or process. | Maintenance / Automation | Allen-Bradley ControlLogix, Siemens S7-1500 |
| **RTU** (Remote Terminal Unit) | A field device at a remote site that **converts sensor signals to digital** and communicates back to a SCADA master. | SCADA / Field Technicians | Telemetry RTUs at pump stations |
| **HMI** (Human-Machine Interface) | The **operator display** used to view process values and send setpoints/commands. | Operators | Wonderware InTouch, Ignition, Siemens WinCC |

### 1.2 Comparison: IT vs OT Priorities

Traditional IT uses the **CIA triad** with **Confidentiality first**. OT inverts this because a process cannot "reboot" — an outage can destroy equipment, injure people, or release hazardous material.

| Priority | IT | OT |
|----------|----|----|
| 1st | **Confidentiality** — protect data | **Availability** — keep the process running |
| 2nd | **Integrity** — ensure data accurate | **Integrity** — control commands & process values correct |
| 3rd | **Availability** — keep systems up | **Confidentiality** — process parameters are secondary |

> **Why reversed?** In IT, a data breach is the worst event. In OT, a **valve failing closed** during a chemical reaction, or a **motor overspeed**, can cause an explosion. A plant that is "offline for patching" is losing hundreds of thousands of dollars per hour and possibly endangering public safety.

### 1.3 Comparison Table: IT vs OT Mindset

| Characteristic | IT | OT |
|----------------|----|----|
| Security objective | Protect data | Protect process & people |
| Patch cadence | Monthly / weekly / on-demand | Quarterly at best; often years; must be tested on identical hardware |
| System lifetime | 3–5 years | 15–30+ years |
| Vendor support | Well supported | Often end-of-life, no longer supported |
| Operating system | Windows 10/11, Linux, modern | Windows 7, XP, proprietary RTOS, vintage embedded |
| Team expertise | Cybersecurity professionals | Control engineers, electricians |
| Failure tolerance | Reboot, restore from backup | **No interruption**; safety first |
| Performance | Seconds acceptable | Millisecond deterministic responses |
| Physical environment | Clean datacenter | Heat, vibration, dust, noise, humidity |

### 1.4 The Purdue Model (ISA-95 / ANSI/ISA-99)

The Purdue Enterprise Reference Architecture (PERA) divides industrial networks into levels. It is the backbone of OT network design and segmentation.

```
                        ┌─────────────────────────────────────────┐
  LEVEL 5  ENTERPRISE  │   ERP, email, web, business apps         │
                        │   (SAP, HR, finance, Office)             │
                        └───────────────────┬─────────────────────┘
                                            │ Business Network
                        ┌───────────────────┴─────────────────────┐
  LEVEL 4  SITE/BUSINESS│   Site LAN, MES, historians at site,    │
                        │   scheduling, reporting                  │
                        └───────────────────┬─────────────────────┘
                                            │ DMZ
                        ┌───────────────────┴─────────────────────┐
  LEVEL 3  SITE OPERATIONS / DMZ │   Plant/SCADA servers,         │
                        │   HMIs (supervisory), historians,       │
                        │   patch mgmt, antivirus, remote access  │
                        └───────────────────┬─────────────────────┘
                                            │ Control Network
                        ┌───────────────────┴─────────────────────┐
  LEVEL 2  SUPERVISORY  │   HMI stations, alarm servers, SCADA    │
                        │   master, engineering workstations      │
                        └───────────────────┬─────────────────────┘
                                            │ Control Bus
                        ┌───────────────────┴─────────────────────┐
  LEVEL 1  CONTROLLERS  │   PLCs, DCS controllers, RTUs           │
                        └───────────────────┬─────────────────────┘
                                            │ Fieldbus / I/O
                        ┌───────────────────┴─────────────────────┐
  LEVEL 0  FIELD        │   Sensors, actuators, drives, I/O       │
                        └─────────────────────────────────────────┘
```

**Level-by-level explanation:**

- **Level 5 — Enterprise Network:** Corporate IT. Email, ERP, HR, finance. A compromised laptop here is the classic **entry point** into OT.
- **Level 4 — Site Business Systems:** Site-level IT: production scheduling (MES), reporting, site file servers.
- **Level 3 — Site Operations / DMZ:** The buffer. Patch management, AV update servers, historians, and **remote access gateways** live here. This is where IT meets OT.
- **Level 2 — Control Systems / Supervisory:** HMIs, operator consoles, SCADA masters, alarm servers. Where operators interact with the process.
- **Level 1 — Controllers:** PLCs, RTUs, DCS controllers executing control logic in real time.
- **Level 0 — Physical Process:** Sensors (pressure, temperature, flow), actuators, valves, motors, drives. The "hands and eyes" of the plant.

> **Level 3.5 — The DMZ:** Not formally in the original Purdue model, the **demilitarized zone** between L3 and L4 is the single most important architectural control. All traffic between IT and OT should terminate here.

### 1.5 Why "It's Different Down Here" — Realities

1. **Availability is king.** Losing the ability to control a turbine for 15 minutes may mean the entire regional grid destabilizes.
2. **Legacy everywhere.** A 2006-era Windows XP HMI still running because "it works and nobody knows how to migrate it" is a realistic finding.
3. **Patching is dangerous.** A Windows update can break a proprietary OPC driver. Patches are tested in a lab on *identical* hardware before rollout.
4. **Cybersecurity is often seen as IT's problem.** Control engineers may distrust security changes that could "break the process."
5. **Air-gaps are mostly mythology.** "We're air-gapped" is frequently false — there is almost always a wireless bridge, a USB stick, a vendor VPN, or a firewall rule with an implicit permit.

---

## 2. ICS Components & Architectures

### 2.1 System Families

| System | Typical Use | Architecture | Scale |
|--------|------------|--------------|-------|
| **SCADA** | Water distribution, pipelines, power transmission, rail | Central master polls remote RTU/PLC sites over WAN/LTE/radio | Geographic (100s of sites) |
| **DCS** | Refineries, chemical plants, power generation | Controllers distributed across process areas, tightly coupled, redundant | Single large site |
| **PLC-based** | Discrete manufacturing, packaging lines, machinery | Individual PLCs, often with local HMIs | Machine → factory |

### 2.2 A Typical SCADA Architecture (Mock)

```
                      ┌──────────────────────────────┐
                      │  SCADA Control Center        │
                      │  - SCADA master server       │
                      │  - Alarm server              │
                      │  - Historian                 │
                      │  - Operator HMIs            │
                      └───────────────┬──────────────┘
                                      │ WAN / MPLS / LTE / Radio
        ┌─────────────┬───────────────┼───────────────┬─────────────┐
   ┌────┴────┐   ┌────┴────┐     ┌────┴────┐     ┌────┴────┐   ┌────┴────┐
   │Pump Stn1│   │Pump Stn2│     │Tank Farm│     │Booster  │   │Campus   │
   │RTU +PLC │   │RTU+PLC  │     │PLC      │     │Station  │   │DCS      │
   │sensors/ │   │sensors/ │     │+ valves │     │RTU      │   │controllers
   │actuators│   │actuators│     │         │     │         │   │         │
   └─────────┘   └─────────┘     └─────────┘     └─────────┘   └─────────┘
```

### 2.3 The Control Loop — Fundamentals

```
               ┌────────────────────────────────────┐
               │                                    │
   setpoint ──►│   CONTROLLER (PLC/DCS)            │
   (desired)   │   compares setpoint vs process    │──► output signal (mA/4-20, digital)
               │   value, computes corrective      │        │
               │   action                          │        ▼
               └──────────────────────▲────────────┘    ACTUATOR (valve, motor, drive)
                                      │                        │
                                      │                        │
               ┌──────────────────────┴────────────┐   changes process
               │   PROCESS (pump, tank, reactor)   │◄─────────────┘
               └──────────────────────▲────────────┘
                                      │
               SENSOR (pressure, temperature, level)
```

A **closed-loop** control system reads a sensor, compares it to a setpoint, and adjusts an actuator. If an attacker can **spoof the sensor reading** or **inject a false setpoint**, the controller will make the process do exactly the wrong thing — while the operator's HMI shows "everything is fine."

### 2.4 Fieldbuses & Protocols

| Protocol | Layer | Characteristics | Security |
|----------|-------|-----------------|----------|
| **Modbus TCP/IP** | Application over TCP:502 | Simple, ubiquitous, register read/write | **None** — no authentication, no encryption |
| **Modbus RTU** | Serial (RS-485/232) | Master/slave polling over serial lines | None |
| **Profibus** | Serial fieldbus | Siemens ecosystem, cyclic I/O | None by default |
| **Profinet** | Ethernet | Siemens, real-time industrial Ethernet | Optional security classes (with limits) |
| **OPC UA** | Application (TCP:4840) | Platform-independent data exchange, **supports encryption & auth** | Good when configured properly |
| **DNP3** | SCADA (TCP:20000 / serial) | Power/water utilities, robust | Authentication optional (SAv5), often not enabled |
| **EtherNet/IP** | Ethernet | Rockwell/AB, CIP object model | CIP Security exists but rarely deployed |
| **HART / Foundation Fieldbus** | Field instruments | 4-20mA with digital overlay | None |

### 2.5 Why Industrial Protocols Are Insecure by Design

Industrial protocols were built in an era of **trusted, isolated networks**. Requirements were:

- **Determinism** — must respond in milliseconds.
- **Simplicity** — a field device with 64KB of RAM cannot run TLS.
- **Longevity** — devices deployed in 1998 still running in 2026.
- **No adversary model** — the "network" was a copper cable inside a locked plant.

The result: **Modbus/TCP has zero security** — no authentication, no encryption, no session concept. Any host that can reach TCP port 502 can read and write any register of any PLC.

### 2.6 Mock Modbus/TCP Example

A raw Modbus/TCP request to read holding registers from a PLC (using Wireshark-style hex dump):

```
Modbus/TCP Header:
  Transaction ID (2 bytes):   0x0001
  Protocol ID   (2 bytes):    0x0000      (always zero for Modbus)
  Length        (2 bytes):    0x0006
  Unit ID       (1 byte):     0x01        (address of the PLC)

Modbus PDU:
  Function Code (1 byte):     0x03        (Read Holding Registers)
  Starting Addr (2 bytes):    0x0010      (register 16)
  Quantity      (2 bytes):    0x0002      (read 2 registers)

Full request (12 bytes):
  00 01 00 00 00 06 01 03 00 10 00 02
```

A malicious "force setpoint" write to register 16 (e.g., the chlorine dosing setpoint on a water plant) uses function code **0x06 (Write Single Register)**:

```
  00 02 00 00 00 06 01 06 00 10 FF FF
  ───────────────────────   ── ── ──── ────
  header (unit 01)          FC=06  addr  value=0xFFFF (max setpoint!)
```

**No password. No handshake. No check that the sender is the operator.** This is the core weakness attackers exploit.

---

## 3. OT Threat Landscape

### 3.1 Threat Actors Targeting ICS

| Actor Class | Example (mock) | Primary Motivation | Typical Capability |
|-------------|----------------|--------------------|--------------------|
| **Nation-state** | "APT-Nimbus" (fictional intelligence service) | Geopolitical sabotage, espionage, pre-positioning | Very high — zero-days, custom malware, deep understanding of industrial protocols |
| **Cybercriminals** | Ransomware syndicates | Financial extortion | High — tooling, RaaS, but less OT protocol expertise |
| **Hacktivists** | Environmental action groups | Political statement / disruption | Medium |
| **Insiders** | Disgruntled control engineer | Revenge, sabotage, intellectual property theft | Very high — legitimate access, knows the process |
| **Terrorist groups** | Hypothetical | Mass disruption, fear | Unknown — often rely on insider knowledge or purchased tooling |
| **Script kiddies** | Curiosity-driven individuals | Thrill, prestige | Low — use scanners, known exploits |

### 3.2 Motivations

1. **Sabotage** — damage physical equipment or cause environmental release.
2. **Espionage** — steal proprietary process recipes, plant layouts, or control logic.
3. **Extortion / Ransom** — encrypt HMIs and historian databases, or threaten to open valves / stop production.
4. **Disruption** — deny service, force shutdowns, tarnish a company's reputation.
5. **Pre-positioning** — stay dormant for years to enable a future kinetic attack.

### 3.3 Real-World Attack Classes (Lessons, Fictionalized Summaries)

> **Lesson 1 — Stuxnet-style (2010).** The archetype. A worm entered an isolated facility via USB, exploited four Windows zero-days, and used stolen certificate keys to load unsigned drivers. It then **rewrote Siemens S7 PLC ladder logic** while replaying "normal" sensor values to the HMI, silently destroying centrifuges by spinning them to destructive speeds.  
> **Takeaway:** Air-gaps fail against USB. Firmware and logic integrity must be verified. "Trusted" devices can be impersonated.

> **Lesson 2 — Safety system attack (Triton/Trisis, 2017).** Attackers compromised the safety instrumented system (SIS) — the *very device meant to stop a disaster* — in a petrochemical plant, delivering a payload that could suppress safety functions. The plant had to be shut down.  
> **Takeaway:** Safety systems are not "off limits" by magic. They are network-attached and must be protected with the highest priority and an **independent** security tier.

> **Lesson 3 — Colonial Pipeline-style ransomware (2021).** A single compromised VPN credential with no MFA let ransomware hit the IT network. Though OT was not directly encrypted, the company **shut the pipeline down** because billing/production integration was compromised — causing fuel shortages across the East Coast.  
> **Takeaway:** IT ransomware becomes an OT availability event. MFA on remote access is non-negotiable. A "clean IT" does not mean "safe OT."

> **Lesson 4 — Ukraine grid blackout (2015/2016).** Nation-state actors used spear-phishing to reach corporate networks, then pivoted to SCADA, opened breakers at substations via HMIs, and **deleted firmware from serial-to-Ethernet converters**, delaying recovery. The 2016 event automated the disruption.  
> **Takeaway:** A well-targeted campaign moves quickly. Secure recovery paths and offline backups are essential because **malware deletes your ability to reboot**.

> **Lesson 5 — Ransomware on manufacturing (e.g., 2020s automotive/aerospace suppliers).** Ransomware entered corporate IT via phishing and traversed to production networks, halting assembly lines and encrypting design files. Downtime cost vastly exceeded the ransom demand.  
> **Takeaway:** Production downtime is the crown jewel for extortionists. Strong segmentation and tested recovery procedures save real money.

### 3.4 OT-Specific Challenges

- **Legacy unpatched systems:** Windows XP/7 HMIs, ancient firmware, no vendor patches available.
- **Long asset lifecycles:** 20–30 years vs. an IT refresh every 3–5 years.
- **Safety-criticality:** any security action (reboot, patch, packet filter) can cause a safety event.
- **Sparse visibility:** engineers often lack a complete asset inventory and network map.
- **Vendor lock-in:** security fixes require the OEM's help, who may charge and take months.
- **Determinism constraints:** inline security appliances that add latency may be unacceptable.
- **No authentication in protocols:** detection of "illegitimate" writes is very hard.

---

## 4. Known ICS Attack Vectors

### 4.1 Attack Surface Map

```
        CORPORATE IT                                OT / PROCESS
   ┌─────────────────┐                         ┌──────────────────────────────┐
   │ Email / phishing│──► initial access       │  Level 3 servers            │
   │ Web browser     │        │                │  - patch mgmt (push chain)   │
   │ VPN / RDP       │        ▼                │  - remote access gateway     │
   │ USB             │   IT workstation        │  - historian                 │
   │ SMB shares      │        │                └──────┬───────────────────────┘
   └─────────────────┘        │                       │
                              │  lateral movement     ▼
                        ┌─────┴──────────────────────────────┐
                        │  DMZ / Level 3.5                    │
                        │  (file transfer, AV, jump host)     │
                        └─────┬──────────────────────────────┘
                              ▼
                        ┌──────────────────────────────┐
                        │  Level 2  HMI / SCADA        │
                        │  - commands to controllers   │
                        └──────┬───────────────────────┘
                               ▼
                        ┌──────────────────────────────┐
                        │  Level 1  PLC / RTU / DCS    │
                        │  - logic rewrite, register   │
                        │    manipulation, DoS         │
                        └──────────────┬───────────────┘
                                       ▼
                        ┌──────────────────────────────┐
                        │  Level 0  Sensors/actuators  │  (rare direct, via PLC)
                        └──────────────────────────────┘
```

### 4.2 Attack Vectors in Detail

| Vector | Description | Realistic Example (Mock) |
|--------|-------------|---------------------------|
| **Direct OT network attack** | Attacker reaches L2/L1 from a compromised IT host through a weak firewall rule | A worm traverses an "allow all" rule between VLAN 10 (office) and VLAN 20 (control) to scan for Modbus port 502 |
| **Protocol attacks** | Crafted Modbus/TCP, DNP3, or OPC packets read/write registers without authentication | A script issues `06` writes to reset all pump speeds to 100% |
| **PLC logic attacks** | Rewrite ladder logic to do malicious actions while reporting normal | Stuxnet-style: logic compiled to overdrive a motor while replaying safe readings |
| **HMI attacks** | Deface HMIs, lock operators out, or show false data | Ransomware renames all HMI windows and demands Bitcoin "to restore control" |
| **Engineering workstation compromise** | ESs hold source project files; an attacker uses them to understand and modify the process | Steal the DCS project database to learn valve addresses, then target writes |
| **Supply chain / firmware** | Malicious or backdoored firmware in new devices, or tampered update files | A "updated" protocol converter ships with an implant that enables remote shell |
| **Remote access abuse** | RDP / vendor VPN without MFA, shared generic accounts | RDP brute-force on the plant's exposed remote-access server succeeds in 3 days |
| **USB / removable media** | Malware smuggled on USB into an isolated plant | A contractor's USB stick containing a spreader trojan infects the ES |
| **Insiders** | Legitimate users acting maliciously or negligently | A disgruntled engineer schedules a tank drain during a "maintenance" window |
| **Physical** | Direct access to equipment, consoles, network jacks | An attacker walks into the control room and attaches a laptop to the control network |
| **Wireless** | Unsecured Wi-Fi, Bluetooth, radio links into the plant | A plant Wi-Fi with WEP/weak password allows access to wireless field devices |

### 4.3 Realistic Mock Modbus Attack Walkthrough

**Stage 1 — Reconnaissance.** Attacker (via compromised IT host) discovers a pump PLC:

```
$ masscan 10.10.20.0/24 -p502
Discovered open port 502/tcp on 10.10.20.14   <- pump station PLC
```

**Stage 2 — Read registers to learn the process.**

```
Modbus request :  FC 0x03 read 20 registers starting at 0x0000
Response       :  coil state 0x01 (running)
                  register 0x0000 (speed)  = 1450 RPM
                  register 0x0004 (setpoint)= 1500 RPM
```

**Stage 3 — Craft malicious write.**

```
python3 -c "
import socket
s = socket.create_connection(('10.10.20.14', 502))
# Write Single Register 0x0004 (setpoint) to 3000 RPM (beyond rating)
pkt = bytes.fromhex('000300000006010600040BB8')
s.send(pkt)
print(s.recv(12).hex())
"
00 03 00 00 00 06 01 06 00 04 0B B8     # echoed by PLC: accepted!
```

The PLC accepts the write with **no authentication**. A pump rated at 1800 RPM now spins at 3000 RPM. Depending on pump curve and pipe rating, this can **destroy the pump, flood the facility, or create an explosive over-pressure** — all while the HMI reports a "normal" speed, because the HMI caches its own copy of the value.

### 4.4 MITRE ATT&CK for ICS

Key techniques security teams should map (all are catalogued in **MITRE ATT&CK for ICS**):

- **Initial Access:** Spearphishing (T0865), Remote Services (T0886), Exploit Public-Facing Application (T0819), Supply Chain Compromise (T0862)
- **Execution:** Command-Line Interface (T0807), HMI (T0826), Modify Controller Logic (T0839)
- **Persistence:** Project File Infection (T0873), Modify Alarm Settings (T0838)
- **Discovery:** Network Sniffing (T0842), I/O Module Discovery (T0881)
- **Lateral Movement:** Remote Services (T0886), Default Credentials (T0812)
- **Collection/Command:** Valid Accounts (T0859), User Execution (T0863)
- **Impair Process Control:** Manipulation of Control (T0831), Device Restart/Shutdown (T0855), Denial of View (T0815)

---

## 5. IoT Security

### 5.1 What Is IoT?

IoT is the interconnection of **physical devices with embedded electronics, software, and connectivity** that collect/exchange data with minimal human intervention. IoT devices form the largest attack surface in many enterprises because they are:

- Cheap, numerous, and long-lived.
- Hard to inventory (shadow IoT / IT-monitored-but-not-managed).
- Often exposed directly to the internet.
- Rarely patched or managed by a security team.

### 5.2 IoT Architecture

```
  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
  │ Edge /     │   │ Gateways   │   │ Cloud      │   │ Mobile /   │
  │ Devices    │──►│ (hub,      │──►│ Platforms  │──►│ Web Apps   │
  │ sensors,   │   │  router,   │   │ (IoT cloud,│   │ dashboards │
  │ actuators, │   │  controller│   │  data lake)│   │ APIs       │
  │ cameras    │   │            │   │            │   │            │
  └────────────┘   └────────────┘   └────────────┘   └────────────┘
       ▲                 │                │                │
       │                 └── MQTT / CoAP / HTTP(S) / LoRaWAN / NB-IoT / BLE / Zigbee
       │
       └───────── protocols to gateway: BLE, Zigbee, Z-Wave, Wi-Fi, Thread
```

Common protocols: **MQTT** (pub/sub, TCP:1883/8883 TLS), **CoAP** (UDP, DTLS), **HTTP/REST**, **AMQP**, **LoRaWAN**, **Zigbee**, **Z-Wave**, **Bluetooth LE**.

### 5.3 IoT Threat Model

| Asset | Threats |
|-------|---------|
| Device firmware | Extraction, reverse engineering, backdooring, malicious OTA update |
| Device credentials | Default creds, hardcoded keys, credential reuse |
| Communication | Interception (no TLS), spoofing, replay, command injection |
| Gateway/router | Compromise → pivot into home/office network, DNS hijack |
| Cloud platform | Insecure API, weak auth, mass data exposure, account takeover |
| Mobile app | Reverse engineering, insecure storage of tokens, MiTM of traffic |
| Physical device | Tampering, cloning, side-channel attacks |
| Data / privacy | Collection of personal data, biometrics, location, behavior |

### 5.4 Common IoT Vulnerabilities (with Mock Examples)

1. **Default / hardcoded credentials**
   - Example: A "smart irrigation controller" ships with admin/admin, telnet enabled. Shodan finds 40,000 exposed units worldwide.
2. **Insecure / unencrypted protocols**
   - Example: A building HVAC controller broadcasts setpoints over plaintext MQTT; anyone on the Wi-Fi can read room temperatures and override the AC.
3. **No update mechanism (or unsigned updates)**
   - Example: A smart lock has no OTA; firmware updates are a physical SD-card insert, so a 2022 vulnerability remains unfixed in 2026.
4. **Insecure web APIs / cloud**
   - Example: An IDOR in a vendor's API (`GET /api/users/{id}`) lets any user pull another user's doorbell footage.
5. **Mobile app flaws**
   - Example: The companion app stores the device API token in plaintext SQLite and disables TLS verification for "performance."
6. **Weak wireless pairing / lack of replay protection**
   - Example: A garage-door opener's rolling code is not actually rolling; captured commands replay for years.
7. **Privacy leakage**
   - Example: A fitness device shares GPS + heart-rate data with third-party analytics without user consent.
8. **Supply chain**
   - Example: A rebranded IP camera ("BrandX") is actually a repackaged unit with a known backdoor account `uidroot:x` added by the manufacturer.

### 5.5 IoT Botnets

**Mirai (2016):** Conscripted insecure IP cameras and DVRs into a 600+ Gbps DDoS botnet, taking down large parts of the internet. Infection method: **default telnet credentials** + known IoT vulns.

Mock Mirai-style credential list (fictional subset):

```
root:123456
root:root
admin:admin
support:support
user:password
default:default
admin:password1
```

**Mozi (2019–2023):** A P2P botnet evolving Mirai with DDoS, persistence, and device backdoors, targeting Netgear, D-Link, and other routers. Notable for a **peer-to-peer C2 architecture** that made takedown harder.

| Property | Mirai | Mozi |
|----------|-------|------|
| C2 architecture | Central IRC | P2P / distributed |
| Primary target | Cameras, DVRs | Routers, NAS |
| Persistence | Minimal (RAM) | Firmware-level, files |
| Evolution | Heavily forked | DDoS + backdoor + proxy |

### 5.6 Consumer IoT — Smart Home Attack Realities

- **Smart cameras** with exposed RTSP (`rtsp://admin:pass@ip:554`) enable voyeurism and botnets.
- **Smart routers** with default passwords and outdated firmware are the most common entry point for home network compromise.
- **Smart assistants** process ambient audio — privacy risk if cloud account is compromised.
- **Smart locks / garage openers** — if cloud or app is weak, physical entry is possible.
- **Firmware OTA** — a malicious update on the vendor's CDN can ship malware to millions.

### 5.7 Healthcare IoT (IoMT)

| Device | Risk Scenario |
|--------|---------------|
| **Infusion pumps** | Remote change of dose rates, or ransomware locking the pump interface |
| **Pacemakers / ICDs** | Wireless reprogramming, battery drain, altered therapy |
| **Insulin pumps** | Forged insulin doses over Bluetooth |
| **Imaging (PACS/CT/MRI)** | Ransomware encrypting scans, delaying life-saving diagnosis |
| **Bedside monitors** | Data falsification (spoofed vitals) impacting clinician decisions |

Regulation / guidance: **FDA premarket/postmarket cybersecurity guidance**, **ISO/IEC 81001-5-1** (health software security), hospital security programs with **unique-device-identification (UDI)** inventories.

### 5.8 IoT Security Frameworks

**NISTIR 8228 — "Considerations for Managing IoT Cybersecurity and Privacy Risks":**
- Aims to integrate IoT into existing risk management.
- Distinguishes IoT device capabilities vs. enterprise expectations (e.g., many devices can't support patching or strong authentication).
- Provides 3 levels of "IoT device cybersecurity capabilities" and guidance for IT/security teams.

**ETSI EN 303 645 — "Cyber Security for Consumer Internet of Things":**
A baseline set of 13 provisions, including:

1. No universal default passwords.
2. Implement a vulnerability disclosure policy.
3. Keep software updated (secure update mechanism).
4. Securely store sensitive security parameters.
5. Communicate securely.
6. Minimize exposed attack surfaces.
7. Ensure software integrity.
8. Ensure personal data is secure.
9. Make systems resilient to outages.
10. Examine system telemetry data.
11. Make it easy for users to delete user data.
12. Make installation and maintenance easy.
13. Validate input data.

Other useful references: **ISO/IEC 27400** (IoT security/privacy guidelines), **OWASP IoT Top 10**, **NIST SP 800-213** (IoT device cybersecurity guidance).

### 5.9 IoT Testing

| Test | Description |
|------|-------------|
| **Firmware analysis** | Extract filesystem (binwalk), find hardcoded secrets, check patch level |
| **Fuzzing** | Malformed MQTT/CoAP/HTTP inputs to find crashes |
| **Network traffic review** | Confirm TLS everywhere, check for plaintext credentials |
| **API testing** | IDOR, auth bypass, rate limiting, injection |
| **Mobile app review** | Root detection, insecure storage, certificate pinning |
| **Radio/wireless review** | BLE/Zigbee/Z-Wave sniffing, key derivation, replay |
| **Physical testing** | JTAG/UART access, chip-off analysis, tamper response |

### 5.10 IoT Secure Development Lifecycle

```
 Secure Requirements → Threat Modeling → Secure Design (auth, TLS, keys)
       → Secure Coding (input validation, least privilege)
       → Security Testing (SAST, DAST, fuzz, pen test)
       → Secure Build/Release (signing, reproducible builds, SBOM)
       → Secure Operations (OTA with signature verification, vuln disclosure,
                            telemetry, device lifecycle/end-of-life)
       → Feedback loop (CVEs → next iteration)
```

Key SDevSecOps practices: **SBOM** (software bill of materials), **code signing**, **secure key provisioning** (HUK/TEE), **OTA with rollback protection**, **monitoring device health**, and a **vulnerability disclosure program**.

---

## 6. Securing OT/ICS Networks

### 6.1 The Golden Rule: Segmentation (Zones and Conduits)

Following ISA/IEC 62443, split the network into **zones** (same security requirements) connected by **conduits** (the communication paths). Each zone has a defined security level, and every conduit is controlled (firewalled, whitelisted).

```
  ┌─────────────── ENTERPRISE ZONE ───────────────┐
  │  office PCs, ERP, email, file servers          │
  │  Security Level 0-1                           │
  └──────────────────────┬────────────────────────┘
                         │ CONDUIT (firewalled, whitelisted, IPSEC optional)
              ┌──────────▼──────────┐
              │  IT/OT DMZ ZONE     │  jump host, patch proxy, AV server,
              │  SL 1-2             │  historian mirror, remote access GW
              └──────────┬──────────┘
                         │ CONDUIT (strict, allow-list)
              ┌──────────▼──────────┐
              │  CONTROL ZONE       │  HMIs, SCADA servers, ES
              │  SL 2-3             │
              └──────────┬──────────┘
                         │ CONDUIT (deterministic)
              ┌──────────▼──────────┐
              │  CONTROLLER ZONE    │  PLCs, RTUs, DCS
              │  SL 3-4             │
              └─────────────────────┘
```

**Rules of thumb:**
- Only **specific, needed** traffic crosses conduits (stateful inspection, allow-list rules).
- **Block all** other traffic by default.
- Never allow direct IT↔PLC traffic. Everything passes through the DMZ.
- Limit **broadcast traffic** and **ICMP** across zones.

### 6.2 IT/OT DMZ Design (Mock)

```
                          ┌──────────────────────────────────────┐
                          │           IT / OT DMZ                │
   ┌───────────┐          │  ┌────────────────────────────────┐  │          ┌──────────────┐
   │ IT Network │          │  │ Patch Management Server        │  │          │ Control Network│
   │  VLAN 10  │◄────────►│  │ AV / EDR Update Proxy           │  │◄────────►│  VLAN 30      │
   │  (office) │          │  │ OPC-UA / Historian Edge Gateway │  │          │  HMIs, SCADA  │
   └───────────┘          │  │ Jump Host (bastion, MFA)        │  │          │  servers      │
                          │  │ Remote Access Gateway (vendor)   │  │          └──────┬───────┘
                          │  └────────────────────────────────┘  │                 │
                          └──────────────────────────────────────┘            ┌────▼───────┐
                                                                               │ PLCs, RTUs │
                                                                               │  VLAN 40   │
                                                                               └────────────┘
                          Firewalls:  IT<─>DMZ   (allow 443, patch, RDP to jump host only)
                                      DMZ<─>OT   (allow 4840 OPC-UA, Modbus only to HMIs,
                                                   block everything else)
```

**Design principles:**
- Two distinct firewall pairs (IT→DMZ, DMZ→OT). No firewall rule passes traffic straight through DMZ.
- DMZ hosts are **dual-homed only if necessary** — prefer single-homed with a proxy.
- All file transfers IT→OT land in the DMZ and are **scanned** before moving into OT.
- Remote access connects to the **jump host**, not directly to OT devices.

### 6.3 Firewalls for OT

| Capability | Description |
|-----------|-------------|
| **Stateful inspection** | Track connection state; deny unsolicited inbound |
| **Industrial protocol awareness / DPI** | Understand Modbus/TCP, DNP3, OPC — enforce register-level rules ("HMI may write to registers 0x0000-0x0050; block others"), flag function-code anomalies |
| **App-aware ACLs** | Whitelist by application identity, not just IP/port |
| **One-way data diodes** | For highest security (e.g., historian mirror), physically enforce one-directional flow |

**Mock DPI rule example (Modbus/TCP):**

```
RULE-1 ALLOW  src=HMI_subnet  dst=PLC_pumps   proto=tcp dstport=502
             APPLY modbus: function_code in {03 (read), 06 (write single)}
             register_range = 0x0000-0x0050        -> ALLOW
             ANY OTHER modbus function_code / register -> ALERT & DROP
RULE-2 DROP   src=any          dst=any          proto=tcp dstport=502
```

### 6.4 Network Monitoring in OT

- **Passive monitoring** is preferred: **SPAN/TAP ports** mirror traffic to an IDS; **no inline risk**.
- Inline devices add latency and a failure point → **avoid inline in Level 0/1** if possible.
- Industrial IDS (e.g., protocol-aware) detect:
  - Invalid or out-of-range Modbus writes
  - Unauthorized protocol use (e.g., HTTP to a PLC)
  - Unknown devices joining the network
  - Command floods / DoS
- **Baseline normal traffic** first, then alert on deviation (see Section 9).

### 6.5 Remote Access Security

| Control | Implementation |
|---------|----------------|
| **Jump host / bastion** | All remote sessions terminate on a hardened, patched host in the DMZ; no direct vendor RDP to OT |
| **MFA** | Token / app-based MFA for every remote user and every vendor account |
| **Session recording & audit** | Record vendor sessions; reviewer signs off |
| **Time-boxed access** | Vendors get access only during the maintenance window |
| **Least privilege** | Per-account rules; no shared "vendor" accounts |
| **Dedicated VPN** | Separate VPN terminating at the DMZ, not the office LAN |

### 6.6 Asset Inventory — The Foundation

> You cannot secure what you do not know exists.

| Inventory Field | Example (Mock) |
|-----------------|----------------|
| IP / MAC | 10.10.40.12 / 00:1B:9E:5A:77:11 |
| Type | PLC (Allen-Bradley ControlLogix 5570) |
| Firmware / OS | v31.011, CIP over EtherNet/IP |
| Location / Zone | Filter Building / Zone 4 (Controllers) |
| Owner / Support | Water Ops / OEM "AquaControls" |
| Patch status | Last patched 2018-04 (v30.01x) |
| Ports open | 44818 (EtherNet/IP), 22 (SSH), 80 (web) |
| Consequence | High (chlorination setpoints) |

Discovery methods: network scans (safe, see §9.4), LLDP/CDP, DHCP leases, asset management agents, vendor records, rack/panel walk-downs, packet capture analysis.

### 6.7 Patch Management in OT (Mock Process)

```
  1.  VULN DISCLOSURE        Vendor (e.g., Rockwell/Siemens/Schneider) advisory
                             arrives, or a CVE is published.
  2.  IMPACT REVIEW          (Security + Controls) does this affect our exact
                             firmware/OS/hardware config? Is it exploitable
                             from our network zones?
  3.  PRIORITIZE             Critical = remotely exploitable + internet-facing +
                             safety impact. Routine = deferred to maintenance.
  4.  LAB TEST               Patch applied to a matching PLC/HMI/VM in the
                             test lab; process regression tested for 2-4 weeks.
  5.  CHANGE WINDOW          Scheduled with operations during planned shutdown
                             or low-demand period; change request approved.
  6.  ROLLOUT                Staged: pilot unit → group 1 → rest of site.
  7.  VERIFY & BASELINE      Confirm functionality, update asset inventory,
                             re-baseline monitoring.
  8.  MONITOR                Watch for process anomalies for 30 days.
```

Mock example — a Windows 7 HMI on the Siemens S7-1500 network has a CVE-2021-34527 (PrintNightmare) rated 9.8 CVSS:

```
Action:  Validate HMI has no Print Spooler dependency.
Lab:    Patch tested on identical HMI + PCS7 stack.  No regression.
Window: Plant maintenance weekend, Sat 02:00-04:00.
Result: Applied to 14 HMIs over 2 weekends. Process unaffected.
```

---

## 7. ISA/IEC 62443

### 7.1 Overview

**ISA/IEC 62443** is the global standard series for **industrial automation and control systems (IACS) security**. It is the de-facto framework for OT security programs, procurement, and assessment.

### 7.2 Standard Parts

| Part | Title | Audience |
|------|-------|----------|
| **62443-1-x** | Terminology, concepts, and models (1-1), Master glossary (1-2), System security compliance metrics (1-3) | Everyone |
| **62443-2-x** | Security program management (2-1), IACS security program rating (2-2), Patch management (2-3) | Asset owners / operators |
| **62443-3-x** | Security technologies for IACS (3-1), Security risk assessment and system design (3-2), System security requirements / security levels (3-3) | System integrators, engineers |
| **62443-4-x** | Secure product development lifecycle (4-1), Technical security requirements for components (4-2) | Product suppliers / vendors |

### 7.3 Foundational Requirements (FRs)

| FR | Requirement | Short Name |
|----|-------------|------------|
| **FR1** | Identification and authentication control | IAC |
| **FR2** | Use control (authorization of operations) | UC |
| **FR3** | System integrity (protect against tampering) | SI |
| **FR4** | Data confidentiality | DC |
| **FR5** | Restricted data flow (segmentation) | RDF |
| **FR6** | Timely response to events | TRE |
| **FR7** | Resource availability | RA |

### 7.4 Security Levels (SL)

| SL | Meaning | Example Expectation |
|----|---------|---------------------|
| **SL1** | Protection against **casual/coincidental** violation | Default creds changed; basic AV |
| **SL2** | Protection against **simple intentional** means with low resources | No shared accounts; network ACLs; logging |
| **SL3** | Protection against **sophisticated** means with moderate resources | MFA, encryption, host hardening, monitoring |
| **SL4** | Protection against **nation-state / advanced** means | Specialized controls, high assurance, possibly air-gap/one-way diodes |

> **Important distinction:** The **target security level (SL-T)** is what you *want* a zone to achieve; **capability (SL-C)** is what a product *provides*; **achieved (SL-A)** is what is *verified in place*. Gaps between SL-T and SL-A drive remediation.

### 7.5 Zones and Conduits (Recap)

- **Zone:** a grouping of assets with **similar security requirements** (e.g., "Chlorination Controllers Zone" SL-T 3).
- **Conduit:** the communication channel *between* zones or between a zone and external systems — it is itself an asset with its own SL-T (e.g., the DMZ↔Control conduit).
- A single asset can belong to one zone; conduits carry allowed protocols only.

### 7.6 The Security Lifecycle (from 62443-2-1)

```
  ┌──────────────────────────────┐
  │  1. CONCEPT / RISK ASSESSMENT│  Identify assets, threats, SL-T for zones
  └──────────────┬───────────────┘
                 ▼
  ┌──────────────────────────────┐
  │  2. DESIGN / DETAILED DESIGN │  Zones & conduits, control selection,
  │                              │  procurement (SL-C), integration
  └──────────────┬───────────────┘
                 ▼
  ┌──────────────────────────────┐
  │  3. IMPLEMENT / BUILD & VERIFY│  Configure, harden, test (verification
  │                              │  of SL-A), factory/site acceptance
  └──────────────┬───────────────┘
                 ▼
  ┌──────────────────────────────┐
  │  4. OPERATE / MAINTAIN       │  Patch management, monitoring, incident
  │                              │  response, audits, security management
  └──────────────────────────────┘
```

### 7.7 Component vs System vs Program Requirements

| Level | Standard | Focus |
|-------|----------|-------|
| **Product (component)** | 62443-4-1 / 4-2 | Secure development lifecycle (SDL); technical requirements a device must meet (auth, crypto, hardening, patch process) |
| **System (architecture)** | 62443-3-3 | Security requirements and levels for the *designed system* — zones, conduits, network design, compensating controls |
| **Program (organization)** | 62443-2-1 | Management system: policies, risk assessment, roles, awareness, incident response, continuous improvement |

### 7.8 Implementing 62443 (Mock Plan)

**Scenario:** Mid-size food & beverage plant ("NutriFlow Foods") wants to reach **SL-T 3** for its control network.

```
Month 1-2   Define scope; asset inventory; zone/conduit diagram; baseline risk.
Month 3     Gap assessment vs 62443-3-3 and 4-2 for all zones.
Month 4-6   Design: firewall DMZ, network segmentation, remote access (jump host + MFA).
Month 6-9   Implement: harden HMIs (disable services, local AV), deploy industrial IDS
            at SPAN ports, enable Modbus ACLs on DPI firewall.
Month 9-12  Program: write OT security policy, incident response procedure for OT,
            patch management procedure, vendor access policy; train operators.
Month 12    Verification: penetration test, SL-A assessment, remediation plan.
Ongoing     Continuous monitoring, quarterly reviews, annual SL-A re-assessment.
```

### 7.9 Related Standards

| Standard | Scope / Relation to OT |
|----------|------------------------|
| **NIST SP 800-82 Rev 3** | "Guide to ICS Security" — thorough practical guidance for ICS including cloud, virtualized, and hybrid architectures |
| **NERC CIP** | Mandatory (US) cybersecurity rules for bulk electric system (BES) — CIP-002 asset identification, CIP-005 electronic security perimeters, CIP-007 systems security mgmt, CIP-010 config mgmt, CIP-013 supply chain |
| **ISO/IEC 27001** | ISMS; applicable to OT when OT is in scope — Annex A mapping with 62443 for control systems |
| **ENISA guidelines** | European guidance on ICS/SCADA security |
| **NIST CSF** | Cross-cutting framework (Identify/Protect/Detect/Respond/Recover) for the whole program |
| **IEC 61511 / 61508** | Functional safety of SIS — must coexist with security (security failures can cause safety failures) |

---

## 8. Securing PLCs & Controllers

### 8.1 PLC Security Features (Modern Controllers)

| Feature | Example |
|---------|---------|
| **Password protection on CPU** | Remote/unlock password required for online edit |
| **User authentication & RBAC** | Per-engineer roles (viewer/operator/engineer) |
| **Firmware signature verification** | Only signed images accepted |
| **Secure communications** | CIP Security / S7 TLS / OPC UA security |
| **Run/Remote/Stop key switch** | Physical switch limiting remote changes |
| **Program lock / memory protection** | Prevent unauthorized read/write of logic |
| **Ethernet port disable / service restriction** | Turn off unneeded ports (web, FTP) |

### 8.2 Safe Programming & Configuration

- **Disable remote programming** unless required; use key-switch positions.
- **Remove upload/download permission** for accounts that don't need it.
- **Log all online changes** with timestamps and user.
- **Back up logic and configuration** (offline, versioned) — allows fast recovery and diffing for tamper detection.
- **Store logic in a repository** (engineering VCS) so integrity can be verified.
- **Avoid using the PLC's web server / FTP** for file transfer.

### 8.3 Firmware Integrity

- Record and verify **firmware versions and hashes** at inventory.
- Enable **signed firmware only** where the OEM supports it.
- Baseline known-good hashes; alert on **online changes** (a PLC being reprogrammed is a high-severity event).
- Watch for **run-mode flips**, **memory-reset**, and **unexpected restarts** as tamper indicators.

### 8.4 Disabling Unused Services

Mock hardening checklist for a ControlLogix / S7 / M340-class PLC:

```
Service                       Default   Recommendation
--------------------------------------------------------------------------------
EtherNet/IP (44818)             ON       Keep only on control VLAN; restrict to HMIs/ES
CIP Security                    OFF      Enable where supported (SL-T >= 3)
Web server / HTTP (80)          ON       Disable
FTP (21)                        OFF      Disable; use secure file transfer via ES
Telnet (23)                     OFF      Disable
SNMP (161)                      ON       Set strong community strings or disable
Discovery (CIP, DCP)            ON       Restrict to Level 2 management network only
Bootstrap / DHCP                ON       Disable in production where static IP used
OPC UA (4840)                   OFF      Enable only if needed; enforce TLS + auth
S7 communication (102)          ON       Restrict to HMI subnet via ACL
```

### 8.5 PLC Access Control

| Layer | Control |
|-------|---------|
| Network | DPI firewall limits who can reach PLC ports; allow-list source IPs (only HMIs/ES) |
| Device | CPU passwords, RBAC, run/remote switch |
| Engineering | MFA on engineering workstations; controlled, logged downloads |
| Physical | Locked cabinets; key-controlled power/network jacks |
| Monitoring | Alert on any firmware upload/download/online edit |

### 8.6 Protection Against Logic Attacks (Ladder Logic Integrity)

- **Checksums/hashes** of logic (CPU and repository copies).
- **Periodic "logic comparison"** vs the golden copy in the repository.
- **Online-change monitoring** via engineering software audit logs and IDS (download detection).
- **Air-gap the engineering port** if possible; USB access to ES is the attack path.
- **Digital signature / change approval**: changes made only through the ES with an auditable change request.

### 8.7 Remote Stop/Start Risks

A remote stop/start command is a one-packet availability attack:

```
Modbus FC 0x05 (Force Single Coil) to set "enable_run" coil OFF on motor 3:
  00 04 00 00 00 06 01 05 00 20 00 00   -> coil 0x20 set FALSE (stop)
```

Impacts: production halt, **safety event** if the process depends on continuous running, or an **unsafe state** during a controlled stop (e.g., stopping a scrubber mid-release). Mitigations: DPI rules blocking remote writes to run/stop coils from non-HMI sources; interlock logic; physical run-permit switches.

### 8.8 Code Signing & Secure Delivery

- Vendors should **sign firmware/configuration**; devices verify signature before accepting.
- Engineering should use **signed, versioned builds** so that "what's in the plant" is provably "what we approved."
- Prevent **man-in-the-middle** of the engineering download (TLS where supported).
- After an incident, **verify signatures** before restoring logic — a malicious "restore" is a classic persistence trick.

---

## 9. OT Monitoring & Detection

### 9.1 Why OT Monitoring Differs

- **You cannot always add agents** to embedded controllers (no RAM/CPU for an agent).
- **Encrypted traffic** is rare (mostly plaintext protocols), which paradoxically makes deep inspection possible — but **no authentication** means you can't trust "who sent it," only *that* a packet arrived.
- **False positives are dangerous**: an alarm that stops a reactor to "be safe" can cause a release.
- **Determinism**: monitoring must not add latency to control loops.

### 9.2 Passive vs Active Monitoring

| Approach | How | Pros | Cons |
|----------|-----|------|------|
| **Passive (recommended)** | SPAN/TAP port mirrors traffic to IDS; read-only | Zero risk to process; sees all traffic; no asset interference | Can't query devices; needs good network taps; mirror overload |
| **Active (in-band probing)** | Ping, SNMP polling, OPC-UA reads, port scans | Enumerates assets & status | **Risk:** crashes legacy devices, triggers interlocks, adds load; banned in many plants except scheduled windows |

### 9.3 Anomaly Detection (Behavioral Baselining)

1. **Learn** the "normal" (baseline) traffic per zone for 2–4 weeks:
   - Which hosts talk to which PLCs, on which ports/function codes.
   - Expected register read/write patterns, time-of-day activity.
2. **Detect** deviation:
   - A new device (unseen MAC) polling a PLC.
   - Modbus function code **not seen before**.
   - Write to a register that is "read-only" in the baseline.
   - Traffic from IT zone directly to Level 1 (violation of segmentation).
   - High-volume reads (data exfiltration) or command floods.
3. **Tune**: reduce false positives by whitelisting known-good maintenance activities.

**Mock alert:**

```
[CRITICAL] MODBUS_ANOMALY  src=10.20.5.150 (unknown host, IT VLAN 10)
           dst=10.40.3.7  (chlorination PLC)  dstport=502
           func=06 (write) reg=0x0010 setpoint → 0xFFFF
           Baseline: only 10.30.2.21 (HMI-03) writes reg 0x0010.
           Recommended action: block src, alert operator, hold chlorine dosing.
```

### 9.4 Industrial IDS / Security Platforms

| Platform type | Examples (mock/generic) | Capabilities |
|---------------|-------------------------|--------------|
| **Protocol-aware IDS** | "ICSPulse", "ScadaSight" | Parse Modbus/DNP3/OPC/EtherNet-IP; protocol anomaly rules |
| **Network-based threat detection** | IDS + signature + ML anomaly | Signature rules + behavioral baselining |
| **Asset discovery & inventory** | Passive discovery engines | Build inventory without touching devices |
| **Log/event correlation (SIEM)** | Centralized OT SIEM | Correlate IT + OT events |
| **OT SOC platforms** | Managed detection & response (MDR) for OT | 24/7 monitoring, response playbooks |

### 9.5 Honeypots for OT (Mock)

Deploy **decoy PLCs/services** that look attractive to attackers:

```
Decoy "chemical mixer PLC" at 10.40.99.99:502 listening with a fake
Modbus map (registers 0x0000-0x00FF). Any connection triggers:

[ALERT] HoneyPotHIT: source 10.20.7.12 (ES-03 workstation)
        touched decoy PLC. Credential used: 'admin'. Protocol: Modbus.
        Duration: 3s, 12 register reads, no writes. Review ES-03 for malware.
```

**Honeypot rules:**
- Run in a **separate, monitored VLAN**; never route real process traffic to it.
- Emulate common devices (S7-1200, ControlLogix, Modbus RTU master) to look real.
- Log **everything**: source, protocol, attempts, credential guessing.
- Use honeypots as an **early warning tripwire**, not a primary detection mechanism.

### 9.6 Safe Asset Discovery in OT

| Method | Risk | Use |
|--------|------|-----|
| **Passive traffic analysis** | None | Preferred; build inventory from observed frames (LLDP/CDP, IP, MAC, OUI) |
| **SPAN port aggregation** | None | See all traffic of a segment |
| **Agent on HMIs/servers** | Low (Windows hosts) | Accurate OS/installed-software inventory |
| **SNMP read polling** | Low-medium | Query switches/controllers with read-only community (throttled) |
| **Active ICMP/TCP scans** | **Medium-High** | Legacy devices crash or trigger interlocks; use **only** during maintenance windows with operations approval |
| **Vendor records / drawings** | None | Cross-check against network findings |

> **Rule:** In OT, "scan everything aggressively" is how you crash a production line. Negotiate scan windows with operations and exclude safety-critical devices.

### 9.7 SOC for OT

A mature OT SOC includes:

- **Dedicated OT monitoring** 24/7 (many plants start 8×5, then 24×7).
- **OT-trained analysts** who know that a Modbus write to a PLC is not a "port scan."
- **Dual response paths**: IT runbook (isolate host) and OT runbook (observe, don't touch the process).
- **Decision authority** — who can authorize an OT containment action (usually the Plant Manager / Shift Supervisor, not the SOC alone).
- **Escalation matrix** to vendors, regulators, and public safety if needed.

### 9.8 Responding in OT — Constraints

```
DO NOT:                            DO:
─────────────────────────────────────────────────────────────────
Reboot a PLC to "clear malware"    Observe & record all OT traffic
Isolate a device from the network  Inform operations BEFORE any change
   mid-process without approval
Block ALL traffic to a zone        Apply narrow ACLs / one-conduit block
Power-cycle a safety controller    Follow the site-specific IR plan
Shut down "to be safe" on a        Trigger the engineered safe-shutdown
   high-pressure reactor           procedure, not a hasty one
```

---

## 10. OT Incident Response

### 10.1 The Core Problem: Safety Before Everything

In IT, first instinct = **pull the plug**. In OT, pulling the plug can be the worst decision:

- Losing communications to a remote pump station = **unknown process state**.
- Killing a safety controller during a fire scenario = **unsafe release**.
- Rebooting an HMI may not stop the controller (controllers run independently), but may hide alarms.

**Decision principle:** *contain the attacker, not the process.* Containment actions must be selected so they can never cause a safety or environmental event.

### 10.2 Special IR Procedures for OT

1. **Mode of operation:** Determine if the event is *process-anomaly* (safety first) vs *cyber-event* (monitor first) vs *both*.
2. **Work with operations:** Shift supervisor must co-sign any action that touches the process.
3. **Preserve evidence without stopping the plant:** SPAN mirror, packet captures, logic/image backups, engineering logs.
4. **Kill-chain mapping:** Did the attacker get through IT? Isolate IT→OT conduits (safe), not OT zones.
5. **Dual runbooks:** one for IT containment, one for OT-safe containment.
6. **Recovery is a process, not a click:** restore with tested backups, verify logic signatures, and **do not** simply "reboot to healthy" because malware may persist in firmware or project files.

### 10.3 Mock OT Incident Response Plan — "AquaSafe Water Treatment"

**IR Team roles:**

| Role | Person (mock) | Responsibility |
|------|---------------|----------------|
| Incident Commander | Plant Manager (Maria) | Final authority; signs all process-affecting actions |
| OT Security Lead | ICS security engineer (Dev) | Forensic lead, containment options |
| Shift Supervisor | Operations (Ahmed) | Approves safety-relevant steps, keeps process safe |
| IT Security Liaison | CISO delegate (Priya) | Coordinates IT-side containment |
| Comms / Legal | Corp comms (Susan) | External communication, regulatory (EPA) notifications |
| Vendor on-call | OEM "AquaControls" L3 | Hardware/firmware support |

**Triage matrix (mock):**

| Event | First action | Who approves |
|-------|--------------|--------------|
| HMI defaced, no process change | Record, screenshot, contain HMI subnet egress | Shift Supervisor |
| Unknown device polling PLC | Block the unknown source at the conduit ACL | OT Security Lead |
| PLC receiving bad setpoints | Put chlorination on **local/manual** with verified setpoints; then block source | Plant Manager |
| Safety PLC (SIS) anomaly | Follow engineered safe-state per SIS manual; **do not touch SIS** until vendor confirms | Plant Manager + Safety Officer |
| Ransomware on IT only | Normal IT containment, but verify OT conduits closed | IT Security Liaison |

**IR workflow (mock timeline):**

```
T+0     Detection: IDS alert "unknown host writes reg 0x0010 on PLC-CHL-04".
T+15m   Triage: confirm no process impact (chlorine residual within limits).
        Engage Shift Supervisor; take SPAN capture started.
T+45m   Containment decision (approved by Plant Mgr):
        - Block src 10.20.5.150 at DMZ<->OT conduit (IT-side block; safe).
        - Place chlorination loop in local/manual with verified setpoints.
        - Preserve ES logs and switch configs.
T+2h    Eradication planning: identify compromised IT host via IT SOC;
        image host; check for persistence; scan for C2.
T+1d    Recovery: restore verified logic from golden backups; re-baseline
        IDS; confirm no other register writes; brief operators.
T+1w    Lessons learned: enable MFA on all remote access; tighten Modbus
        DPI register whitelist; add PLC-CHL to honeypot VLAN monitoring.
```

### 10.4 Recovery Considerations

- **Backups:** Offline, air-gapped, tested copies of logic, configurations, and HMI projects. Ransomware that hits IT can also hit historian backups on the same LAN.
- **Firmware integrity:** restore **signed, verified** images only.
- **Staged restart:** bring systems up in a controlled order (historians → HMIs → comms → then validate controllers).
- **Watch the process:** after recovery, keep monitoring for anomalies — attackers often re-enter via the same conduit.
- **Post-incident patching** and access review are part of recovery, not an afterthought.

### 10.5 IT vs OT IR — Comparison Table

| Dimension | IT IR | OT IR |
|-----------|-------|-------|
| First priority | Contain the breach | **Protect people & process** |
| Typical first action | Isolate/power down affected hosts | Observe, preserve, coordinate with operations |
| Can we reboot? | Usually yes | Sometimes no (process interlock, safety) |
| Who decides | IT IR lead / CISO | Plant Manager + Shift Supervisor jointly |
| Data confidentiality | Critical | Usually secondary to availability/safety |
| Evidence handling | Standard forensic process | Must preserve without disrupting process |
| Patch/restore | Fast, standard | Tested, windowed, may take weeks |
| Primary impact | Data loss / legal | Safety, environment, production, revenue |
| Playbooks | Mature, IT-focused | Must be OT-custom, drilled with operations |

---

## 11. Industrial Ransomware & Extortion

### 11.1 How Ransomware Hits OT

```
                    Corporate IT
  ┌──────────────────────────────┐
  │ Phishing email → user runs   │
  │ attachment                    │
  │    ↓                          │
  │ Ransomware deploys via SMB,   │
  │ WMI, PsExec                   │
  │    ↓                          │
  │ Lateral to file servers,      │
  │ MES, domain controllers       │
  └───────────────┬──────────────┘
                  │   IT→OT connection (too-open firewall,
                  │   shared credentials, DMZ weak spots)
                  ▼
      ┌──────────────────────────┐
      │  OT hit: HMIs, historians,│
      │  engineering workstations │
      │  encrypted; HMIs replaced │
      │  with ransom notes        │
      └──────────────────────────┘
```

**Key insight:** OT devices are rarely the *first* target; they are collateral or the *extortion lever*. Ransomware operators learned that **production downtime is the biggest cost**, so they deliberately target environments where downtime is expensive (manufacturers, utilities, hospitals).

### 11.2 Impact on Production

| Impact | Example (Mock) |
|--------|----------------|
| Direct production loss | 72-hour shutdown at $1.2M/day revenue loss = **$3.6M** |
| Product quality/rework | Batch data lost → 2,000 liters of reagent disposed |
| Safety/environmental | Forced manual operation of a reactor increases risk |
| Regulatory | Missed reporting deadlines; EPA/OSHA inquiries |
| Brand/reputation | Customers move orders to competitors |
| Recovery costs | Emergency engineering overtime, forensic firm, vendor support |

### 11.3 Response When Ransomware Hits OT

1. **Don't pay immediately** — negotiate time; often the decryption doesn't work anyway, and paying funds more attacks. (Final call is with leadership; regulators may weigh in.)
2. **Contain, don't destroy:** close IT→OT conduits (safe); keep OT running where possible.
3. **Preserve evidence** for law enforcement (FBI/NCSC/local authorities).
4. **Run the OT IR plan** (Section 10) — get process back safely, not just "decrypted."
5. **Recovery from clean, offline, tested backups** of HMI projects, logic, and data.
6. **Post-incident:** rebuild, patch, segment, add MFA, and rehearse.

### 11.4 Prevention

- **MFA everywhere** (especially VPN/RDP — the #1 entry vector).
- **Segmentation** (zones/conduits) so IT compromise doesn't reach OT.
- **Least privilege + no shared domain accounts** in OT.
- **Endpoint protection + EDR** on OT Windows hosts, updated via the DMZ.
- **Harden & minimize** OT attack surface (disable SMB/NETBIOS/PsExec vectors in OT).
- **Offline backups** and tested recovery runbooks.
- **User awareness** (phishing is the common entry point).
- **Fast patching** of internet-facing and IT systems; OT patch on a risk-based schedule.

---

## 12. Physical Security & Safety

### 12.1 Why Physical Security Matters in OT

Physical access to OT is **equivalent to full compromise**:

- A serial/console port on a PLC allows **logic upload/download** with no credentials.
- A network jack in a plant corridor gives a direct path to Level 1.
- Key switches and run-mode switches are physical controls an attacker can flip.
- The control room is where someone can watch the operator's screen and credentials.

### 12.2 OT Physical Security Controls

| Layer | Controls (examples) |
|-------|---------------------|
| **Perimeter** | Fences, guards, access control systems (badge + biometric), vehicle barriers |
| **Facility** | Locked control rooms, camera coverage, tamper alarms |
| **Equipment** | Locked cabinets/panels for PLC/RTU racks, key-controlled switches, sealing of spare ports |
| **Ports & media** | Locked-down USB, controlled removable media (allowed-list + scanning), no open network jacks |
| **People** | Contractor vetting, escort policy, clean-desk for credentials/drawings |
| **Lifecycle** | Decommissioning: wipe media, remove devices, revoke badges |

### 12.3 Safety Systems (SIS) — Why They Must Not Be Compromised

A **Safety Instrumented System (SIS)** is independent of the basic process control system (BPCS). It exists to **detect dangerous conditions and take the process to a safe state** (e.g., emergency shutdown, relief valve actuation).

```
  ┌──────────────────────────────────────────────────────────┐
  │  BPCS (control)      │        SIS (protection)           │
  │  e.g., DCS/PLC       │        e.g., logic solver +       │
  │  runs process setpoints     │        redundant sensors & final
  │  *security SL 2-3*   │        elements (valves, trips)   │
  └──────────────────────────┬───────────────────────────────┘
                             │   Independent (or carefully separated)
                             ▼
                       PROCESS & PEOPLE
```

**Why attackers target SIS:** If you can disable the "trip" that prevents an overpressure, you can make a controlled process become an **explosion**. This is the Triton lesson (§3.3).

**Security requirements for SIS:**
- **Strongest segmentation** — ideally on its own isolated network with no external connections.
- **Independent security tier** from the BPCS.
- **No remote access** unless through a dedicated, logged, MFA-protected path with SIS vendor involvement.
- **Physical controls** on the logic solver (keys, sealed cabinets).
- **Functional safety + security combined** per IEC 61511 and 62443 (a security failure is a safety failure).

### 12.4 Security + Safety Integration

- **Converged risk:** A cyber event can cause a safety event; a safety event can reveal cyber weakness. Manage both in one risk process.
- **Alarm management:** Security alarms must be prioritized alongside process alarms; **alarm flooding** can hide a real safety alarm.
- **Change management:** Any security control touching the SIS goes through the full safety case (Hazop/Hazid, proof-test plan).
- **Proof testing:** SIS devices get periodic functional tests — include them in the security baseline so anomalies are caught early.

### 12.5 Human Safety

- An attacker changing a setpoint can create a scenario that **endangers operators** (toxic release, mechanical failure).
- **Manual intervention** during a cyber incident is itself risky — operators acting on a compromised HMI may take wrong actions.
- Emergency response plans must assume **instrumentation may lie** during a cyber event.

---

## 13. Supply Chain & Third-Party Risk in OT

### 13.1 Why OT Supply Chain Risk Is Severe

- OT devices have **long lives**; a malicious or backdoored component can persist for decades.
- **Fewer vendors** per niche → less scrutiny, higher concentration risk.
- **Firmware is opaque**; most asset owners cannot verify what is inside a PLC.
- **Vendors and integrators** get deep, persistent access to plants (support VPNs, remote maintenance).
- **Counterfeit components** are common in industrial spares.

### 13.2 Vendor Access (Secure Remote Vendor Support — Mock)

**Policy example — "AquaControls vendor session"**

```
REQUEST:
  Vendor: AquaControls (PLC firmware vendor)
  Activity: Firmware update for PLC-CHL-04
  Window: Fri 22:00 - Sat 03:00 (maintenance window)
  Personnel: AquaControls L3 engineer (ID 4421)

ENABLE:
  1. Open remote access via the DMZ Remote Access Gateway (RAG) with MFA.
  2. Route session to Jump Host JH-OT-01 (hardened, patched, no direct OT reach).
  3. From JH-OT-01, engineer connects to the ES (engineering workstation) VLAN only.
  4. Record full session (screen + keystrokes) to central logging.
  5. Apply time-boxed, single-use credential, least privilege.

DURING:
  6. OT security analyst monitors session live; watches for out-of-policy commands.
  7. All file uploads/downloads pass through the DMZ AV scanner.

CLOSE:
  8. Session terminated at 02:55 (5 min before end).
  9. Credential revoked immediately.
  10. Session recording + change record logged; reviewed within 24h.
```

### 13.3 Firmware Supply Chain Controls

- **Require SBOMs** from vendors (what software/libraries are inside).
- **Prefer signed firmware** and verify signatures at install.
- **Baseline & hash** firmware at install; monitor for drift.
- **Scan incoming media** (USB/CD) and staged software before installation in OT.
- **Maintain an approved vendor list**; audit vendor security posture.
- **Test firmware in the lab** before production deployment.

### 13.4 Equipment Provenance & Counterfeits

- Buy from **authorized channels**; verify serial/part numbers with OEM.
- Document the **chain of custody** of critical devices (who configured, shipped, installed).
- Check for tamper evidence on packaging and hardware.
- Cross-check configuration files against vendor-known-good.
- Use **OEM verification tools** (hardware identity checks) where available.

### 13.5 Vendor Risk for OT

| Risk | Mitigation |
|------|-----------|
| Vendor remote access abuse | MFA, jump host, session recording, time-boxed access, least privilege |
| Backdoored firmware/software | SBOM, signed images, lab testing, hash baselining |
| Unpatched vendor software | Patch SLAs in contracts; vendor-signed updates; escrow for end-of-life |
| Vendor account compromise | Dedicated vendor accounts, MFA, immediate revocation after job |
| Vendor insider threat | Background checks in contract, segregation of duties, monitoring |
| Integrator/SI tampering | Acceptance testing with hashes, independent review of configs |
| End-of-life / unsupported | Upgrade/replace plan, compensating controls, vendor escalation |

---

## 14. IoT/OT Security Program Build-Out

### 14.1 The Four Pillars

```
                  OT SECURITY PROGRAM
   ┌──────────┬──────────┬──────────┬──────────┐
   │ GOVERNANCE │  PEOPLE   │  PROCESS  │TECHNOLOGY │
   └──────────┴──────────┴──────────┴──────────┘
   • policies  • roles     • risk mgmt  • segmentation
   • standards • training  • change mgmt• monitoring
   • risk      • awareness • patch mgmt • hardening
   • metrics   • staffing  • IR plans   • access ctrl
```

### 14.2 Asset Inventory First (Again — It's That Important)

Start with a **complete, current asset inventory**, because every downstream control (firewall rules, monitoring, patching, incident response) depends on it. Without it you will:

- Deploy IDS rules that don't match reality.
- Patch the wrong devices and miss the vulnerable ones.
- Discover "phantom devices" in incident response that no one can locate.

### 14.3 Risk Assessment for OT

| Step | Output (Mock) |
|------|---------------|
| 1. Inventory assets & zones | 84 PLCs, 22 HMIs, 9 servers, 3 historians across 6 zones |
| 2. Identify threats | Ransomware via IT (high), remote-access abuse (high), insider (medium), protocol attack (medium) |
| 3. Assess vulnerabilities | 14 HMIs on unsupported Win7, 9 PLCs with default passwords, 4 exposed web UIs, no MFA on VPN |
| 4. Estimate consequence | Chlorination outage = public health risk (High) |
| 5. Estimate likelihood | Ransomware via IT = High (phishing observed) |
| 6. Compute risk & prioritize | **Critical:** Win7 HMIs + no MFA on remote access. **High:** default PLC creds, missing IDS. |
| 7. Select controls (62443 SL-T) | Set SL-T=3 for control zones; plan MFA, DPI firewall, IDS, patching |

### 14.4 Executive Alignment

- Translate OT security into **business risk language**: revenue at risk per hour of downtime, regulatory fines, safety/environmental exposure.
- Build a **business case**: cost of downtime vs cost of security controls.
- Use **management metrics** that executives understand: % of OT assets inventoried, % with MFA on remote access, # of unpatched critical devices, patching compliance, incident counts, MTTR.
- Get **explicit sponsorship** from the CEO/Plant Director, not just the CISO — OT security is owned jointly by IT and Operations.

### 14.5 Mock Roadmap (18–24 Months)

```
PHASE 0 (Months 0-3)   FOUNDATION
  - Appoint OT security owner (Operations + IT)
  - Asset inventory & network map (passive discovery + walkdown)
  - Executive risk workshop; define risk appetite & SL-T

PHASE 1 (Months 3-9)   QUICK WINS
  - MFA on all remote access (VPN, RAG, jump host)
  - Remove/default-change PLC & HMI credentials
  - Harden HMIs: disable SMB/NETBIOS, apply AV, restrict users
  - Basic segmentation: create DMZ; stop IT->OT direct routes
  - Enable logging on firewalls, switches, HMIs

PHASE 2 (Months 9-18)  STRUCTURE
  - Full zones & conduits per 62443; DPI firewall for Modbus/DNP3
  - Deploy passive IDS + asset discovery; baseline 4 weeks
  - Patch management program with lab + windows; migrate critical Win7 HMIs
  - Vendor access policy + session recording in production
  - OT incident response plan + tabletop exercises (quarterly)

PHASE 3 (Months 18-24)  ASSURANCE & CONTINUOUS IMPROVEMENT
  - Independent pen test / SL-A assessment
  - SIS security review; supply chain/SBOM requirements
  - 24/7 OT SOC handoff (or MDR)
  - KPIs reported quarterly to board; annual re-risk
```

### 14.6 Program KPIs (Mock)

| KPI | Baseline | Target (Month 24) |
|-----|----------|-------------------|
| OT assets inventoried | 45% | 100% |
| Remote access with MFA | 10% | 100% |
| HMIs on supported OS | 30% | 95% |
| PLCs with non-default credentials | 55% | 100% |
| Zones with defined SL-T & ACLs | 0 | 100% |
| Control zones with passive IDS | 0 | 100% |
| Patch critical OT devices within SLA | 20% | 90% |
| OT IR exercises completed / yr | 0 | 4 |
| Security incidents reaching process | 3/yr | 0 |

---

## 15. Mock OT Assessment / Case Study

### 15.1 Client & Scope

```
CLIENT:  "Greenfield Municipal Water Utility" (fictional)
SCOPE:   Two treatment plants + 6 remote pump stations + SCADA HQ
ENGAGEMENT: OT security assessment (architecture, configuration,
            network, and process-safety review), 4 weeks on site.
OBJECTIVE: Identify vulnerabilities that could impact safe, reliable
           water production; produce prioritized remediation roadmap.
```

### 15.2 Architecture Discovery (Findings of the Assessment)

Discovered architecture (simplified):

```
                        SCADA HQ (IT VLAN 10)
   ┌───────────────────────────────────────────────────┐
   │ AD, file servers, email, MES, 3 admin workstations │
   │ Firewall "FW-EDGE"                                │
   └───────────────────────────┬───────────────────────┘
                               │ rule 10: permit it->ot any any (IMPLICIT)
              ┌────────────────▼───────────────┐
              │  DMZ (VLAN 20)  - small         │
              │  remote access gateway (RAG)    │
              │  patch proxy, AV server         │
              └────────────────┬───────────────┘
                               │ rule 30: permit any any (basically open)
              ┌────────────────▼───────────────┐
              │  CONTROL NET (VLAN 30)         │
              │  SCADA master, 4 HMI stations  │
              │  historian, 2 ES workstations  │
              │  --- flat, no sub-segmentation │
              └────────────────┬───────────────┘
                               │ Modbus TCP
              ┌────────────────▼───────────────┐
              │  FIELD (VLAN 40)              │
              │  6 pump station PLCs (S7-1200) │
              │  2 treatment PLCs (M340)       │
              │  SIS logic solvers (isolated?) │
              │  - physically shared rack      │
              └────────────────────────────────┘
```

### 15.3 Key Findings (with CVSS)

| # | Finding | CVSS v3.1 | Priority |
|---|---------|-----------|----------|
| F1 | **No MFA on remote access**; RAG uses a shared generic account (`scadaadmin`) with default-length password | 9.8 | **Critical** |
| F2 | **Flat control network**; no zones/conduits; PLCs reachable from any VLAN 30 host | 9.1 | **Critical** |
| F3 | **Modbus/TCP allowed from IT VLAN to all PLCs** (firewall rule 10, implicit any) — any IT host can write PLC registers | 9.8 | **Critical** |
| F4 | 4 HMIs run **Windows 7 EOL**, exposed SMB (445), no AV signatures in 14 months | 9.3 | **Critical** |
| F5 | 9 PLCs use **default passwords**; one S7-1200 still has telnet/port 23 open | 9.8 | **Critical** |
| F6 | **SIS logic solver on the same network/rack** as BPCS controllers with no isolation | 8.5 | **High** |
| F7 | No **logging/IDS**; no passive monitoring of field protocols | 8.1 | **High** |
| F8 | Historian backups stored **only on the same LAN**, no offline copy | 7.2 | **High** |
| F9 | Engineering workstation has **Internet browsing** enabled; drive-by risk into OT | 7.5 | **High** |
| F10 | **Vendor access**: AquaControls maintains a permanent VPN tunnel with no session recording | 8.8 | **Critical** |
| F11 | USB ports open on 6 HMIs; removable media policy not enforced | 5.3 | **Medium** |
| F12 | No documented **OT incident response plan**; operators unsure who to call | 6.5 | **High** |
| F13 | Chlorination PLC (PLC-CHL-01) **writable** by any Modbus client (no DPI) | 9.8 | **Critical** |

### 15.4 Risk Narrative (Fiction, Illustrative)

> "An attacker who compromises a single IT workstation (e.g., via phishing) can reach the control network and issue Modbus writes to PLC-CHL-01, altering chlorine dosing setpoints. Because Modbus has no authentication and the firewall permits IT→OT traffic, no credentials are required. Combined with the shared remote-access account, the attack can also be executed remotely. Should the SIS be suppressed (F6), a resulting over-chlorination event could affect public drinking water, causing a reportable water-quality incident and exposing the utility to regulatory action. Availability impact: a full denial of service on the SCADA system would stop remote monitoring of 6 pump stations and both treatment plants, requiring manual operation."

### 15.5 Prioritized Recommendations

**Immediate (0–90 days):**
1. Enable **MFA** on RAG and all remote access; revoke the shared `scadaadmin` account; issue individual, least-privilege accounts.
2. **Break IT→OT paths**: remove rule 10 (implicit any). Permit only DMZ-mediated flows (patch, AV, historian mirror, jump host).
3. **DPI firewall / Modbus rules**: allow Modbus only from HMIs/SCADA to PLCs; whitelist function codes & register ranges; drop everything else.
4. **Remove default credentials** on all 9 PLCs; disable telnet/web/FTP on all controllers.
5. **Isolate the SIS** onto its own physical/VLAN segment with no inbound access; document and test.
6. **Deploy passive IDS** with SPAN/taps at VLAN 30/40; baseline 4 weeks.

**Short-term (3–9 months):**
7. Migrate Win7 HMIs to supported OS; disable SMB/NETBIOS; enforce AV via DMZ proxy.
8. Implement zones & conduits per ISA/IEC 62443 (SL-T = 3 for control zones, 4 for SIS).
9. Move historian backups offline; test restore process.
10. Create and rehearse the **OT incident response plan** (§10) with operations.
11. Enforce vendor session recording + time-boxed access; terminate permanent VPN.

**Ongoing:**
12. Asset inventory updates, quarterly SL-A verification, annual pen test, patching program with lab + windows.

### 15.6 Mock Findings Report Excerpt

```
GREENFIELD MUNICIPAL WATER UTILITY — OT SECURITY ASSESSMENT
Assessment ID: OT-2026-0413        Date: 2026-06
Severity legend: Critical / High / Medium / Low

FINDING F1 — No Multi-Factor Authentication on Remote Access
  Affected: Remote Access Gateway (10.20.2.5), vendor VPN (FW-EDGE)
  CVSS: 9.8 (AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H)
  Evidence:
     - RAG login accepted username 'scadaadmin' with password 'P@ssw0rd!'
       (found in a field engineer's saved-file export during walkdown)
     - No second factor configured for any remote account.
     - Logs show 3 daily failed logins from external IPs over last 30 days.
  Impact:
     - Compromise of one remote account grants direct path into control
       network; historical OT incidents (e.g., Colonial-style) began
       exactly this way.
  Recommendation:
     - Deploy app-based/physical-key MFA for ALL remote users.
     - Remove shared account; create per-user accounts with time-boxed
       access windows and session recording.
     - Rate-limit and geo/allow-list RAG access; block after 5 failures.

FINDING F13 — Chlorination PLC Writable by Any Modbus Client
  Affected: PLC-CHL-01 (S7-1200, IP 10.40.3.7, Modbus TCP :502)
  CVSS: 9.8 (AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H)
  Evidence:
     - A passive capture confirmed reads AND writes from multiple hosts
       including IT-subnet address 10.20.5.150 (an HR laptop that was
       on the office network during the test).
     - No Modbus DPI in place; function code 06 (write) to dosing
       register 0x0010 observed with no error response.
  Impact:
     - Attacker can set chlorine dosing to 0 (under-chlorination → public
       health risk) or to maximum (over-chlorination → corrosion, taste,
       reportable event), with no authentication and no logging.
  Recommendation:
     - Deploy DPI firewall rule: allow Modbus from {HMI-01..04, SCADA}
       to PLC-CHL-01, function codes {03 read, 06 write}, registers
       0x0000-0x0060; DROP & ALERT all else.
     - Enable CPU password; set Run/Remote switch to Run with protection.
     - Add PLC-CHL-01 to passive monitoring with immediate alert on any
       non-HMI write attempt.
```

### 15.7 Assessment Summary Table

| Severity | Count | Examples |
|----------|-------|----------|
| Critical | 5 | F1, F2, F3, F5, F13 |
| High | 5 | F4, F6, F7, F10, F12 |
| Medium | 2 | F8, F9, F11 |
| Low | 1 | (e.g., clock skew on field devices) |

**Top-3 must-do now:** (1) MFA on all remote access, (2) break IT→OT connectivity and enforce Modbus DPI whitelisting, (3) isolate the safety system (SIS).

---

## Appendix A — Quick Reference Tables

### A.1 Default Ports of Common ICS Protocols

| Protocol | Port | Notes |
|----------|------|-------|
| Modbus/TCP | 502 | No security |
| EtherNet/IP / CIP | 44818, 2222 | CIP security optional |
| PROFINET | 34962-34964 | Real-time |
| OPC UA | 4840 | Encryption/auth configurable |
| DNP3 | 20000 | Auth optional (SAv5) |
| IEC 104 | 2404 | Power SCADA |
| BACnet | 47808 (0xBAC0) | Building automation |
| SNMP | 161/162 | Read/write communities |
| Telnet | 23 | Often left on embedded devices |
| HTTP | 80/443 | HMIs & device web UIs |
| FTP | 21 | File transfer, insecure |

### A.2 OT Security Quick Checklist

- [ ] Asset inventory of ALL OT devices (IP, firmware, owner, zone)
- [ ] Network diagram with Purdue levels + zones/conduits
- [ ] Firewall rule review (block implicit allows, IT↔OT)
- [ ] Modbus/DNP3/OPC DPI rules (function code + register whitelist)
- [ ] MFA on ALL remote access (VPN, RAG, vendor)
- [ ] No default credentials anywhere (verify with active scan in window)
- [ ] Unused services disabled (telnet, FTP, web on controllers)
- [ ] SIS isolated + not reachable remotely
- [ ] Passive IDS + logging + 4-week baseline
- [ ] Patch management with lab testing + maintenance windows
- [ ] OT incident response plan + tabletop exercises
- [ ] Offline, tested backups of logic/config/data
- [ ] Vendor access policy (MFA, recording, time-boxed)
- [ ] SBOM / signed firmware / supply chain controls
- [ ] Executive risk dashboard + quarterly KPIs

### A.3 Key Terms Glossary

| Term | Definition |
|------|-----------|
| **Availability** | The property that a system is ready for use when needed (top priority in OT) |
| **Integrity** | Data/commands cannot be modified without detection |
| **Confidentiality** | Data is only disclosed to authorized parties |
| **CIA / AIC** | Confidentiality-Integrity-Availability vs Availability-Integrity-Confidentiality (OT) |
| **DMZ** | Demilitarized zone; network buffer between IT and OT |
| **DPI** | Deep Packet Inspection (protocol-aware filtering) |
| **Zone/Conduit** | ISA/IEC 62443 grouping of assets and the controlled communication between them |
| **SL-T / SL-A / SL-C** | Target / Achieved / Capability security levels |
| **SIS** | Safety Instrumented System (independent protection layer) |
| **SBOM** | Software Bill of Materials |
| **IDS** | Intrusion Detection System |
| **SOC / MDR** | Security Operations Center / Managed Detection & Response |
| **OT** | Operational Technology (controls physical processes) |
| **ICS / SCADA / DCS** | See Section 1.1 |

---

## Appendix B — References & Further Reading (General)

- ISA/IEC 62443 series (parts 1-1 through 4-2)
- NIST SP 800-82 Rev 3 — Guide to Operational Technology (ICS) Security
- NISTIR 8228 — IoT cybersecurity & privacy risk management
- ETSI EN 303 645 — Consumer IoT baseline
- MITRE ATT&CK for ICS
- IEC 61508 / IEC 61511 — Functional safety
- NERC CIP v7+ — North American bulk electric system
- OWASP IoT Top 10

---

*This document is for educational and professional reference purposes only. All companies, people, IP addresses, data, and scenarios are fictional and are used purely to illustrate security concepts. No real facility or organization is referenced.*
