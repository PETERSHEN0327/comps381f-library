const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, trim: true },
  status: { type: String, enum: ['available', 'loaned'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
