import axios from "axios";
import { GitlabConfig, GitlabMergeRequest, CodeComment, GitlabComment } from "@shared/schema";

class GitLabApi {
  private baseUrl: string;
  private token: string;
  private projectId?: number;

  constructor(config: GitlabConfig) {
    this.baseUrl = 'https://gitlab.com/api/v4';
    this.token = config.token;
    this.projectId = config.projectId;
  }

  private getHeaders() {
    return {
      'Private-Token': this.token,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Fetch user information using the provided token
   */
  async getCurrentUser() {
    try {
      const response = await axios.get(`${this.baseUrl}/user`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching GitLab user:', error);
      throw new Error('Failed to fetch GitLab user information');
    }
  }

  /**
   * Get projects the user has access to
   */
  async getProjects() {
    try {
      const response = await axios.get(`${this.baseUrl}/projects?membership=true`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching GitLab projects:', error);
      throw new Error('Failed to fetch GitLab projects');
    }
  }

  /**
   * Get merge requests for a project
   */
  async getMergeRequests(projectId: number): Promise<GitlabMergeRequest[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/projects/${projectId}/merge_requests?state=opened`, {
        headers: this.getHeaders(),
      });
      
      return response.data.map((mr: any) => ({
        id: mr.iid,
        projectId: mr.project_id,
        sourceBranch: mr.source_branch,
        targetBranch: mr.target_branch,
        title: mr.title,
        description: mr.description || '',
        state: mr.state,
        webUrl: mr.web_url,
      }));
    } catch (error) {
      console.error('Error fetching GitLab merge requests:', error);
      throw new Error('Failed to fetch GitLab merge requests');
    }
  }

  /**
   * Get diff for a merge request
   */
  async getMergeRequestDiff(projectId: number, mergeRequestId: number) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/projects/${projectId}/merge_requests/${mergeRequestId}/changes`, 
        { headers: this.getHeaders() }
      );
      return response.data.changes;
    } catch (error) {
      console.error('Error fetching GitLab merge request diff:', error);
      throw new Error('Failed to fetch GitLab merge request diff');
    }
  }

  /**
   * Post a comment on a merge request
   */
  async createMergeRequestComment(projectId: number, mergeRequestId: number, comment: GitlabComment) {
    try {
      const endpoint = `${this.baseUrl}/projects/${projectId}/merge_requests/${mergeRequestId}/notes`;
      const response = await axios.post(endpoint, comment, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating GitLab merge request comment:', error);
      throw new Error('Failed to create GitLab merge request comment');
    }
  }

  /**
   * Post a comment on a specific line in a merge request
   */
  async createMergeRequestLineComment(
    projectId: number, 
    mergeRequestId: number, 
    comment: GitlabComment
  ) {
    try {
      const endpoint = `${this.baseUrl}/projects/${projectId}/merge_requests/${mergeRequestId}/discussions`;
      const response = await axios.post(endpoint, comment, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating GitLab line comment:', error);
      throw new Error('Failed to create GitLab line comment');
    }
  }

  /**
   * Post code review comments to a merge request
   */
  async postCodeReviewComments(
    projectId: number,
    mergeRequestId: number,
    comments: CodeComment[]
  ) {
    try {
      const diff = await this.getMergeRequestDiff(projectId, mergeRequestId);
      const commentResults = [];
      
      // Summary comment
      const summaryComment = {
        body: `## AI Code Review Results\n\n${comments.length} issues found:\n` +
              `- ${comments.filter(c => c.type === 'error').length} errors\n` +
              `- ${comments.filter(c => c.type === 'warning').length} warnings\n` +
              `- ${comments.filter(c => c.type === 'suggestion').length} suggestions\n` +
              `- ${comments.filter(c => c.type === 'info').length} info`
      };
      
      const summary = await this.createMergeRequestComment(projectId, mergeRequestId, summaryComment);
      commentResults.push(summary);
      
      // Line-specific comments
      for (const comment of comments) {
        // Find the right file in the diff
        const file = comment.file || diff[0]?.new_path;
        if (!file) continue;
        
        const lineComment: GitlabComment = {
          body: `**${comment.type.toUpperCase()}**: ${comment.text}` + 
                (comment.suggestion ? `\n\nSuggestion: ${comment.suggestion}` : ''),
          path: file,
          line: comment.line,
          lineType: 'new',
          position: {
            positionType: 'text',
            newPath: file,
            newLine: comment.line,
          }
        };
        
        try {
          const result = await this.createMergeRequestLineComment(projectId, mergeRequestId, lineComment);
          commentResults.push(result);
        } catch (e) {
          // If line comment fails, post as a general comment
          const fallbackComment = {
            body: `**${comment.type.toUpperCase()}** in ${file}:${comment.line}: ${comment.text}` + 
                  (comment.suggestion ? `\n\nSuggestion: ${comment.suggestion}` : '')
          };
          
          const result = await this.createMergeRequestComment(projectId, mergeRequestId, fallbackComment);
          commentResults.push(result);
        }
      }
      
      return commentResults;
    } catch (error) {
      console.error('Error posting code review comments to GitLab:', error);
      throw new Error('Failed to post code review comments to GitLab');
    }
  }
}

export default GitLabApi;