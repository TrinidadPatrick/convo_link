const User = require("../Models/userModel");
const Friendship = require("../Models/FriendShipModel");

module.exports.getPeopleRecommendations = async (req,res) => {
    const searchValue = req.query.searchValue;
    let peopleRecommendation;

    if (!searchValue) {
    // Fetch default recommendations (e.g., random users, popular users, etc.)
    peopleRecommendation = await User.find({ _id: { $ne: req.user._id } })
        .select('_id firstname lastname profileImage userBio profile_status Address hobbies')
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
    .select('_id firstname lastname profileImage userBio profile_status Address hobbies')
    .limit(50);
    }
    return res.status(200).json({ message: 'People recommendations fetched', peopleRecommendation });    
}

module.exports.getPeopleRecommendations_v2 = async (req, res) => {
    const searchValue = req.query.searchValue;
    let peopleRecommendation;

    try {
        // Fetch all friendships cuRrent user
        const friendships = await Friendship.find({
            $or: [
                { participants: req.user._id }, // Friends
                { initiator: req.user._id,  } // Sent requests
            ]
        });

        // Extract ID of friends
        const friendIds = friendships.flatMap(friendship => 
            friendship.participants.filter(participant => 
                participant.toString() !== req.user._id.toString() &&
                friendship.status === 'accepted'
            )
        ).map(participant => participant._id.toString());

        // Extract IDs of users who received requests from the current user
        const sentRequestIds = friendships
            .filter(friendship => friendship.initiator.toString() === req.user._id.toString() &&
            friendship.status === 'pending')
            .flatMap(friendship => 
                friendship.participants.filter(participant => participant.toString() !== req.user._id.toString()) 
            )
            .map(participant => participant.toString());

            // Extracts IDS of the users who sent requests to the current user
            const acceptRequestIds = friendships
            .filter(friendship => friendship.initiator.toString() !== req.user._id.toString() &&
            friendship.status === 'pending')
            .flatMap(friendship => 
                friendship.participants.filter(participant => participant.toString() !== req.user._id.toString()) 
            )
            .map(participant => participant.toString());

            const excludeIds = [...new Set([...friendIds, ...acceptRequestIds])];

        // Fetch users who are not friends and who have received requests
        if (!searchValue) {
            result = await User.find({
                _id: { $ne: req.user._id, $nin: excludeIds }
                
            }).select('_id firstname lastname profileImage userBio profile_status Address hobbies')
            .limit(50);
             peopleRecommendation = result.map((person)=> {
                return {
                    ...person.toObject(),
                    hasSentRequest : sentRequestIds.includes(person._id.toString()),
                }
            })
            
        } else {
            // Search query that respects the same criteria
            result = await User.find({
                _id: { $ne: req.user._id, $nin: excludeIds },
                $or: [
                    { firstname: { $regex: searchValue, $options: 'i' } },
                    { lastname: { $regex: searchValue, $options: 'i' } }
                ]
            })
            .select('_id firstname lastname profileImage userBio profile_status Address hobbies')
            .limit(50);
             peopleRecommendation = result.map((person)=> {
                return {
                    ...person.toObject(),
                    hasSentRequest : sentRequestIds.includes(person._id.toString()),
                }
            })
        }

        return res.status(200).json({ message: 'People recommendations fetched', peopleRecommendation  });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.getFriendRequests = async (req, res) => {
    const searchValue = req.query.searchValue;
    let friendRequests
    try {
        if (!searchValue) {
             friendRequests = await Friendship.find({
                initiator : {$ne : req.user._id},
                status : 'pending'
            }).populate("initiator", "firstname lastname profileImage userBio profile_status Address hobbies")
            .limit(50);
        }
        else
        {
            const users = await User.find({
                $or: [
                    { firstname: { $regex: searchValue, $options: 'i' } },
                    { lastname: { $regex: searchValue, $options: 'i' } }
                ]
            });

            const userIds = users.map(user => user._id);


             friendRequests = await Friendship.find({
                initiator: { $ne: req.user._id },
                status: 'pending',
                participants: { $in: userIds } // Use $in to match any of the user IDs
            }).populate("initiator", "firstname lastname profileImage userBio profile_status Address hobbies")
            .limit(50);
        }
       
        
        return res.status(200).json({message: 'Friend requests fetched', friendRequests});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.getFriends = async (req,res) => {
    const searchValue = req.query.searchValue;
    const userId = req.user._id;
    const friendShips = await Friendship.find({participants : {$in : [userId]}, status : 'accepted'}).select('_id participants status initiator')
    
    const friendIds = friendShips.flatMap(friendship => 
        friendship.participants.filter(participant => 
            participant.toString() !== req.user._id.toString() &&
            friendship.status === 'accepted'
        )
    ).map(participant => participant._id.toString());

    const friends = await User.find({
        _id : {$in : friendIds},
        $or: [
            { firstname: { $regex: searchValue, $options: 'i' } },
            { lastname: { $regex: searchValue, $options: 'i' } }
        ]
    }).select('_id firstname lastname profileImage userBio profile_status Address hobbies')
    return res.status(200).json({ message: 'Friends fetched', friends : friends });
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

module.exports.cancelFriendship = async (req, res) => {
    const {_id}  = req.query; //id of the user to be cancelled
    const userId = req.user._id;
    // Get friendship where participants is _id and userId
    const friendship = await Friendship.findOne({participants : {$all : [userId, _id]}, status : 'pending'})
    // delete the friendship
    if(friendship)
    {
        await Friendship.findByIdAndDelete(friendship._id);
        return res.status(200).json({ message: 'Friendship cancelled' });
    }
    else
    {
        return res.status(400).json({ message: 'Friendship not found' });
    }
}