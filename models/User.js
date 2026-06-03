const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

userSchema.pre("save", function() {
  if (!this.isModified("password")) return;
  const salt = bcryptjs.genSaltSync(10);
  this.password = bcryptjs.hashSync(this.password, salt);
});

userSchema.methods.matchPassword = function(enteredPassword) {
  return bcryptjs.compareSync(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;