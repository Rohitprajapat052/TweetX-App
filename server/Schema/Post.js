import mongoose, { Schema } from "mongoose";

const postSchema = mongoose.Schema({
    des: {
        type: String,
        maxlength: 400,
        // required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    }
}, 
{ 
    timestamps: {
        createdAt: 'publishedAt'
    } 

})

export default mongoose.model("posts", postSchema);