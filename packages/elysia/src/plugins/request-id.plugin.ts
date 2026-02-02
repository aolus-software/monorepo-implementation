import { Elysia } from "elysia";

export const RequestPlugin = new Elysia({ name: "request-id" }).derive(() => ({
	requestId: crypto.randomUUID(),
	startedAt: Date.now(),
}));
