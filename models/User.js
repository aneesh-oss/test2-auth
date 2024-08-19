const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  loginuser: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  loginpassword: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

module.exports = User;



// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   loginuser: { type: String, required: true, unique: true },
//   email: { type: String, required: true },
//   loginpassword: { type: String, required: true }
// });

// module.exports = mongoose.model('User', userSchema);
