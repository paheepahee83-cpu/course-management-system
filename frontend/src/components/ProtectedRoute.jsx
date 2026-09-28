
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  getUser,
  getToken,
} from "../services/auth";


function ProtectedRoute({
  children,
  role,
}) {

  const location =
    useLocation();

  const navigate =
    useNavigate();


  const token =
    getToken();

  const user =
    getUser();


 

  if (!token || !user) {

    return (

      <Navigate
        to="/login"

        state={{
          from:
            location.pathname +
            location.search +
            location.hash,
        }}

        replace
      />

    );
  }


  

  if (
    role &&
    user.role !== role
  ) {

    return (

      <div className="access-denied-container">

        <div className="access-denied-content">

          <h1>
            Access Denied
          </h1>


          <p>
            Access denied. You do not have
            permission to access this page.
          </p>


          <button
            type="button"

            className="btn btn-primary"

            onClick={() =>
              navigate(-1)
            }
          >
            Go Back
          </button>

        </div>

      </div>

    );
  }




  return children;
}


export default ProtectedRoute;

