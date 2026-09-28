
import { useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FaSearch,
  FaSignInAlt,
} from "react-icons/fa";

import api from "../services/api";

import {
  saveAuth,
} from "../services/auth";

import Navbar from "../components/Navbar";


function Login() {

  
 

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  

  const navigate =
    useNavigate();

  const location =
    useLocation();




  const searchParams =
    new URLSearchParams(
      location.search
    );


  const sessionExpired =
    searchParams.get(
      "sessionExpired"
    ) === "true";


 

  const sessionExpiredFrom =
    sessionStorage.getItem(
      "sessionExpiredFrom"
    );


  const protectedRouteFrom =
    location.state?.from;


  const redirectTo =
    sessionExpiredFrom ||
    protectedRouteFrom ||
    null;




  const handleSubmit =
    async (event) => {

    
      event.preventDefault();


   
      setError("");



      if (
        !username.trim() ||
        !password
      ) {

        setError(
          "Please enter both username and password."
        );

        return;
      }


      setLoading(true);


      try {

      

        const response =
          await api.post(
            "/auth/login",
            {
              username,
              password,
            }
          );


       

        saveAuth(
          response.data.token,
          response.data.user
        );


       

        if (
          redirectTo &&
          !redirectTo.startsWith("/login")
        ) {

          sessionStorage.removeItem(
            "sessionExpiredFrom"
          );


          navigate(
            redirectTo,
            {
              replace: true,
            }
          );


          return;
        }


       

        const role =
          response.data.user.role;


        if (role === "admin") {

          navigate(
            "/admin",
            {
              replace: true,
            }
          );

        } else {

          navigate(
            "/student",
            {
              replace: true,
            }
          );
        }


      } catch (error) {


        if (
          error.response?.status === 401
        ) {

          setError(
            "Invalid username or password"
          );


        } else if (
          error.response
        ) {

          setError(
            error.response.data?.message ||
            `Login failed (status ${error.response.status})`
          );


        } else {

         

          setError(
            "Cannot reach the server. Please check that the backend is running on http://localhost:3000"
          );
        }

      } finally {

        setLoading(false);
      }
    };



  return (

    <>

      <Navbar />


      <div className="login-container">

        <h1>
          Login
        </h1>


        <p className="login-subtitle">
          Sign in to enroll in courses.
        </p>


      

        {sessionExpired && (

          <div
            className="session-expired-message"
            role="alert"
          >

            Your session has expired.
            Please log in again.

          </div>

        )}


    
        <form
          onSubmit={handleSubmit}
        >


          

          <div className="form-group">

            <label htmlFor="username">
              Username
            </label>


            <input
              id="username"
              type="text"
              value={username}

              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }

              placeholder="Enter username"

              autoComplete="username"

              disabled={loading}
            />

          </div>


         

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>


            <input
              id="password"
              type="password"
              value={password}

              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }

              placeholder="Enter password"

              autoComplete="current-password"

              disabled={loading}
            />

          </div>


       

          {error && (

            <p
              className="error"
              role="alert"
            >
              {error}
            </p>

          )}


       

          <button
            type="submit"

            className="btn btn-primary btn-block"

            disabled={loading}
          >

            <FaSignInAlt />

            {loading
              ? "Logging in..."
              : "Login"}

          </button>


        </form>


        

        <p className="login-footer">

          Not sure where to go?{" "}

          <Link to="/courses">

            <FaSearch />

            {" "}Browse the courses

          </Link>{" "}

          first.

        </p>


      </div>

    </>
  );
}


export default Login;

