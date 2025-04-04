import { cookies } from "next/headers";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { MiddlewareFactory } from "@/types/MiddleFactory";

export const frontAuth: MiddlewareFactory = (next) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;

    if (
      ["/chat", "/orders", "/products", "/buyers"]?.some((path) =>
        pathname.startsWith(path),
      ) ||
      pathname === "/"
    ) {
      const token = (await cookies()).get("token")?.value;

      if (!token) {
        const url = new URL(`/sign-in`, request.url);

        return NextResponse.redirect(url);
      }
    }

    if (["/sign-in"]?.some((path) => pathname.startsWith(path))) {
      const token = (await cookies()).get("token")?.value;

      if (token) {
        const url = new URL(`/`, request.url);

        return NextResponse.redirect(url);
      }
    }

    return next(request, _next);
  };
};
