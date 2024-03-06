const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User_new1',
    required: true,
  },
  orderedItems: [
    {
      foodItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dishes',
      },
      deliveryDates: {
        type: Date
      }, // Array to store delivery dates
    },
  ],
    orderDate: {
        type: Date,
        default: () => {
            const now = new Date();
            const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
            return easternTime;
        },
    },
    tip: {
        type: Number,
        default: null,
    },
    totalPaid: {
        type: Number,
        default: null,
    },
    shipping: {
        type: Number,
        default: null,
    },
    tax: {
        type: Number,
        default: null,
    },
    isPlaced: {
        type: Boolean,
        default: false,
    },
    paymentId: {
        type: String,
        default: null,
    },
    cardNumber: {
        type: String,
        default: null,
    },
    address: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: false,
    },
    state: {
        type: String,
        required: false,
    },
    zipCode: {
        type: String,
        required: true,
    },
    spicy: {
        type: String,
    }
});
orderSchema.plugin(timestamp, {
    useVirtual: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  
  orderSchema.pre('save', function (next) {
    // Set the time zone to North Virginia (Eastern Time Zone) for createdAt and updatedAt
    this.created_at = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    this.updated_at = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  
    next();
  });
module.exports = mongoose.model('placedOrder_new', orderSchema);
