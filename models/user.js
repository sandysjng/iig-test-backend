const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: [true, "can't be blank"], match: [/^[A-Za-z0-9_]{6,12}$/, 'is invalid'], unique: true },
        firstName: { type: String },
        lastName: { type: String },
        hash: { type: String },
        hashRecords: { type: Array },
        profile: { type: String }
    },
    { timestamps: true, versionKey: false }
)

module.exports = mongoose.model('User', UserSchema)
