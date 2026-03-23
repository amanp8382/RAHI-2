const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  // Basic destination information
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  
  // Location information
  location: {
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required'],
        index: '2dsphere'
      }
    },
    timezone: String
  },
  
  // Media and visual content
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    tags: [String]
  }],
  videos: [{
    url: String,
    title: String,
    duration: Number,
    thumbnail: String
  }],
  
  // Categorization for AI training
  categories: [{
    type: String,
    enum: [
      'nature', 'culture', 'history', 'adventure', 'beach', 'mountain',
      'city', 'rural', 'religious', 'museum', 'park', 'monument',
      'entertainment', 'shopping', 'food', 'nightlife', 'spa', 'sports'
    ]
  }],
  
  // Tourism information
  bestTimeToVisit: {
    months: [{
      type: String,
      enum: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }],
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter', 'year-round']
    },
    weather: String
  },
  
  // Practical information
  operatingHours: {
    monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isClosed: { type: Boolean, default: false } }
  },
  
  pricing: {
    currency: {
      type: String,
      default: 'USD'
    },
    adult: Number,
    child: Number,
    senior: Number,
    group: Number,
    isFree: {
      type: Boolean,
      default: false
    }
  },
  
  // Accessibility and facilities
  accessibility: {
    wheelchairAccessible: Boolean,
    hasParking: Boolean,
    hasRestrooms: Boolean,
    hasGiftShop: Boolean,
    hasRestaurant: Boolean,
    hasWifi: Boolean,
    petFriendly: Boolean
  },
  
  // AI training data
  popularityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // User engagement metrics for AI
  metrics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalBookmarks: {
      type: Number,
      default: 0
    },
    totalCheckins: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    averageVisitDuration: Number // in minutes
  },
  
  // Reviews and ratings
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    content: String,
    images: [String],
    visitDate: Date,
    isVerified: {
      type: Boolean,
      default: false
    },
    helpfulCount: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Similar destinations for recommendation system
  similarDestinations: [{
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination'
    },
    similarityScore: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  
  // Status and metadata
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // SEO and search
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  tags: [String],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
destinationSchema.index({ 'location.coordinates': '2dsphere' });
destinationSchema.index({ categories: 1 });
destinationSchema.index({ 'location.country': 1, 'location.city': 1 });
destinationSchema.index({ popularityScore: -1 });
destinationSchema.index({ 'metrics.averageRating': -1 });
destinationSchema.index({ slug: 1 });
destinationSchema.index({ tags: 1 });

// Pre-save middleware to generate slug
destinationSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }
  this.updatedAt = Date.now();
  next();
});

// Static method to find destinations near a location
destinationSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Static method for AI recommendation based on user preferences
destinationSchema.statics.getRecommendations = function(userPreferences, limit = 10) {
  const query = {
    isActive: true,
    categories: { $in: userPreferences.interests }
  };
  
  return this.find(query)
    .sort({ popularityScore: -1, 'metrics.averageRating': -1 })
    .limit(limit);
};

// Method to calculate average rating
destinationSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) return 0;
  
  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / this.reviews.length) * 10) / 10;
};

module.exports = mongoose.model('Destination', destinationSchema);