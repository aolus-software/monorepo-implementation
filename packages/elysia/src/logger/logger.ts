import type { LoggerOptions } from "@bogeychan/elysia-logger/types";
import type { Logger } from "pino";
import { destination, pino } from "pino";

const logFile = destination({
	append: true,
	write: true,
	writable: true,
	dest: "storage/logs/app.log",
});

const transport = {
	target: "pino-pretty",
	options: {
		singleLine: false,
		translateTime: "SYS:standard",
		include: "time",
	},
};

// Helper to recursively remove sensitive fields
const sensitivePattern = /password|token|auth|bearer|secret|key|credential/i;

// eslint-disable-next-line
function deepSanitize(objectSanitize: Record<string, any>) {
	for (const key of Object.keys(objectSanitize)) {
		if (sensitivePattern.test(key)) {
			objectSanitize[key] = undefined;
		} else if (
			objectSanitize[key] &&
			typeof objectSanitize[key] === "object" &&
			!Array.isArray(objectSanitize[key])
		) {
			// eslint-disable-next-line
			deepSanitize(objectSanitize[key]);
		}
	}
}

const options: LoggerOptions = {
	level: "info",
	base: null,
	timestamp: () =>
		`<${new Date().toLocaleString("en-US", {
			weekday: "long",
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			timeZone: "UTC",
		})}>`,
	transport: transport,
	formatters: {
		level(label) {
			return { level: label };
		},
		log(obj) {
			const sanitized = { ...obj };
			deepSanitize(sanitized);
			return sanitized;
		},
	},

	file: logFile,
};

// SINGLE logger instance for the whole app
export const log: Logger = pino(options, logFile);

/**
 * Create a child logger with bindings for a module or domain.
 * Example: const userLog = child({ module: "user" })
 */
export function child(bindings: Record<string, unknown>): Logger {
	return log.child(bindings);
}
