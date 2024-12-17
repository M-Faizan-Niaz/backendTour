const mongoose = require('mongoose');
const validator = require('validator'); // using for email validation
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pleasr tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true, // transform the email into lowercase,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  photo: [String],
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8, // password should have atleast 8 characters
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Pease confirm your password '],
    validate: {
      // This only works on CREATE and SAVE!! not on update
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same ',
    },
  },
});

userSchema.pre('save', async function (next) {
  // Only run this function is password was actually modified or created
  if (!this.isModified('password')) return next;

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the passwordConfirm field
  this.passwordConfirm = undefined;
});

// if the getting passwrord is same as the onbe store in document
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
  // candidatePassword is not hashed , coming from user , and
  // userPassword is hashed , we can't compare them manually
};

const User = mongoose.model('User', userSchema);
module.exports = User
