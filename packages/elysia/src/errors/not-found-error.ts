import { NotFoundError as BaseNotFoundError } from "@repo/types";

export class NotFoundError extends BaseNotFoundError {
	constructor(message = "Resource not found") {
		super(message);
	}

	toResponse(): Response {
		return Response.json(
			{
				status: 422,
				success: false,
				message: this.message || "Resource not found",
			},
			{
				status: 422,
			},
		);
	}
}
