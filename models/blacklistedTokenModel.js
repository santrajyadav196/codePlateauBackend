const mongoose = require("mongoose");

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// Automatically delete expired tokens

blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const blacklistedToken = mongoose.model(
  "BlacklistedToken",
  blacklistedTokenSchema
);

module.exports = blacklistedToken;
