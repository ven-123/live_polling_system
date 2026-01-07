const mongoose = require('mongoose')

const voteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true
    },
    studentId: {
      type: String,
      required: true
    },
    optionIndex: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
)

voteSchema.index({ pollId: 1, studentId: 1 }, { unique: true })

module.exports = mongoose.model('Vote', voteSchema)
