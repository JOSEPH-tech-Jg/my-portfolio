# Networking & Infrastructure Security — Master Reference

> **Document ID:** NET-SEC-MASTER-01
> **Version:** 1.0
> **Classification:** Internal / Sensitive — Distribution limited to authorized security & infrastructure teams
> **Audience:** Network engineers, security analysts, system administrators, SOC staff
> **Disclaimer:** All network addresses, hostnames, domain names, credentials, log entries, and traces in this document are **fictional mock data** created for educational purposes. No real systems are referenced.

---

## Table of Contents

1. [OSI Model & TCP/IP](#1-osi-model--tcpip)
2. [Network Devices & Their Security](#2-network-devices--their-security)
3. [IP Addressing & Subnetting](#3-ip-addressing--subnetting)
4. [Network Protocols Deep Dive](#4-network-protocols-deep-dive)
5. [Firewall Configuration](#5-firewall-configuration)
6. [Network Segmentation](#6-network-segmentation)
7. [Wireless Security](#7-wireless-security)
8. [Remote Access Security](#8-remote-access-security)
9. [Network Monitoring & Defense](#9-network-monitoring--defense)
10. [Network Attacks & Countermeasures](#10-network-attacks--countermeasures)
11. [DNS Security](#11-dns-security)
12. [Network Hardening Checklist](#12-network-hardening-checklist)
13. [Mock Network Topology Case Study](#13-mock-network-topology-case-study)

---

## 1. OSI Model & TCP/IP

### 1.1 The Seven Layers of the OSI Model

The **Open Systems Interconnection (OSI)** model is a conceptual framework (ISO/IEC 7498-1) that standardizes how network functions communicate across a stack. It is divided into seven layers. Each layer serves the layer above it and is served by the layer below it.

| Layer | Name | Mnemonic (top-down) | Responsibility | Data Unit |
|-------|------|---------------------|----------------|-----------|
| 7 | Application | All | User-facing services, APIs, application protocols | Data |
| 6 | Presentation | People | Encoding, encryption, serialization, compression | Data |
| 5 | Session | Seem | Session establishment, maintenance, teardown | Data |
| 4 | Transport | To | End-to-end delivery, segmentation, reliability, flow control | Segment |
| 3 | Network | Need | Logical addressing (IP), routing, fragmentation | Packet |
| 2 | Data Link | Data | Physical addressing (MAC), framing, error detection, media access | Frame |
| 1 | Physical | Processing | Bits, electrical/optical/radio signals, cabling | Bit |

**Mnemonic (top-down):** All People Seem To Need Data Processing
**Mnemonic (bottom-up):** Please Do Not Throw Sausage Pizza Away

### 1.2 Protocols at Each Layer

| OSI Layer | Protocols / Technologies | Common TCP/IP Equivalent |
|-----------|--------------------------|---------------------------|
| 7 Application | HTTP/HTTPS, DNS, SMTP, IMAP, POP3, FTP, SSH, Telnet, SNMP, DHCP, SIP, RDP | Application |
| 6 Presentation | TLS/SSL (record layer), JPEG, ASCII/UTF-8, MIME | (part of Application) |
| 5 Session | NetBIOS, RPC, SOCKS, session establishment in TCP, SIP dialogs | (part of Application) |
| 4 Transport | TCP, UDP, SCTP, DCCP | Transport |
| 3 Network | IPv4, IPv6, ICMP, ICMPv6, IPsec (ESP/AH), OSPF, BGP, RIP, IGMP | Internet |
| 2 Data Link | Ethernet (802.3), Wi-Fi (802.11), PPP, VLAN (802.1Q), ARP, NDP, STP, LLDP, CDP | Network Access |
| 1 Physical | Ethernet copper/fiber (1000BASE-T, 10GBASE-SR), Wi-Fi PHY, DSL, SONET | Network Access |

### 1.3 TCP/IP Model (DoD Model)

The TCP/IP model condenses OSI into four layers and is what the Internet actually runs on:

| TCP/IP Layer | Maps to OSI | Core Protocols |
|--------------|-------------|----------------|
| Application | 7, 6, 5 | HTTP, DNS, SMTP, SSH, TLS (technically operates here) |
| Transport | 4 | TCP, UDP |
| Internet | 3 | IP, ICMP, ARP (loosely), IPsec |
| Network Access / Link | 2, 1 | Ethernet, Wi-Fi, ARP, VLAN |

### 1.4 Example: An HTTPS Request Walking Down the Stack

Scenario: A user on host `192.168.50.10` (MAC `00:1a:2b:3c:4d:5e`) requests `https://securebank.example.com` resolved to `203.0.113.77` via default gateway `192.168.50.1`.

**Mock layered trace:**

```
[7] Application:  Chrome issues GET https://securebank.example.com/login
[6] Presentation: TLS record created. Encrypts HTTP payload with AES-256-GCM,
                  negotiated key via TLS 1.3 handshake.
[5] Session:      Reuses/creates a session; TLS session ID or 0-RTT ticket.
[4] Transport:    SYN seq=0x00001234  -> dst port 443
                  HTTP over port 443. TCP segment: SRC 192.168.50.10:51000, DST 203.0.113.77:443
[3] Network:      IPv4 packet: src=192.168.50.10, dst=203.0.113.77, TTL=64, proto=TCP
                  No match for 203.0.113.77 in local routing table -> forward to gateway.
[2] Data Link:    ARP query for 192.168.50.1 -> reply MAC 00:11:22:33:44:55
                  Ethernet frame: src MAC 00:1a:2b:3c:4d:5e, dst MAC 00:11:22:33:44:55
                  VLAN tag (802.1Q) VID=100, EtherType 0x0800
[1] Physical:     Bits transmitted on Cat6 copper at 1 Gbps -> switch port Gi1/0/5
```

### 1.5 TCP vs UDP — Comparison Table

| Property | TCP | UDP |
|----------|-----|-----|
| Connection state | Connection-oriented (3-way handshake) | Connectionless |
| Reliability | Guaranteed delivery, retransmission | Best-effort, no retransmission |
| Ordering | Ordered segments | No ordering guarantees |
| Flow control | Sliding window, congestion control | None |
| Error checking | Checksum + ACK/retransmit | Checksum only (optional in IPv4) |
| Header size | 20-60 bytes | 8 bytes |
| Data streaming | Byte-stream oriented | Datagram (message) oriented |
| Use cases | HTTP/HTTPS, SSH, SMTP, file transfer | DNS, VoIP/RTP, DHCP, streaming, gaming, SNMP |
| Vulnerabilities | SYN flood, sequence number attacks | Reflection/amplification DDoS, spoofing |

### 1.6 TCP Three-Way Handshake with Packet Captures

Before sending data, TCP establishes a connection via the **SYN -> SYN-ACK -> ACK** sequence.

```
Client 192.168.50.10:51000                 Server 203.0.113.77:443
        |  --- SYN, seq=1000 -------------------------------> |
        |  <-- SYN-ACK, seq=5000, ack=1001 ------------------ |
        |  --- ACK, seq=1001, ack=5001 ---------------------> |
        |  === (connection established; data flows) ========= |
        |  --- FIN, seq=2000 -------------------------------> |
        |  <-- ACK, ack=2001 -------------------------------- |
        |  <-- FIN, seq=6000 -------------------------------- |
        |  --- ACK, ack=6001 -------------------------------> |
```

**Mock tcpdump capture:**

```
$ sudo tcpdump -ni eth0 'tcp port 443 and host 203.0.113.77'
12:01:03.100000 IP 192.168.50.10.51000 > 203.0.113.77.443: Flags [S], seq 1000, win 64240, length 0
12:01:03.100220 IP 203.0.113.77.443 > 192.168.50.10.51000: Flags [S.], seq 5000, ack 1001, win 65535, length 0
12:01:03.100310 IP 192.168.50.10.51000 > 203.0.113.77.443: Flags [.], ack 5001, win 64240, length 0
```

**Why this matters to security:**
- The initial SYN with a low sequence number enables **sequence prediction attacks** (mitigated by RFC 6528 randomization).
- Half-open SYNs (never ACKed) consume server memory - the basis of **SYN flood** DDoS.
- TCP `SYN cookies` and rate limiting mitigate SYN floods.

---

## 2. Network Devices & Their Security

### 2.1 Routers

Routers forward packets between networks based on Layer 3 (IP) addressing and maintain routing tables (static, OSPF, BGP, RIP).

**Security considerations:**
- Harden management plane: SSH only (no Telnet), disable SNMP community strings or use SNMPv3, restrict management access by source ACL.
- Control plane policing (CoPP) to prevent CPU exhaustion from control-plane traffic.
- Disable unused services: CDP, LLDP (unless needed), HTTP server, echo, finger.
- Authenticate routing protocols (OSPF `area 0 authentication`, BGP MD5/TCP-AO) to prevent route injection.
- Log all administrative actions and ship logs to a SIEM.
- Use `no ip directed-broadcast` to prevent smurf-style attacks.
- Keep firmware/OS current; remove default credentials (e.g., `cisco/cisco`).

**Mock router config snippet (Cisco-like):**

```
!
enable secret 9 $9$kJYpKfN1Qp0U2v7xB4m8a2t0...
line vty 0 4
 transport input ssh
 access-class MGMT-ACL in
!
router ospf 1
 passive-interface default
 network 192.168.10.0 0.0.0.255 area 0
 area 0 authentication message-digest
!
ip access-list standard MGMT-ACL
 permit 10.10.10.0 0.0.0.255
 deny   any log
!
no ip http server
no service tcp-small-servers
```

### 2.2 Switches

Switches operate at Layer 2, forwarding frames by MAC address.

**Key Layer-2 attack surfaces and mitigations:**

| Attack | Description | Mitigation |
|--------|-------------|------------|
| MAC flooding | Attacker floods CAM table with fake MACs, forcing switch into hub mode | Port security (`switchport port-security`), MAC limit, sticky MAC |
| ARP spoofing | Attacker poisons ARP caches to MITM | Dynamic ARP Inspection (DAI), static ARP |
| DHCP starvation / rogue DHCP | Exhausts DHCP pools or serves malicious leases | DHCP snooping, trusted ports, rate limiting |
| VLAN hopping | Double-tagging (802.1Q) or DTP abuse to reach other VLANs | Disable DTP (`switchport nonegotiate`), set access/trunk manually |
| Spanning Tree attacks | Rogue BPDUs reroute traffic | BPDU guard, root guard, PortFast |
| STP/MAC table exhaustion | Disrupt forwarding decisions | Storm control, rate limiting |
| CDP/LLDP leaking | Information disclosure | Disable globally or per-port as appropriate |

**Mock hardened switch ports (Cisco-like):**

```
interface GigabitEthernet1/0/5
 switchport mode access
 switchport access vlan 100
 switchport port-security
 switchport port-security maximum 2
 switchport port-security mac-address sticky
 switchport port-security violation restrict
 ip dhcp snooping limit rate 10
 spanning-tree portfast
 spanning-tree bpduguard enable
!
interface GigabitEthernet1/0/24
 switchport mode trunk
 switchport trunk allowed vlan 100,200,300
 switchport nonegotiate
 ip dhcp snooping trust
 spanning-tree guard root
```

### 2.3 Firewalls

| Type | Operates At | Characteristics | Example |
|------|-------------|-----------------|---------|
| Packet filter / Stateless | Layers 3-4 | Inspects each packet in isolation, no connection state | Legacy iptables, access lists |
| Stateful | Layers 3-4 (with connection table) | Tracks connection state (ESTABLISHED, RELATED, NEW); allows return traffic automatically | pfSense, Windows Defender Firewall, Palo Alto, FortiGate |
| Application / Next-Gen (NGFW) | Layers 3-7 | Deep packet inspection, app-ID, user-ID, TLS decryption, IPS, threat feeds | Palo Alto PAN-OS, FortiGate, Check Point |

**Stateless vs stateful - practical difference:**

```
Stateless:  "Allow TCP 22 from any to 10.0.0.5"  ->  ALL packets to port 22 allowed (both directions),
                                                     return traffic must be separately allowed.
Stateful:   "Allow SSH from 192.168.1.0/24 to 10.0.0.5" -> firewall auto-allows the established
             session's return traffic, then expires it after timeout.
```

**Next-gen firewall advantages:**
- Recognizes application traffic regardless of port (e.g., SSH over 443).
- User/group-based policies via AD/LDAP integration.
- Decrypts and inspects TLS.
- Signature and behavioral threat detection.
- URL filtering and reputation feeds.

### 2.4 IDS / IPS

- **IDS (Intrusion Detection System):** passive, monitors traffic, raises alerts. Usually SPAN/mirror or inline tap.
- **IPS (Intrusion Prevention System):** inline, actively drops/rewrites malicious traffic.

| Feature | IDS | IPS |
|---------|-----|-----|
| Deployment | Out-of-band (mirror port) | Inline (traffic passes through) |
| Action | Alert/log only | Drop, reject, reset, rate-limit |
| Latency | Negligible | Adds latency; must be robust |
| Failure mode | No impact on traffic | Fail-open vs fail-closed decisions |
| Detection methods | Signatures, anomaly, behavioral, protocol analysis, honeypots | Same, plus inline enforcement |

**Mock Suricata alert:**

```
11/08/2026-14:22:31.100023  [**] [1:2024215:3] ET MALWARE Known C2 Beacon
      (C&C IP group) [**] [Classification: A Network Trojan was detected]
      [Priority: 1] {TCP} 192.168.50.10:51122 -> 185.220.101.5:443
```

### 2.5 Proxies

Proxies sit between clients and servers, mediating and often caching or filtering requests.

| Proxy Type | Use | Security Benefit |
|------------|-----|------------------|
| Forward proxy | Internal clients to Internet | Content filtering, user auth, TLS interception, data loss prevention |
| Reverse proxy | Internet to internal servers | Hides backends, TLS termination, WAF, load distribution, rate limiting |
| Transparent proxy | Inline without client config | Enforced policy without per-host settings |
| SOCKS proxy | Generic TCP/UDP tunneling | Anonymization, egress control |

**Hardening:** require authentication, restrict to allowed destinations, disable open relay, log all requests, terminate TLS and re-inspect, update blocking categories.

**Mock Squid-style ACL:**

```
acl workhours time M T W T F 08:00-18:00
acl blocked_sites dstdomain facebook.com tiktok.com
http_access deny blocked_sites
http_access allow workhours
http_access deny all
```

### 2.6 Load Balancers

Distribute traffic across multiple servers for availability and scale. Layer 4 (TCP/UDP) and Layer 7 (HTTP/HTTPS) variants.

**Security considerations:**
- TLS termination point - must be patched and keys protected.
- Protect against DNS rebinding and host-header injection (L7).
- Enable slowloris / connection limits, client certificate support.
- Persistence (sticky sessions) can leak state; ensure session IDs are random and HTTP-only.
- Ensure health checks do not expose admin endpoints.
- Use a dedicated management VLAN; restrict admin UI access.

**Mock HAProxy frontend (excerpt):**

```
frontend https-in
    bind *:443 ssl crt /etc/haproxy/certs/wildcard.example.com.pem
    http-request set-header X-Forwarded-Proto https if { ssl_fc }
    http-request deny if ! hdr(Host) -m dom example.com
    default_backend web_backend

backend web_backend
    balance roundrobin
    server web01 10.0.10.11:8443 check
    server web02 10.0.10.12:8443 check
```

### 2.7 VPN Concentrators

Central device terminating many simultaneous VPN tunnels (IPsec, SSL/TLS).

**Security considerations:**
- Strong crypto policies only (AES-256-GCM, no 3DES/MD5); force rekey.
- Multi-factor authentication (MFA) mandatory.
- Restrict split tunneling to reduce client-routed attack surface.
- Client posture checking (OS patch level, AV running) before grant.
- Rate-limit login attempts; lock out after N failures; alert on anomalies.
- Disable default crypto profiles and legacy protocols (L2TP, PPTP).

---

## 3. IP Addressing & Subnetting

### 3.1 IPv4 Address Classes (legacy)

Classful addressing (RFC 791) is largely superseded by CIDR but still appears in exams and legacy docs.

| Class | Leading Bits | First Octet Range | Default Mask | Default Prefix | Hosts (usable) |
|-------|--------------|-------------------|--------------|----------------|----------------|
| A | 0 | 0-127 | 255.0.0.0 | /8 | 16,777,214 |
| B | 10 | 128-191 | 255.255.0.0 | /16 | 65,534 |
| C | 110 | 192-223 | 255.255.255.0 | /24 | 254 |
| D | 1110 | 224-239 | Multicast | - | - |
| E | 1111 | 240-255 | Reserved/Experimental | - | - |

**Special addresses:**
- `0.0.0.0/8` - "this network" (source only)
- `127.0.0.0/8` - loopback (`127.0.0.1`)
- `169.254.0.0/16` - link-local (APIPA, when DHCP fails)
- `255.255.255.255` - limited broadcast

### 3.2 Private Ranges (RFC 1918)

| Range | CIDR | Default Mask | Use |
|-------|------|--------------|-----|
| 10.0.0.0 - 10.255.255.255 | 10.0.0.0/8 | 255.0.0.0 | Large private networks |
| 172.16.0.0 - 172.31.255.255 | 172.16.0.0/12 | 255.240.0.0 | Mid-size private networks |
| 192.168.0.0 - 192.168.255.255 | 192.168.0.0/16 | 255.255.0.0 | Small/home networks |

Other notable ranges: `100.64.0.0/10` (CGNAT), `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` (documentation), `224.0.0.0/4` (multicast), `2001:db8::/32` (IPv6 documentation).

### 3.3 CIDR and Prefix Notation

**Classless Inter-Domain Routing (CIDR)** abandons fixed classes in favor of arbitrary prefix lengths written as `network/prefix-length`.

- The prefix length = number of leading `1` bits in the subnet mask.
- `255.255.255.0` = `/24`, `255.255.252.0` = `/22`, `255.255.255.128` = `/25`.

**Key formulas:**

```
Number of addresses  = 2^(32 - prefix)
Usable hosts         = 2^(32 - prefix) - 2   (subtract network + broadcast)
Subnet increment     = 256 - (value of last non-zero octet in mask)
```

### 3.4 Subnetting Examples with Mock Calculations

**Example 1:** Subnet `192.168.10.0/26` (mask `255.255.255.192`).

```
Host bits = 32 - 26 = 6
Addresses = 2^6 = 64
Usable    = 64 - 2 = 62
Block size = 64
Subnets of 192.168.10.0/24 broken into /26:
  192.168.10.0/26     .0  - .63      usable .1 - .62
  192.168.10.64/26    .64 - .127     usable .65 - .126
  192.168.10.128/26   .128 - .191    usable .129 - .190
  192.168.10.192/26   .192 - .255    usable .193 - .254
```

**Example 2:** A company needs 3 subnets with 300, 100, and 40 hosts.

```
300 hosts  -> next power of 2 >= 302 = 512  -> /23  -> 10.10.0.0/23   (10.10.0.0 - 10.10.1.255)
100 hosts  -> next power of 2 >= 102 = 128  -> /25  -> 10.10.2.0/25   (10.10.2.0 - 10.10.2.127)
40 hosts   -> next power of 2 >= 42  = 64   -> /26  -> 10.10.2.128/26 (10.10.2.128 - 10.10.2.191)
```

**Example 3:** Route summarization / supernetting.

```
Networks:    192.168.32.0/24, 192.168.33.0/24, 192.168.34.0/24, 192.168.35.0/24
In binary:   192.168.00100000.0 ... 192.168.00100011.0
Common bits: 192.168.001 = first 22 bits identical
Summary:     192.168.32.0/22
```

**Mock `sipcalc` output:**

```
$ sipcalc 172.16.24.0/21
Host address        - 172.16.24.0
Network address     - 172.16.24.0
Network mask        - 255.255.248.0
Network mask (bits) - 21
Broadcast address   - 172.16.31.255
Usable range        - 172.16.24.1 - 172.16.31.254
Number of hosts     - 2046
```

### 3.5 IPv6 Overview

IPv6 (RFC 8200) uses 128-bit addresses, written in 8 groups of 16-bit hex, with `::` collapsing zero groups (once).

```
Global unicast  2001:db8:1a2b:3c4d::1/64        (documentation range)
Link-local      fe80::2a1d:48ff:fe22:3344/10
Loopback        ::1
Unspecified     ::
Multicast       ff02::1   (all nodes on link)
Multicast       ff02::2   (all routers on link)
```

**Key IPv6 security notes:**
- **SLAAC** (Stateless Address Autoconfiguration) allows any node to join without auth - use **RA Guard** to drop rogue router advertisements.
- DHCPv6 leases should be rate-limited; **DHCPv6 Guard** prevents rogue servers.
- Link-local (`fe80::/10`) only, until you configure scope.
- Fragmentable extension headers and oversized payloads have been used in evasion - filter ICMPv6 types carefully.
- If dual-stack, security policies must cover both families; NAT is not a protection mechanism.
- Recommended: use privacy extensions (`tempaddr`) for hosts, filter inbound unsolicited traffic, allow only ICMPv6 types required (neighbor discovery: 133-137, MLD: 130-132).

---

## 4. Network Protocols Deep Dive

### 4.1 ARP (Address Resolution Protocol)

ARP maps Layer-3 IPv4 addresses to Layer-2 MAC addresses on a broadcast segment. Because it is **unauthenticated and stateless**, it is trivially exploitable.

**Normal request/response (mock):**

```
Who-has 192.168.50.1?  Tell 192.168.50.10      (broadcast request)
192.168.50.1 is at 00:11:22:33:44:55           (unicast reply)
```

**ARP poisoning / spoofing (MITM):**
An attacker sends gratuitous ARP replies claiming to be the gateway, redirecting victim traffic through the attacker's NIC.

```
# Attacker sends forged replies to victim and gateway:
arp_poison 192.168.50.1   -> claims "00:aa:bb:cc:dd:ee is 192.168.50.1"
arp_poison 192.168.50.10  -> claims "00:aa:bb:cc:dd:ee is 192.168.50.10"
```

**Detection & mitigation:**
- **Dynamic ARP Inspection (DAI)** on switches validates ARP replies against DHCP snooping bindings.
- Static ARP entries for critical hosts.
- `arpwatch`/`arpon` monitoring; alert on MAC changes.
- Port security on access ports.

**Mock `arpwatch` alert:**

```
arpwatch: changed ethernet address 192.168.50.1 00:11:22:33:44:55 (00:aa:bb:cc:dd:ee)
```

### 4.2 DNS

DNS translates names to IPs over UDP/53 (and TCP for large responses/zone transfers).

**Attack vectors:**

| Attack | Description |
|--------|-------------|
| Zone transfer | Unauthenticated AXFR copies entire zone to attacker |
| Cache poisoning | Spoofed answers poison resolver caches |
| DNS tunneling | Encodes data in subdomain labels / TXT records to exfiltrate or C2 |
| Fast flux | Rapidly changing A/NS records to hide C2 infrastructure |
| DGA | Domain Generation Algorithms for ephemeral C2 domains |
| DNS rebinding | Attacker domain resolves to different IPs to bypass SOP |
| NXDOMAIN flood | DDoS against authoritative server |
| Typosquatting / lookalike | Registration of similar domains for phishing |

**Mock zone transfer attempt:**

```
$ dig @ns1.examplecorp.com examplecorp.com AXFR
; Transfer failed (no permission)

# On the victim DNS server log:
Nov 08 14:02:11 dns01 named[1122]: client 185.220.101.5#55321: transfer of 'examplecorp.com/IN':
          AXFR-style query denied, query refused
```

**Mitigation:** restrict AXFR to secondary servers by IP/TSIG, run resolvers with recursion only for internal clients, use random source ports + QNAME randomization, DNSSEC, DNS-over-TLS/HTTPS.

### 4.3 DHCP

Dynamic Host Configuration Protocol assigns IPs, masks, gateway, DNS. Runs UDP client:68 to server:67.

**Attacks:**

| Attack | Description |
|--------|-------------|
| DHCP starvation | Exhausts the pool by requesting all addresses |
| Rogue DHCP server | Attacker supplies malicious gateway/DNS to victims |
| DHCP spoofing (MiTM) | Interception of lease traffic |
| Log poisoning | Crafted hostnames inject into admin UI / logs |

**Mitigation - DHCP snooping (mock Cisco config):**

```
ip dhcp snooping vlan 100,200,300
ip dhcp snooping verify mac-address
no ip dhcp snooping information option
!
interface GigabitEthernet1/0/1
 ip dhcp snooping trust          ! uplink to legitimate DHCP server
!
interface GigabitEthernet1/0/5
 ip dhcp snooping limit rate 10  ! drop excessive Discover/Request
```

### 4.4 HTTP / HTTPS

- **HTTP** (RFC 9110): cleartext, port 80, trivially sniffable/modifiable.
- **HTTPS** = HTTP over TLS, port 443. Protects confidentiality, integrity, and authenticity.

**HTTP security headers every site should set:**

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Common HTTP attacks:** SQL injection, XSS, CSRF, request smuggling, host-header injection, directory traversal, open redirects, credential stuffing. Defenses include WAF, input validation, parameterized queries, same-site cookies, and HSTS.

### 4.5 TLS Handshake Explained

TLS 1.3 (RFC 8446) handshake in two round trips (or one with resumption / 0-RTT).

```
Client                                   Server
  |--- ClientHello (key_share, cipher_suites, supported_versions) ------>
  |<-- ServerHello (chosen cipher, key_share) + EncryptedExtensions -----
  |    + Certificate + CertificateVerify + Finished ----------------------
  |--- Finished (encrypted) --------------------------------------------->
  |    (keys established; application data flows under AES-128/256-GCM,
  |     HKDF key derivation, X25519/ECDHE P-256 key exchange)
```

**Mock OpenSSL capture of a TLS 1.3 session:**

```
$ openssl s_client -connect securebank.example.com:443 -brief
CONNECTION ESTABLISHED
Protocol version: TLSv1.3
Cipher suite: TLS_AES_256_GCM_SHA384
Server public key is 2048 bit
Session-ID: 9A2F...C1
```

**TLS security pitfalls:** weak ciphers (RC4, 3DES), SSLv3/POODLE, BEAST, Heartbleed (CVE-2014-0160), certificate expiry/mismatch, insufficient key lengths, TLS interception without proper pinning/cert handling, and renegotiation attacks.

### 4.6 SMB / NFS (File Sharing)

| Protocol | Ports | Primary Risk |
|----------|-------|--------------|
| SMBv1 | 445 (also 139/NetBIOS) | EternalBlue (MS17-010), WannaCry/NotPetya; must be disabled |
| SMBv2/3 | 445 | Session encryption and signing available |
| NFSv3 | 2049 | No encryption; rely on IP-based export lists, weak auth |
| NFSv4 | 2049 | Kerberos (krb5p) support, more granular |

**Hardening:** disable SMBv1, require SMB signing, disable guest access, restrict NFS exports to specific subnets with `no_root_squash` disabled, enable `sec=krb5p`.

**Mock `/etc/exports` (NFS):**

```
/data/apps   192.168.10.0/24(rw,no_root_squash,sec=krb5p)
```

### 4.7 SNMP

Simple Network Management Protocol - manager polls agents (UDP/161) and receives traps (UDP/162). Uses community strings (v1/v2c) acting as passwords.

| Version | Security | Recommendation |
|---------|----------|----------------|
| v1 | Cleartext community string | Never deploy |
| v2c | Cleartext community string | Only in trusted nets; use strong random string; restrict by ACL |
| v3 | Auth (HMAC) + Privacy (AES) + access control (USM/VACM) | Standard for new deployments |

**Mock attack on weak SNMP (community string leaked in cleartext):**

```
# Attacker sniffs community string "public", then:
$ snmpwalk -v2c -c public 192.168.50.10 1.3.6.1.2.1.1.1.0
SNMPv2-MIB::sysDescr.0 = STRING: Linux srv-web01 5.15.0-91-generic ...
$ snmpwalk -v2c -c public 192.168.50.10 1.3.6.1.4.1.2021.4   # memory stats
# Worse: if "private" RW string known, attacker rewrites configuration.
```

**Mitigation:** use SNMPv3 with authPriv, change default strings (`public`/`private`), restrict source IPs via ACL/firewall, block UDP/161-162 at the edge, disable unnecessary MIBs, and log failures.

---

## 5. Firewall Configuration

### 5.1 Core Principles

- **Default-deny:** Allow only what is explicitly required; deny everything else.
- **Least privilege:** Rules grant minimal access needed.
- **Stateful awareness:** Track connections so return traffic is legitimate.
- **Order matters:** First matching rule wins in iptables; place specific rules before broad ones.
- **Log and monitor:** Log denials to detect scanning and misconfigurations.

### 5.2 iptables / nftables (Linux)

**Mock iptables - default-deny stateful firewall:**

```
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Loopback
iptables -A INPUT -i lo -j ACCEPT

# Established/related traffic
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# SSH from management subnet only
iptables -A INPUT -p tcp --dport 22 -s 10.10.10.0/24 -m conntrack --ctstate NEW -j ACCEPT

# HTTPS for web server
iptables -A INPUT -p tcp --dport 443 -s 0.0.0.0/0 -m conntrack --ctstate NEW -j ACCEPT

# Drop invalid
iptables -A INPUT -m conntrack --ctstate INVALID -j DROP

# Log then drop the rest (rate-limited)
iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "FW-DROP: "
iptables -A INPUT -j DROP
```

**Mock nftables equivalent (`/etc/nftables.conf`):**

```
table inet filter {
    chain input {
        type filter hook input priority filter; policy drop;
        ct state established,related accept
        iif "lo" accept
        iifname "eth0" tcp dport 22 ip saddr 10.10.10.0/24 ct state new accept
        tcp dport 443 ct state new accept
        ct state invalid drop
        counter log prefix "FW-DROP: " limit rate 5/minute
    }
    chain forward {
        type filter hook forward priority filter; policy drop;
    }
}
```

### 5.3 Windows Defender Firewall Rules

**Mock PowerShell commands:**

```powershell
# Enable profiles
Set-NetFirewallProfile -Profile Domain,Private,Public -Enabled True
Set-NetFirewallProfile -Profile Public -DefaultInboundAction Block -DefaultOutboundAction Allow

# Allow RDP from admin jump-host only
New-NetFirewallRule -DisplayName "RDP from JumpHost" -Direction Inbound `
  -Protocol TCP -LocalPort 3389 -RemoteAddress 10.10.10.0/24 -Action Allow

# Block SMB inbound from non-domain ranges
New-NetFirewallRule -DisplayName "Block SMB from Untrusted" -Direction Inbound `
  -Protocol TCP -LocalPort 445 -RemoteAddress Any -Action Block

# Log dropped packets
Set-NetFirewallProfile -Profile Domain `
  -LogFileName C:\Windows\System32\LogFiles\Firewall\pfirewall.log `
  -LogAllowed True -LogBlocked True -LogMaxSizeKilobytes 32768
```

**Mock Windows Firewall log line:**

```
2026-11-08 14:02:31 DROP TCP 192.168.50.25 192.168.50.10 445 58321 40 - R - - - - - - - RECEIVE
```

### 5.4 pfSense-Style Rules

pfSense uses a per-interface rule set with the implicit **default deny** at the bottom.

**Mock rule table (WAN interface):**

| # | Protocol | Source | Port | Destination | Port | Action | State |
|---|----------|--------|------|-------------|------|--------|-------|
| 1 | TCP | Any | * | Public VIP | 443 | Pass | New |
| 2 | TCP | Any | * | Public VIP | 22 | Block (log) | New |
| 3 | ICMP | Any | * | Any | echo-request | Pass | New (rate limit) |
| 4 | Any | Any | * | Any | * | **Reject (log)** | - |

**And LAN interface:**

| # | Protocol | Source | Port | Destination | Port | Action |
|---|----------|--------|------|-------------|------|--------|
| 1 | TCP | 10.0.0.0/8 | * | 10.0.10.11 | 22 | Pass |
| 2 | TCP | 10.0.0.0/8 | * | 10.0.10.11 | 3306 | Block |
| 3 | UDP | 10.0.0.0/8 | * | 8.8.8.8 | 53 | Pass |
| 4 | Any | Any | * | Any | * | **Deny** |

### 5.5 Stateful Firewall Rule Semantics

Stateful firewalls classify packets into states:

- **NEW** - first packet of a connection.
- **ESTABLISHED** - part of a tracked, ongoing connection.
- **RELATED** - a new connection spawned from an existing one (e.g., FTP data channel, ICMP errors).

**Mock conntrack table:**

```
$ conntrack -L
tcp 6 431999 ESTABLISHED src=192.168.50.10 dst=203.0.113.77 sport=51000 dport=443
     src=203.0.113.77 dst=192.168.50.10 sport=443 dport=51000 [ASSURED] mark=0
udp 17 119 src=192.168.50.10 dst=8.8.8.8 sport=53123 dport=53
     src=8.8.8.8 dst=192.168.50.10 sport=53 dport=53123 [ASSURED] mark=0
```

---

## 6. Network Segmentation

### 6.1 VLANs

VLANs (IEEE 802.1Q) segment broadcast domains at Layer 2. Trunks carry multiple VLANs; access ports belong to a single VLAN.

**Security requirements:**
- Native VLAN should be a distinct, unused VLAN (never VLAN 1).
- Trunk links: only the VLANs required; `switchport nonegotiate` to prevent DTP auto-trunking.
- VLAN hopping prevention: treat untrusted ports as access; disable dynamic trunking.
- Private VLANs (PVLAN) to isolate peers within a VLAN.
- Use VACLs for intra-VLAN filtering if supported.

**Mock 802.1Q frame (Wireshark excerpt):**

```
Ethernet II, Src: 00:1a:2b:3c:4d:5e, Dst: 00:11:22:33:44:55
  802.1Q Virtual LAN: PCP: 0, DEI: 0, ID: 200
  Type: IPv4 (0x0800)
```

### 6.2 DMZ

A **Demilitarized Zone** is a separate, semi-trusted network holding public-facing services. Rules: DMZ cannot initiate into the LAN; LAN can access DMZ as needed; WAN can reach only specific DMZ services.

**Typical segmentation:**

```
Internet
   |  (only 443/80 -> DMZ VIP)
   v
Edge FW ----------> DMZ (web01, web02, mail01, vpn01)
   |  (DMZ -> LAN: none by default)
   |  (LAN -> DMZ: specific ports)
   v
Internal FW ------> LAN (10.0.x.x) / server VLAN / user VLANs
```

### 6.3 Micro-Segmentation

Micro-segmentation restricts communication to the workload/VM/pod level rather than subnet level - enabling zero trust east-west controls.

**Benefits:** limits blast radius, contains lateral movement, enables per-workload policy, compliance.

**Example policy logic (workload identity):**

```
ALLOW app-a to db-a tcp/5432 (only app-a's identity)
ALLOW app-b to cache-b tcp/6379
DENY ALL other east-west traffic (default deny between workloads)
```

### 6.4 Zero Trust Networking

**Zero Trust** (NIST SP 800-207): never trust implicitly; verify explicitly. Continuous authentication, least privilege, and per-request authorization based on device posture, user identity, and context.

**Core components:** identity provider (IdP), device posture checks, micro-segmentation, encrypted internal traffic, and dynamic policy.

**SDP (Software-Defined Perimeter)** / Zero Trust Network Access (ZTNA) implements the "black cloud": services are invisible until device+user are verified.

### 6.5 NAC (Network Access Control)

NAC (802.1X-based, or agent/cloud-based) authenticates and profiles devices *before* granting network access.

- **802.1X** on wired/wireless with EAP-PEAP / EAP-TLS; RADIUS backend.
- **Posture assessment:** OS version, AV status, patch level, device compliance.
- **Quarantine VLAN** for non-compliant or unknown devices.

**Mock 802.1X flow:**

```
Supplicant        Authenticator (switch)        Auth server (RADIUS)
    |  EAPOL Start  --------->
    | <------------------- EAP-Request/Identity
    |  EAP-Response/Identity (user@corp.local) ----->  RADIUS Access-Request
    |  ...EAP-TLS handshake (mutual) --------------->  verify certs
    |  EAP-Success  <--------------------------------  RADIUS Access-Accept (VLAN=200)
```

---

## 7. Wireless Security

### 7.1 802.11 Standards

| Standard | Year | Band | Max PHY Rate (typical) | Notes |
|----------|------|------|------------------------|-------|
| 802.11 | 1997 | 2.4 GHz | 2 Mbps | Legacy |
| 802.11b | 1999 | 2.4 GHz | 11 Mbps | WEP era |
| 802.11a | 1999 | 5 GHz | 54 Mbps | |
| 802.11g | 2003 | 2.4 GHz | 54 Mbps | |
| 802.11n | 2009 | 2.4/5 GHz | up to 600 Mbps | MIMO, WPA2 era |
| 802.11ac (Wi-Fi 5) | 2013 | 5 GHz | up to ~3.5 Gbps | MU-MIMO |
| 802.11ax (Wi-Fi 6) | 2019 | 2.4/5/6 GHz | up to ~9.6 Gbps | OFDMA |
| 802.11be (Wi-Fi 7) | 2024 | 2.4/5/6 GHz | up to ~46 Gbps | 320 MHz, MLO |

### 7.2 WEP / WPA / WPA2 / WPA3 Comparison

| Feature | WEP | WPA (TKIP) | WPA2 (CCMP/AES) | WPA3 (SAE/GCMP) |
|---------|-----|------------|------------------|------------------|
| Status | Broken (crackable in minutes) | Legacy, deprecated (KRACK) | Current but aging | Recommended |
| Encryption | RC4 (64/128-bit) | RC4 + TKIP | AES-CCMP | AES-GCMP |
| Auth | Shared key (weak IVs) | PSK w/ 802.1X optional | PSK w/ 802.1X | SAE (simultaneous auth of equals) |
| Forward secrecy | No | No | No (with PSK) | Yes |
| PMF (management frame protection) | No | No | Optional | Mandatory |
| Known attacks | IV reuse, FMS/KoreK, chop-chop, packet injection | Michael/KRACK | KRACK, PMKID hash attacks (offline PSK) | Downgrade attack (Dragonblood, patched) |

**WEP crack example (mock, educational):**

```
$ aircrack-ng -b 00:1A:2B:3C:4D:5E capture.cap
[00:01:02] 8324 IVs collected; key found
KEY FOUND! [ 31:32:33:34:35 ]  (ASCII: 12345)
```

### 7.3 PSK vs 802.1X Enterprise

| Aspect | WPA2/WPA3-Personal (PSK) | WPA2/WPA3-Enterprise (802.1X) |
|--------|--------------------------|-------------------------------|
| Auth | Single shared passphrase | Per-user credentials / certs |
| Scale | Small networks | Large orgs |
| Accountability | None (shared key) | Per-user logs via RADIUS |
| Risk | Key leak = full access; offline PMKID attacks | RADIUS compromise or weak EAP methods |
| Roaming | Full re-auth | Fast roaming (802.11r) optional |

**Recommended EAP methods:** EAP-TLS (certificate-based, strongest), EAP-TTLS / PEAP-MSCHAPv2 (password, enforce strong policies). Avoid EAP-MD5, EAP-LEAP (crackable), and unencrypted inner methods.

### 7.4 Rogue AP and Evil Twin

- **Rogue AP:** unauthorized AP plugged into the wired network - bypasses controls, may be unencrypted.
- **Evil Twin:** attacker broadcasts an AP with the same SSID; victims connect and are MITM'd. Often combined with a deauth (disassociation) flood to force reconnects.

**Mock deauth attack log:**

```
# Attacker sends continuous disassociations to force clients to reconnect to the evil twin
airmon-ng, Deauth of client 00:1a:2b:3c:4d:5e (AP: CorpNet) frame sent
```

**Mitigations:** wireless intrusion detection (WIDS) / prevention (WIPS) with RF monitoring, rogue AP detection via wired-side probes (LLDP, CDP, SNMP MAC learning), periodic site surveys, disable clients' "auto-connect" habits, and use Enterprise WPA3 with PMF.

### 7.5 MAC Filtering - Why It Is Weak

MAC addresses are unencrypted, unauthenticated, and spoofable with one command:

```
# Attacker clones an allowed MAC:
$ ifconfig wlan0 down
$ macchanger -m 00:1a:2b:3c:4d:5e wlan0
$ ifconfig wlan0 up
```

MAC filtering adds friction, not security. Use it only as a minor layer alongside strong auth (802.1X/WPA3-SAE). SSID hiding is also ineffective (probes reveal SSIDs). Effective security = strong cryptography + per-user authentication + monitoring.

### 7.6 Wireless Hardening Checklist

- Use WPA3-SAE (or WPA2-CCMP minimum) - never WEP/WPA/TKIP.
- Enterprise deployment: 802.1X + EAP-TLS with client certs.
- Enable PMF (management frame protection).
- Disable WPS (PIN brute-force risk).
- Change default SSID/admin credentials; use unique SSIDs per site.
- Disable unused SSIDs and guest-from-internal bridging.
- Place APs on a dedicated management VLAN; authenticate APs to controller.
- Enforce strong passphrases (>= 14 chars, random) if PSK is unavoidable.
- Deploy WIDS/WIPS; alert on rogue APs and deauth floods.
- Use band steering and client isolation on guest networks.
- Regularly update AP firmware; disable remote management from WAN.
- Use protected management frames; randomize client MAC policy per org needs.

---

## 8. Remote Access Security

### 8.1 VPN Types

| Type | Protocol | Ports | Encryption | Use Case |
|------|----------|-------|------------|----------|
| IPsec (IKEv2) | ESP/AH + IKE | UDP 500, 4500 | AES-GCM / ChaCha20 | Site-to-site & client |
| IPsec (IKEv1) | ESP + ISAKMP | UDP 500, 4500 | AES (legacy modes) | Legacy gateways |
| SSL/TLS VPN | TLS | TCP 443 (or UDP 443/QUIC) | TLS 1.3 | Clientless & client remote access |
| WireGuard | UDP | single UDP port (e.g., 51820) | ChaCha20-Poly1305, Curve25519 | Modern simple VPN |
| OpenVPN | TLS (TCP/UDP) | 1194/443 | TLS + ciphers | Flexible client VPN |

**Mock IPsec IKEv2 phase 1-2 flow:**

```
Client <---[IKE_SA_INIT (SA proposal, key exchange)]--> Gateway
Client <---[IKE_AUTH (EAP/PSK + certs + ESP SPIs)]---> Gateway
Client <---[ESP tunnel established: AES-256-GCM]-----> Gateway
```

### 8.2 IPsec Details

- **IKEv2** (RFC 7296) - fewer messages than IKEv1, built-in NAT traversal, MOBIKE mobility.
- **Modes:** Tunnel (protects whole packet, for site-to-site) vs Transport (protects payload only).
- **Proposals to require:** AES-256-GCM, DH Group 14/19/20, SHA-256 or better, PFS.
- **Proposals to forbid:** 3DES, DES, MD5, SHA-1, DH Group 1/2, static preshared keys without rotation.

**Mock `ipsec.conf` (strongSwan):**

```
conn site-to-site
    left=203.0.113.10
    leftsubnet=10.0.10.0/24
    right=198.51.100.20
    rightsubnet=10.0.20.0/24
    authby=secret
    auto=start
    ike=aes256gcm16-sha256-prfsha256-ecp384
    esp=aes256gcm16-sha256-ecp384
    keyexchange=ikev2
```

### 8.3 SSL/TLS VPN (incl. OpenVPN & WireGuard)

- **SSL VPN:** leverages TLS; supports clientless web portals and full-tunnel clients. Great NAT/firewall traversal (port 443).
- **OpenVPN:** mature, flexible; supports certificate + TOTP; TCP/UDP; 1194 or 443.
- **WireGuard:** minimal code, modern crypto (ChaCha20-Poly1305, X25519, BLAKE2s), fast. Fixed-port UDP.

**Mock WireGuard client config (`wg0.conf`):**

```
[Interface]
PrivateKey = qFfQ7e... (mock base64)
Address = 10.200.0.2/32
DNS = 10.10.10.5

[Peer]
PublicKey = X3mP9r... (mock base64)
PresharedKey = /X2aBc... (mock base64)
Endpoint = 203.0.113.15:51820
AllowedIPs = 10.0.0.0/8
PersistentKeepalive = 25
```

### 8.4 VPN Security Issues

| Issue | Description | Mitigation |
|-------|-------------|------------|
| Split tunneling | Client routes some traffic direct, exposing endpoint | Force full tunnel; split-DNS only |
| Weak crypto profiles | Legacy IKEv1/3DES/SHA-1 | Enforce modern suites; disable legacy |
| Credential-only auth | Single-factor access | MFA (TOTP, push, certs) mandatory |
| VPN server compromise | Gateway becomes pivot | Segregate VPN zone; harden host; monitor |
| Orphaned accounts | Stale VPN users | Periodic account recertification |
| Client-side risk | Malware on VPN client | Posture checks, EDR, patching |
| Bandwidth abuse / tunneling | Personal VPN-in-VPN | Egress filtering, log anomalous flows |

### 8.5 RDP Security

RDP (port 3389/TCP) is a leading remote-attack vector. Hardening:

- Never expose RDP directly to the Internet - front with a VPN, RD Gateway, or jump host.
- Enforce NLA (Network Level Authentication).
- Use strong passwords + MFA (RDG / NPS RADIUS / DUO).
- Restrict via firewall to admin source IPs only.
- Enable RDP SSL with trusted certs; disable clipboard, drive mapping, printer redirection where not needed.
- Limit users in "Remote Desktop Users" group; monitor 4624/4625 (Windows logon) events.
- Disable RDP entirely on non-admin workstations.
- Restrict sessions, idle timeouts, and concurrent logins.

**Mock RDP brute-force log (Windows Security Event):**

```
Log Name:      Security
Event ID:      4625 (An account failed to log on)
Account Name:  Administrator
Source Network Address: 203.0.113.99
Date: 2026-11-08 03:17:41  (pattern: 412 failures from same source in 10 min)
```

### 8.6 Remote Access Policies (Template Outline)

1. **Scope:** who may connect, from where, with which devices.
2. **Authentication:** MFA mandatory; account lockout after 5 failures/15 min.
3. **Device requirements:** managed endpoints, patched, EDR enabled.
4. **Session rules:** idle timeout 15 min, max session 8 h, re-auth on disconnect.
5. **Network access:** VPN users land in isolated segment; no direct server access.
6. **Logging & auditing:** all sessions logged; quarterly reviews.
7. **Termination:** immediate revocation on offboarding; key/cert rotation.
8. **Approval & exceptions:** exception process requiring security sign-off.

---

## 9. Network Monitoring & Defense

### 9.1 SNMP for Monitoring

Use SNMPv3 for collection. Typical queries: CPU, memory, interface utilization, interface status, BGP/OSPF state.

**Mock SNMPv3 walk (authenticated):**

```
$ snmpwalk -v3 -l authPriv -u monitor -a SHA -A 'Str0ngPass!' -x AES -X 'Pr1vKey!' 10.0.10.11 1.3.6.1.2.1.25.3.3.1.2
HOST-RESOURCES-MIB::hrProcessorLoad.196608 = INTEGER: 12
HOST-RESOURCES-MIB::hrProcessorLoad.196609 = INTEGER: 8
```

### 9.2 Flow Analysis: NetFlow / sFlow / IPFIX

Flow records summarize conversations (5-tuple: src IP, dst IP, src port, dst port, protocol) plus counters and timestamps.

| Standard | Sampling | Transport | Notes |
|----------|----------|-----------|-------|
| NetFlow v5 | First packet of each flow | UDP 9995/2055 | Legacy, fixed record format |
| NetFlow v9 | Template-based | UDP 9995/2055 | Flexible fields, dynamic templates |
| IPFIX | Template-based (IETF NetFlow v9) | SCTP/UDP/TCP | Standards-based |
| sFlow | Statistical sampling | UDP 6343 | Stateless, high speed |

**Mock NetFlow record:**

```
Flow 18324: src 192.168.50.10:51000 -> 203.0.113.77:443 proto TCP
  packets=2314 bytes=4823151 first=2026-11-08 13:58:01 last=14:01:44 flags=.....
```

**Detection value:** flow analysis reveals beaconing (regular small transfers to a fixed C2), data exfiltration volume spikes, and internal lateral movement.

### 9.3 Packet Capture with tcpdump

**Real filter examples:**

```
# All traffic to/from one host
sudo tcpdump -ni eth0 host 10.0.10.11

# HTTP only (port 80)
sudo tcpdump -ni eth0 tcp port 80

# HTTPS + DNS
sudo tcpdump -ni eth0 'tcp port 443 or udp port 53'

# Malformed TCP flags (stealth scanning / Xmas)
sudo tcpdump -ni eth0 'tcp[13] = 0x29'

# SSH brute force from a subnet
sudo tcpdump -ni eth0 'tcp[((tcp[12]>>2)&3)<<2] = 0x02' and 'tcp dst port 22'

# Write capture to file, rotating
sudo tcpdump -ni eth0 -C 100 -W 48 -z gzip -w /var/captures/edge.pcap
```

**Mock tcpdump capture (SYN scan detected):**

```
$ sudo tcpdump -ni eth0 'tcp[13] & 0x02 != 0' and not dst port 22
14:02:31.004112 IP 198.51.100.88.31001 > 10.0.10.11.80: Flags [S], seq 101, win 1024
14:02:31.004119 IP 198.51.100.88.31002 > 10.0.10.11.443: Flags [S], seq 101, win 1024
14:02:31.004125 IP 198.51.100.88.31003 > 10.0.10.11.8080: Flags [S], seq 101, win 1024
14:02:31.004131 IP 198.51.100.88.31004 > 10.0.10.11.21: Flags [S], seq 101, win 1024
(1-2-3-4 rapid sequential probe of closed ports -> port scan signature)
```

### 9.4 Wireshark Filter Examples

```
# Show only HTTP GET/POST requests
http.request

# Find all TLS handshakes (ClientHello)
tls.handshake.type == 1

# Traffic between two hosts
ip.addr == 10.0.10.11 && ip.addr == 10.0.10.12

# Malformed packets (bad checksums)
ip.checksum_bad == 1

# DNS queries containing suspicious subdomains (tunneling)
dns.qry.name contains "base64" or dns.txt contains ""

# ARP spoofing - duplicate addresses
arp.duplicate-address-detected

# Credentials over cleartext
http.request or (ftp.request.command == "USER") or (ftp.request.command == "PASS")
```

### 9.5 IDS/IPS Signatures & Rules

**Mock Snort rule:**

```
alert tcp $HOME_NET any -> $EXTERNAL_NET 445 (msg:"ET EXPLOIT SMB EternalBlue";
 content:"|ff|SMBu|00|"; depth:16; flow:established; sid:2024215; rev:1;)
```

**Mock Suricata rule (DNS tunneling heuristic):**

```
alert dns $HOME_NET any -> any any (msg:"ET DNS Suspicious high-entropy subdomain";
 dns.query; content:".sk3.example.net"; pcre:"/([a-z0-9]{50,})\./"; sid:2024300; rev:1;)
```

**Detection categories:** signature (exact match), anomaly (deviation from baseline), behavior (sequence of events), heuristic (rules of thumb), reputation (threat intel), protocol analysis (RFC violation).

### 9.6 Anomaly Detection & Network Baselining

**Baselining process:**
1. Collect flow + SNMP data for 2-4 weeks during normal operation.
2. Build per-segment, per-protocol, per-server baselines (bytes, sessions, peak hours).
3. Set thresholds (e.g., mean + 3 sigma, or percentile-based).
4. Alert on deviation; correlate with asset criticality.
5. Re-baseline after major changes; validate false positives.

**Mock anomaly alert:**

```
ALERT: VLAN 100 -> Internet egress volume deviation
  Baseline 14-day avg: 2.4 Mbps peak (13:00-15:00)
  Observed: 41.8 Mbps sustained for 28 min (src host 192.168.50.77)
  Likelihood: HIGH (rate > 17x baseline) - recommend host investigation for exfil.
```

### 9.7 Network Monitoring Stack (Reference)

| Layer | Tool Example | Purpose |
|-------|--------------|---------|
| Capture | tcpdump, Wireshark | Deep packet inspection |
| Flow | nfdump/fprobe, PRTG | Conversation summaries, baselining |
| Log | rsyslog/Windows Event Forwarding | Device & host logs |
| IDS/IPS | Suricata, Snort, Zeek | Signature + behavioral detection |
| SIEM | Wazuh, Splunk, Sentinel | Correlation, alerting, compliance |
| NetMon | Zabbix, PRTG, LibreNMS | Availability, SNMP metrics, alerts |
| Honeypots | Cowrie, Canarytokens | Deception, early warning |

---

---

## 10. Network Attacks & Countermeasures

### 10.1 DoS / DDoS

Denial-of-Service attacks exhaust resources (bandwidth, CPU, connections, state). DDoS uses botnets/reflectors to amplify.

| Attack Type | Layer | Example | Defense |
|-------------|-------|---------|---------|
| SYN flood | 4 | Half-open connections fill the SYN backlog | SYN cookies, SYN proxy, rate limit |
| UDP amplification | 4 | DNS/NTP/SSDP reflect & amplify (up to 100x) | Block UDP services exposed, egress filtering, rate limit |
| ICMP flood | 3 | Ping flood, Smurf (directed broadcast) | Disable directed broadcast, rate limit ICMP |
| HTTP flood | 7 | Slowloris, GET/POST floods | WAF, rate limit per IP/UA, CAPTCHA, CDN |
| Connection exhaustion | 4-7 | Fill FW/conntrack tables | Scale-out, state limits, load balancing |
| Botnet flood | 3-7 | Massive distributed traffic | CDN scrubbing, blackholing, anycast |

**Mock mitigation (nginx rate limiting for HTTP flood):**

```
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
server {
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        limit_conn conn_per_ip 10;
        proxy_pass http://backend;
    }
}
```

**Mock DDoS alert timeline:**

```
14:05:00  Edge: inbound traffic rises 3x over baseline
14:05:40  Edge: SYN rate 1.2M/s from 40k distinct source IPs
14:06:10  Alert: DDoS mitigated by CDN scrubbing center (ASN-based drop lists)
14:07:00  Post-mortem: reflection vector DNS port 53, amplification factor 28x
```

**Defense-in-depth:** capacity planning, CDN/scrubbing, anycast, ingress/egress filtering (BCP 38), rate limiting, SYN cookies, blackhole routing, and WAF.

### 10.2 MITM (Man-in-the-Middle) — ARP Spoofing Detailed Example

ARP spoofing lets an attacker on the same L2 segment impersonate the gateway. Traffic between victim and gateway flows through the attacker.

**Step-by-step scenario (all mock):**

```
Segment: VLAN 100
Victim:    192.168.50.10  MAC 00:1a:2b:3c:4d:5e
Gateway:   192.168.50.1   MAC 00:11:22:33:44:55
Attacker:  192.168.50.66  MAC 00:aa:bb:cc:dd:ee

Step 1 - Attacker poisons victim's ARP cache:
  $ arpspoof -i eth0 -t 192.168.50.10 192.168.50.1
  00:aa:bb:cc:dd:ee is-at 192.168.50.1   (gratuitous reply, repeated)

Step 2 - Attacker poisons gateway's cache:
  $ arpspoof -i eth0 -t 192.168.50.1 192.168.50.10
  00:aa:bb:cc:dd:ee is-at 192.168.50.10

Step 3 - Victim's traffic now transits attacker NIC:
  victim -> attacker -> gateway -> internet (and reverse)

Step 4 - Attacker enables IP forwarding and starts sniffing:
  $ echo 1 > /proc/sys/net/ipv4/ip_forward
  $ tcpdump -ni eth0 -w mitm.pcap
```

**Victim-side symptoms:**
- Duplicate ARP replies for the gateway (detectable via `arpwatch` / DAI).
- HTTP pages get injected with a fake "update" or redirect.
- TLS failures if attacker attempts downgrade; `arp -a` shows gateway at the attacker MAC.

**Verification (mock):**

```
$ arp -a
192.168.50.1  at 00:aa:bb:cc:dd:ee   <-- WRONG MAC (should be 00:11:22:33:44:55)
```

**Countermeasures:**
- Dynamic ARP Inspection (DAI) on the access switch (validates against DHCP bindings).
- Static ARP entries on critical hosts.
- DHCP snooping + port security (1 MAC per port).
- Encrypt everything (TLS/HSTS) so sniffed plaintext is useless.
- Network segmentation: restrict who shares a broadcast segment with servers.
- Anomaly detection on ARP traffic; alert on rapid gratuitous ARP.

### 10.3 Sniffing (Passive Eavesdropping)

**Capture methods:** promiscuous NIC on a shared segment, SPAN/mirror port, TAP, wireless monitor mode, evil twin, or ARP-poison MITM.

**Mitigation:** switched networking (limits L2 visibility), encryption (TLS 1.3, IPsec, SMB signing, SSH), 802.1X port auth, and disabling cleartext protocols.

### 10.4 Session Hijacking

Attacker steals an active TCP/session token and takes over. For TCP: guessing/observing sequence numbers; for HTTP: session ID theft (XSS, sniffing, fixation).

**Defenses:** random per-connection ISNs, encrypted transport, short-lived random session IDs (HttpOnly, Secure, SameSite), re-authentication for sensitive actions, and session binding to IP/UA heuristics (careful with IP churn).

### 10.5 Port Scanning Techniques with nmap

| Scan | nmap flag | Technique | Detectability |
|------|-----------|-----------|---------------|
| Full connect | `-sT` | Completes 3-way handshake | High (logged in app/auth) |
| Stealth / SYN | `-sS` | Half-open SYN, no final ACK | Medium |
| FIN | `-sF` | FIN packet; closed ports reply RST | Low |
| Xmas | `-sX` | FIN+PSH+URG; closed ports reply RST | Low |
| NULL | `-sN` | No flags; closed ports reply RST | Low |
| ACK (firewall mapping) | `-sA` | ACK packet; response reveals filtering | Low |
| UDP | `-sU` | ICMP port unreachable = closed | Medium |
| Idle / zombie | `-sI` | Uses third host's IP ID | Very low |

**Mock nmap SYN scan run and output:**

```
$ sudo nmap -sS -Pn -p 22,80,443,445,3389 -T4 10.0.10.11
Starting Nmap 7.94 ( https://nmap.org ) at 2026-11-08 14:02 UTC
Nmap scan report for 10.0.10.11
Host is up (0.0012s latency).
PORT     STATE    SERVICE
22/tcp   open     ssh
80/tcp   filtered http
443/tcp  open     https
445/tcp  filtered microsoft-ds
3389/tcp filtered ms-wbt-server

Nmap done: 1 IP address (1 host up) scanned in 3.42 seconds
```

**Detection & defense:**
- Drop/rate-limit unusual flag combos (iptables state rules naturally drop invalid).
- IDS signatures for sequential port probes (see section 9.3 tcpdump filter).
- Only expose required services; place everything else behind firewall deny.
- Honeypot ports to trip scanners early.

**Mock iptables drop rule for Xmas/NULL/FIN scans:**

```
iptables -A INPUT -p tcp -m conntrack --ctstate INVALID -j DROP
iptables -A INPUT -p tcp --tcp-flags ALL FIN,PSH,URG -j DROP    # Xmas
iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP            # NULL
iptables -A INPUT -p tcp --tcp-flags SYN,FIN SYN,FIN -j DROP     # SYN+FIN
```

---

## 11. DNS Security

### 11.1 DNSSEC

DNSSEC (RFC 4033-4035) cryptographically signs DNS records to prevent spoofing/poisoning. It does **not** encrypt; it authenticates with a chain of trust (root -> TLD -> zone).

**Components:** DNSKEY (public key), RRSIG (signature over a record set), DS (delegation signer to parent), NSEC/NSEC3 (authenticated denial of existence).

**Mock signed record response (`dig +dnssec`):**

```
$ dig +dnssec +short A examplecorp.com
10.20.30.40
A 8 2 300 2030... 2026... 12345 examplecorp.com. 4q1r...==
DNSKEY 257 3 8 AwEAAfE5...
```

**Verification:** resolvers validate; a bad signature yields `status: SERVFAIL`. Monitor with `delv` / `dig +sigchase`.

### 11.2 DNS over HTTPS / TLS

Encrypts the DNS channel to prevent on-path snooping/poisoning.

| Protocol | Port | Use |
|----------|------|-----|
| DoT (RFC 7858) | 853/TCP | Encrypts resolver link; easy to firewall/policy |
| DoH (RFC 8484) | 443/TCP | Blends with HTTPS; harder to block; bypass potential |
| DoQ (RFC 9250) | 853/UDP | QUIC-based, low latency |

**Policy note:** DoH can bypass corporate DNS filtering and split-horizon - decide whether to allowlist/block DoH endpoints; enforce via enterprise resolver and client policy (e.g., Group Policy / MDM).

### 11.3 Split-Horizon DNS

Internal and external clients resolve the same names to different addresses:

```
Internal query for intranet.examplecorp.com -> 10.20.30.40   (internal view)
External query for intranet.examplecorp.com -> (no record)   (external view)
```

**Security:** hides internal topology, prevents external scanning of internal names, keeps internal services off public records. Requires careful zone replication and consistency (avoid split-horizon "fencing" mistakes / DNS rebinding by using separate internal namespaces where possible).

### 11.4 Sinkholing

A sinkhole redirects known-bad domains to a controlled IP, either at authoritative/recursive level or via a malicious-infrastructure takedown.

**Mock internal resolver config (block C2 by domain):**

```
zone "evil-c2.example" {
    type master;
    file "/etc/bind/db.sinkhole";
};

# db.sinkhole returns a local capture host for all queries:
*   IN  A  10.10.10.99   ; sinkhole honeypot, logging all hits
```

**Mock sinkhole hit log (compromised host beaconing):**

```
2026-11-08 15:44:02 sinkhole 10.10.10.99 192.168.50.77 TXT  b8m3n.c2-evil.example 208 bytes
```

### 11.5 DGA (Domain Generation Algorithm) Detection

DGA malware (e.g., Conficker, Mirai variants, TrickBot) generates many random-looking domains to locate C2.

**Indicators:**
- High query volume to domains with high entropy / unusual TLDs.
- NXDOMAIN storms (most generated domains never exist).
- Character frequency far from human-language norms.
- Periodic algorithmic cadence (hourly/daily).

**Detection approaches:**

| Approach | Method |
|----------|--------|
| Entropy scoring | Shannon entropy of labels > threshold (e.g., >3.5 per char for domain) |
| NXDOMAIN ratio | Per-client ratio of failed queries spikes |
| Longest meaningful substring | Low readability score |
| Machine learning | Classifier on n-grams / character distribution |
| Threat intel | Match against DGA family seeds / predicted domains |

**Mock DGA detection log (Suricata + flow):**

```
ALERT: host 192.168.50.77 issued 412 DNS queries in 60s
  entropy(avg) 3.91; 398 NXDOMAIN; TLDs: .com .net .info .biz
  verdict: likely DGA (TrickBot family) - isolate host and hunt for beaconing.
```

---

## 12. Network Hardening Checklist

### 12.1 Routers & Switches

- [ ] Change default credentials; use strong passwords / AAA (TACACS+/RADIUS).
- [ ] Management access via SSH only; disable Telnet, HTTP(S) admin where avoidable.
- [ ] Restrict management plane to a dedicated management subnet via ACL.
- [ ] Enable control-plane policing (CoPP) / management-plane protection.
- [ ] Disable unused services: CDP, LLDP (unless needed), NTP control, small servers, DHCP client.
- [ ] Enable logging (local + remote) of all admin actions; set NTP.
- [ ] Authenticate routing protocol peers (OSPF MD5, BGP TCP-AO).
- [ ] `no ip directed-broadcast`; drop BOGON/private source addresses at edge (BCP 38).
- [ ] Port security on access ports; disable DTP; hardcode trunk VLANs; change native VLAN.
- [ ] Enable DHCP snooping, Dynamic ARP Inspection (DAI), IP Source Guard.
- [ ] BPDU guard + PortFast on user ports; root guard on distribution.
- [ ] Disable STP on interfaces that need it off; enable STP root protection.
- [ ] Firmware/OS patched and verified via signed images; configs backed up & encrypted.
- [ ] Disable SNMPv1/v2c or restrict by ACL; prefer SNMPv3 authPriv.
- [ ] Disable password recovery / config-exposure ports where possible.

### 12.2 Firewalls

- [ ] Default-deny inbound and outbound (least privilege).
- [ ] Stateful rules; drop INVALID states.
- [ ] Log all denies; ship logs to SIEM; review weekly.
- [ ] Admin access restricted + MFA; disable management from WAN.
- [ ] Patch/update firmware and threat feeds regularly.
- [ ] Use specific rules over broad ones; audit rule order and stale rules quarterly.
- [ ] Enable anti-spoofing, rate limiting, and connection limits.
- [ ] Enable TLS inspection (NGFW) where privacy policy allows.
- [ ] Fail-closed for critical segments; document fail-open exceptions.

### 12.3 Servers (Network-relevant)

- [ ] Host firewall enabled (Windows Defender / nftables) with default deny inbound.
- [ ] Only required ports listening; verify with `netstat -tulpn` / `Get-NetTCPConnection`.
- [ ] Disable cleartext protocols (Telnet, FTP, HTTP where HTTPS/SSH apply).
- [ ] Patch management process with defined SLAs (critical within 48h).
- [ ] Local accounts removed; domain/AD auth; MFA for admins.
- [ ] AV/EDR installed, updated, and reporting to a central console.
- [ ] Centralized logging enabled; time sync via NTP.
- [ ] Backups tested; recovery plan documented.
- [ ] NTP secured (authentication where supported).

### 12.4 Wireless & Remote Access

- [ ] WPA3-SAE minimum; enterprise 802.1X + EAP-TLS for managed fleets.
- [ ] PMF enabled; WPS disabled.
- [ ] Rogue AP detection (WIDS/WIPS) active; alerts on deauth floods.
- [ ] AP firmware patched; APs on dedicated management VLAN.
- [ ] Guest network isolated (client isolation, bandwidth caps, separate SSID).
- [ ] VPN: IKEv2/SSL with modern ciphers; MFA enforced.
- [ ] RDP never exposed; NLA on; RDP via VPN/gateway only.
- [ ] Remote access accounts reviewed quarterly; disable on termination.

### 12.5 DNS & Monitoring

- [ ] DNSSEC signing + validation; monitor SERVFAIL.
- [ ] Restrict zone transfers (AXFR) to authorized secondaries (IP + TSIG).
- [ ] Split-horizon views hide internal topology.
- [ ] Resolver rate limits; query logging for NXDOMAIN/DGA analytics.
- [ ] SNMPv3 for all monitoring; no default community strings.
- [ ] Flow export (NetFlow/IPFIX) enabled on edge + core.
- [ ] IDS/IPS coverage on all segments; signatures updated daily.
- [ ] Network baseline maintained; anomaly alerts tuned.
- [ ] Backup of all configs; change-management process with peer review.

---

## 13. Mock Network Topology Case Study

### 13.1 Organization & Environment

**"Northwind Financial Services"** (fictional). 400 employees, HQ + one branch. Scope: HQ campus.

### 13.2 Mock Network Diagram (Text)

```
                              INTERNET
                                 |
                          [Edge Router R1]
                                 | 203.0.113.1/24 (WAN)
                        +--------+--------+
                        |  Edge FW (NGFW) |
                        +--------+--------+
                                 |  10.0.0.1
              +------------------+------------------+
              |                                     |
        DMZ 10.0.1.0/24                       LAN 10.0.2.0/24
        +------------+---------+               +------------------------+
        |            |         |               |                        |
    [web01][web02] [mail01] [vpn01]      [SW-CORE1] ---- [SW-CORE2]
    10.0.1.11  .12  .13      .14              |           |   (MLAG)
                                              |           |
                        +---------------------+---+-------+
                        |         |         |         |
              VLAN 100 Users     VLAN 200 HR     VLAN 300 Finance     VLAN 400 Server
              10.0.2.10-99      10.0.2.100-199  10.0.2.200-299       10.0.2.150-179
                   [SW-A1]         [SW-A2]         [SW-A3]            [db01 .161, filesrv .162]
                                                                      [ad01 .160, backup .163]

Wireless: [AP-1..AP-4] SSID "NW-Fin-Corp" (WPA2-PSK currently) on VLAN 100;
          SSID "NW-Fin-Guest" on VLAN 500 (isolated)

Management: 10.10.10.0/24 (Mgmt VLAN 999) - switch/router mgmt, FW mgmt, iLO/iDRAC
```

**Addressing summary (all fictional):**

| Segment | VLAN | Subnet | Purpose |
|---------|------|--------|---------|
| WAN | - | 203.0.113.0/30 | ISP link |
| DMZ | 10 | 10.0.1.0/24 | Public services |
| Users | 100 | 10.0.2.0/24 | Staff workstations |
| HR | 200 | 10.0.2.128/25 | HR workstations (shared with Users) |
| Finance | 300 | 10.0.2.128/25 (same) | Finance workstations (shared) |
| Servers | 400 | 10.0.2.128/25 (same) | DB, fileserver, AD, backup |
| Guest | 500 | 10.0.5.0/24 | Guest wireless |
| Mgmt | 999 | 10.10.10.0/24 | Management plane |

### 13.3 Security Issues Identified

**Critical / High:**

1. **Flat user segments:** HR, Finance, and Servers share the same /25 - no segmentation between HR, finance, and server resources (VLAN 200/300/400 overlap). Any user workstation compromise can directly reach the DB server (10.0.2.161).
2. **Wireless WPA2-PSK on corporate SSID:** shared passphrase; offline PMKID cracking possible; no per-user accountability; guests and staff on same PSK.
3. **RDP exposed to Internet:** firewall logs show direct 3389 inbound to an HR PC (10.0.2.104) for "vendor access" - frequent brute-force attempts (4625 events from 203.0.113.99).
4. **No MFA on VPN:** vpn01 uses password-only auth; login failure logs show credential stuffing.
5. **SNMPv2c with default community `public`** on switches and firewall; not restricted by ACL (sniffable).
6. **SMBv1 enabled** on filesrv02 (10.0.2.162) - residual risk for EternalBlue-class worms.

**Medium:**

7. **Native VLAN 1 in use** on trunks; DTP not disabled on all ports.
8. **No DHCP snooping / DAI / port security** on access switches; MAC flooding and ARP spoofing unmitigated.
9. **Management VLAN (999) routable** from Users VLAN via firewall allow-all rule.
10. **DNS zone transfer** allowed from any host in Users subnet (BIND config permits AXFR from 10.0.0.0/8).
11. **Guest wireless bridges** to corporate SSID traffic (no client isolation).
12. **No egress filtering** - outbound allowed to all destinations/ports; large uploads from a finance PC (41.8 Mbps) observed with no alert.

**Low:**

13. Default passwords on a legacy printer and a network camera.
14. NTP and SNMP traps not authenticated.
15. No NXDOMAIN/DGA detection; DNS logs not analyzed.

### 13.4 Remediation Plan

| # | Action | Owner | Priority | Effort |
|---|--------|-------|----------|--------|
| 1 | Re-IP HR, Finance, Servers into distinct VLANs/subnets (VLAN 200, 300, 400 separate); apply micro-segmentation between HR/Finance and DB | Net | Critical | 2 weeks |
| 2 | Migrate corporate SSID to WPA2/WPA3-Enterprise 802.1X + EAP-TLS; certificate enrollment; RADIUS (NPS) | Net/Sec | Critical | 1 month |
| 3 | Remove direct RDP exposure; route via VPN/RD Gateway with NLA + MFA | Net | Critical | 1 week |
| 4 | Enforce MFA on VPN (TOTP/push); lockout + rate limit; posture check | Sec | Critical | 1 week |
| 5 | Move all devices to SNMPv3 authPriv; remove `public` string; ACL restrict to monitoring host | Net | High | 1 week |
| 6 | Disable SMBv1 org-wide via GPO; require SMB signing | Sec | High | 1 week |
| 7 | Native VLAN to unused VLAN 4094 on trunks; `switchport nonegotiate`; hardcode trunk allowed lists | Net | Medium | 2 days |
| 8 | Enable DHCP snooping, DAI, IP Source Guard, port security on all access ports | Net | Medium | 1 week |
| 9 | Restrict Mgmt VLAN access to admins + jump host; block from Users VLAN | Net/FW | Medium | 2 days |
| 10 | Restrict AXFR to secondary DNS servers by IP + TSIG | Net | Medium | 1 day |
| 11 | Enable client isolation on Guest SSID; block guest-to-corp routing | Net | Medium | 1 day |
| 12 | Implement egress default-deny with allowlist; alert on volume anomalies (NetFlow baselining) | Sec/FW | High | 2 weeks |
| 13 | Change default creds on printer/camera; segment IoT | Net | Low | 1 day |
| 14 | Harden NTP (authenticated) + SNMP traps | Net | Low | 2 days |
| 15 | Stand up DNS DGA/NXDOMAIN analytics; feed alerts to SIEM | Sec | Medium | 1 month |

### 13.5 Expected Post-Remediation State

- HR, Finance, and Server traffic isolated at L2/L3 with default-deny east-west.
- Wireless fully enterprise-authenticated with per-user audit; guest network quarantined.
- Zero direct RDP to the Internet; all remote access via VPN + MFA.
- Management plane isolated, monitored, MFA-protected.
- Baseline established with NetFlow + SNMPv3; anomaly alerts active for egress/DNS.
- Compliance evidence: quarterly firewall rule review, config backups, change records.

---

## Appendix A. Common Port Reference

| Port | Protocol | Service | Security Note |
|------|----------|---------|---------------|
| 20/21 | TCP | FTP | Cleartext; use SFTP/FTPS |
| 22 | TCP | SSH | Harden, key-only, rate limit |
| 23 | TCP | Telnet | Never expose; cleartext |
| 25 | TCP | SMTP | Relay control, TLS (STARTTLS) |
| 53 | TCP/UDP | DNS | Restrict AXFR; DNSSEC/DoT |
| 67/68 | UDP | DHCP | Snooping required |
| 80/443 | TCP | HTTP/HTTPS | HSTS, redirect 80->443 |
| 110/143 | TCP | POP3/IMAP | Require TLS |
| 135/137/139/445 | TCP/UDP | SMB/NetBIOS | Disable SMBv1; block at edge |
| 161/162 | UDP | SNMP | SNMPv3 only |
| 3389 | TCP | RDP | Never expose directly |
| 500/4500 | UDP | IKE/IPsec | Modern profiles only |
| 1433/3306/5432 | TCP | MSSQL/MySQL/PostgreSQL | Never expose to WAN |
| 2049 | TCP/UDP | NFS | Restrict exports; krb5p |
| 51820 | UDP | WireGuard | Firewall allow only for VPN |

---

*End of document. All data is fictional mock data for educational purposes only.*
