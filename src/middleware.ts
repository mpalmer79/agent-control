import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextMiddleware } from "next/server";

// Apply Clerk middleware only when a publishable key is configured. Without
// credentials the middleware is a passthrough so the static shell remains
// reviewable in local development.
const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_"),
);

const passthrough: NextMiddleware = () => NextResponse.next();

export default (hasClerk ? clerkMiddleware() : passthrough) as NextMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
