// src/hooks/use-api.ts
import { useState, useEffect } from 'react';
import { AxiosResponse, AxiosError } from 'axios';
import { apiClient, handleApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface UseApiOptions {
  showToast?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(
  apiCall: () => Promise<AxiosResponse<T>>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      setData(response.data);
      
      if (options.onSuccess) {
        options.onSuccess(response.data);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = handleApiError(err as AxiosError);
      setError(errorMessage);
      
      if (options.showToast !== false) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    execute,
    setData,
  };
}