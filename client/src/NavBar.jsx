import { NavLink } from "react-router-dom"

function NavBar({user}) {

    // console.log(user)

    // if (!user) {
    //     return (
    //         <nav className="navbar">
    //             <NavLink to="/" style={{ textDecoration: 'none' }}>HOME</NavLink>
    //             <>      </>
    //             <NavLink to="/login" style={{ textDecoration: 'none' }}>LOGIN</NavLink>
    //         </nav>
    //     )
    // } else if (user) {
    //     return(
    //     <nav className="navbar">
    //         <NavLink to="/" style={{ textDecoration: 'none' }}>HOME</NavLink>
    //         <>      </>
    //         <NavLink to="/profile" style={{ textDecoration: 'none' }}>PROFILE</NavLink>
    //     </nav>
    //     )
    // }

    return(
        <nav className="navbar">
                  <NavLink to="/" style={{ textDecoration: 'none' }}>HOME</NavLink>
                     <>      </>
                  {/* <NavLink to="/login" style={{ textDecoration: 'none' }}>LOGIN</NavLink> */}
                  <NavLink to="/journeyplanner" style={{ textDecoration: 'none' }}>Journey Planner</NavLink>
        </nav>
    )
    
}

export default NavBar