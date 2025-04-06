import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from '@/lib/queryClient';
import { ReviewResult } from '@shared/schema';
import { AlertCircle, CheckCircle, GitMerge } from "lucide-react";

interface GitLabIntegrationProps {
  reviewId?: number;
  result: ReviewResult;
}

export default function GitLabIntegration({ reviewId, result }: GitLabIntegrationProps) {
  const [gitlabToken, setGitlabToken] = useState<string>('');
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [mergeRequests, setMergeRequests] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedMR, setSelectedMR] = useState<number | null>(null);
  const [posting, setPosting] = useState<boolean>(false);
  const [postSuccess, setPostSuccess] = useState<boolean>(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [gitlabUser, setGitlabUser] = useState<any>(null);

  const connectToGitLab = async () => {
    if (!gitlabToken) return;
    
    setConnecting(true);
    try {
      const response = await apiRequest('/api/gitlab/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: gitlabToken }),
      }, "json");
      
      if (response && response.connected) {
        setConnected(true);
        setGitlabUser(response.user);
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to connect to GitLab', error);
    } finally {
      setConnecting(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const projects = await apiRequest('/api/gitlab/projects', {
        method: 'GET',
        headers: {
          'GitLab-Token': gitlabToken,
        },
      }, "json");
      
      if (projects) {
        setProjects(projects);
      }
    } catch (error) {
      console.error('Failed to fetch GitLab projects', error);
    }
  };

  const fetchMergeRequests = async (projectId: number) => {
    try {
      const mrs = await apiRequest(`/api/gitlab/projects/${projectId}/merge_requests`, {
        method: 'GET',
        headers: {
          'GitLab-Token': gitlabToken,
        },
      }, "json");
      
      if (mrs) {
        setMergeRequests(mrs);
      }
    } catch (error) {
      console.error('Failed to fetch merge requests', error);
    }
  };

  const handleProjectChange = (projectId: string) => {
    const id = parseInt(projectId);
    setSelectedProject(id);
    setSelectedMR(null);
    fetchMergeRequests(id);
  };

  const handleMRChange = (mrId: string) => {
    setSelectedMR(parseInt(mrId));
  };

  const postReviewToGitLab = async () => {
    if (!reviewId) {
      setPostError("Review must be saved before posting to GitLab");
      return;
    }
    
    setPosting(true);
    setPostError(null);
    
    try {
      const response = await apiRequest(`/api/gitlab/post-review/${reviewId}`, {
        method: 'POST',
        headers: {
          'GitLab-Token': gitlabToken,
          'Content-Type': 'application/json',
        },
      }, "json");
      
      if (response && response.success) {
        setPostSuccess(true);
      } else {
        setPostError((response && response.message) ? response.message : "Failed to post review");
      }
    } catch (error) {
      console.error('Failed to post review to GitLab', error);
      setPostError("Network error occurred while posting review");
    } finally {
      setPosting(false);
    }
  };

  // Show GitLab integration info if available in result
  if (result.gitlabIntegration && result.gitlabIntegration.commentIds) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            GitLab Integration
          </CardTitle>
          <CardDescription>
            This review has been posted to GitLab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {result.gitlabIntegration.commentIds.length} comments have been posted to
              <a 
                href={result.gitlabIntegration.reviewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 font-medium underline"
              >
                merge request #{result.gitlabIntegration.mergeRequestId}
              </a>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <GitMerge className="h-5 w-5" />
          GitLab Integration
        </CardTitle>
        <CardDescription>
          Post code review results directly to GitLab merge requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connect" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connect">Connect</TabsTrigger>
            <TabsTrigger value="select" disabled={!connected}>Select MR</TabsTrigger>
            <TabsTrigger value="post" disabled={!connected || !selectedMR}>Post Review</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="py-4">
            {!connected ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gitlab-token">GitLab Personal Access Token</Label>
                  <Input
                    id="gitlab-token"
                    type="password"
                    placeholder="glpat-XXXXXXXXXXXXXXXXXXXX"
                    value={gitlabToken}
                    onChange={(e) => setGitlabToken(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    You can generate a token in GitLab under Settings &gt; Access Tokens.
                    Ensure it has the <code>api</code> scope.
                  </p>
                </div>
                <Button 
                  onClick={connectToGitLab} 
                  disabled={!gitlabToken || connecting}
                >
                  {connecting ? "Connecting..." : "Connect to GitLab"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center gap-2">
                    Connected as {gitlabUser?.name} ({gitlabUser?.username})
                    {gitlabUser?.avatar_url && (
                      <img 
                        src={gitlabUser.avatar_url} 
                        alt={gitlabUser.name} 
                        className="w-6 h-6 rounded-full ml-2" 
                      />
                    )}
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setConnected(false);
                    setGitlabToken('');
                    setGitlabUser(null);
                    setProjects([]);
                    setMergeRequests([]);
                    setSelectedProject(null);
                    setSelectedMR(null);
                  }}
                >
                  Disconnect
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="select" className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">Select Project</Label>
                <Select 
                  onValueChange={handleProjectChange} 
                  value={selectedProject?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.nameWithNamespace}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedProject && (
                <div className="space-y-2">
                  <Label htmlFor="merge-request">Select Merge Request</Label>
                  <Select 
                    onValueChange={handleMRChange} 
                    value={selectedMR?.toString()}
                    disabled={!mergeRequests.length}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={mergeRequests.length ? "Select a merge request" : "No open merge requests"} />
                    </SelectTrigger>
                    <SelectContent>
                      {mergeRequests.map((mr) => (
                        <SelectItem key={mr.id} value={mr.id.toString()}>
                          #{mr.id}: {mr.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mergeRequests.length === 0 && selectedProject && (
                    <p className="text-sm text-muted-foreground">
                      No open merge requests found for this project.
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="post" className="py-4">
            <div className="space-y-4">
              {selectedProject && selectedMR && (
                <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ready to post review comments to merge request #{selectedMR} in 
                    project {projects.find(p => p.id === selectedProject)?.nameWithNamespace}
                  </AlertDescription>
                </Alert>
              )}
              
              {postSuccess ? (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Review comments successfully posted to GitLab!
                  </AlertDescription>
                </Alert>
              ) : (
                <Button 
                  onClick={postReviewToGitLab} 
                  disabled={!selectedProject || !selectedMR || posting}
                  className="w-full"
                >
                  {posting ? "Posting..." : "Post Review to GitLab"}
                </Button>
              )}
              
              {postError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{postError}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}