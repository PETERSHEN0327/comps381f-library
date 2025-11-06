const mongoose = require('mongoose');
const { Schema } = mongoose;

const loanSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  borrower: { type: String, required: true }, // 简化：存借阅者名字/学号
  loanedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnedAt: { type: Date }
});

module.exports = mongoose.model('Loan', loanSchema);
