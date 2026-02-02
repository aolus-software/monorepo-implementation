export class NotFoundError extends Error {
	code: number;

	constructor(message = "Resource not found") {
		super(message);
		this.name = "NotFoundError";
		this.code = 422;
	}
}
