import { createBrowserRouter } from "react-router-dom";
import UserLayout from "./UserLayout/UserLayout";
import GuestLayout from "./GuestLayout/GuestLayout";
import SignupForm from "./Components/Signup/SignupForm";
import SignupEmailVerification from "./Components/Signup/SignupEmailVerification";

const router : any = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        path: "/",
        element: <SignupForm />
      },
      {
        path: "/about",
        element: <div>About</div>
      },
      {
        path: "/contact",
        element: <div>Contact</div>
      },
    ],
  },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "/signin",
        element: <div>Login</div>
      },
      {
        path: "/signup",
        element: <SignupForm />
      },
      {
        path: "/verifyEmail/:email",
        element: <SignupEmailVerification />
      },
    ],
  }
]);

export default router;