const User = require('../models/usersModel');
const jwt = require('jsonwebtoken');
const asyncWrapper = require('../middleware/async');
const { createCustomError } = require('../middleware/custom-error');
const { promisify } = require('util');
const crypto = require('crypto')
const sendEmail = require('../middleware/email');


const filterObj = (obj, ...allowedFields) => {
    const filteredObj = {}
    Object.keys(obj).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredObj[key] = obj[key]
      }
      else{
        return false;
      }
    })
    return filteredObj;
  }

const signToken = (id, email) =>{
    return jwt.sign({id, email}, process.env.JWT_SECRET, {expiresIn:process.env.JWT_EXPIRES})
};

const createAndSendToken = (user, statusCode, res) => {
    const token = signToken(user._id, user.email);
    
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_EXPIRES.replace('d','') * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true
    }
    
    res.cookie('jwt', token, cookieOptions)

    //console.log(user);
    user
    res.status(statusCode).json({
    status: 'success',
    details:user,
    token
  })
};

exports.signUp = asyncWrapper(async(req, res, next )=>{
    const data = filterObj(req.body, 'name', 'email', 'password', 'passwordConfirm', 'phone', 'city', 'country')
    if(!data){
        return next(createCustomError("Bad data insert !!!!!!!", 404));
    }
    const user = await User.create(data)
    createAndSendToken(user, 200, res)
});

exports.login = asyncWrapper(async(req, res, next )=>{
    const {email, password} = req.body
    if(!email || !password){
        return next(createCustomError('must enter email and password !', 404));
    }
    const user = await User.findOne({email}).select('+password')
    if(!user){
        return next(createCustomError("user does not exist", 404));
    }
    const decoded = await user.checkPassword(password ,user.password)
    if(!decoded){
        return next(createCustomError("password or email not match", 404));
    }
    createAndSendToken(user, 200, res);
});

exports.protect = asyncWrapper(async(req, res, next) =>{
    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')){
        return next(createCustomError('Please login', 403));
    }
    const token = req.headers.authorization.split(' ')[1];
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    if(!decoded){
        return next(createCustomError('token not valid', 403));
    }
    //console.log(decoded.id);
    const user = await User.findById(decoded.id);
    if(!user){
        return next(createCustomError('somthing went wrong, try again', 403));
    }
    req.user = user;

    next();
});

exports.forgotPassword = asyncWrapper(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) return next(createCustomError("We havent found user with this email",404));
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false });
    // console.log("user -- ",user);
    // const resetUrl = `${req.protocol}://${req.get('host')}/users/resetPassword/${resetToken}`;
    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
    const resetForm = `http://localhost:3000/resetPassword?token=${resetToken}`;

    // console.log(resetUrl);
  
    const message1 = `Please follow this link to reset your password. The link is valid for 10 min ${resetForm}`
    const message = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Password Reset</title>
        <style>
          body {
            background-color: #f2f2f2;
            color: #333333;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            font-size: 24px;
            font-weight: bold;
            margin-top: 0;
          }
          p {
            font-size: 16px;
            line-height: 1.5;
            margin: 0 0 20px;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3869D4;
            color: #ffffff;
            text-decoration: none;
            border-radius: 3px;
          }
          .button:hover {
            background-color: #224699;
          }
          .text-center {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hi ${user.name},</h1>
          <p>You recently requested to reset your password for your account. Use the button below to reset it. This password reset is only valid for the next 10 minutes.</p>
          <p class="text-center">
            <a href="${resetForm}" class="button" style="color: #ffffff;">Reset Your Password</a>
          </p>
          <p>For security reasons, do not share this address with anyone. If you didn't request a password reset, please ignore this email.</p>
          <p>Thanks,<br>The Plan your plants team</p>
          <p>If you're having trouble with the button above, copy and paste the following URL into your web browser:</p>
          <p>${resetForm}</p>
        </div>
      </body>
    </html>
    `;
    try {
      await sendEmail({
        emailTo: user.email,
        subject: 'Password reset link',
        html: message
      })
      res.status(200).json({
        status: 'success',
        message: `Token sent to email ${user.email}`,
        resetUrl:resetUrl
      })
    }
    catch (err) {
      return next(createCustomError('There was a problem sending email', 500))
    }
})
  
exports.resetPassword = asyncWrapper(async (req, res, next) => {
    const passwordResetToken = crypto.createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    const user = await User.findOne(
        {
        passwordResetToken: passwordResetToken,
        passwordResetExpires: { $gt: Date.now() }
        }
    );
    if (!user) return next(createCustomError('Password reset link invalid or expired', 400))
    user.password = req.body.password,
    user.passwordConfirm = req.body.passwordConfirm,
    user.passwordResetToken = undefined,
    user.passwordResetExpires = undefined

    await user.save()
    createAndSendToken(user, 200, res);
})