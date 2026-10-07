import { makeCollectionRoutes } from "@/lib/server/http";
import { cardsDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(cardsDelegate);
