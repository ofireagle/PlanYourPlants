const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "You must enter name"],
        trim:true,
        email:true,
        minlength:[2, "Name need to be at least 2 characters"],
        maxlength:[30, "Name cannot be more than 30 characters"]
    },
    email:{
        type:String,
        required:[true, "You must enter email"],
        trim:true,
        unique:[true, "Email already exist in system, try to log in or enter another email"] ,
        validate: [validator.isEmail, "Email not valid"]
    },
    password:{
        type:String,
        trim:true,
        minlength:[8, "must be at least 8 charterts"],
        required:[true, "You must enter password"],
        select:false
    },
    passwordConfirm:{
        type:String,
        trim:true,
        required:[true, "You must confirm password"],
        validate:{
            validator: function(el){
                return el === this.password
            },
            message:"passwords not match, try again"
        },
    },
    phone:{
        type:String,
        trim:true,
        validate:{
            validator: function(v){
                return /\d{3}\d{7}/.test(v);
            },
            message: props => `${props.value} is not a valid phobe number`
        },
        required:[true, "You must enter your phone number"]
    },
    city:{
        type:String,
        required:[true, "You must enter your city"]
    },
    country:{
        type:String,
        required:[true, "You must enter country"]
    },
    role:{
        type:Number,
        default:1
    },
    date_created:{
        type:Date,
        default:Date.now()
    },
    images:Array,
    plants:[{
        type:mongoose.Schema.ObjectId,
        ref:'Plant'
    }],
    newPlants:[{
        type:mongoose.Schema.ObjectId,
        ref:'Plant'
    }],

    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
});

userSchema.pre( 'save', async function ( next )
{
    if ( !this.isModified( 'password' ) ) return next();
    this.password = await bcrypt.hash( this.password, 12 );
    next();
} );
userSchema.pre( 'save', function ( next )
{
    this.passwordConfirm = undefined;
    next();
} );
userSchema.methods.checkPassword = async function ( reqPassword, userPassword )
{
    return await bcrypt.compare( reqPassword, userPassword );
};
userSchema.methods.createPasswordResetToken = function ()
{
    const resetToken = crypto.randomBytes( 32 ).toString( 'hex' );
    this.passwordResetToken = crypto.createHash( 'sha256' )
        .update( resetToken )
        .digest( 'hex' );

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const User = mongoose.model( 'User', userSchema );
module.exports = User;