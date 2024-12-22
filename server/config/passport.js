import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from '../app.js';

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    async (jwtPayload, done) => {
      try {
        console.log('[JWT] Verifying token payload:', jwtPayload);
        
        // Return the user data from the token
        const user = {
          id: jwtPayload.userId,
          email: jwtPayload.email,
          name: jwtPayload.name,
          picture: jwtPayload.picture,
          role: jwtPayload.role || 'USER'
        };
        
        return done(null, user);
      } catch (error) {
        console.error('[JWT] Strategy error:', error);
        return done(error, false);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/auth/google/callback`,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = await prisma.user.upsert({
          where: { googleId: profile.id },
          update: {
            accessToken,
            refreshToken,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
            email: profile.emails?.[0]?.value
          },
          create: {
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
            accessToken,
            refreshToken
          }
        });

        done(null, { ...user, accessToken, refreshToken });
      } catch (error) {
        done(error, false);
      }
    }
  )
);

export default passport; 