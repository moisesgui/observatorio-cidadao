import { createMiddleware } from "@tanstack/react-start";

export const withRequest = createMiddleware({ type: "request" }).server(({ request, next }) =>
  next({ context: { request } }),
);