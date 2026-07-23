title: Why Password Hashing Requires Salt: Preventing Database Dictionary Attacks
description: Discover how password salts protect databases from precomputed dictionary and brute-force cracking attacks.
date: 2026-07-24
category: Developer
author: Urbandigistore Security
---

# Why Hashing Requires Salt: Preventing Dictionary Attacks

Securing user accounts requires state-of-the-art hashing algorithms and entropy measures. Here is how passwords are secured.

A **cryptographic password** is a secure key verified using hashing algorithms (like bcrypt) and unique random salt values. Checking password complexity entropy ensures the credentials resist modern high-speed brute-force attacks.

Simply hashing user passwords (using SHA-256 or MD5) before storing them in a database is no longer enough to protect them from breaches. Attackers use high-performance cracking rigs to run **Dictionary Attacks** against compromised databases. To stop these attacks, developers use unique **Password Salts**.

---

> **Product-Led CTA**: Never reuse passwords or store them in unsafe web browsers. Generate high-entropy, cryptographically secure keys instantly using our secure, client-side [Secure Password Generator](/password-generator).

## ⚙️ How Dictionary Attacks Work

A dictionary attack is a targeted brute-force method where attackers test a list of common words, phrases, and leaked passwords against a database of hashes:
*   **Plain Hashes**: If your database stores plain hashes, the attacker can compute the hash of every word in their dictionary once and compare it directly to your database. Any matches instantly reveal user passwords.
*   **Speed**: Attackers can compare billions of hashes per second using standard consumer GPUs.

---

## 📊 Password Security and Entropy Reference

To resist dictionary attacks, users must choose high-entropy passwords. Refer to the logarithmic curve below to see how character length affects complexity:

![Chart demonstrating cryptographic entropy growth curves by password length](/static/images/entropy_length_exponential.png)

---

## 🛡️ How Salts Defend Against Dictionary Attacks

A **salt** is a cryptographically secure random string appended to the password before hashing:
*   **Forces Individual Cracking**: Since the salt is unique for every user, the attacker cannot use pre-calculated hashes. They must calculate a custom hash chain for each individual user's salt, slowing their attack significantly.
*   Read [Why Password Hashing Requires Salt](/blog/why-password-hashing-requires-salt-rainbow-tables) and [Why Password Salts Must Be Cryptographically Random](/blog/why-password-salts-must-be-cryptographically-random) to learn more.
*   Generate high-entropy passwords locally in your browser with our client-side [Secure Password Generator](/password-generator).
