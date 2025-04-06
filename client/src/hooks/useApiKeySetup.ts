import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function useApiKeySetup() {
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [currentApiKeyService, setCurrentApiKeyService] = useState<{
    name: string;
    envVar: string;
  }>({ name: '', envVar: '' });
  const { toast } = useToast();

  const openApiKeyDialog = (serviceName: string, envVarName: string) => {
    setCurrentApiKeyService({ name: serviceName, envVar: envVarName });
    setIsApiKeyDialogOpen(true);
  };

  const closeApiKeyDialog = () => {
    setIsApiKeyDialogOpen(false);
  };

  const saveApiKey = async (apiKey: string) => {
    try {
      // This endpoint would need to be implemented on the server
      await apiRequest('/api/config/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: currentApiKeyService.envVar,
          value: apiKey
        }),
      });

      toast({
        title: 'API Key Saved',
        description: `Your ${currentApiKeyService.name} API key has been saved successfully.`,
      });

      return true;
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: 'Error Saving API Key',
        description: 'There was a problem saving your API key. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Handle an error response that indicates a missing API key
  const handleMissingApiKey = (error: any) => {
    if (error?.response?.data?.missingKey === 'HUGGINGFACE_API_KEY') {
      openApiKeyDialog('Hugging Face', 'HUGGINGFACE_API_KEY');
      return true;
    } else if (error?.response?.data?.missingKey === 'OPENAI_API_KEY') {
      openApiKeyDialog('OpenAI', 'OPENAI_API_KEY');
      return true;
    }
    return false;
  };

  return {
    isApiKeyDialogOpen,
    currentApiKeyService,
    openApiKeyDialog,
    closeApiKeyDialog,
    saveApiKey,
    handleMissingApiKey
  };
}