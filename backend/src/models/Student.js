const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

studentSchema.pre('findByIdAndUpdate', function () {
  this.set({ lastActive: new Date() })
})

module.exports = mongoose.model('Student', studentSchema)
