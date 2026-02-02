export class BadRequestError extends Error {
	code: number;
	error?: {
		field: string;
		message: string;
	}[];

	constructor(
		message: string,
		error?: {
			field: string;
			message: string;
		}[],
	) {
		super(message);
		this.name = "BadRequestError";
		this.code = 400;
		this.error = error;
	}
}
