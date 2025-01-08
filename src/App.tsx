import './App.css';
import { QueryClient, QueryClientProvider } from "react-query";
import { VoiceRecorderOpusCodec } from "./VoiceRecorderOpusCodec.tsx";

const queryClient = new QueryClient();

export const App = () => {
    return <QueryClientProvider client={queryClient}>
        <VoiceRecorderOpusCodec />
    </QueryClientProvider>
}
