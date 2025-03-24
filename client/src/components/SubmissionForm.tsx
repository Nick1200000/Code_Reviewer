import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { programmingLanguages, reviewTypes, sampleCode } from "@/lib/languages";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Form validation schema
const formSchema = z.object({
  language: z.string().min(1, "Language is required"),
  reviewType: z.string().min(1, "Review type is required"),
  code: z.string().min(1, "Code is required"),
});

type SubmissionFormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isPending: boolean;
};

export default function SubmissionForm({ onSubmit, isPending }: SubmissionFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showReviewTypeInfo, setShowReviewTypeInfo] = useState<string | null>(null);
  
  // Form setup with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: "Python",
      reviewType: "Comprehensive",
      code: sampleCode.Python || "",
    },
  });

  // Handle file upload
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process uploaded file
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      form.setValue("code", text);
      
      // Try to determine language from file extension
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (fileExt) {
        const matchedLang = programmingLanguages.find(
          lang => lang.extension.slice(1) === fileExt
        );
        if (matchedLang) {
          form.setValue("language", matchedLang.value);
        }
      }
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been loaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error loading file",
        description: "Could not read the file content.",
        variant: "destructive",
      });
    }
    
    // Reset file input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Auto-format code (placeholder functionality)
  const handleAutoFormat = () => {
    const code = form.getValues("code");
    if (!code.trim()) {
      toast({
        title: "Cannot format empty code",
        description: "Please add some code first.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Code formatted",
      description: "Your code has been formatted.",
    });
    // In a real implementation, this would apply actual formatting
  };

  // Update sample code when language changes
  const handleLanguageChange = (value: string) => {
    form.setValue("language", value);
    
    const currentCode = form.getValues("code");
    const isDefaultOrEmpty = !currentCode || 
      Object.values(sampleCode).some(sample => currentCode === sample);
      
    if (isDefaultOrEmpty && sampleCode[value]) {
      form.setValue("code", sampleCode[value]);
    }
  };
  
  // Reset the form to default values
  const handleReset = () => {
    const currentLanguage = form.getValues("language");
    form.reset({
      language: currentLanguage,
      reviewType: "Comprehensive",
      code: sampleCode[currentLanguage] || "",
    });
    
    toast({
      title: "Form reset",
      description: "The form has been reset to sample code.",
    });
  };
  
  // Handle review type select to show description
  const handleReviewTypeSelect = (value: string) => {
    form.setValue("reviewType", value);
    setShowReviewTypeInfo(value);
  };
  
  // Get review type description
  const getReviewTypeDescription = (value: string) => {
    const reviewType = reviewTypes.find(type => type.value === value);
    return reviewType?.description || "";
  };

  return (
    <Card className="overflow-hidden mb-6">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-white">
        <CardTitle className="text-xl font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Submit Code for Review
        </CardTitle>
        <CardDescription>
          Enter your code below and select options for AI-powered code review
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Programming Language</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Select
                                onValueChange={(value) => handleLanguageChange(value)}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {programmingLanguages.map((language) => (
                                    <SelectItem key={language.value} value={language.value}>
                                      {language.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Select the programming language of your code</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <FormDescription>
                        We support {programmingLanguages.length} programming languages
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="reviewType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Review Type</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Select
                                onValueChange={handleReviewTypeSelect}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select review type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {reviewTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Choose the type of review you need</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {showReviewTypeInfo && (
                        <FormDescription>
                          {getReviewTypeDescription(showReviewTypeInfo)}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Code</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Paste your code here..."
                          className="font-mono bg-gray-50 resize-y h-80 overflow-auto"
                        />
                      </FormControl>
                      <FormDescription>
                        Paste your code or upload a file. Line numbers will be shown in the review.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-between">
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={handleFileUpload}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Upload File
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".py,.js,.ts,.java,.cpp,.go,.rb,.php,.cs,.rs,.swift,.kt"
                />
                <Button type="button" variant="outline" onClick={handleAutoFormat}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Auto-Format
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Reset
                </Button>
              </div>
              <Button type="submit" disabled={isPending} className="px-6 gap-2">
                {isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Code...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                    </svg>
                    Review Code
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
