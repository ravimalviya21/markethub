const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
require("dotenv").config();

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
    API_BASE_URL,
    PORT,
} = process.env;

const callbackURL =
    GOOGLE_CALLBACK_URL ||
    `${API_BASE_URL || `http://localhost:${PORT || 3003}`}/api/v1/auth/google/callback`;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL,
            },
            (accessToken, refreshToken, profile, done) => {
                return done(null, { profile });
            }
        )
    );
} else {
    console.warn(
        "[passport] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google strategy disabled"
    );
}

module.exports = passport;
