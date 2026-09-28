


const TOKEN_KEY = "token";
const USER_KEY = "user";



export function saveAuth(token, user) {

  localStorage.setItem(
    TOKEN_KEY,
    token
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}



export function getToken() {

  return localStorage.getItem(
    TOKEN_KEY
  );
}




export function getUser() {

  const userJson =
    localStorage.getItem(USER_KEY);


  if (!userJson) {

    return null;
  }


  try {

    return JSON.parse(userJson);

  } catch (error) {

    console.error(
      "Could not read user from localStorage:",
      error.message
    );

    return null;
  }
}



export function clearAuth() {

  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
}




export function isLoggedIn() {

  return Boolean(
    getToken() &&
    getUser()
  );
}




export function getUserRole() {

  const user =
    getUser();

  return user
    ? user.role
    : null;
}




export function isAdmin() {

  return getUserRole() === "admin";
}




export function isStudent() {

  return getUserRole() === "student";
}

