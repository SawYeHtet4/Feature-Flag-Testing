# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of our feature flag system seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not

- **Do not** open a public GitHub issue for security vulnerabilities
- **Do not** disclose the vulnerability publicly until it has been addressed

### How to Report

Please report security vulnerabilities by emailing **security@yourproject.com** with:

1. **Description** - A clear description of the vulnerability
2. **Impact** - What an attacker could do with this vulnerability
3. **Steps to Reproduce** - Detailed steps to reproduce the issue
4. **Affected Versions** - Which versions are affected
5. **Suggested Fix** - If you have ideas on how to fix it (optional)

### What to Expect

- **Acknowledgment** - We will acknowledge receipt of your report within 48 hours
- **Updates** - We will provide regular updates on our progress
- **Timeline** - We aim to address critical vulnerabilities within 7 days
- **Credit** - We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When using this feature flag system:

### 1. Environment Variables

- Never commit `.env.local` files to version control
- Use different secrets for each environment
- Rotate secrets regularly
- Use strong, random values for sensitive flags

### 2. Feature Flag Security

- **Validate User Input** - Always validate user data before using in feature flag checks
- **Sanitize Flag Names** - Don't use user input directly as flag names
- **Audit Access** - Monitor which users access which features
- **Role Verification** - Ensure user roles are verified server-side

### 3. Percentage-Based Rollouts

- The hash-based percentage system is deterministic and non-cryptographic
- Do not rely on it for security decisions
- Use it only for gradual feature rollouts

### 4. Debug Mode

- **Never enable debug mode in production**
- Debug panels expose feature flag configuration
- Use `NODE_ENV` checks to prevent accidental production debugging

### 5. Dependencies

- Keep dependencies updated
- Review security advisories regularly
- Use `yarn audit` or `npm audit` to check for vulnerabilities

## Known Security Considerations

### MurmurHash Usage

We use MurmurHash for consistent user bucketing in percentage-based rollouts. Important notes:

- MurmurHash is **not cryptographically secure**
- It should **not** be used for authentication or authorization
- It is suitable for feature rollout distribution only

### Client-Side Exposure

Feature flags are partially exposed to clients:

- Flag names are visible in component code
- Flag states can be inferred from rendered content
- **Never use feature flags to hide sensitive data** - use proper authorization instead

### Role-Based Access

- User roles must be validated server-side
- Client-side role checks are for UX only
- Always verify permissions on API endpoints

## Security Updates

We will announce security updates through:

- GitHub Security Advisories
- CHANGELOG.md with `[SECURITY]` prefix
- Email notifications to maintainers

## Responsible Disclosure

We follow responsible disclosure practices and request that security researchers:

- Give us reasonable time to fix vulnerabilities before public disclosure
- Make a good faith effort to avoid privacy violations and service disruption
- Do not access or modify data that doesn't belong to you

Thank you for helping keep our project and users safe!
