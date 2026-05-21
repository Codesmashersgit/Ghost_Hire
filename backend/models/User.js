import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  dailyUsage: {
    date: {
      type: String, // stores as 'YYYY-MM-DD'
      default: () => new Date().toISOString().split('T')[0]
    },
    secondsUsed: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

// The user mentioned collection should be 'users'. 
// Mongoose defaults to pluralized lowercase, so 'User' becomes 'users'.
const User = mongoose.model('User', userSchema);

export default User;
