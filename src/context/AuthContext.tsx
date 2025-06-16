import React, { createContext, useState, useEffect, useContext } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface AuthContextType {
user: FirebaseAuthTypes.User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

useEffect(() => {
const subscriber = auth().onAuthStateChanged(setUser);
return subscriber; // unsubscribe on unmount
}, []);

return (
<AuthContext.Provider value={{ user }}>
{children}
</AuthContext.Provider>
);
};

export const useAuth = () => useContext(AuthContext);