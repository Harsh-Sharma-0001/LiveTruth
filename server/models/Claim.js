import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  transcript: {
    type: String,
    required: false,
    default: ''
  },
  claim: {
    type: String,
    required: true
  },
  verdict: {
    type: String,
    enum: ['true', 'false', 'misleading', 'unverified'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  sources: [{
    title: String,
    url: String,
    snippet: String
  }],
  explanation: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    entities: [String],
    keywords: [String]
  }
}, {
  timestamps: true
});

export default mongoose.model('Claim', claimSchema);
