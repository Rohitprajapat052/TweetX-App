import mongoose, { Schema } from "mongoose";

let profile_imgs_name_list = ["Garfield", "Tinkerbell", "Annie", "Loki", "Cleo", "Angel", "Bob", "Mia", "Coco", "Gracie", "Bear", "Bella", "Abby", "Harley", "Cali", "Leo", "Luna", "Jack", "Felix", "Kiki"];
let profile_imgs_collections_list = ["notionists-neutral", "adventurer-neutral", "fun-emoji"];

const userSchema = mongoose.Schema({

    personal_info: {
        fullname: {
            type: String,
            lowercase: true,
            required: true,
            minlength: [3, 'fullname must be 3 letters long'],
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true
        },
        password: String,
        username: {
            type: String,
            minlength: [3, 'Username must be 3 letters long'],
            unique: true,
        },
        bio: {
            type: String,
            maxlength: [200, 'Bio should not be more than 200'],
            default: "",
        },
        profile_img: {
            type: String,
            default: () => {
                return `https://api.dicebear.com/6.x/${profile_imgs_collections_list[Math.floor(Math.random() * profile_imgs_collections_list.length)]}/svg?seed=${profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)]}`
            } 
        },
    },
    account_info:{
        total_posts: {
            type: Number,
            default: 0
        },
        total_followers: {
            type: Number,
            default: 0
        },
        total_followings: {
            type: Number,
            default: 0
        }
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'users',
    }],
    followings: [{
        type: Schema.Types.ObjectId,
        ref: 'users',
    }],
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'posts',
    }],
}, 
{ 
    timestamps: {
        createdAt: 'joinedAt'
    } 

})

export default mongoose.model("users", userSchema);