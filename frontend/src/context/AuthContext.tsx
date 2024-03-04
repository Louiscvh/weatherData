import {createContext, useContext, useState, useEffect, PropsWithChildren} from 'react';
import {useLocalStorage} from "../hooks/useLocalStorage";
import {User} from "../types/user.type";
import {decodeToken} from "../utils";

interface AuthContextProps {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);
export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const {getItem, setItem, removeItem} = useLocalStorage();
    useEffect(() => {
        const storedUser = getItem('user');
        if (storedUser) {
            setUser(decodeToken(storedUser));
        }
        setLoading(false);
    }, []);


    const login = (token: string) => {
        setUser(decodeToken(token));
        setItem('user', token);
    };

    const logout = () => {
        setUser(null);
        removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};