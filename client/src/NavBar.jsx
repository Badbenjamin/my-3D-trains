import { NavLink } from "react-router-dom"

function NavBar({user}) {

    return(
        <nav className="navbar">
                  <NavLink to="/" style={{ textDecoration: 'none' }}>MAP</NavLink>
                     <>      </>
                  {/* <NavLink to="/login" style={{ textDecoration: 'none' }}>LOGIN</NavLink> */}
                  <NavLink to="/journeyplanner" style={{ textDecoration: 'none' }}>Commute Planner</NavLink>
        </nav>
    )
    
}

export default NavBar