const User = require("../Models/userModel");
const Friendship = require("../Models/FriendShipModel");

module.exports.getPeopleRecommendations = async (req,res) => {
    const friends = await User.find({_id : {$ne : req.user._id}}).select('_id firstname lastname profileImage userBio profile_status').limit(50);
    return res.status(200).json({ message: 'People recommendations fetched', friends });    
}

module.exports.requestFriendship = async (req,res) => {
    // User 2 is the initiator
    // User 1 is the friend/requested friend
    const {userId} = req.body;
    const friendShip = await Friendship.create({user1 : userId, user2 : req.user._id, initiator : req.user._id});
    return res.status(200).json({ message: 'Friendship request sent', friendShip });
}

module.exports.getFriendships = async (req,res) => {
    const friendships = await Friendship.find({$or : [{user2 : req.user._id}, {user1 : req.user._id}]}).select('_id user2 user1 status initiator').limit(50);
    return res.status(200).json({ message: 'Friendships fetched', friendships });
}   

module.exports.respondFriendship = async (req,res) => {
    const {_id, status} = req.body;
    const friendship = await Friendship.findById(_id);
    if(friendship)
    {
        await Friendship.findByIdAndUpdate(friendship._id, {status : status});
        return res.status(200).json({ message: 'Friendship status updated', friendship });
    }
    else
    {
        return res.status(400).json({ message: 'Friendship not found' });
    }
}