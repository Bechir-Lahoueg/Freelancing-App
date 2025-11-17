import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import User from '../models/User.js';

// Serialisation de l'utilisateur
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialisation de l'utilisateur
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Strategie Google OAuth2
if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Verifier si l'utilisateur existe deja
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }

      // Creer un nouvel utilisateur
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0]?.value,
        authType: 'google'
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

// Strategie Facebook OAuth2
if (process.env.FACEBOOK_APP_ID) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'email', 'photos']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ facebookId: profile.id });
      
      if (user) {
        return done(null, user);
      }

      user = await User.create({
        facebookId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
        avatar: profile.photos?.[0]?.value,
        authType: 'facebook'
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

// Strategie Microsoft (Outlook) OAuth2
if (process.env.MICROSOFT_CLIENT_ID) {
  passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: process.env.MICROSOFT_CALLBACK_URL,
    scope: ['user.read']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ microsoftId: profile.id });
      
      if (user) {
        return done(null, user);
      }

      user = await User.create({
        microsoftId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value,
        authType: 'outlook'
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

export default passport;
