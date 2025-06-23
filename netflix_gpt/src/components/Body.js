import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Login from "./Login";
import Brows from "./Brows";

const Body = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/brows",
      element: <Brows />,
    },
  ]);
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default Body;
