const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        adults: { type: Number, required: true },
        children: { type: Number, required: true },
        image: { type: Array }
    }],
    createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('Order', OrderSchema);
