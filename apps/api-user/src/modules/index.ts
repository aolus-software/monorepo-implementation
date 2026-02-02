import Elysia from "elysia";

import { HomeModule } from "./home/index";

export const bootstraps = new Elysia().use(HomeModule);
