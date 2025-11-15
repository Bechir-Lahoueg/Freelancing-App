import mongoose from 'mongoose';

const siteStatsSchema = new mongoose.Schema({
  projectsCompleted: {
    type: Number,
    default: 0
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  totalTasks: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const SiteStats = mongoose.model('SiteStats', siteStatsSchema);

export default SiteStats;
