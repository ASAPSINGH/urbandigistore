title: Understanding JSON Web Tokens (JWT): Structure, Claims, and Verification
description: Learn the technical composition of JSON Web Tokens, understand standard registered claims, and explore secure methods for verifying signatures.
date: 2026-07-16
category: Developer
author: Urbandigistore Engineering
---

# Understanding JSON Web Tokens (JWT): Structure, Claims, and Verification

JSON Web Tokens (JWT) have become the de facto standard for stateless session handling and single sign-on (SSO) authentication in modern web applications. However, despite their widespread use, misunderstandings about their security model frequently lead to critical vulnerabilities, such as the infamous "alg: none" bypass.

In this guide, we'll dissect the structure of a JWT, examine the difference between public and private claims, and write secure verification code.

---

## 🔍 The Anatomy of a JWT

A JSON Web Token is a string consisting of three parts separated by dots (`.`):
`header.payload.signature`

Each section is encoded using **Base64URL** (a URL-safe variation of standard Base64 encoding):

### 1. The Header
Contains metadata about the token, typically specifying the token type (`JWT`) and the hashing algorithm used to sign it (e.g., `HS256` or `RS256`):
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 2. The Payload
Contains the "claims," which are statements about the user and any session metadata. This is the core data payload:
```json
{
  "sub": "1234567890",
  "name": "Jane Doe",
  "admin": true,
  "exp": 1799982400
}
```

### 3. The Signature
Used to verify that the sender of the JWT is who they claim to be and to ensure that the message hasn't been altered along the way. It is created by taking the encoded header, the encoded payload, and signing them with a secret key:
```javascript
const signature = HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secretKey
);
```

---

## 🏷️ Standard Claims vs. Custom Claims

The payload contains claims, which are classified into three types:

### 1. Registered Claims
Predefined claims that are not mandatory but highly recommended for interoperability:
*   `iss` (Issuer): The authority that issued the token.
*   `sub` (Subject): The user ID the token represents.
*   `aud` (Audience): The specific API or service the token is intended for.
*   `exp` (Expiration Time): The Unix epoch timestamp when the token expires.
*   `nbf` (Not Before): The timestamp before which the token must not be accepted.
*   `iat` (Issued At): The timestamp when the token was created.

### 2. Public Claims
Defined by developers but should be registered in the IANA JSON Web Token Registry to avoid naming collisions.

### 3. Private Claims
Custom claims created to share information between parties that agree on using them (e.g. `{"role": "editor"}`).

---

## 🛠️ Secure Signature Verification Best Practices

### The Security Risk of JWTs
> [!WARNING]
> Because JWTs are Base64URL-encoded, their contents can be easily decoded and read by anyone who intercepts the token. **Never store sensitive data like passwords or API keys inside the payload.**

### Node.js Secure Verification Example
When verifying a token on your server, always specify the allowed signature algorithms explicitly. This prevents attackers from sending a token with `"alg": "none"` or changing an asymmetric RS256 token to a symmetric HS256 token to bypass verification:

```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  // Explicitly define the algorithms allowed to prevent signature attacks
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
```
