import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    // Required seulement pour l'authentification locale
    required: function() {
      return this.authType === 'local';
    },
    minlength: 6
  },
  universityYear: {
    type: String,
    enum: ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat', 'Autre'],
    default: 'L1'
  },
  authType: {
    type: String,
    enum: ['google', 'facebook', 'outlook', 'local'],
    default: 'local'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  googleId: String,
  facebookId: String,
  microsoftId: String,
  avatar: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hacher le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Methode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
