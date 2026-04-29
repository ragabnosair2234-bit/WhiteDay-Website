import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { usersRouter } from "./routers/users";
import { servicesRouter } from "./routers/services";
import { bookingsRouter } from "./routers/bookings";
import { paymentsRouter } from "./routers/payments";
import { reviewsRouter } from "./routers/reviews";
import { disputesRouter } from "./routers/disputes";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  user: usersRouter,
  service: servicesRouter,
  booking: bookingsRouter,
  payment: paymentsRouter,
  review: reviewsRouter,
  dispute: disputesRouter,
});

export type AppRouter = typeof appRouter;
