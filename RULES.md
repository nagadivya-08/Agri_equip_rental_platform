# Project Rules & Development Guidelines

These rules are mandatory for all development, maintenance, and agent operations on the **Agri-Equipment Rental Platform** project.

---

## 1. Feature Preservation
* **Existing Functionality Protection**: Do not change, refactor, or modify existing functionality unless the user explicitly requests and approves the change.
* **Regression Prevention**: When adding new features or fixing bugs, ensure that previously implemented phases (auth, roles, equipment listing, admin moderation, etc.) remain intact and functional.

---

## 2. Database Data Safety
* **Zero Data Loss**: Do not delete, drop, wipe, or overwrite any database collections or existing records without explicit user authorization.
* **Safe Migrations & Updates**: Schema updates and migrations must be additive and backward-compatible with existing stored data.
* **Test Isolation**: Any automated test scripts must clean up only their own temporary test data and never truncate or alter operational user/equipment records.

---

## 3. Step-by-Step Implementation
* **Scope Discipline**: Implement only the specific step or phase currently requested by the user.
* **No Premature Implementation**: Do not jump ahead to unapproved future phases or speculative features until the user gives explicit approval.
* **Iterative Verification**: Complete and verify each phase thoroughly before proceeding to the next.

---

## 4. Security Enforcement
* **JWT Integrity**: Preserve JSON Web Token (JWT) authentication across all protected endpoints.
* **Backend Verification**: User identity, roles (`owner`, `renter`, `admin`), and account permissions must strictly be verified on the backend via verified JWTs and database lookups (`req.user`), never relying solely on client-side state.
* **Access Control**: Enforce strict role authorization and block banned accounts from accessing protected resources.
