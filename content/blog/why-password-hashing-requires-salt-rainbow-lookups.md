title: Why Password Hashing Requires Salt: Preventing Precomputed Rainbow Table Lookups
description: Learn how password salts work and why appending unique random strings prevents precomputed rainbow table lookups from cracking databases.
date: 2026-07-19
category: Developer
author: Urbandigistore Security
---

# Why Hashing Requires Salt: Stopping Rainbow Lookups

Storing password hashes instead of plain text protects user credentials. However, plain hashes are still vulnerable to **precomputed lookup attacks**. If an attacker accesses a database containing plain SHA-256 or MD5 hashes, they don't need to guess the passwords. Instead, they can use precomputed databases—called **Rainbow Tables**—to reverse the hashes instantly. To prevent this, developers use unique **Password Salts**.

In this guide, we'll explain how rainbow table lookups work, trace the salting mechanism, and analyze security rules.

---

## ⚙️ How Precomputed Rainbow Table Lookups Work

Rainbow tables are optimized lookup databases that trade memory storage space for CPU processing time. 

1.  **The Precomputation**: Attackers run hash functions on billions of common passwords and character combinations in advance.
2.  **The Reduction Function**: To save disk space, tables use reduction functions to compress long chains of hashes into simple start-and-end value pairs.
3.  **Instant Reversing**: When a database is breached, the attacker looks up the stolen hashes in the rainbow table. If a match is found, the table reveals the corresponding plain-text password in seconds.

---

## 📊 Password Length and Complexity Reference

Using strong, random salts is critical. To see how password length and search space sizes scale brute-force difficulty, refer to the logarithmic chart below:

![Password Complexity and Search Space](/static/images/entropy_length_exponential.png)

---

## 🛡️ How Salting Prevents Precomputed Lookups

A **salt** is a cryptographically random string appended to the user's password before hashing:

$$\text{Stored Hash} = \text{Hash}(\text{Password} + \text{Salt})$$

By generating a unique, random salt for every user:
*   **Destroys Precomputations**: Even if two users share the same password, their unique salts ensure that their stored hashes are completely different.
*   **Requires Custom Cracking**: Because the salt is unique, attackers cannot use pre-existing rainbow tables to decrypt the hashes. They must compute a brand-new set of hashes for each individual salt, making bulk decryption computationally impractical.
*   (Read our [Password Hashing and Rainbow Table Salting Guide](/blog/why-password-hashing-requires-salt-rainbow-tables) to review database protections).
*   **Generate High-Entropy Keys**: Use our browser-only [Secure Password Generator](/password-generator) to create custom keys. Since all calculations execute in client-side memory, your keys are never sent to a database. (Read our [Privacy Policy](/privacy) for data safety guarantees).
