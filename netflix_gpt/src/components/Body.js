import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Login from "./Login";
import Browse from "./Browse";
import { ROUTE } from "../utils/constant";

const Body = () => {
  const router = createBrowserRouter([
    {
      path: ROUTE.LOGIN,
      element: <Login />,
    },
    {
      path: ROUTE.BROWSE,
      element: <Browse />,
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default Body;
