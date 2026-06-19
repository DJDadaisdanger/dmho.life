# Security Architectural Rules

The following rules must be enforced as continuous security checks to avoid architectural mistakes, specifically those related to CBSE OSM vulnerabilities.

## 1. Zero Client-Side Security Controls
* **Rule:** Never perform authentication, authorization checks, or OTP comparisons in the frontend JavaScript.
* **Action:** The client-side must only collect inputs. The backend must independently validate sessions, tokens, and state. If a security control runs on the user's machine, it doesn't exist.

## 2. No Hardcoded Credentials or Master Passwords
* **Rule:** Plaintext credentials, backdoor tokens, or master passwords must never be bundled into the production frontend build.
* **Action:** Use secure environment variables on the server-side only. Scan all bundled JavaScript for sensitive string constants before deployment.

## 3. Strict Server-Side Session Validation (No Open Routes)
* **Rule:** Do not rely on Angular/React router guards alone to protect internal dashboard pages (like `/dashboard` or `/profile`).
* **Action:** Every single API endpoint feeding data to these routes must cryptographically verify the user's session token on the server. Dummy values in browser local storage should yield nothing but `401 Unauthorized` responses.

## 4. Enforce Strict Server-Side IDOR Protections
* **Rule:** Prevent Insecure Direct Object References. Never blindly trust user IDs or resource IDs (`ValuatorID`, `userId`, etc.) sent directly in the request body or parameters.
* **Action:** Cross-reference the requesting user's session token with the specific resource they are attempting to mutate. If they don't own it or lack explicit permissions, block the action immediately.

## 5. Secure State Mutation (Password Resets)
* **Rule:** Any sensitive account change—especially password resets—must require verification of the current password or a freshly validated, server-verified OTP token tied strictly to that active session.
