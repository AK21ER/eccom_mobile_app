import { HeaderShownContext } from "@react-navigation/elements";
import { Stack } from "expo-router";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import {QueryClientProvider,QueryClient} from "@tanstack/react-query"
import "../global.css"

const queryClient = new QueryClient()

export default function RootLayout() {
  return 
<ClerkProvider tokenCache={tokenCache}>
<QueryClientProvider client={queryClient}>
    <Stack  screenOptions={{headerShown : false}}/>
    </QueryClientProvider>
    </ClerkProvider>  ;
}
