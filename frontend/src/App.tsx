
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {Dashboard} from "../src/pages/Dashboard";
import {Header} from "@/components/Header.tsx";
import {Login} from "@/pages/Login.tsx";
import {PublicRoutes} from "@/router/PublicRoutes.tsx";
import {PrivateRoutes} from "@/router/PrivateRoutes.tsx";

function App() {

    return (
        <Router>
            <Header/>
            <main>
                <Routes>
                    <Route element={<PublicRoutes/>}>
                        <Route path="/" element={<Login />} />
                    </Route>
                    <Route element={<PrivateRoutes/>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Route>
                </Routes>
            </main>
        </Router>
  )
}

export default App
