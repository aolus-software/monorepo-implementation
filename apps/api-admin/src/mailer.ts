import { MailerService } from "@repo/mailer";

import { env } from "./env";

export const mailer = new MailerService({
	host: env.MAILER_HOST,
	port: env.MAILER_PORT,
	secure: env.MAILER_SECURE,
	auth: {
		user: env.MAILER_USER,
		pass: env.MAILER_PASSWORD,
	},
	from: env.MAILER_FROM,
});
