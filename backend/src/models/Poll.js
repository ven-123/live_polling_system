const mongoose = require('mongoose')

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  }
})

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [optionSchema],
    required: true
  },
  correctIndex: {
    type: Number,
    default: null
  },
  duration: {
    type: Number, 
    required: true
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'CLOSED', 'COMPLETED'],
    default: 'PENDING'
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('Poll', pollSchema)
