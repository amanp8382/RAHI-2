const mongoose = require('mongoose');

const aiTrainingDataSchema = new mongoose.Schema({
  // Data source information
  dataType: {
    type: String,
    required: [true, 'Data type is required'],
    enum: [
      'user_interaction',
      'preference_pattern',
      'destination_similarity',
      'seasonal_trend',
      'rating_correlation',
      'location_affinity',
      'activity_sequence',
      'demographic_preference',
      'time_based_behavior',
      'recommendation_feedback'
    ]
  },
  
  // User context (anonymized for privacy)
  userProfile: {
    anonymizedId: {
      type: String,
      required: true,
      index: true
    },
    ageGroup: {
      type: String,
      enum: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+']
    },
    travelStyle: {
      type: String,
      enum: ['solo', 'couple', 'family', 'group', 'business']
    },
    budgetRange: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury']
    },
    interests: [String],
    locationRegion: String, // Generalized location for privacy
    previousTravelCount: Number
  },
  
  // Interaction data
  interactionData: {
    action: {
      type: String,
      enum: ['view', 'search', 'bookmark', 'share', 'review', 'book', 'visit', 'skip']
    },
    targetDestination: {
      destinationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination'
      },
      category: String,
      location: {
        country: String,
        region: String
      },
      priceRange: String,
      rating: Number,
      popularityScore: Number
    },
    
    // Context of interaction
    sessionData: {
      sessionId: String,
      deviceType: {
        type: String,
        enum: ['mobile', 'tablet', 'desktop']
      },
      timeOfDay: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night']
      },
      dayOfWeek: String,
      seasonality: {
        type: String,
        enum: ['spring', 'summer', 'autumn', 'winter']
      },
      searchQuery: String,
      previousActions: [String], // Last 5 actions in session
      durationSpent: Number, // in seconds
      scrollDepth: Number, // percentage
      clickPosition: {
        x: Number,
        y: Number
      }
    }
  },
  
  // Outcome data for training
  outcomeData: {
    wasBookmarked: Boolean,
    wasShared: Boolean,
    wasBooked: Boolean,
    rating: Number, // If user rated the destination
    reviewSentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    returnIntent: Boolean, // Would user visit again
    recommendationFollowed: Boolean,
    conversionTime: Number // Time from first view to booking (if applicable)
  },
  
  // Recommendation context
  recommendationContext: {
    algorithmVersion: String,
    recommendationType: {
      type: String,
      enum: ['collaborative', 'content_based', 'hybrid', 'popularity_based', 'location_based']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    alternativesShown: [{
      destinationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination'
      },
      position: Number,
      clicked: Boolean
    }],
    personalizedFactors: [{
      factor: String,
      weight: Number,
      description: String
    }]
  },
  
  // Feature vectors for ML training
  features: {
    // User features
    userVector: [Number], // Encoded user preferences
    
    // Destination features
    destinationVector: [Number], // Encoded destination attributes
    
    // Contextual features
    contextVector: [Number], // Time, location, device, etc.
    
    // Interaction features
    behaviorVector: [Number], // Past behavior patterns
    
    // Combined feature vector
    combinedVector: [Number]
  },
  
  // Labels for supervised learning
  labels: {
    willLike: {
      type: Number,
      min: 0,
      max: 1 // Probability user will like this destination
    },
    willBook: {
      type: Number,
      min: 0,
      max: 1 // Probability user will book
    },
    timeToDecision: Number, // Predicted time to make decision
    expectedRating: {
      type: Number,
      min: 1,
      max: 5
    },
    churnRisk: {
      type: Number,
      min: 0,
      max: 1 // Probability user will stop using platform
    }
  },
  
  // Training metadata
  trainingMetadata: {
    dataVersion: {
      type: String,
      default: '1.0'
    },
    isTrainingSet: {
      type: Boolean,
      default: true
    },
    isValidationSet: {
      type: Boolean,
      default: false
    },
    isTestSet: {
      type: Boolean,
      default: false
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 1
    },
    lastUsedInTraining: Date,
    modelPerformance: {
      accuracy: Number,
      precision: Number,
      recall: Number,
      f1Score: Number
    }
  },
  
  // Privacy and compliance
  privacyLevel: {
    type: String,
    enum: ['public', 'anonymized', 'aggregated_only'],
    default: 'anonymized'
  },
  
  dataRetentionUntil: {
    type: Date,
    required: true
  },
  
  consentGiven: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  processedAt: Date,
  
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// Indexes for ML queries
aiTrainingDataSchema.index({ dataType: 1, 'trainingMetadata.isTrainingSet': 1 });
aiTrainingDataSchema.index({ 'userProfile.anonymizedId': 1, timestamp: -1 });
aiTrainingDataSchema.index({ 'interactionData.targetDestination.destinationId': 1 });
aiTrainingDataSchema.index({ 'trainingMetadata.dataVersion': 1 });
aiTrainingDataSchema.index({ dataRetentionUntil: 1 }); // For data cleanup
aiTrainingDataSchema.index({ timestamp: -1 }); // For time-series analysis

// Static methods for ML operations
aiTrainingDataSchema.statics.getTrainingBatch = function(batchSize = 1000, dataTypes = [], skipProcessed = true) {
  const query = {
    'trainingMetadata.isTrainingSet': true
  };
  
  if (dataTypes.length > 0) {
    query.dataType = { $in: dataTypes };
  }
  
  if (skipProcessed) {
    query.processedAt = { $exists: false };
  }
  
  return this.find(query)
    .limit(batchSize)
    .sort({ timestamp: 1 });
};

aiTrainingDataSchema.statics.getFeatureMatrix = function(dataTypes = [], limit = 10000) {
  const pipeline = [
    { $match: { dataType: { $in: dataTypes } } },
    { $limit: limit },
    {
      $project: {
        features: '$features.combinedVector',
        labels: 1,
        dataType: 1
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Method to mark as processed
aiTrainingDataSchema.methods.markAsProcessed = function() {
  this.processedAt = new Date();
  return this.save();
};

// Method to update model performance
aiTrainingDataSchema.methods.updatePerformance = function(performanceMetrics) {
  this.trainingMetadata.modelPerformance = performanceMetrics;
  this.lastModified = new Date();
  return this.save();
};

// Pre-save middleware
aiTrainingDataSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  
  // Set data retention (2 years from creation)
  if (this.isNew) {
    this.dataRetentionUntil = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

module.exports = mongoose.model('AITrainingData', aiTrainingDataSchema);