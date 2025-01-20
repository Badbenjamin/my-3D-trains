
import {ReactDOM, createRoot} from 'react-dom/client';
import { createBrowserRouter, RouterProvider} from 'react-router-dom';

import MapExpierience from './MapExperience.jsx';
import ErrorElement from './ErrorElement.jsx';
import App from './App.jsx'
import './index.css'



const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: "/",
        element: <MapExpierience />
      },
      // {
      //   path:"/journeyplanner",
      //   element: <JourneyPlanner/>
      // }
      // {
      //   path: "/login",
      //   element: <Login />
      // },
      // {
      //   path:"/profile",
      //   element: <Profile/>
      // },
      // {
      //   path: "/signup",
      //   element: <SignUp/>
      // }
    ]
  }
])

const root = createRoot(document.getElementById('root'));

root.render(<RouterProvider router={router} />);