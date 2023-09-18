

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    default: 'пользователь',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  pay: Boolean,
  textAnswer: Number,
  audioAnswer: Number,
  languageAssistent: {
    type: String,
    default: 'rus',
  },
  speakingRate: {
    type: String,
    default: '1',
  },
  statusPay: String,
  paymentID: String,
  dateAffiramtion:String,
  paymentDate: Date,
  onOffAssistent: {
    type: String,
    default: 'on',
  },
  paymentDateOut: Number,
  imagineGeneration:{
    type:Number,
    default:0,
    required: false,
  },
  Language:{
    type:String,
    default:'ru',
    require:false,
  },
  dayTextAnswer:{
    type:Number,
    default:0,
    require:false
  }
});

const UserModel = mongoose.model('User', userSchema);

export { UserModel };
