import './App.css';
import {QueryClient, QueryClientProvider} from "react-query";
import {VoiceRecorder} from "./VoiceRecorder.tsx";

const queryClient = new QueryClient();

export const App = () => {
    return <QueryClientProvider client={queryClient}>
        <VoiceRecorder />
    </QueryClientProvider>
}
