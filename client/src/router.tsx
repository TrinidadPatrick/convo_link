import { createBrowserRouter } from "react-router-dom";
import UserLayout from "./UserLayout/UserLayout";
import GuestLayout from "./GuestLayout/GuestLayout";
import SignupForm from "./Components/Signup/SignupForm";
import SignupEmailVerification from "./Components/Signup/SignupEmailVerification";
import SigninForm from "./Components/Signin/SigninForm";
import ForgotPassword from "./Components/ForgorPassword/ForgotPassword";
import UserProfile from "./Views/UserProfileView/UserProfile";
import FindFriends from "./Views/FriendLists/FriendLists";
import FriendLists from "./Views/FriendLists/FriendLists";
import Friends from "./Views/FriendLists/Friends";
import FriendRecommendations from "./Views/FriendLists/FriendRecommendations";

const router : any = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        path: "/",
        element: <div>Homes</div>
      },
      {
        path: "/about",
        element: <div>About</div>
      },
      {
        path: "/contact",
        element: <div>Contact</div>
      },
      {
        path: "/profile",
        element: <UserProfile />
      },
      {
        path: "/findPeople",
        element: <FriendRecommendations />
      },
    ],
  },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "/signin",
        element: <SigninForm />
      },
      {
        path: "/signup",
        element: <SignupForm />
      },
      {
        path: "/verifyEmail/:email",
        element: <SignupEmailVerification />
      },
      {
        path: "/forgotPassword",
        element: <ForgotPassword />
      },
    ],
  }
]);

export default router;