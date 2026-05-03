import mongoose from 'mongoose';
import { type } from 'os';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,   
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  qr_id : {
    type : String ,
    required : true 
  },
  admin:{
    type:Boolean,
    default:false
  },
  superadmin:{
    type:Boolean,
    default:false
  },
  guest:{
    type:Boolean,
    default:false
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);