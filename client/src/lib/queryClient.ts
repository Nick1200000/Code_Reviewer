import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorData: any;
    
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await res.json();
      } else {
        // If not JSON, get as text
        errorData = await res.text();
      }
    } catch (e) {
      // If JSON parsing fails, use status text
      errorData = res.statusText;
    }
    
    // Create a custom error with the response data
    const error: any = new Error(
      typeof errorData === 'string' ? errorData : errorData.message || `${res.status}: ${res.statusText}`
    );
    
    // Attach the full response and parsed data to the error
    error.status = res.status;
    error.response = { 
      status: res.status,
      statusText: res.statusText,
      data: errorData
    };
    
    throw error;
  }
}

export async function apiRequest(
  url: string,
  requestOptions?: RequestInit,
  responseType: "json" | "text" | "blob" = "json"
): Promise<any> {
  const options: RequestInit = {
    credentials: "include",
    ...requestOptions
  };

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  
  // Return based on responseType
  if (responseType === "json") {
    return res.json();
  } else if (responseType === "text") {
    return res.text();
  } else if (responseType === "blob") {
    return res.blob();
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
