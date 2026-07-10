const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
     },
     email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
      },
      password: {
        type: String,
        required: true
      },skills: {
        type: [String], 
        default: []
      },
      role: {
        type: String, 
        trim: true
      },
      githubProfile: String,
      portfolioUrl: String,
      availability: {
        type: Boolean,
        default: true
      }
    }, { timestamps: true});


    const User = mongoose.model('User', userSchema);
    module.exports =User;
    
    
    
    