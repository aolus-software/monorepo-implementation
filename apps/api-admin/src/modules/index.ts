import Elysia from "elysia";
import { HomeModule } from "./home/index";
import { AuthModule } from "./auth";
import { SettingsModule } from "./settings";

export const bootstraps = new Elysia().use(HomeModule).use(AuthModule).use(SettingsModule);