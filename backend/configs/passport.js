import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Admin from "../models/Admin.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/admin/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let admin = await Admin.findOne({ email: profile.emails[0].value });

        if (!admin) {
          admin = await Admin.create({
            email: profile.emails[0].value,
            googleId: profile.id,
            status: "pending",
          });
        }

        return done(null, admin);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((admin, done) => done(null, admin.id));
passport.deserializeUser(async (id, done) => {
  try {
    const admin = await Admin.findById(id);
    done(null, admin);
  } catch (err) {
    done(err, null);
  }
});
