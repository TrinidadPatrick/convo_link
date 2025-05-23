const jwt = require("jsonwebtoken");
const publicRoutes = ['/login', '/signup', '/verifyEmail', '/verifyOtp', '/resendOtp',
  '/forgotPassword', '/verifyFpyOTP', '/resetPassword', '/createUser', '/keepAlive']


const protectedRoutes = ['/getUserProfile', '/getPeopleRecommendations', '/getPeopleRecommendations_v2', '/requestFriendship',
  '/getFriendships', '/respondFriendship', '/logout', '/getFriendRequests', '/getFriends', '/getConversations', '/sendMessage',
  "/getConversationList", "/readConversation", "/updateAddress", "/changeEmail", "/verifyChangeEmailOTP", "/changePassword", "/changeProfileImage",
  "/updateBio", "/updateHobbies", "/cancelFriendship"
]

const middleware = (req, res, next) => {

  const isProtectedRoutes = protectedRoutes.some(route => {
    const routeRegex = new RegExp(`^${route.replace(/:\w+/g, '\\w+')}$`);
    return routeRegex.test(req.path);
  });
  const isPublicRoutes = publicRoutes.includes(req.url)
  // If no cookie is present
  if (isPublicRoutes) {
    next()
  }
  // If is protected route
  else if (isProtectedRoutes) {
    // If cookie is present
    if (req.cookies.user_token && req.cookies.user_token != '') {
      // Verify the token
      jwt.verify(req.cookies.user_token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          return res.status(401).json({ message: 'Unauthorized' })
        }
        req.user = user; // Attach user info to request
        next()
      })
    }
    // If cookie is not present
    else {
      return res.status(401).json({ message: 'Unauthorized' })
    }

  }
}

module.exports = middleware;