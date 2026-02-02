import { UnauthorizedError as BaseUnauthorizedError } from "@repo/types";

export class UnauthorizedError extends BaseUnauthorizedError {
	constructor(message = "Unauthorized") {
		super(message);
	}

	toResponse(): Response {
		return Response.json(
			{
				status: 401,
				success: false,
				message: this.message || "Unauthorized",
			},
			{
				status: 401,
			},
		);
	}
}
