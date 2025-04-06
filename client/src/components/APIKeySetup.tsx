import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  apiKey: z.string().min(1, "API key is required")
});

type APIKeySetupProps = {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  apiKeyName: string;
  onSubmit: (apiKey: string) => void;
};

export default function APIKeySetup({ 
  isOpen, 
  onClose, 
  serviceName, 
  apiKeyName, 
  onSubmit 
}: APIKeySetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values.apiKey);
      onClose();
    } catch (error) {
      console.error("Failed to save API key:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{serviceName} API Key Required</DialogTitle>
          <DialogDescription>
            The application needs a valid {serviceName} API key to analyze code.
          </DialogDescription>
        </DialogHeader>

        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Your API key will be stored as an environment variable on the server. It will not be exposed to other users.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{apiKeyName}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your API key" 
                      type="password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    <div className="flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" />
                      <span>
                        Obtain your key from the {serviceName} website
                      </span>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save API Key"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}