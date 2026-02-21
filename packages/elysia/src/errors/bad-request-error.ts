import { BadRequestError as BaseBadRequestError } from "@repo/types";

export class BadRequestError extends BaseBadRequestError {
	constructor(
		message: string,
		error?: {
			field: string;
			message: string;
		}[],
	) {
		super(message, error);
		this.error = error;
	}

	toResponse(): Response {
		return Response.json(
			{
				status: 400,
				success: false,
				message: this.message || "Bad Request",
				errors: this.error ?? [],
			},
			{
				status: 400,
			},
		);
	}
}
