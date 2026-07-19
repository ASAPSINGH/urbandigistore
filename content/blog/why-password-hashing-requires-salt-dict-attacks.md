title: Why Password Hashing Requires Salt: Preventing Precomputed Dictionary Attacks
description: Learn how password salting works and why appending random seeds before hashing prevents precomputed dictionary and rainbow table attacks.
date: 2026-07-19
category: Developer
author: Urbandigistore Security
---

# Why Password Hashing Requires Salt: Stopping Dict Attacks

When storing user credentials in a database, security best practices dictate that passwords should never be stored in plain text. Instead, they are passed through a cryptographic hash function (like bcrypt, Argon2, or SHA-256) to generate a fixed-size signature. However, if you hash passwords directly without adding a **Salt**, the database remains vulnerable to **precomputed dictionary attacks**.

In this guide, we'll explain dictionary attacks, trace the salting mechanism, and outline entropy rules.

---

## ⚙️ The Threat of Precomputed Dictionary Attacks

Hash functions are **deterministic**—the same input password will always produce the exact same output hash. If two users choose the same password (e.g., `123456`), their stored hashes in the database will be identical.

Attackers exploit this determinism using two primary methods:
1.  **Dictionary Attacks**: The attacker hashes a list of common words and phrases, comparing them against stolen database hashes.
2.  **Rainbow Tables**: Attackers pre-compute millions of password hashes in advance and store them in massive lookup tables. When a database is breached, the attacker simply runs a database lookup to reverse the hashes instantly.

---

## 📊 Password Length and Complexity Reference

Using strong, random salts is critical. To see how password length and search space sizes scale brute-force difficulty, refer to the logarithmic chart below:

![Password Complexity and Search Space](/static/images/entropy_length_exponential.png)

---

## 🛡️ How Salting Defeats Precomputation

A **salt** is a cryptographically random string appended to the user's password before the hashing function is applied:

$$\text{Stored Hash} = \text{Hash}(\text{Password} + \text{Salt})$$

By using a unique, random salt for every user:
*   **Unique Hashes**: If two users choose the same password, their unique salts ensure that their stored hashes are completely different.
*   **Renders Rainbow Tables Useless**: Because the salt is unique for every user account, attackers cannot pre-compute rainbow tables. They must brute-force each account's hash individually, increasing cracking costs.
*   (Read our [Password Hashing and Rainbow Table Salting Guide](/blog/why-password-hashing-requires-salt-rainbow-tables) to review database protections).
*   **Generate High-Entropy Keys**: Use our browser-only [Secure Password Generator](/password-generator) to create custom keys. Since all calculations execute in client-side memory, your keys are never sent to a database. (Read our [Privacy Policy](/privacy) for data safety guarantees).
