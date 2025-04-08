const User = require("../Models/userModel");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { trusted } = require("mongoose");

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
      html : `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your OTP Code</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  color: #333;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  width: 100%;
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
              }
              .header {
                  background-color: #007bff;
                  color: #ffffff;
                  padding: 20px;
                  text-align: center;
              }
              .header h1 {
                  margin: 0;
                  font-size: 24px;
              }
              .content {
                  padding: 20px;
                  text-align: center;
              }
              .otp {
                  font-size: 32px;
                  font-weight: bold;
                  color: #007bff;
                  margin: 20px 0;
              }
              .footer {
                  background-color: #f4f4f4;
                  color: #666;
                  padding: 10px;
                  text-align: center;
                  font-size: 14px;
              }
              .footer a {
                  color: #007bff;
                  text-decoration: none;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Your OTP Code</h1>
              </div>
              <div class="content">
                  <p>Hello,</p>
                  <p>Here is your One-Time Password (OTP) for verifying your account:</p>
                  <div class="otp">
                      ${otp}
                  </div>
                  <p>This OTP is valid for 10 minutes. Please use it to complete your verification process.</p>
                  <p>If you did not request this OTP, please ignore this email.</p>
              </div>
          </div>
      </body>
      </html>
  `
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
        // res.cookie('user_token', token, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite : "None", secure: true}); //For testing set secure to true in prod
        res.cookie('user_token', token, {maxAge: 30 * 24 * 60 * 60 * 1001, httpOnly: true, sameSite : "None", secure: true}); //For testing set secure to true in prod
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

module.exports.forgotPassword = async (req, res) => {
  const data = req.body;
  const {email} = data;

  const existingUser = await findUserByEmail(email.toLowerCase());
  // If user exists
  if (existingUser) {
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await sendOTPEmail(email, otp);
    await User.findByIdAndUpdate(existingUser._id, {otp: otp, otpExpiry: otpExpiry});
    return res.status(200).json({ message: 'An OTP was sent to \n' + email });
  }
  return res.status(400).json({ message: 'Account not found' });
}

module.exports.verifFpyOTP = async (req, res) => {
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
     if(user.otp === otp && user.otpExpiry > Date.now())
     {
       return res.status(200).json({ message: 'OTP verified' });
     }
     else
     {
       return res.status(401).json({ message: 'Invalid OTP' });
     }
    }
}

module.exports.resetPassword = async (req, res) => {
  const data = req.body;
  const {email, password, otp} = data;

  const user = await User.findOne({email: email.toLowerCase()});

  // If user is not in the database
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }
  if(user)
  {
    if(user.otp === otp && user.otpExpiry > Date.now())
    {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(user._id, {password : hashedPassword, otp : null, otpExpiry : null});
      return res.status(200).json({ message: 'Password reset successfully' });
    }
    else
    {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }
  }
}

module.exports.logout = async (req, res) => {
  const token = jwt.sign({_id: req.user._id}, process.env.JWT_SECRET, {expiresIn: '0ms'});
  res.clearCookie('user_token', {
    httpOnly: true,
    secure: true, // Use true if your application is served over HTTPS
    sameSite: 'None', // Adjust this based on your needs (Strict, Lax, None)
  });
  res.sendStatus(200); // Optional: send a success response
}

module.exports.getUserProfile = async (req,res) => {
  const user_id = req.user._id;
  if(user_id)
  {
    const user = await User.findById(user_id, {password : 0});
    const {firstname, lastname, email, birthdate, gender, profileImage, Address, account_status, profile_status, _id} = user;
    return res.status(200).json({ message: 'User profile fetched', user : {firstname, lastname, email, birthdate, gender, profileImage, Address, account_status, profile_status, _id} });
  }
  else{
    return res.status(400).json({ message: 'User not found' });
  }
}
