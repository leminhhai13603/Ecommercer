const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const { ObjectId } = mongoose.Schema.Types.ObjectId;
const crypto = require('crypto');

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:"user",
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    cart:{
        type:Array,
        default:[],
    },
    address:{
        type:String,
    },
    // wishlist:[{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"Product",
    // }],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    timestamps: true
});

userSchema.pre('save', async function(next){
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    console.log('Mật khẩu nhập vào:', enteredPassword);
    console.log('Mật khẩu đã mã hóa trong DB:', this.password);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Kết quả so sánh:', isMatch);
    return isMatch;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 
    return resetToken;
};

//Export the model
module.exports = mongoose.model('User', userSchema);