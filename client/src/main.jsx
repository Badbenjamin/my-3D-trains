import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MapExpierience from './MapExperience.jsx';
import ErrorElement from './ErrorElement.jsx';
import App from './App.jsx'
import './index.css'
import JourneyPlanner from './JourneyPlanner.jsx';

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

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
      {
        path:"/journeyplanner",
        element: <JourneyPlanner/>
      }
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

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<RouterProvider router={router} />);