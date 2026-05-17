import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Interview Session'
  },
  transcript: {
    type: Array,
    default: []
  },
  duration: {
    type: String,
    default: '00:00:00'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
