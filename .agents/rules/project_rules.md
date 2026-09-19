# Project Rules & Development Guidelines

These rules are mandatory for all agent operations and code changes on the Agri-Equipment Rental Platform project:

1. **Feature Preservation**: Do not change or modify existing functionality until the user explicitly accepts/approves the change.
2. **Database Data Safety**: Do not delete, drop, wipe, or overwrite any database data without explicit user approval.
3. **Step-by-Step Implementation**: Implement only the requested step. Do not jump ahead to unapproved future features.
4. **Security Enforcement**: Preserve JWT authentication and verify user identity strictly via backend JWTs.
