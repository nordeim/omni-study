import { makeItemRoutes } from "@/lib/server/http";
import { cardsDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(cardsDelegate);
