import './App.css';
import {QueryClient, QueryClientProvider} from "react-query";
import {AudioRecorder} from "./VoiceRecorder.tsx";

const queryClient = new QueryClient();

export const App = () => {
    return <QueryClientProvider client={queryClient}>
        <AudioRecorder />
    </QueryClientProvider>
}
