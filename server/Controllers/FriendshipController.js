const User = require("../Models/userModel");
const Friendship = require("../Models/FriendshipModel");

module.exports.getPeopleRecommendations = async (req,res) => {
    const searchValue = req.query.searchValue;
    console.log(searchValue)
    let peopleRecommendation;

    if (!searchValue) {
    // Fetch default recommendations (e.g., random users, popular users, etc.)
    peopleRecommendation = await User.find({ _id: { $ne: req.user._id } })
        .select('_id firstname lastname profileImage userBio profile_status')
        .limit(50);
    } else {
    // Perform the search query
    peopleRecommendation = await User.find({
        _id: { $ne: req.user._id },
        $or: [
        { firstname: { $regex: searchValue, $options: 'i' } },
        { lastname: { $regex: searchValue, $options: 'i' } }
        ]
    })
    .select('_id firstname lastname profileImage userBio profile_status')
    .limit(50);
    }
    return res.status(200).json({ message: 'People recommendations fetched', peopleRecommendation });    
}

module.exports.requestFriendship = async (req,res) => {
    const {userId} = req.body;
    const friendShip = await Friendship.create({participants : [userId, req.user._id], initiator : req.user._id});
    return res.status(200).json({ message: 'Friendship request sent', friendShip });
}

module.exports.getFriendships = async (req,res) => {
    const userId = req.user._id;
    const friendships = await Friendship.find({participants : {$in : [userId]}}).select('_id participants status initiator').limit(50);
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