const User = require("../Models/userModel");
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const findUserByEmail = async (email) => {
  const user = await User.findOne({email});
  return user;
};

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: process.env.USER,
          pass: process.env.PASSWORD,
      },
  });

  const mailOptions = {
      from: 'Convo_wave_support@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports.resendOtp = async (req, res) => {  
    const data = req.body;
    const {email} = data;

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    const existingUser = await findUserByEmail(email.toLowerCase());
    // If user exists
    if (existingUser && !existingUser.email_verified) {
        await sendOTPEmail(email, otp);
        await User.findByIdAndUpdate(existingUser._id, {otp: otp, otpExpiry: otpExpiry});
        return res.status(200).json({ message: 'OTP sent to your email' });
    }
    return res.status(400).json({ message: 'Account not found or already verified' });
  }

module.exports.createUser = async (req, res) => {
  const data = req.body;
  const {firstname, lastname, email, birthdate, gender, password} = data;

  const otp = generateOTP();
  const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  const existingUser = await findUserByEmail(email.toLowerCase());
  // If user is already in the database
  if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered to an account' });
  }

  // If user is not in the database
  await sendOTPEmail(email, otp);
  await User.create({email : email.toLowerCase(), password, firstname, lastname, birthdate, gender, otp, otpExpiry});
  return res.status(200).json({ message: 'OTP sent to your email' });


};

module.exports.verifyOTP = async (req, res) => {
  const data = req.body;
  const {otp, email} = data;

  const user = await User.findOne({email: email.toLowerCase()});

  // If user is not in the database
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  // if user is in the database
  if(user)
  {
    // if user email is verifiend
    if(user.email_verified)
    {
      return res.status(400).json({ message: 'User is already verified' });
    }
    // if user email is not verified
    else
    {
     if(user.otp === otp && user.otpExpiry > Date.now())
     {
       await User.findByIdAndUpdate(user._id, {email_verified: true, otp : null, otpExpiry : null});
       return res.status(200).json({ message: 'Email verified' });
     }
     else
     {
       return res.status(400).json({ message: 'Invalid OTP' });
     }
    }
  }
}