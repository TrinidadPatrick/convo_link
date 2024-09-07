const User = require("../Models/userModel");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

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
  // Entry validation
  Object.entries(data).map(([key, value]) => {
    if(value == '')
    {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }
    
  })
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const response = await sendOTPEmail(email, otp);
    await User.create({email : email.toLowerCase(), password : hashedPassword, firstname, lastname, birthdate, gender, otp, otpExpiry});
    return res.status(200).json({ message: response });
  } catch (error) {
    if(error.message == 'No recipients defined' )
    {
      return res.status(400).json({ message: 'Invalid email' });
    }
  }
  


};

module.exports.login = async (req,res) => {
  const data = req.body;
  const {email, password} = data;

  const user = await User.findOne({email: email.toLowerCase()});

  // If user is not in the database
  if(!user)
  {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // If user is in the database
  else if(user)
  {
    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    // If user is in the database but not verified
    if(isPasswordCorrect && !user.email_verified)
    {
      const otp = generateOTP();
      const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
      await sendOTPEmail(email, otp);
      await User.findByIdAndUpdate(user._id, {otp: otp, otpExpiry: otpExpiry});
      return res.status(403).json({ message: 'User not verified' });
    }
    // If user is in the database and verified
    if(user.email_verified && isPasswordCorrect)
    {
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '30d'});
        res.cookie('user_token', token, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite : "None", secure: true});
        return res.status(200).json({ message: 'Logged in successfully', token });
    }
    // If password is incorrect
    if(!isPasswordCorrect)
    {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  }
}

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

module.exports.getUserProfile = async (req,res) => {
  const user_id = req.user._id;
  if(user_id)
  {
    const user = await User.findById(user_id, {password : 0});
    const {firstname, lastname, email, birthdate, gender, profileImage, Address, account_status, profile_status} = user;
    return res.status(200).json({ message: 'User profile fetched', user : {firstname, lastname, email, birthdate, gender, profileImage, Address, account_status, profile_status} });
  }
  else{
    return res.status(400).json({ message: 'User not found' });
  }
}