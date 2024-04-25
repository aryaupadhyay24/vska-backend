const mongoose=require('mongoose')
const { Schema } = mongoose;

const UserSchema=new Schema({
    name:  {type:String,
            required:true
        },
    email: {type:String,
            required: true,
            unique:true
        },
    
    password:   {type:String, 
                required:true
            },

    date:{type:String,
        default:Date.now
    },
    isAdmin: {
        type: String,
        default: "false" // Default value is false
    },
    certificates: [{
        type: Schema.Types.ObjectId,
        ref: 'Certificate'
    }]

});
const user=mongoose.model('userData',UserSchema)
// here user is nawm of the model  and data will stored in tavble/collection  named userdatas
module.exports=user