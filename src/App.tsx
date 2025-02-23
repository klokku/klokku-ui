import {BrowserRouter} from "react-router-dom";
import AppRoutes from "@/pages/AppRoutes.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AppRoutes/>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App
