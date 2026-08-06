# CRYPTOGRAPHY MASTER REFERENCE

> **A Comprehensive, Practitioner-Oriented Guide to Modern Cryptography**
>
> Version 1.0 — Training & Reference Material
> Scope: Foundations → Symmetric → Asymmetric → Hybrid → Hashing → Passwords → Signatures → PKI → TLS → Attacks → Randomness → Tools → Policy → Checklists
>
> **Disclaimer:** All keys, messages, certificates, hashes, and command outputs in this document are **fictional mock data** created for teaching purposes. Nothing here is a real secret, real certificate, or real target.

---

## Table of Contents

1. [Foundations of Cryptography](#1-foundations-of-cryptography)
2. [Symmetric Cryptography](#2-symmetric-cryptography)
3. [Worked Example: AES-CBC](#3-worked-example-aes-cbc)
4. [Asymmetric Cryptography](#4-asymmetric-cryptography)
5. [Hybrid Cryptosystems](#5-hybrid-cryptosystems)
6. [Hash Functions](#6-hash-functions)
7. [Password Security](#7-password-security)
8. [Digital Signatures](#8-digital-signatures)
9. [Public Key Infrastructure (PKI)](#9-public-key-infrastructure-pki)
10. [TLS in Practice](#10-tls-in-practice)
11. [Crypto Attacks](#11-crypto-attacks)
12. [Cryptographic Randomness](#12-cryptographic-randomness)
13. [Practical Crypto Tools](#13-practical-crypto-tools)
14. [Crypto Policy & Compliance](#14-crypto-policy--compliance)
15. [Common Crypto Mistakes Checklist](#15-common-crypto-mistakes-checklist)

---

# 1. Foundations of Cryptography

## 1.1 What Cryptography Protects — The CIA Triad

Cryptography is the science of secure communication in the presence of adversaries. It is the *mathematical* backstop for three core security goals:

| Goal | Acronym | What It Means | Crypto Mechanism |
|------|---------|---------------|------------------|
| **Confidentiality** | C | Only authorized parties can read the data | Encryption (AES, RSA, ChaCha20) |
| **Integrity** | I | Data has not been altered in transit or at rest | Hash functions, MACs (HMAC, GCM tags) |
| **Authenticity** | A | Data really comes from the party it claims to come from | Digital signatures, MACs, certificates |

Two additional properties frequently added to the model:

- **Non-repudiation** — A sender cannot plausibly deny having sent a message (provided by digital signatures).
- **Availability** — Not strictly a crypto property, but key management failures routinely take systems offline.

> **Rule of thumb:** Encryption alone gives confidentiality, not integrity. An attacker who can flip ciphertext bits can often produce meaningful (garbage-in, garbage-out) changes. Always pair encryption with authentication — that is exactly why modern modes like **AES-GCM** exist (see §2.3).

## 1.2 A Brief History

### The Caesar Cipher (c. 58 BCE)

A substitution cipher: each letter is shifted a fixed number of positions.

```
Plaintext:  ATTACKATDAWN
Shift +3:   DWWDFNDWGDZQ
```

Decryption is the reverse shift. The key space is only 26 possible shifts (and historically often only the shift of 3). This is trivially breakable by hand and by brute force today.

### Vigenère Cipher (16th century, popularized 1553)

A polyalphabetic cipher using a repeating keyword. Each letter is shifted by the value of the corresponding keyword letter.

```
Keyword:    LEMONLEMONLE
Plaintext:  ATTACKATDAWN
Ciphertext: LXFOPVEFRNHR
```

For over 300 years it was called *le chiffre indéchiffrable* ("the indecipherable cipher"). It was finally broken in 1863 by Friedrich Kasiski using frequency analysis and repeated-keyword patterns.

### The Enigma Machine (1920s–1945)

A rotor-based electro-mechanical cipher machine used by Nazi Germany in WWII. Its security depended on:

- **Rotor settings** (choice and order of rotors)
- **Ring settings**
- **The plugboard (Steckerbrett) wiring**

The key space was astronomically large (~150 million million million possible settings by some counts), which created a false sense of total security. The Allies' success at Bletchley Park (Alan Turing, Gordon Welchman, Marian Rejewski's earlier Polish work) came not from brute force but from **known-plaintext analysis** — cribs such as predictable message headers — combined with mathematical reduction of the key space and automated machines (the Bombe).

> **Lesson from history:** enormous key space ≠ secure. Good cryptography needs sound mathematical analysis, not just complexity. This is the ancestor of Kerckhoffs's principle.

### Modern Era (1970s–present)

- **1976** — Diffie-Hellman key exchange published: the first practical way for two parties to agree on a shared secret over an insecure channel.
- **1977** — RSA public-key cryptosystem published (Rivest, Shamir, Adleman).
- **1977** — DES standardized (56-bit keys, now broken).
- **2001** — AES standardized by NIST (Rijndael).
- **2005** — SHA-1 shown to be practically broken (collision attacks published 2017).
- **2012–2015** — SHA-3 (Keccak) standardized; Argon2 wins the Password Hashing Competition.
- **2018** — TLS 1.3 standardized.
- **2024+** — Post-quantum cryptography standardization (NIST PQC: ML-KEM, ML-DSA, SLH-DSA, FN-DSA) begins real-world deployment.

## 1.3 Kerckhoffs's Principle

> "A cryptosystem should be secure even if everything about the system, **except the key**, is public knowledge."

— Auguste Kerckhoffs, *La Cryptographie Militaire*, 1883

Modern restatement: **The enemy knows the system.** The only secret is the key.

Implications:

- Algorithms are public. AES, RSA, SHA-256 are open and scrutinized by thousands of cryptographers.
- If a design needs to be secret to be secure, it has no real security — only obscurity.
- Open algorithms get attacked, and the attacks get fixed. Secret algorithms often contain catastrophic flaws that only the designers miss.

### Why Security Through Obscurity Is Bad

| Claim | Reality |
|-------|---------|
| "Nobody knows how our system works" | One leak, one reverse-engineered binary, or one insider exfiltration reveals everything. |
| "Our proprietary cipher is better than AES" | Unverifiable. History shows proprietary ciphers are *more* likely to be broken (A5/1 in GSM, DVD's CSS, Cisco's VMS). |
| "We can keep the source secret" | Serves (and often fails to deter) the casual attacker; never stops determined adversaries or insider threats. |
| "Obscurity is an extra layer" | Defense in depth is fine — but it must never *replace* sound cryptography. |

**Use obscurity only as garnish, never as the meal.**

## 1.4 Cryptographic Goals & Threat Model

Before designing any solution, answer:

1. **What are we protecting?** Data at rest? Data in transit? Passwords? Integrity?
2. **Who is the adversary?** Passive eavesdropper? Active MITM? Malicious server? Nation state?
3. **What can the adversary do?** Read ciphertext (ciphertext-only), know plaintext (known-plaintext), choose plaintext (chosen-plaintext), modify messages?
4. **What is the expected lifetime of the data?** "Harvest now, decrypt later" — if data must stay secret for 20 years, today's key sizes must survive future computational growth and possibly quantum computers.

| Adversary Capability | Attack Model | Typical Defenses |
|----------------------|--------------|------------------|
| Eavesdrops on ciphertext only | Ciphertext-only | Strong encryption (AES-256) |
| Knows some (plaintext, ciphertext) pairs | Known-plaintext | Good modes, random IVs, padding resistance |
| Can choose plaintext and observe ciphertext | Chosen-plaintext | Randomized encryption (IV/nonce), authenticated modes |
| Can modify ciphertext | Active / tampering | MACs, AEAD modes (GCM/ChaCha20-Poly1305), TLS record protection |
| Can observe timing/power of the target | Side-channel | Constant-time implementations, blinding |

> **Fundamental rule:** Cryptography is only one component of a security architecture. Poor key management, weak randomness, or misconfigured protocols will defeat even "unbreakable" algorithms.

---

# 2. Symmetric Cryptography

## 2.1 Stream vs Block Ciphers

### Stream Ciphers

Encrypt one bit/byte at a time by XORing the plaintext with a **keystream**:

```
ciphertext = plaintext XOR keystream
```

```
keystream:  1 0 1 1 0 1 0 0
plaintext:  1 1 0 0 1 0 1 1
XOR result (ciphertext): 0 1 1 1 1 1 1 1
```

Properties:

- Fast, low latency, small code size.
- **Keystream reuse is fatal** — XORing two ciphertexts produced with the same keystream cancels the keystream and leaks the XOR of the two plaintexts, which is easily deciphered.
- Modern example: **ChaCha20** (used in TLS 1.3, WireGuard). RC4 is broken — never use it.

### Block Ciphers

Encrypt fixed-size blocks (AES = 128-bit blocks) with a key. Because real messages are longer than one block, block ciphers need a **mode of operation** (§2.3).

```
Plaintext block (128 bits) ----> [ AES-128 block cipher ] ----> Ciphertext block (128 bits)
                                        |
                                    128-bit key
```

Properties:

- Modes provide different security properties (ECB is insecure, CBC has padding pitfalls, CTR turns it into a stream, GCM adds integrity).
- Block ciphers are the workhorse of modern cryptography: AES everywhere.

### Comparison

| Aspect | Stream Cipher | Block Cipher |
|--------|---------------|--------------|
| Granularity | Bit/byte at a time | Fixed-size block (AES: 128 bits) |
| Typical use | Low-power devices, fast transport, TLS 1.3 | Disk/network encryption, most modern systems |
| Modern example | ChaCha20 | AES (with GCM/CTR/CBC modes) |
| Pitfall | Keystream reuse | Misused modes (ECB, static IV, no padding integrity) |

## 2.2 AES — Advanced Encryption Standard

AES (Rijndael), standardized by NIST in **FIPS 197** (2001), is a **Substitution-Permutation Network**. It operates on a 4×4 byte state matrix across a number of rounds:

| Key Size | Rounds | Security |
|----------|--------|----------|
| AES-128 | 10 | ~2^128 operations to brute force — secure for most purposes |
| AES-192 | 12 | 2^192 |
| AES-256 | 14 | 2^256 — recommended for long-term/classified-grade secrecy |

Each round (except the last) performs:

1. **SubBytes** — non-linear byte substitution via an S-box (provides confusion).
2. **ShiftRows** — rotates each row of the state (provides diffusion).
3. **MixColumns** — matrix multiplication mixing columns (diffusion).
4. **AddRoundKey** — XOR with the round key derived from the key schedule.

The real strength of AES is the combination of confusion (S-box) and diffusion (ShiftRows + MixColumns) repeated many times. No practical break of full AES has been published; the best known attacks (biclique, 2011) are theoretical and still require ~2^126 operations against AES-128.

### Known Attacks / Concerns

- **Side-channel attacks** (power analysis, cache timing) against naive AES implementations — mitigated by hardware AES instructions (AES-NI) and constant-time software.
- **Related-key attacks** reduce effective strength slightly for AES-256 in theory, but only in contrived settings; AES-256 remains recommended for highest assurance.
- The real-world AES failures are almost always **protocol misuse**, not the cipher itself.

## 2.3 Block Cipher Modes of Operation

The mode decides how blocks relate to each other. This is where most real-world encryption bugs live.

### ECB — Electronic Codebook (NEVER use for real data)

Each block is encrypted independently.

```
Block 1: M1 ----> [AES_K] ----> C1
Block 2: M2 ----> [AES_K] ----> C2
Block 3: M3 ----> [AES_K] ----> C3
(identical plaintext blocks produce identical ciphertext blocks)
```

**Problem:** identical blocks encrypt identically, leaking structure. The classic Tux test image still shows the penguin silhouette when encrypted with ECB. Great for single-block operations (like encrypting a key) — useless for general data.

### CBC — Cipher Block Chaining

Each plaintext block is XORed with the *previous ciphertext block* before encryption. The first block is XORed with the **IV**.

```
C0 (IV)
C1 = AES_K(P1 XOR C0)
C2 = AES_K(P2 XOR C1)
C3 = AES_K(P3 XOR C2)
```

- **IV must be unpredictable (random) and unique per message.** Reusing an IV leaks the XOR of the first plaintext blocks between messages.
- Requires **padding** because the message must fill whole blocks (CBC can't stream partial blocks) — padding is the source of the famous *padding oracle attack* (§11.4).
- With proper IV handling and HMAC/authenticated wrapper it is acceptable, but **prefer GCM**.

### CTR — Counter Mode (turns the block cipher into a stream)

Encrypts a counter value, then XORs the result with the plaintext:

```
C1 = P1 XOR AES_K(CTR+0)
C2 = P2 XOR AES_K(CTR+1)
C3 = P3 XOR AES_K(CTR+2)
```

- Blocks can be processed **in parallel** and you can decrypt the *n-th* block without the rest (random access — used in disk encryption and databases).
- **Nonce must NEVER be reused** under the same key; the result is a two-time pad.
- No padding needed. Provides confidentiality only — pair with a MAC (this is essentially what GCM does internally).

### GCM — Galois/Counter Mode (AEAD, the modern default)

GCM = **CTR mode + authentication tag** computed with a universal hash (GHASH). It is an **AEAD** (Authenticated Encryption with Associated Data) scheme.

```
Inputs:  Plaintext, AAD (e.g., IP headers, metadata), Key, 96-bit IV/nonce
Outputs: Ciphertext, 128-bit authentication tag

Decrypt: if tag does not verify -> message rejected (tamper detected)
```

- Authenticates the data *and* the associated data (AAD) that travels unencrypted (packet headers).
- Fast with hardware AES-NI + GHASH instructions.
- **Critical caveat:** a nonce reuse under the same key can allow key recovery via the GHASH collision attack. Never reuse nonces; use random 96-bit nonces or deterministic counters.

### When to Use Which

| Mode | Integrity? | Parallel? | Random access? | Use case | Verdict |
|------|-----------|-----------|----------------|----------|---------|
| ECB | No | Yes | Yes | Single-block ops only | ❌ Avoid |
| CBC | No (needs MAC) | Decrypt only | No | Legacy; some legacy protocols | ⚠️ Prefer GCM |
| CTR | No (needs MAC) | Yes | Yes | Disk/DB encryption with separate MAC | ⚠️ OK w/ MAC |
| **GCM** | **Yes (AEAD)** | **Yes** | Partial | TLS, IPsec, general transport | ✅ Default |

## 2.4 DES and 3DES — Why Deprecated

**DES** (Data Encryption Standard, 1976) used a 56-bit key and 64-bit blocks. With 2^56 keys, it was brute-forced in 1998 by the EFF's "Deep Crack" machine in ~56 hours for under $250k. Today a dedicated rig or cloud burst can do it in hours-to-days.

**3DES** applied DES three times with (usually) three keys: `C = E_K3(D_K2(E_K1(P)))`. Effective strength ≈ 112 bits, but:

- Only 64-bit blocks (vulnerable to birthday-bound attacks in some uses — Sweet32, 2016).
- Very slow in software (no hardware acceleration).
- NIST officially **disallowed 3DES for new uses in 2023** (SP 800-131A transition; withdrawn completely from new Federal use).

**Recommendation:** AES-GCM or ChaCha20-Poly1305. Nothing from the DES family should appear in new code.

## 2.5 The Key Exchange Problem

Symmetric encryption requires both sides to share the same secret key. But how do two parties that have never met agree on a key without a pre-existing secure channel?

```
            Alice                                    Bob
        ???? shared key K ????                     
           (insecure channel — Eve is listening)
```

Options:

1. **Out-of-band delivery** (USB stick, courier, printed paper) — secure but slow and un-scalable.
2. **Diffie-Hellman key exchange** (§4.3) — mathematically agree on a secret even while everything exchanged is public.
3. **Public-key encryption / hybrid systems** (§5) — send the symmetric key wrapped in the recipient's public key.
4. **Pre-shared keys (PSK)** — fine for small fixed deployments (e.g., WPA2-PSK, IoT), but key management doesn't scale.

> The insight that solved key exchange — Diffie-Hellman (1976) — is why *asymmetric* cryptography exists. Symmetric crypto is fast but key distribution is hard; asymmetric crypto is slow but key distribution is easy. Real systems combine both.

---

# 3. Worked Example: AES-CBC

## 3.1 Setup (Mock Data)

```
Message (plaintext, UTF-8):  "PAY 5000 TO ALICE"
Key (AES-128, 16 bytes):     A1 B2 C3 D4 E5 F6 07 18 29 3A 4B 5C 6D 7E 8F 90
IV  (16 bytes, random):      5C D2 9F 41 8A E0 7B 33 64 F1 0B 2C 9E 47 A8 D5
```

### Step 0 — Convert message to bytes and pad

The message `"PAY 5000 TO ALICE"` is 16 bytes (including the 2 spaces) — exactly one block. To demonstrate padding, let's make the message `"PAY 5000 TO ALICE."` (17 bytes).

PKCS#7 padding adds `N` bytes of value `N`, where `N` = bytes needed to reach a multiple of 16.

```
17 bytes message -> needs 15 bytes of padding to reach 32 (2 blocks)
Padding bytes: 0F 0F 0F 0F 0F 0F 0F 0F 0F 0F 0F 0F 0F 0F 0F   (15 × 0x0F)
```

So our two plaintext blocks (each 16 bytes = 128 bits):

```
Block P1: "PAY 5000 TO ALICE"   (16 bytes)
Block P2: "." + 15 × 0x0F       (17th char + padding)
```

## 3.2 Byte-Level Walkthrough

### Block 1

```
Step 1: XOR P1 with the IV
  P1:      50 41 59 20 35 30 30 30 20 54 4F 20 41 4C 49 43   ("PAY 5000 TO ALIC")
  IV:      5C D2 9F 41 8A E0 7B 33 64 F1 0B 2C 9E 47 A8 D5
  XOR ->  0C 93 C6 61 BF D0 4B 03 44 A5 44 0C DF 0B E1 96

Step 2: Encrypt that with AES_K
  AES_K(0C 93 C6 61 BF D0 4B 03 44 A5 44 0C DF 0B E1 96)
        = 8F 12 A7 30 C4 55 9E 2B 7D 00 63 FA 11 8C D4 5E   (C1)
```

### Block 2

```
Step 3: XOR P2 with C1 (chaining!)
  P2:      2E 0F 0F 0F 0F 0F 0F 0F 0F 0F 0F 0F 0F 0F 0F 0F
  C1:      8F 12 A7 30 C4 55 9E 2B 7D 00 63 FA 11 8C D4 5E
  XOR ->   A1 1D A8 3F CB 5A 91 24 72 0F 6C F5 1E 83 DB 51

Step 4: Encrypt that with AES_K
  AES_K(A1 1D A8 3F CB 5A 91 24 72 0F 6C F5 1E 83 DB 51)
        = 3B 64 E0 9C 1F D2 87 4A B6 30 77 8C D9 42 E3 1F   (C2)
```

### Final Ciphertext

```
IV  || C1        || C2
5C D2 9F 41 8A E0 7B 33 64 F1 0B 2C 9E 47 A8 D5
8F 12 A7 30 C4 55 9E 2B 7D 00 63 FA 11 8C D4 5E
3B 64 E0 9C 1F D2 87 4A B6 30 77 8C D9 42 E3 1F
```

> **Key observations for real understanding:**
>
> 1. Identical message blocks (block 1's trailing bytes and block 2 are *different*) produce different ciphertext *because* of chaining. If we'd used ECB, the two identical plaintext regions would produce identical ciphertext.
> 2. The **IV travels with the ciphertext** — it is not secret, but it MUST be random and unique per message. Anyone can read the IV; that's fine, because without the key, XOR-with-IV tells them nothing about plaintext.
> 3. **Decryption reverses this:** decrypt C1 with the key, XOR with the IV to get P1; decrypt C2, XOR with C1 to get P2; strip the `0F` padding.
> 4. Chaining means **every byte of the plaintext affects all subsequent ciphertext** — a single flipped bit in C1 will corrupt P1's byte *and* scramble all of P2 (though P2's flipped bit will be recovered after XOR). This is why CBC needs a MAC for integrity.

## 3.3 What Changes in AES-GCM (same message)

GCM uses the same block cipher but in CTR mode plus a GHASH tag:

```
Nonce:  A4 8B 1E 70 33 D9 C0 56 92 1D F4 8A        (96-bit nonce)
Result ciphertext: same length as plaintext (no padding!)
Tag (128 bits):    6E C4 9A 2F 57 B1 80 3D ...      (authenticates ciphertext + AAD)
```

Because there is no chaining and no padding, a flipped bit corrupts **only that one bit's plaintext byte** — but the **tag fails**, so the receiver rejects the whole message. Integrity via the tag; confidentiality via CTR.

---

# 4. Asymmetric Cryptography

## 4.1 The Big Idea

In symmetric crypto, one key does everything. In asymmetric (public-key) crypto, there are **two mathematically linked keys**:

```
                 Private Key (kept secret)
                        |
   Encrypt-with-public   |  Decrypt-with-private
   Verify-with-public    |  Sign-with-private
```

- **Public key** — freely distributed. Encrypt to a party, or verify their signature.
- **Private key** — never leaves its owner. Decrypt, or sign.

Confidentiality: Alice encrypts with Bob's *public* key → only Bob (private key) decrypts.
Authentication: Alice signs with her *private* key → anyone verifies with her *public* key.

## 4.2 RSA — Rivest–Shamir–Adleman

Security rests on the practical hardness of **integer factorization**: given the product of two large primes, find the primes.

### Key Generation (with small mock primes — NOT production sizes)

Production RSA uses 2048- or 3072-bit primes. For teaching we use tiny primes; the *math* is identical.

```
1. Pick two distinct primes:        p = 61,  q = 53
2. Compute n = p × q:               n = 61 × 53 = 3233
3. Compute φ(n) = (p−1)(q−1):       φ = 60 × 52 = 3120
4. Choose public exponent e:        e = 17   (small odd, coprime with 3120)
5. Compute private exponent d:      d = e⁻¹ mod φ(n)  = 2753
   (2753 × 17 = 46801, and 46801 mod 3120 = 1  ✓)
```

```
Public key  = (n = 3233, e = 17)
Private key = (n = 3233, d = 2753)
```

### Encrypt a Mock Message

Treat the message as a number `m` with `0 ≤ m < n`. Let `m = 65`.

```
Encrypt:  c = m^e mod n = 65^17 mod 3233
65^2   = 4225 mod 3233 = 992
65^4   = 992² mod 3233 = 448
65^8   = 448² mod 3233 = 174
65^16  = 174² mod 3233 = 1323
c = 65^17 = 65^16 × 65 = 1323 × 65 = 85995 mod 3233 = 1973
Ciphertext: c = 1973
```

### Decrypt

```
Decrypt: m = c^d mod n = 1973^2753 mod 3233 = 65  ✓ (restored)
```

The magic is Euler's theorem: for coprime `m` and `n`, `m^(φ(n)) ≡ 1 (mod n)`, and since `e·d ≡ 1 (mod φ(n))`, `m^(e·d) ≡ m (mod n)`.

### RSA in Practice

- RSA with small primes is trivially breakable — real keys use 2048-bit minimum (or 3072 for long-term).
- **Textbook RSA is insecure:** deterministic, malleable, vulnerable to padding. Real RSA uses **OAEP** (Optimal Asymmetric Encryption Padding) for encryption and **PSS** for signatures.
- **Never share `p`/`q`/`d`; never reuse `n` across distinct parties** (common-factor attacks on shared primes).
- RSA encryption is slow; in practice RSA (or ECDH) only wraps a symmetric session key (§5).

## 4.3 Diffie–Hellman Key Exchange (ECDH)

Diffie–Hellman lets two parties derive a **shared secret** without ever transmitting it, even in the presence of a passive eavesdropper.

### Mock DH over a tiny group (again for math only)

```
Public parameters:  prime p = 23,  generator g = 5

Alice chooses secret a = 6:      A = g^a mod p = 5^6 mod 23 = 8
Bob   chooses secret b = 15:     B = g^b mod p = 5^15 mod 23 = 19

Alice sends A = 8  ──────────────▶ Bob
Bob   sends B = 19 ──────────────▶ Alice

Alice computes:  s = B^a mod p = 19^6 mod 23 = 2
Bob   computes:  s = A^b mod p = 8^15 mod 23 = 2

Shared secret s = 2   (both parties, nobody else who only saw 8 and 19)
```

Security rests on the **Discrete Logarithm Problem** (given `g` and `g^a`, find `a`). ECDH is the same idea on an elliptic curve group, giving equivalent security with much smaller numbers (§4.5). **MITM caveat:** classic DH is unauthenticated — an active attacker can perform two DH exchanges (one with each victim). Modern systems authenticate DH with signatures or certificates (§10, §11.7).

## 4.4 ECC — Elliptic Curve Cryptography

ECC works in the group of points on an elliptic curve, e.g. `y² = x³ + ax + b` over a prime field (Curve25519, NIST P-256).

```
Curve:   y² = x³ − 3x + b   (mod p)
Group op: point addition / scalar multiplication  →  Q = k·P
Private key: k  (a large random scalar)
Public key:   Q = k·P  (a point)
```

Security rests on the **Elliptic Curve Discrete Logarithm Problem**: given points `P` and `Q = k·P`, find `k`. The best known algorithms have complexity ~2^(n/2) for n-bit keys, which is why ECC offers comparable security to RSA at dramatically smaller key sizes.

## 4.5 Key Length Comparison (Equivalent Strengths)

NIST recommended equivalence (bits of symmetric security):

| Symmetric (AES) | RSA / DH (modulus) | ECC (curve size) | NIST Assessment (2020s) |
|-----------------|--------------------|------------------|-------------------------|
| 80 (obsolete) | 1024 (broken) | 160 | Deprecated |
| 112 | 2048 | 224 | Acceptable to 2030 |
| 128 | 3072 | 256 | Standard recommendation |
| 192 | 7680 | 384 | Higher assurance |
| 256 | 15360 | 521 | Long-term / classified |

Why smaller keys for ECC?

- RSA security: `2^(0.5 × log2(n))` against NFS — the "half-exponent" penalty.
- ECC security: `2^(bits/2)` against Pollard rho — meaning a 256-bit curve ≈ 2^128 security, while RSA needs a 3072-bit modulus for the same.
- Smaller keys → faster computation, smaller certificates, less energy — critical for TLS handshakes and IoT.

> **Note on quantum (§11.8):** both RSA (Shor's algorithm) and ECC (also broken by Shor, since it solves discrete log too) fall to quantum computers. Post-quantum schemes (ML-KEM, ML-DSA) use lattices, not factoring or discrete logs.

---

# 5. Hybrid Cryptosystems

## 5.1 Why Hybrid?

Symmetric crypto is ~1000× faster than asymmetric, but key distribution is hard. Asymmetric solves distribution but is slow. **Hybrid** = asymmetric for the key exchange, symmetric for the bulk data.

```
Alice                                            Bob
   │  Bob's public key (certificate)                 │
   │◄───────────────────────────────────────────────│
   │  1. Generate random session key K (AES-256)     │
   │  2. Wrap K:  enc = RSA/ECDH(K, Bob_public)      │
   │  3. Send enc ────────────────────────────────►  │  4. Unwrap K with private key
   │  5. Encrypt data with K (AES-GCM)               │
   │  ciphertext ─────────────────────────────────►  │  6. Decrypt data with K
   │                                                 │
   │  (future messages can reuse a new K per session)│
```

This is exactly what **TLS does**: ECDHE for a shared secret, HKDF to derive AES keys, AES-GCM for all application data.

## 5.2 Worked Example: A TLS-Like Exchange (Mock)

```
Setup: Server has RSA-2048 keypair; server's certificate carries the public key.

1. Key exchange
   Client generates random session key:     K = 7F 2A 91 C0 ... (32 bytes, from CSPRNG)
   Client wraps K with server's public key: wrapped = RSA_OAEP_Encrypt(K, server_pub)
   Client sends:  wrapped ───────────────────────────────► Server
   Server unwraps: K = RSA_OAEP_Decrypt(wrapped, server_priv)

2. Both parties now share K (only they know it). Client authenticates nothing yet.

3. Bulk data
   Client:  ct = AES-256-GCM-Encrypt(plaintext, key=K, nonce=N1, aad=record_header)
   Server:  plaintext = AES-256-GCM-Decrypt(ct, key=K, nonce=N1, aad=record_header)
   (GCM tag validates that no one tampered with ct or the header)
```

Modern TLS 1.3 actually uses **(EC)DHE** instead of pure RSA key transport (forward secrecy, §10.2), but the hybrid principle — asymmetric bootstrap, symmetric bulk — is identical.

## 5.3 Why Forward Secrecy Matters

If a TLS session used *only* RSA to wrap a static session key, anyone who later steals the server's RSA private key could decrypt **recorded** traffic. Forward secrecy (ephemeral ECDH, a fresh key per session, discarded after use) ensures that compromising today's long-term key does **not** decrypt yesterday's traffic.

```
Without FS:   compromise RSA private key  =>  all recorded sessions decrypted
With FS:      compromise RSA private key  =>  only future sessions impersonatable;
               past session keys are already deleted
```

---

# 6. Hash Functions

## 6.1 What a Hash Is

A hash function maps arbitrary-length input to a fixed-size output:

```
H("hello")  = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
H("hello!") = 523af537941b1e98e5b92e8e5d7e24e2d...   (totally different, one char changed)
```

```
┌─────────────────┐
│  arbitrary data │
└────────┬────────┘
         ▼
   ┌───────────┐
   │ SHA-256   │ ──► 256-bit digest
   └───────────┘
```

## 6.2 Required Properties

| Property | Definition | Why It Matters |
|----------|-----------|----------------|
| **Deterministic** | Same input → same output | Verification is repeatable |
| **Preimage resistance** | Given `y`, infeasible to find `x` with `H(x)=y` | Passwords can't be reversed |
| **Second-preimage resistance** | Given `x`, infeasible to find `x'≠x` with `H(x')=H(x)` | Forged documents can't collide with a real one |
| **Collision resistance** | Infeasible to find *any* `x≠y` with `H(x)=H(y)` | Signatures & digests can't be attacked by birthday collisions |
| **Avalanche effect** | Changing one input bit flips ~half the output bits | Statistical indistinguishability |

## 6.3 The Big Three Families

### SHA-1 (obsolete, broken)

- 160-bit output. First practical collision attack published 2017 (Google's SHAttered — two valid PDFs, same SHA-1).
- NIST deprecated since 2011. **Do not use** for signatures or integrity.

### SHA-2 (SHA-224/256/384/512)

- Merkle–Damgård construction. Still recommended for most purposes.
- Same family as SHA-1 but with a much stronger design; no practical attacks.

### SHA-3 (Keccak, 2015)

- Sponge construction — a different design family. Good as a fallback should SHA-2 ever weaken, and excellent in KDFs (via SHAKE).
- NIST approved alongside SHA-2.

| Algorithm | Output | Status | Typical use |
|-----------|--------|--------|-------------|
| MD5 | 128 bits | Broken (collisions trivial) | Legacy only; checksums of low-value data |
| SHA-1 | 160 bits | Broken | Avoid |
| SHA-256 | 256 bits | Recommended | Integrity, HMAC, TLS, passwords (via KDF) |
| SHA-512 | 512 bits | Recommended | Large-file integrity, some KDFs |
| SHA3-256 | 256 bits | Recommended | New designs, NIST PQC ecosystem |

## 6.4 MD5 — The Cautionary Tale

MD5 collisions were found in 2004 (Wang); by 2007, crafted colliding certificates were demonstrated. Today:

- **Rapid collision construction:** an attacker can generate two colliding inputs (e.g., two different program files) in seconds on a laptop.
- MD5 should never be used for security. It survives only in non-security checksums.

## 6.5 Length Extension Attacks

**Length extension** applies to Merkle–Damgård hashes (MD5, SHA-1, SHA-2) used in the pattern `H(secret || message)` for a MAC:

- Given `H(secret || m)` and the length of `secret || m`, the attacker can compute `H(secret || m || padding || m')` **without knowing the secret**, by re-using the internal state.
- Consequence: naive `H(key || data)` MACs are forgeable.
- **Fix:** use HMAC (`HMAC(key, data)`), or SHA-3 (sponge — not vulnerable), or prefix the key *after* the data.

## 6.6 Applications

### Password Storage
Store `salt || H(password, salt, iterations)` (never plain `H(password)` — see §7).

### Data Integrity
```
$ sha256sum firmware-v2.1.img
3f84cd3a1d6... e9b2  firmware-v2.1.img
Compare against vendor-published digest to detect tampered downloads.
```

### Digital Signatures (the real reason hashes matter)
Sign the *hash*, not the whole document — signatures work on fixed-size digests (§8).

### Blockchain
Each block stores `H(previous_block)`. Any modification to any block changes every subsequent hash, making history tamper-evident:

```
Block 1: H(prev=0, txns) ──► Block 2: H(prev=h1, txns) ──► Block 3: H(prev=h2, txns)
```

### Merkle Trees / Commitments
Hash a structure of sub-hashes so any single leaf change is detectable with minimal data.

## 6.7 Worked SHA-256 Concept

SHA-256 processes 512-bit message blocks through 64 rounds of message expansion + compression, mixing in constants derived from the cube roots of the first 64 primes. The result is the state's final 256-bit value.

```
Step 1: Message "abc" (ASCII 0x61 62 63) -> pad to 512 bits:
  0x61 0x62 0x63 0x80 0x00 ... (488 zero bytes) ... 0x0000000000000018
  (appends 0x80, zeros, then the 64-bit original length = 24 bits)

Step 2: Run the compression function 64 times (add/add/add/rotate/shift/XOR).

Output (the well-known value):
  SHA256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
```

The same pipeline gives different but *deterministic* 256-bit outputs for any input — this is the property all applications in §6.6 rely on.

---

# 7. Password Security

## 7.1 The Problem

Users pick weak, reused passwords. Even strong ones must be stored so that a database breach doesn't hand attackers the plaintext. Storing plaintext (or a single unsalted hash) is catastrophic.

```
Breed breach (2017): 617 million records; many passwords unsalted-hashed
with SHA-1 -> trivially cracked en masse.
```

## 7.2 Salt + Iterations — The Foundation

**Salt:** a random value unique per user, stored next to the hash.

```
hash = KDF(salt || password, iterations)
```

Why salt:

1. **Defeats rainbow tables** — precomputed lookup tables work on unsalted hashes only.
2. **Defeats identical-password correlation** — two users with the same password now have different hashes.
3. **Slows targeted cracking** — each hash needs its own salt.

**Iterations/work factor:** makes each hash computation expensive, so brute-forcing a million passwords costs a million × work-factor time.

```
Without salt/iterations:  H("password123") -> same hash for everyone, instant lookup
With salt + 600k iters:   each guess costs a CPU-expensive KDF invocation
```

## 7.3 The KDF Family

| KDF | Construction | Memory-hard? | Tuning | Status |
|-----|--------------|--------------|--------|--------|
| **PBKDF2** | HMAC iterated N times | No (CPU-only) | iterations | Legacy-ok, GPU-crackable at high speed |
| **bcrypt** | Blowfish-based | Slightly (4KB) | cost factor 2^n | Good, older; GPU-resistant-ish |
| **scrypt** | PBKDF2 + large memory block | Yes | N, r, p | Good; memory parameter resistant to ASICs |
| **Argon2id** | PHC winner (2015) | Yes (tunable) | m, t, p | **Modern default** |

### Argon2 (recommended)

- **Argon2id** (hybrid of Argon2i + Argon2d) is the default choice.
- Memory-hard: an attacker must commit gigabytes of RAM *per candidate password*, which does not parallelize well on GPUs.

### Recommended Parameters (as of the mid-2020s)

| KDF | Example params |
|-----|----------------|
| PBKDF2-HMAC-SHA256 | 600,000+ iterations |
| bcrypt | cost 10–13 (≥2^12 preferred) |
| scrypt | N=2^17, r=8, p=1 |
| Argon2id | m=64 MiB, t=3, p=1 |

> If you can't choose, **use a password hashing library** (`cryptography`/`passlib` in Python, `argon2` crate, Spring's `PasswordEncoder`). Never write your own.

## 7.4 How Attackers Crack Hashes

```
1. Wordlist attack     — try every word from rockyou.txt / SecLists
2. Rule-based / mangling — append digits, leet substitutions ("password1!", "P@ssw0rd")
3. Mask attacks        — "9?d?d?d?d" brute-force all 9xxxxx PINs
4. Rainbow tables      — precomputed hash->password tables (defeated by salt)
5. GPU/hardware        — billions of SHA-1/sec, millions of bcrypt/sec; cheap cloud GPUs
6. Online services     — hash databases (crackstation.net etc.)
```

### Mock hashcat Session

```
$ echo -n 'MalloryLikesH4shing!' | sha256sum
2c9f6c81e73f91e45d9b4ecde1c2d0d9e47ad54f1d26d0d38c27dd6a1bd9d8ab  -

$ hashcat -m 1400 -a 0 2c9f6c81e73f91e45d9b4ecde1c2d0d9e47ad54f1d26d0d38c27dd6a1bd9d8ab rockyou.txt
...
Session..........: hashcat
Status...........: Cracked
Hash.Target......: 2c9f6c81e73f91e45d9b4ecde1c2d0d9e47ad54f1d26d0d38c27dd6a1bd9d8ab
Time.Started.....: ...
Speed.Dev.#1.....:  912.3 MH/s
Recovered........: 1/1 (100.00%) Digests
Recovered.Plain..: MalloryLikesH4shing!        (found in wordlist)
```

Modes of interest:

| hashcat mode | Hash | Notes |
|--------------|------|-------|
| 0 | MD5 | trivially fast |
| 1400 | SHA-256 | fast — never use bare SHA-256 for passwords |
| 3200 | bcrypt | slow — good |
| 10900 | PBKDF2-HMAC-SHA256 | use high iterations |
| 25600 | Argon2id | slowest/most expensive for attacker — good |

## 7.5 Storage Format Conventions

Common formats embed algorithm, parameters, salt, and hash in one string:

```
$argon2id$v=19$m=65536,t=3,p=1$c29tZXNhbHQ=$ZHFzaG9mcm9v...
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy     (bcrypt)
sha256$100000$yF7d3j9x...$k8sY0e9Vx...                          (PBKDF2 variants)
```

Self-describing formats let you **upgrade parameters** later without breaking existing users.

## 7.6 Practical Guidance

- Use **Argon2id** where available; fall back to scrypt → bcrypt → PBKDF2 (in that order).
- **Never** use raw MD5/SHA-1/SHA-256 for passwords; **never** reuse password hashes as verification without work factor.
- Enforce a *minimum* length and use a password manager; complex rules often backfire.
- Add **rate limiting**, **account lockout with backoff**, and **breach-password blacklists** (HIBP) to slow online guessing.
- Store the **username, salt, and KDF params** together; keep the whole database encrypted at rest too.

---

# 8. Digital Signatures

## 8.1 What a Signature Provides

A digital signature is the electronic analog of a handwritten signature — plus mathematical proof:

- **Authenticity** — the message genuinely came from the claimed signer.
- **Integrity** — the message wasn't altered after signing.
- **Non-repudiation** — the signer cannot deny signing (only they hold the private key).

```
Signer (Alice)                                   Verifier (anyone)
  hash = H(message)                                 hash = H(message)
  sig  = Sign_priv(hash)                            valid = Verify_pub(hash, sig)
  send (message, sig) ────────────────────────────►  if valid -> authentic & intact
```

Because we sign the **hash**, signatures are small and constant-size regardless of document length.

## 8.2 RSA Signatures

- Sign: `sig = H(message)^d mod n` (private key).
- Verify: `H'(message) = sig^e mod n` (public key); compare to locally computed hash.

Requires **PSS padding** in practice; raw "textbook RSA" signatures are forgeable/malleable.

```
$ openssl dgst -sha256 -sign alice_priv.pem -out doc.sig doc.txt
$ openssl dgst -sha256 -verify alice_pub.pem -signature doc.sig doc.txt
Verified OK
```

## 8.3 ECDSA (Elliptic Curve Digital Signature Algorithm)

- Key: curve point `Q = k·P` (private scalar `k`, public point `Q`).
- Each signature uses a fresh random nonce `r`; **nonce reuse leaks the private key** (famously broke Sony's PS3 signing in 2010).
- Signature is a pair `(r, s)`.
- Deterministic variants (RFC 6979) derive the nonce from key+message, eliminating reuse bugs.

## 8.4 MAC vs Signature — Know the Difference

| | MAC (e.g., HMAC) | Digital Signature |
|---|---|---|
| Key type | Single shared **symmetric** key | **Asymmetric** keypair |
| Who can verify | Anyone holding the shared key | Anyone with the public key |
| Provides non-repudiation | No — both parties share the key | Yes — only signer holds private key |
| Use case | Data integrity between parties who already share a secret | Proof of origin to the world, contracts, TLS auth |
| Example | `HMAC-SHA256(key, data)` | `RSASSA-PSS`, `Ed25519` |

## 8.5 Sign/Verify Workflow Example (Mock)

```
Documents:  order.txt  = "SELL 100 UNITS OF ACME AT $45.00"

Alice (signer):
  1. hash = SHA256(order.txt) = e3b0c44298fc1c149afbf4c8996fb924...
  2. sig  = RSASSA-PSS_Sign(hash, alice_private_key)
           = 9F 2C A1 4D 0B ... 87 (256 bytes for RSA-2048)
  3. ships: order.txt + sig + her certificate

Bob (verifier):
  1. Gets Alice's public key from her cert (or trust store)
  2. hash' = SHA256(order.txt)  (recompute over received file)
  3. valid = RSASSA-PSS_Verify(hash', sig, alice_public_key)
  4. If valid -> the order really is Alice's and unmodified.
  5. If Bob later forwards this to a court, the signature still proves
     Alice signed it (non-repudiation) — Bob can't forge a second one
     for a different amount.
```

### Why Non-Repudiation Holds

```
To forge "SELL 100 ... AT $46.00" you would need Alice's private key.
Nobody else can produce a valid signature for that message, ever.
```

## 8.6 Ed25519 — The Modern Default

- EdDSA over Curve25519: fast, deterministic, no nonce-reuse hazard, small signatures (64 bytes), constant-time-friendly.
- Used by SSH keys, age, WireGuard, and modern signing tools. Prefer it over ECDSA/RSA for new work unless interop requires otherwise.

---

# 9. Public Key Infrastructure (PKI)

## 9.1 Why We Need It

Public keys alone don't tell you **whose** key it is. PKI binds a public key to an identity via **certificates** issued by trusted **Certificate Authorities (CAs)**.

```
Trust anchor (root CA) ── signs ──► intermediate CA ── signs ──► leaf cert ("api.acme.com")
```

## 9.2 X.509 Certificates — Structure

An X.509 certificate (the standard for TLS) contains, in simplified form:

| Field | Mock Value |
|-------|-----------|
| **Version** | V3 |
| **Serial number** | `7C:3A:...:09` (unique, CA-assigned) |
| **Signature algorithm** | `SHA256withRSA` |
| **Issuer** | `CN=Acme Root CA, O=Acme Corp, C=US` |
| **Validity** | `Not Before: 2026-01-01 00:00:00 UTC` / `Not After: 2027-01-01 23:59:59 UTC` |
| **Subject** | `CN=api.acme.com, O=Acme Corp, C=US` |
| **Subject Public Key Info** | `RSA Public Key (2048 bit)` |
| **Extensions** | KeyUsage, ExtendedKeyUsage (serverAuth), SAN (`api.acme.com`), BasicConstraints |
| **Signature** | CA's signature over all the above (verified with CA's public key) |

### Subject Alternative Names (SANs)

Modern browsers **ignore the old CommonName (CN)** for hostname matching and use only **SAN** entries. A cert with `CN=api.acme.com` but no matching SAN will fail in every modern browser.

```
$ openssl x509 -in cert.pem -noout -text
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            5e:2a:7c:90:...:09
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: CN = Acme Root CA, O = Acme Corp, C = US
        Validity
            Not Before: Jan  1 00:00:00 2026 GMT
            Not After : Jan  1 23:59:59 2027 GMT
        Subject: CN = api.acme.com, O = Acme Corp, C = US
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:api.acme.com, DNS:api.acme.eu
```

## 9.3 Chain of Trust & Verification

```
Browser trust store contains root CA certs (preinstalled by OS/vendor).

Verify leaf ("api.acme.com"):
  1. Get leaf cert from server during TLS handshake.
  2. Check validity dates are current.
  3. Check the hostname matches a SAN entry.
  4. Find the issuing CA: leaf was signed by intermediate CA.
  5. Verify leaf's signature using intermediate's public key.
  6. Intermediate is itself signed by the root CA in the trust store.
  7. Verify intermediate's signature using root's public key.
  8. Root is self-signed and trusted by configuration.
  All checks pass -> connection proceeds.
```

## 9.4 CRL and OCSP — Revocation

Keys/certs don't always stay trustworthy (private key leaked, CA compromise, domain ownership change). Revocation mechanisms:

- **CRL (Certificate Revocation List):** periodically downloaded list of revoked serial numbers. Timely but laggy.
- **OCSP (Online Certificate Status Protocol):** real-time query `is this cert revoked?`. Lower latency.
- **OCSP Stapling:** server fetches a signed OCSP response *once* and "staples" it into the TLS handshake, offloading queries.
- **Best practice now:** short-lived certificates (Let's Encrypt's 90 days) reduce reliance on revocation.

## 9.5 Self-Signed Certificates

```
$ openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
```

- Self-signed = cert signs itself. No chain to a trusted root.
- Browsers reject them by default (unless the user explicitly adds the cert to their trust store).
- **Legit uses:** internal test environments, device identity, code signing labs. Never in production for user-facing TLS.

## 9.6 Browser Verification — Worked Walkthrough

Scenario: `https://login.acme.com` cert chain: leaf ← Acme Intermediate ← Acme Root.

```
Browser action:
  ✓ leaf validity:  2026-01-01 .. 2027-01-01  -> OK (today 2026-08-06)
  ✓ hostname:       SAN contains "login.acme.com"  -> matches URL
  ✓ chain:          leaf sig by intermediate OK; intermediate sig by root OK
  ✓ root:           "Acme Root" present in browser's trust store
  ✓ revocation:     OCSP check returns "good"
  Result: green padlock. TLS session established.
```

If any step fails, the browser blocks the connection with a warning (§10.4).

---

# 10. TLS in Practice

## 10.1 TLS Overview

TLS (Transport Layer Security) provides encrypted, authenticated, integrity-checked transport over TCP. TLS 1.2 is legacy; **TLS 1.3 (RFC 8446)** is the modern standard.

Handshake goals: agree on a session key with **(EC)DHE** (forward secrecy), authenticate the server (and optionally the client) via certificates, derive separate keys for each direction via **HKDF**, and then encrypt all records.

## 10.2 TLS 1.3 Handshake (Full)

```
Client                                          Server
  │  1. ClientHello: supported ciphers, keyshares,       │
  │     random_nonce_c ────────────────────────────────►  │
  │                                                      │ 2. ServerHello: chosen
  │                                                      │    cipher, keyshare
  │  ◄──────── 3. EncryptedExtensions (SNI, ALPN) ─────  │
  │  ◄──────── 4. Certificate (chain) ──────────────────  │
  │  ◄──────── 5. CertificateVerify (signature proof) ──  │
  │  ◄──────── 6. Finished (MAC over handshake) ────────  │
  │                                                      │
  │  7. Both compute shared secret via ECDHE, then       │
  │     HKDF-expand to: client_key, server_key, IVs      │
  │  8. Client sends Finished ────────────────────────►  │
  │  ◄── 9. Application data (AES-128-GCM / ChaCha20) ──►│
```

Notes:

- **1-RTT** for a fresh connection; **0-RTT** resumption for repeat visitors (with replay caveats).
- All handshake messages after ServerHello are encrypted (privacy for SNI/cert details — with ECH, even SNI).
- No more CBC suites, no RC4, no 3DES, no compression — TLS 1.3 removed the entire legacy zoo.

## 10.3 Reading a Cipher Suite

A cipher suite encodes 4 (TLS 1.2) or 2–3 (TLS 1.3) pieces of information:

```
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384     (TLS 1.2)
│    │     │         │           └── PRF/HMAC hash: SHA-384
│    │     │         └────────────── bulk cipher: AES-256 in GCM mode
│    │     └──────────────────────── cert key type: RSA
│    └────────────────────────────── key exchange: ECDHE (ephemeral ECDH)
└──────────────────────────────────── protocol prefix
```

TLS 1.3 suites are simpler (they fix the suite shape):

```
TLS_AES_256_GCM_SHA384
TLS_CHACHA20_POLY1305_SHA256
TLS_AES_128_GCM_SHA256
```

`TLS_CHACHA20_POLY1305_SHA256` is the fallback for CPUs without AES-NI (mobile/embedded), since software ChaCha20 beats software AES.

## 10.4 Certificate Validation Errors — Mock `openssl s_client` Output

### Self-Signed Certificate

```
$ openssl s_client -connect localhost:8443
CONNECTED(00000003)
depth=0 CN = localhost
verify error:num=19:self signed certificate in certificate chain
verify return:1
...
Verification: FAILED  (code=19)  [self signed certificate]
```

Browser: "Your connection is not private — NET::ERR_CERT_AUTHORITY_INVALID".

### Expired Certificate

```
$ openssl s_client -connect api.acme.com:443
verify error:num=10:certificate has expired
Verification: FAILED  (code=10)
```

Browser: "NET::ERR_CERT_DATE_INVALID". Common after failed auto-renewal (cron misconfig, firewall blocking the ACME endpoint).

### Hostname Mismatch

```
$ openssl s_client -connect web.acme.com:443
...
Verification: FAILED  (code=18)  [self signed certificate in certificate chain]
# note: hostname check often surfaces as code 18/51/62 depending on tooling
```

Browser: "NET::ERR_CERT_COMMON_NAME_INVALID" or "ERR_SSL_MISMATCHED_SERVER_IDENTITY" when the cert's SAN has no `web.acme.com`.

## 10.5 Common Misconfigurations

| Misconfiguration | Symptom | Fix |
|------------------|---------|-----|
| Old protocol versions (TLS 1.0/1.1) | Weak ciphers, BEAST/POODLE-era attacks | Enable TLS 1.2/1.3 only |
| Weak cipher suites | RC4, CBC+HMAC, export ciphers offered | Use AEAD suites; test with ssllabs.com |
| Wrong SAN / CN | Hostname mismatch errors | Generate cert with correct SANs |
| Self-signed in production | Browsers block users | Get a public CA cert (Let's Encrypt) |
| Expired certs (no automation) | Outage + trust errors | Automate renewal (ACME/certbot) |
| Missing chain (no intermediate) | "incomplete chain" errors on some clients | Send full chain in handshake |
| HTTP only for sensitive paths | Plaintext credentials | HSTS + full-site TLS |
| Static/weak DH params | TLS 1.2 DHE with small p (Logjam) | Prefer ECDHE; ≥2048-bit safe primes |
| Broken SNI handling | Multi-domain errors | Configure SNI correctly |

Quick public check: `curl -sv https://example.com` and https://www.ssllabs.com/ssltest/.

---

# 11. Crypto Attacks

## 11.1 Brute Force

Try every possible key.

```
AES-128: 2^128 keys. At 10^12 keys/sec, ~10^26 years. Infeasible. ✓
DES-56:  2^56 keys. At 10^9 keys/sec, ~2 years of specialized hardware — done in 1998.
```

- Time = key space / speed. Modern defense = big enough key space (AES-256) + rate limiting + locked/derived keys.

## 11.2 Known-Plaintext (KPA)

Attacker has ciphertext **and** the matching plaintext for some messages (e.g., the first bytes of a known file format — `JFIF` JPEG header, HTTP `GET /`). Uses the pair to:

- Recover the key (if the cipher is weak — classical ciphers; modern ciphers resist KPA).
- In keystream reuse scenarios, XOR out the known plaintext to recover the keystream and decrypt other traffic.

## 11.3 Chosen-Plaintext (CPA)

Attacker can submit plaintext and observe ciphertext (e.g., an encryption oracle). Modern security definitions demand **indistinguishability under CPA** — even if the attacker chooses "MESSAGE A" vs "MESSAGE B", they can't tell which was encrypted (randomized IVs/nonces guarantee this).

## 11.4 Padding Oracle — Worked Example

Classic against CBC-with-PKCS#7 when the app leaks whether padding is valid (a "padding oracle").

```
Setup: Server decrypts CBC and returns:
         - "200 OK" if padding is valid
         - "500 Error" if padding is invalid

Attack on the last block, byte by byte (from the end):
1. Want to decrypt byte 16 of block n without the key.
2. Modify C[n]'s last byte, send. If padding became valid (0x01),
   then P[n]^modified_C = 0x01, so  P[n] = modified_C ^ 0x01.
3. Repeat for byte 15 (pad target 0x02), and so on across all blocks.
4. Recover all plaintext — with the oracle, no key needed.
```

Guards:

- **Authenticate before decrypting** (GCM decrypt+verify, or HMAC-then-decrypt) — the tag fails first, no padding oracle.
- Never expose whether padding was the failure reason; use constant-time error handling.
- This attack directly broke ASP.NET (2010) and many Java/Node TLS stacks over the years.

## 11.5 Length Extension

See §6.5. `H(secret || message)` MACs are forgeable. Fix: HMAC, or SHA-3, or key-after-data.

## 11.6 Side-Channel Attacks

Attacks exploiting *physical* leaks rather than math:

| Channel | Leak | Mitigation |
|---------|------|-----------|
| **Timing** | How long decryption takes reveals key bits (e.g., variable-time modular exponentiation) | Constant-time code, blinding, `OPENSSL_CONSTANT_TIME` |
| **Power** | Power trace during AES S-box lookups reveals key | Masking, DPA-resistant S-boxes, AES-NI |
| **Electromagnetic** | EM emissions from the CPU | Faraday shielding, masking |
| **Cache** | Which cache lines were touched reveals key-dependent lookups | Hardware AES, table-less S-boxes (bitslicing) |
| **Acoustic** | Microphone picks up keypress/fan noise | Not usually a remote threat; local only |
| **Thermal/voltage** | Fault injection (glitch) flips bits | Error detection, redundancy |

**Spectre/Meltdown (2018)** are extreme examples: speculative execution leaked memory via timing side channels, exposing keys from other processes. Lesson: side channels are real, local and remote.

## 11.7 MITM on Key Exchange

Unauthenticated Diffie-Hellman is vulnerable to the classic man-in-the-middle:

```
Alice ──► Mallory ◄── Bob
Alice ↔ Mallory do DH (share K_AM); Bob ↔ Mallory do DH (share K_MB)
Mallory relays, decrypts/reads/rewrites everything. Neither victim knows.
```

Defense: **authenticated** key exchange — DH key shares signed with certificates (as in TLS 1.3's CertificateVerify), or pre-shared authentication.

## 11.8 Quantum Threat Overview

| Algorithm | Quantum attack | Implication |
|-----------|----------------|-------------|
| **Shor's algorithm** | Polynomial-time factoring and discrete log | Breaks RSA, DSA, ECDSA, DH, ECDH |
| **Grover's algorithm** | Quadratic speedup of brute force | AES-128 → ~2^64; AES-256 → ~2^128 (still safe); SHA-256 → ~2^128 (still safe) |

Pragmatic view:

- A large-scale fault-tolerant quantum computer isn't available yet, but **"harvest now, decrypt later"** means data with long-term secrecy requirements should already move to post-quantum algorithms.
- NIST standardized (2024): **ML-KEM** (Kyber) for key encapsulation, **ML-DSA** (Dilithium) and **SLH-DSA** (SPHINCS+) for signatures.
- Hybrid mode in TLS (X25519 + ML-KEM) gives forward-compatibility without abandoning existing trust.

---

# 12. Cryptographic Randomness

## 12.1 PRNG vs CSPRNG

| | PRNG (e.g., Mersenne Twister, `rand()`) | CSPRNG (e.g., `/dev/urandom`, `os.urandom`, `secrets`) |
|---|---|---|
| Purpose | Simulations, games, sampling | Keys, IVs, nonces, salts, tokens |
| Predictable from state? | Yes — Mersenne Twister state recoverable | No — next output infeasible to predict |
| Backtracking resistance? | No | Yes (state compromise doesn't leak past outputs) |
| Example | `random.random()` | `secrets.token_bytes(32)` |

> **Hard rule:** never generate keys, IVs, or nonces with a non-cryptographic PRNG. `random.randbytes` is a bug; `os.urandom`/`secrets` is correct.

## 12.2 Why Entropy Matters

Entropy = uncertainty of the randomness source. A 128-bit key is only 128-bit *strong* if the source has ≥128 bits of real entropy.

```
Bad:   seed = str(time.time())            -> ~30 bits of entropy, guessable window
Good:  seed = os.urandom(32)              -> ~256 bits from OS CSPRNG
```

When entropy is low, keys collapse into a small set of possibilities — `openssl` historically used `RAND_add` heuristics; embedded devices with no entropy sources have shipped predictably seeded keys.

## 12.3 /dev/urandom vs /dev/random (Linux)

- `/dev/urandom` — CSPRNG seeded from kernel entropy pool; **never blocks**, suitable for virtually everything including key generation.
- `/dev/random` — historically blocked when entropy estimate was low; the modern Linux `getrandom()` syscall mixes sources and blocks only at very early boot.
- **Practical guidance:** use the OS CSPRNG (`getrandom(2)`, `RAND_bytes`, `os.urandom`). Do not hand-roll or "improve" it.

## 12.4 Weak Randomness — Real Cases

| Incident | What went wrong |
|----------|-----------------|
| **Debian OpenSSL bug (2008)** | Commented-out entropy seeding left PRNG seeded only by PID → all keys effectively one of ~32767 values; many SSH keys and certs recovered from public scans. |
| **Android Java SecureRandom (2013)** | Early Android had predictable `SecureRandom` seeding → Bitcoin wallets on Android generated predictable private keys; a scanner drained funds. |
| **Sony PS3 (2010)** | ECDSA nonce reuse → private key recovered from two signatures. |
| **YubiKey clone (2019)** | Predictable random numbers from a specific Infineon RNG used in some hardware keys → ECC keys recovered. |

**Moral:** entropy failures are silent until catastrophic. Use OS CSPRNGs, test randomness, and never let any component invent its own RNG.

---

# 13. Practical Crypto Tools

All examples use mock data and command-line tooling available on Linux/macOS (with Windows equivalents noted).

## 13.1 OpenSSL — Swiss Army Knife

### Symmetric Encrypt (AES-256-CBC with PBKDF2-derived key)

```
$ openssl enc -aes-256-cbc -pbkdf2 -iter 600000 -salt -in secret.txt -out secret.enc
enter aes-256-cbc encryption password: ********
```

Decrypt:

```
$ openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -in secret.enc -out secret.txt
```

### Generate Keypair + Self-Signed Cert

```
$ openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 90 \
    -nodes -subj "/CN=dev.acme.com"
Generating a RSA private key
....+++++
writing new private key to 'key.pem'
```

### View a Certificate

```
$ openssl x509 -in cert.pem -noout -text
```

### Sign and Verify a File

```
$ openssl dgst -sha256 -sign key.pem -out doc.sig doc.txt
$ openssl dgst -sha256 -verify <(openssl x509 -in cert.pem -pubkey -noout) \
    -signature doc.sig doc.txt
Verified OK
```

### Inspect a TLS Connection

```
$ openssl s_client -connect api.acme.com:443 -servername api.acme.com
CONNECTED(00000003)
...
Cipher    : TLS_AES_256_GCM_SHA384
...
Verify return code: 0 (ok)
```

### Encrypt a File with a Public Key (hybrid, `pkeyutl`)

```
$ openssl pkeyutl -encrypt -pubin -inkey pub.pem -in plain.bin -out wrapped.bin
$ openssl pkeyutl -decrypt -inkey key.pem -in wrapped.bin -out plain.bin
```

## 13.2 GPG — GNU Privacy Guard

```
$ gpg --full-generate-key            # Ed25519 / RSA-4096
$ gpg --encrypt --recipient alice@example.com report.pdf
$ gpg --decrypt report.pdf.gpg
$ gpg --sign report.pdf              # detached: gpg --detach-sign
$ gpg --verify report.pdf.sig report.pdf
```

## 13.3 ssh-keygen

```
$ ssh-keygen -t ed25519 -C "jose@work-laptop"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/jose/.ssh/id_ed25519):
Your identification has been saved in /home/jose/.ssh/id_ed25519
Your public key has been saved in /home/jose/.ssh/id_ed25519.pub
```

Modern default: **Ed25519** (fast, small, robust). Avoid deprecated DSA; RSA-3072/4096 still fine for interop.

## 13.4 Hashing

```
$ echo -n "hello" | sha256sum
2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824  -
$ sha1sum firmware.img          # avoid for security
$ md5sum file.iso               # checksum only, not security
$ shasum -a 512 file.iso
```

## 13.5 Encrypted Disks — LUKS (Linux)

```
# Create an encrypted container
$ sudo cryptsetup luksFormat /dev/sdc1
WARNING: ... data on /dev/sdc1 will be irrevocably destroyed.
Are you sure? (Type uppercase yes): YES
Enter passphrase: ********

# Open it
$ sudo cryptsetup open /dev/sdc1 mydisk
$ sudo mkfs.ext4 /dev/mapper/mydisk
$ sudo mount /dev/mapper/mydisk /mnt/secure

# Windows equivalent: BitLocker; macOS: FileVault; portable: VeraCrypt
```

## 13.6 Quick Tool Selection

| Task | Tool |
|------|------|
| Encrypt files/symmetry | `openssl enc -aes-256-gcm`, age |
| Key exchange for TLS | TLS 1.3 (ECDHE + ML-KEM hybrid) |
| Sign/verify | `openssl dgst`, GPG, age |
| SSH auth | `ssh-keygen -t ed25519` |
| Password hashing | Argon2id (library) |
| Full-disk encryption | LUKS / BitLocker / FileVault |
| Code signing | `osslsigncode` / `codesign` |

---

# 14. Crypto Policy & Compliance

## 14.1 Key Management Lifecycle

```
┌────────┐   ┌─────────┐   ┌────────┐   ┌─────────┐   ┌────────┐   ┌──────────┐
│Generate│──▶│Distribute│──▶│  Use   │──▶│  Rotate │──▶│ Archive│──▶│  Destroy │
└────────┘   └─────────┘   └────────┘   └─────────┘   └────────┘   └──────────┘
```

| Phase | Requirements |
|-------|--------------|
| **Generate** | From a CSPRNG; never derive two keys from one weak secret |
| **Distribute** | Only via authenticated channels; never email/chat; hardware HSM for high-value keys |
| **Use** | Minimum necessary; no logging of keys; keys never in source control |
| **Rotate** | Scheduled (per policy) and event-driven (suspect compromise) |
| **Archive** | For decryption of old data only; access-controlled; separate from operational keys |
| **Destroy** | Cryptographic erasure (delete key ⇒ data effectively gone); physical destruction for HSMs |

## 14.2 Key Rotation

- Why: limit the blast radius of compromise, satisfy compliance, retire algorithms.
- **Never decrypt-and-reencrypt by reusing the old key**; use key wrapping / envelope encryption:

```
Data-key DK (per file) encrypted with master key MK.
Rotation: re-wrap DK under new MK' — no bulk re-encryption of data needed.
```

- Rotation cadence depends on risk: TLS certs 90 days (Let's Encrypt), payment keys ≤ annually (PCI), KMS keys per organization policy.

## 14.3 Algorithm Deprecation Policy

Standard lifecycle: **approved → deprecated → disallowed**.

| Timeline element | Example |
|------------------|---------|
| Monitor NIST / academic announcements | SHA-1 collisions 2017, 3DES disallowed 2023 |
| Set deprecation date with headroom | "SHA-1 allowed for verification only until 2027" |
| Inventory usage | Code scans, cert scans, `cipher scan` |
| Migrate before disallow date | Replace with SHA-256/384 or SHA3 |
| Enforce | CI gates rejecting deprecated algorithms |

**NIST SP 800-131A** (transitioning to newer crypto) and **CNSA 2.0** (2022–2025 timeline) are useful baselines, including migration to post-quantum algorithms.

## 14.4 FIPS 140 (FIPS 140-2 → 140-3)

- US federal standard for *cryptographic modules* (the software/hardware implementing crypto).
- Security levels 1–4 (physical protection, tamper evidence/resistance, etc.).
- If your org sells to US government: modules must be FIPS 140-3 validated (or FIPS 140-2 validated until transition completes).
- Note: FIPS 140 validates a *module*, not your application. NIST-approved algorithms + validated module + correct usage = compliant.

## 14.5 Export Controls (Wassenaar / US EAR)

- Historically, cryptography was treated as munitions (crypto export controls); modern regimes classify most commercial crypto under **dual-use** rules.
- Key factors: key length (e.g., >56-bit symmetric is generally unrestricted for mass-market software), purpose, end-user, destination (sanctions lists).
- Practical takeaway: consult legal for export of security products; open-source libraries are generally broadly exportable today, but don't assume.

## 14.6 Standards to Know

| Standard/Reg | Focus |
|--------------|-------|
| FIPS 197 | AES |
| FIPS 180-4 | SHA-2 |
| FIPS 202 | SHA-3 |
| SP 800-38A/D/G | Block cipher modes, CTR, GCM |
| SP 800-131A / 800-57 | Transitions, key management |
| RFC 8446 | TLS 1.3 |
| PCI-DSS | Encryption of cardholder data, key management |
| GDPR | Encryption as a safeguard for personal data (at rest/in transit) |
| SOC 2 | Encryption controls for availability/integrity |

---

# 15. Common Crypto Mistakes Checklist

*Top 15 developer mistakes — mark them off before shipping.*

1. **Rolling your own crypto.** Even "simple" designs are complex. Use vetted libraries (`cryptography`, OpenSSL, libsodium).
2. **Using ECB mode** for real data — leaks structure. Use GCM.
3. **Reusing IVs/nonces.** A reused nonce in GCM/CTR can destroy security (sometimes recover keys). Always fresh, random (or monotonic) nonces per message+key.
4. **Storing passwords with raw hashes** (MD5/SHA-256) — no salt, no work factor. Use Argon2id/scrypt/bcrypt/PBKDF2.
5. **Using weak/old algorithms** (MD5, SHA-1, DES/3DES, RC4, TLS 1.0/1.1). Audit and migrate.
6. **Not authenticating encryption.** AES-CBC without a MAC lets attackers flip bits (padding oracle, bit-flipping). Use AEAD (AES-GCM, ChaCha20-Poly1305).
7. **Keys in source control / logs / configs.** Never commit secrets; use secret managers and HSMs/KMS.
8. **Insufficient key sizes.** RSA-1024/DH-1024 are deprecated; use RSA-3072 or ECC-256+, AES-256.
9. **Using a non-crypto RNG for keys.** `Math.random()`/`rand()` for keys/IVs/salts is a critical vulnerability.
10. **Handling padding/errors inconsistently** — leaking "invalid padding" vs "valid padding" enables padding-oracle attacks. Respond uniformly.
11. **Ignoring side channels** — non-constant-time comparison of MACs/tokens (`strcmp` vs `hmac.compare_digest`).
12. **Improper TLS configuration** — old versions, weak suites, self-signed in prod, missing chain, missing HSTS.
13. **Key rotation/revocation ignored** — no automation, no revocation checks, no rotation policy. Certificates expire.
14. **Hardcoded keys/passphrases** with "it's obfuscated" reasoning (security through obscurity).
15. **No threat model / no post-quantum planning** for long-lived data — if data must stay secret 10+ years, plan for harvest-now-decrypt-later and key management today.

---

## Appendix A — Quick Reference Cheat Sheet

| Need | Use | Avoid |
|------|-----|-------|
| Bulk encryption | AES-256-GCM, ChaCha20-Poly1305 | ECB, RC4, DES |
| Key exchange | ECDHE (TLS 1.3), X25519, ML-KEM hybrid | Static RSA key transport |
| Signatures | Ed25519, ECDSA P-256, RSA-PSS | Raw RSA, DSA |
| Hashing (integrity) | SHA-256/384, SHA3-256 | MD5, SHA-1 |
| Hashing (passwords) | Argon2id | SHA-256, MD5 |
| MAC | HMAC-SHA256, AEAD tag | `H(secret\|\|msg)` |
| Randomness | `os.urandom`/`getrandom`/`secrets` | `random`, `Math.random`, `time` |
| Certs | X.509 v3 with SANs, public CA | Self-signed in prod |
| Transport | TLS 1.3 | SSL, TLS 1.0/1.1 |

## Appendix B — Further Reading

- NIST SP 800-57 (Key Management), SP 800-131A (Transitions), FIPS 197/202
- RFC 8446 (TLS 1.3), RFC 8017 (RSA-OAEP/PSS)
- Dan Boneh & Victor Shoup, *A Graduate Course in Applied Cryptography* (free online)
- Practical Cryptography for Developers (CryptoBook / libsodium docs)
- *Serious Cryptography* — Jean-Philippe Aumasson
- OWASP Password Storage Cheat Sheet & TLS Cheat Sheet

---

*End of CRYPTOGRAPHY_MASTER.md — a teaching reference. All keys, hashes, certificates, and outputs are fictional mock data.*
