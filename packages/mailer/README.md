# @repo/mailer

Clean and reusable SMTP email service for the monorepo.

## Philosophy

This package is intentionally simple and focused on one thing: **sending emails
via SMTP**. It does NOT include email templates or business logic. This keeps
the package clean, reusable, and easy to maintain.

Email templates and content should be defined at the application level (e.g., in
your API services) where you have full control over customization.

## Features

- Simple SMTP email sending
- Configurable per application
- Type-safe email options
- SMTP connection verification
- Support for HTML/text content, attachments, CC/BCC

## Installation

```bash
# Already available as workspace package
# Add to your app's package.json:
"@repo/mailer": "workspace:*"
```

## Usage

### Basic Setup

```typescript
import { MailerService } from "@repo/mailer";

const mailer = new MailerService({
	host: "smtp.gmail.com",
	port: 587,
	secure: false,
	auth: {
		user: "your-email@gmail.com",
		pass: "your-password",
	},
	from: "noreply@example.com",
});
```

### Send an Email

```typescript
await mailer.sendMail({
	to: "user@example.com",
	subject: "Welcome!",
	html: "<p>Welcome to our platform</p>",
	text: "Welcome to our platform",
});
```

### Verify SMTP Connection

```typescript
const isValid = await mailer.verify();
if (!isValid) {
	console.error("SMTP configuration is invalid");
}
```

## Creating Email Templates

Define your email templates in your API service layer, NOT in this package. See
example below:

```typescript
// apps/api-admin/src/services/email.service.ts
import { mailer } from "../mailer";

export const EmailService = {
	async sendVerificationEmail(to: string, token: string, userName: string) {
		const verificationUrl = `https://yourapp.com/verify?token=${token}`;

		await mailer.sendMail({
			to,
			subject: "Verify Your Email",
			html: `
				<h2>Hi ${userName}</h2>
				<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>
			`,
			text: `Hi ${userName}, verify your email: ${verificationUrl}`,
		});
	},
};
```

## Configuration

Each API application provides its own SMTP configuration through environment
variables:

- `MAILER_HOST` - SMTP server host
- `MAILER_PORT` - SMTP server port
- `MAILER_SECURE` - Use TLS (true/false)
- `MAILER_USER` - SMTP username
- `MAILER_PASSWORD` - SMTP password
- `MAILER_FROM` - Default "from" address

## Why This Design?

1. **Separation of Concerns**: Email sending (transport) vs email content
   (templates)
2. **Flexibility**: Each API can define its own templates and styling
3. **Maintainability**: Changes to email templates don't require package updates
4. **Testability**: Easy to mock the mailer service in tests
5. **Reusability**: The same mailer can be used across different apps with
   different templates
