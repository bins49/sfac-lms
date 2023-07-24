"use client";
import { store } from "@/redux/store";
import { ReactNode, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import RequireAuth from "@/components/RequireAuth/RequireAuth";

const Provider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ReduxProvider store={store}>
        <RequireAuth>{children}</RequireAuth>
      </ReduxProvider>
    </QueryClientProvider>
  );
};

export default Provider;
