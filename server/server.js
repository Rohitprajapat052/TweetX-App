import 'dotenv/config';
import express from "express"
import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid';
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();

//Schema Imported
import User from "./Schema/User.js";
import Follower from "./Schema/Follower.js";
import Post from "./Schema/Post.js";

app.use(cors())
app.use(express.json());

const port = process.env.PORT || 5000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const mongoURI = process.env.MONGO_URL;
const connectToMongo = () => {
    mongoose.connect(mongoURI, {
        autoIndex: true
    }).then(() => console.log("Connected to MongoDB Atlas Successfully")).catch((err) => console.log(err));

};

mongoose.set('strictQuery', true);
connectToMongo();


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        return res.status(401).json({ error: "No access token" });
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Access token is invalid" });
        }
        req.user = user.id;
        next();
    });
};

const generateUsername = async (email) => {
    let username = email.split("@")[0];
    let isUsernameNotUnique = await User.exists({ "personal_info.username": username }).then((result) => result)
    isUsernameNotUnique ? username += nanoid().substring(0, 4) : "";
    return username;
}
const formatDatatoSend = (user) => {

    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY)


    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}
app.post("/signup", (req, res) => {
    console.log(req.body)
    let { fullname, email, password } = req.body;

    if (fullname.length < 3) {
        return res.status(403).json({ "error": "Fullname must be at least 3 letters long" })
    }
    if (!email.length) {
        return res.status(403).json({ "error": "Enter Email" })
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({ "error": "Email is invalid" })
    }
    if (!passwordRegex.test(password)) {
        return res.status(403).json({ "error": "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters" })
    }
    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUsername(email);
        let user = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        })
        user.save().then((u) => {
            return res.status(200).json(formatDatatoSend(user))
        }).catch(err => {

            if (err.code = 11000) {
                return res.status(500).json({ "error": "Email already exists" })
            }
            return res.status(500).json({ "error": err.message })
        })
    })
})

app.post("/signin", (req, res) => {
    let { email, password } = req.body;

    if (!email.length) {
        return res.status(403).json({ "error": "Enter Email" })
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({ "error": "Email is invalid" })
    }
    User.findOne({ "personal_info.email": email })
        .then((user) => {
            if (!user) {
                return res.status(403).json({ "error": "Email not found" });
            }
            bcrypt.compare(password, user.personal_info.password, (err, result) => {
                if (err) {
                    return res.status(403).json({ "error": "Error occured while login please try again" });
                }
                if (!result) {
                    return res.status(403).json({ "error": "Incorrect Password" });
                } else {
                    return res.status(200).json(formatDatatoSend(user))
                }


            })

        }).catch(err => {
            console.log(err.message);
            return res.status(500).json({ "error": err.message })
        })

})

app.post("/follow", verifyJWT, async (req, res) => {
    try {
        const loggedInUserId = req.user;
        let { target_username } = req.body;

        const targetUser = await User.findOne({ "personal_info.username": target_username });

        if (!targetUser) {
            return res.status(404).json({ error: "Target user not found" });
        }

        const targetUserId = targetUser._id;
        const isFollowing = targetUser.followers.includes(loggedInUserId);

        if (isFollowing) {
            await User.findByIdAndUpdate(loggedInUserId, { $pull: { followings: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $pull: { followers: loggedInUserId } });
            await Follower.findOneAndDelete({ follower: loggedInUserId, following: targetUserId });
        } else {
            await User.findByIdAndUpdate(loggedInUserId, { $push: { followings: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $push: { followers: loggedInUserId } });
            await Follower.create({ follower: loggedInUserId, following: targetUserId });
        }
        const loggedInUser = await User.findByIdAndUpdate(
            loggedInUserId,
            { $inc: { "account_info.total_followings": isFollowing ? -1 : 1 } },
            { new: true }
        );

        const targetUserUpdated = await User.findByIdAndUpdate(
            targetUserId,
            { $inc: { "account_info.total_followers": isFollowing ? -1 : 1 } },
            { new: true }
        );

        return res.status(200).json({
            loggedInUser: {
                total_followings: loggedInUser.account_info.total_followings,
                total_followers: loggedInUser.account_info.total_followers,
            },
            targetUser: {
                total_followings: targetUserUpdated.account_info.total_followings,
                total_followers: targetUserUpdated.account_info.total_followers,
            },
        });
    } catch (error) {
        console.error("Error in follow/unfollow route:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/is-followed-by-user", verifyJWT, async (req, res) => {
    try {
        const loggedInUserId = req.user;
        const { target_username } = req.body; 
        const targetUser = await User.findOne({ "personal_info.username": target_username });

        if (!targetUser) {
            return res.status(200).json(false); 
        }
        const isFollowing = await Follower.exists({ follower: loggedInUserId, following: targetUser._id });

        return res.status(200).json(isFollowing);
    } catch (error) {
        console.error("Error in is-following route:", error);
        return res.status(500).json(false);
    }
});


app.post("/create-post", verifyJWT, async (req, res) => {
    try {
        const { des } = req.body;
        const loggedInUserId = req.user;
        const userExists = await User.exists({ _id: loggedInUserId });
        if (!userExists) {
            return res.status(404).json({ error: "User not found" });
        }
        const newPost = await Post.create({
            des,
            author: loggedInUserId,
        });
        await User.findByIdAndUpdate(loggedInUserId, { $inc: { "account_info.total_posts": 1 } });

        return res.status(201).json(newPost);
    } catch (error) {
        console.error("Error in create-post route:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/feed", verifyJWT, async (req, res) => {
    try {
        const loggedInUserId = req.user;
        const followingUsers = await Follower.find({ follower: loggedInUserId }, "following");
        const followingUserIds = followingUsers.map(user => user.following);
        const feedPosts = await Post.find({ author: { $in: followingUserIds } })
            .populate("author", "personal_info.username personal_info.fullname personal_info.profile_img -_id")
            .sort({ publishedAt: -1 })

        return res.status(200).json({ feedPosts });
    } catch (error) {
        console.error("Error in feed route:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/get-profile", (req, res) => {
    let { username } = req.body;
    User.findOne({ "personal_info.username": username })
        .select("-personal_info.password -updatedAt -posts -followings -followers")
        .then(user => {
            return res.status(200).json(user);
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ error: err.message })
        })
})


app.post("/search-posts", (req, res) => {
    let { author } = req.body;
    let findQuery = {};
    if (author) {
        findQuery = { author }
    }
    Post.find(findQuery)
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "publishedAt": -1 })
        .select("des publishedAt -_id")
        .then(posts => {
            return res.status(200).json({ posts })
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ error: err.message })
        })
})


app.get("/all-users", verifyJWT, async (req, res) => {
    try {
        const loggedInUserId = req.user;

        const allUsers = await User.find({ _id: { $ne: loggedInUserId } })
            .select("personal_info.fullname personal_info.username personal_info.profile_img account_info.total_followers followings")
            .populate("followings", "_id");
        const usersData = allUsers.map(user => {
            const isFollowing = user.followings.some(following => following._id.equals(loggedInUserId));
            return {
                fullname: user.personal_info.fullname,
                username: user.personal_info.username,
                profile_img: user.personal_info.profile_img,
                total_followers: user.account_info.total_followers,
                isFollowing: isFollowing,
            };
        });
        return res.status(200).json({ users: usersData });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/followers', verifyJWT, async (req, res) => {
    try {
        const loggedInUserId = req.user;
        const followers = await Follower.find({ following: loggedInUserId })
            .populate('follower', 'personal_info.username personal_info.fullname personal_info.profile_img account_info.total_followers -_id');

        if (!followers) {
            return res.status(404).json({ error: 'Followers not found' });
        }

        const followersData = followers.map(follower => ({
            _id: follower.follower._id,
            fullname: follower.follower.personal_info.fullname,
            username: follower.follower.personal_info.username,
            profile_img: follower.follower.personal_info.profile_img,
            total_followers: follower.follower.account_info.total_followers,
            isFollowing: true,
        }));
        const loggedInUser = await User.findById(loggedInUserId).lean();
        if (loggedInUser.followings && Array.isArray(loggedInUser.followings)) {
            followersData.forEach(follower => {
                follower.isFollowing = loggedInUser.followings.includes(follower._id);
            });
        }

        res.status(200).json({ users: followersData });
    } catch (error) {
        console.error('Error fetching followers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/followings', verifyJWT, async (req, res) => {
    try {
        const loggedInUserId = req.user;
        const followings = await Follower.find({ follower: loggedInUserId })
            .populate('following', 'personal_info.username personal_info.fullname personal_info.profile_img account_info.total_followers -_id');

        if (!followings) {
            return res.status(404).json({ error: 'Followings not found' });
        }

        const followingsData = followings.map(following => ({
            fullname: following.following.personal_info.fullname,
            username: following.following.personal_info.username,
            profile_img: following.following.personal_info.profile_img,
            total_followers: following.following.account_info.total_followers,
            isFollowing: true, 
        }));

        res.status(200).json({ users: followingsData });
    } catch (error) {
        console.error('Error fetching followings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//server
app.listen(port, () => {
    console.log(`TweetX Backend listening on port ${port}`)
}) 