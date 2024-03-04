import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export const PublicRoutes = () => {
    const { user } = useAuth();
    return user ? <Navigate to="/dashboard"/> : <Outlet/>
};