// import { createContext } from "react";

// export const AppContext = createContext();
// export const AppContextProvider = (props)=>{
//     const value ={}
//     return( 
//          <AppContext.Provider value = {value}>
//             {props.children}
//          </AppContext.Provider>)
// }

import { createContext, useContext, useState } from "react";

// Create Context
export const AppContext = createContext();

// Create a Provider Component
export const AppContextProvider = ({ children }) => {
    // Define user state
    const [user, setUser] = useState(null);  // Initially, no user is logged in

    // Function to update user
    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AppContext.Provider value={{ user, login, logout }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom Hook to Use the Context
export const useUser = () => {
    return useContext(AppContext);
};
