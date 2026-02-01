import Elysia from "elysia";
import { SelectOptionModule } from "./select-option";
import { PermissionModule } from "./permission";
import { RoleModule } from "./role";
import { UserModule } from "./user";

export const SettingsModule = new Elysia({
  prefix: "/settings",
  name: "Settings Module",
  detail: {
    tags: ["Settings"],
    description: "Module for managing application settings",
  },
})
.use(SelectOptionModule)
.use(PermissionModule)
.use(RoleModule)
.use(UserModule);