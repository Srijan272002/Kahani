import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from '../index.mjs';

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false
    },
    async (jwtPayload, done) => {
      try {
        if (!jwtPayload.userId) {
          return done(null, false, { message: 'Invalid token payload' });
        }

        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.userId },
          select: {
            id: true,
            email: true,
            name: true,
            picture: true,
            role: true
          }
        });

        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        return done(null, user);
      } catch (error) {
        console.error('JWT Strategy Error:', error);
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
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.id || !profile.emails?.[0]?.value) {
          return done(null, false, { message: 'Invalid Google profile data' });
        }

        // Check if user exists
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId: profile.id },
              { email: profile.emails[0].value }
            ]
          }
        });

        if (user) {
          // Update existing user
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
              accessToken,
              refreshToken,
              name: profile.displayName,
              picture: profile.photos?.[0]?.value,
              email: profile.emails[0].value
            }
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              picture: profile.photos?.[0]?.value,
              accessToken,
              refreshToken
            }
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('OAuth error:', error);
        return done(error, false, { message: 'Failed to process OAuth callback' });
      }
    }
  )
);

export default passport; 