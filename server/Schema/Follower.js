import mongoose, { Schema } from "mongoose";

const followerSchema = mongoose.Schema({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
},
{
  timestamps: true,
});

export default mongoose.model("followers", followerSchema);
