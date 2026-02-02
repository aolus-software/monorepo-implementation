export class UnauthorizedError extends Error {
	code: number;

	constructor(message = "Unauthorized") {
		super(message);
		this.name = "UnauthorizedError";
		this.code = 401;
	}
}
