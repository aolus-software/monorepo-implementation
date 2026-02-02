import Elysia from "elysia";

import { AuthModule } from "./auth";
import { HomeModule } from "./home/index";
import { SettingsModule } from "./settings";

export const bootstraps = new Elysia()
	.use(HomeModule)
	.use(AuthModule)
	.use(SettingsModule);
