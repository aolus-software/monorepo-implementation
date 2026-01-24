import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import Elysia from "elysia";

interface AuthOptions {
	jwtConfig: { name: string; secret: string; exp: string };
}

export const AuthPlugin = (options: AuthOptions) => {
	return new Elysia({ name: "auth" }).use(jwt(options.jwtConfig)).use(bearer());
};
