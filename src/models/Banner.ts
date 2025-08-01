import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  costume: {
    type: String,
    required: true
  },
  start_date: {
    type: String,
    required: true
  },
  end_date: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);

export default Banner;