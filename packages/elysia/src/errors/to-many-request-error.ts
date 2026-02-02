export class RateLimitError extends Error {
	constructor(public message = "rate-limited") {
		super(message);
	}

	toResponse(): Response {
		return Response.json(
			{
				status: 429,
				success: false,
				message: this.message || "Too Many Requests",
			},
			{
				status: 429,
			},
		);
	}
}
