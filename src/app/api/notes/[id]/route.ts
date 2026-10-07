import { makeItemRoutes } from "@/lib/server/http";
import { notesDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(notesDelegate);
