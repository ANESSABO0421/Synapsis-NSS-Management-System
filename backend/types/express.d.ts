// Properties our middleware attaches to Express requests.
import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    /** Authenticated user (any role), set by `protect`. `role` is the effective role. */
    user?: any;
    admin?: any;
    student?: any;
    teacher?: any;
    coordinator?: any;
    alumni?: any;
    /** Event loaded and access-checked by `requireEventAccess`. */
    event?: any;
  }
}
