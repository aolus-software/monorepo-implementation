import Elysia from "elysia";
import { HomeModule } from "./home/index";
import { AuthModule } from "./auth";

export const bootstraps = new Elysia().use(HomeModule).use(AuthModule);
