import {BrowserRouter} from "react-router-dom";
import AppRoutes from "@/pages/AppRoutes.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner"
import {PwaProvider} from "@/components/pwa/PwaProvider";
import {OfflineBoundary} from "@/components/pwa/OfflineBoundary";
import {UpdateNotice} from "@/components/pwa/UpdateNotice";

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <OfflineBoundary onReconnected={() => { void queryClient.invalidateQueries(); }}>
                <PwaProvider>
                    <BrowserRouter>
                        <AppRoutes/>
                        <Toaster />
                    </BrowserRouter>
                    <UpdateNotice/>
                </PwaProvider>
            </OfflineBoundary>
        </QueryClientProvider>
    );
}

export default App
