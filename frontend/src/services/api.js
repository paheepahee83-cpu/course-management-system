
import axios from "axios";
import {
  clearAuth,
  getToken,
} from "./auth";




const api = axios.create({
  baseURL: "http://localhost:3000/api",
});




api.interceptors.request.use(
  (config) => {

    const token = getToken();

    if (token) {

      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);



let isRedirectingToLogin = false;


api.interceptors.response.use(

  (response) => {
    return response;
  },




  (error) => {

 

    if (!error.response) {

      return Promise.reject(error);
    }


    const status =
      error.response.status;


  

    if (status === 401) {

      const requestUrl =
        error.config?.url || "";


     

      const isLoginRequest =
        requestUrl.includes("/auth/login");


      if (!isLoginRequest) {

     

        if (!isRedirectingToLogin) {

          isRedirectingToLogin = true;


         

          const currentPath =
            window.location.pathname +
            window.location.search +
            window.location.hash;


   
          if (
            currentPath &&
            currentPath !== "/login"
          ) {

            sessionStorage.setItem(
              "sessionExpiredFrom",
              currentPath
            );
          }


      

          clearAuth();


    

          window.location.href =
            "/login?sessionExpired=true";
        }
      }
    }


    


    return Promise.reject(error);
  }
);


export default api;

