import axios from 'axios';
import { type GitlabConfig, type GitlabComment, type GitlabMergeRequest, type CodeComment } from '@shared/schema';

/**
 * GitLab API client for integrating with GitLab repositories
 */
export default class GitLabApi {
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
      'PRIVATE-TOKEN': this.token,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Fetch user information using the provided token
   */
  async getCurrentUser() {
    try {
      const response = await axios.get(`${this.baseUrl}/user`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('GitLab API Error (getCurrentUser):', error);
      throw new Error(`Failed to get GitLab user: ${error.message}`);
    }
  }

  /**
   * Get projects the user has access to
   */
  async getProjects() {
    try {
      const response = await axios.get(`${this.baseUrl}/projects?membership=true&per_page=100`, {
        headers: this.getHeaders()
      });
      return response.data.map(project => ({
        id: project.id,
        name: project.name,
        nameWithNamespace: project.name_with_namespace,
        webUrl: project.web_url,
        description: project.description,
        visibility: project.visibility
      }));
    } catch (error) {
      console.error('GitLab API Error (getProjects):', error);
      throw new Error(`Failed to get GitLab projects: ${error.message}`);
    }
  }

  /**
   * Get merge requests for a project
   */
  async getMergeRequests(projectId: number): Promise<GitlabMergeRequest[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/projects/${projectId}/merge_requests?state=opened&per_page=100`,
        {
          headers: this.getHeaders()
        }
      );
      return response.data.map(mr => ({
        id: mr.iid, // GitLab uses 'iid' for project-specific IDs
        projectId: projectId,
        sourceBranch: mr.source_branch,
        targetBranch: mr.target_branch,
        title: mr.title,
        description: mr.description || '',
        state: mr.state,
        webUrl: mr.web_url
      }));
    } catch (error) {
      console.error('GitLab API Error (getMergeRequests):', error);
      throw new Error(`Failed to get merge requests: ${error.message}`);
    }
  }

  /**
   * Get diff for a merge request
   */
  async getMergeRequestDiff(projectId: number, mergeRequestId: number) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/projects/${projectId}/merge_requests/${mergeRequestId}/changes`,
        {
          headers: this.getHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('GitLab API Error (getMergeRequestDiff):', error);
      throw new Error(`Failed to get merge request diff: ${error.message}`);
    }
  }

  /**
   * Post a comment on a merge request
   */
  async createMergeRequestComment(projectId: number, mergeRequestId: number, comment: GitlabComment) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/projects/${projectId}/merge_requests/${mergeRequestId}/notes`,
        { body: comment.body },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('GitLab API Error (createMergeRequestComment):', error);
      throw new Error(`Failed to create merge request comment: ${error.message}`);
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
      if (!comment.position) {
        throw new Error('Position is required for line comments');
      }

      const response = await axios.post(
        `${this.baseUrl}/projects/${projectId}/merge_requests/${mergeRequestId}/discussions`,
        {
          body: comment.body,
          position: {
            base_sha: comment.position.baseSha,
            start_sha: comment.position.startSha,
            head_sha: comment.position.headSha,
            position_type: comment.position.positionType || 'text',
            new_line: comment.position.newLine,
            old_line: comment.position.oldLine,
            new_path: comment.position.newPath,
            old_path: comment.position.oldPath
          }
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('GitLab API Error (createMergeRequestLineComment):', error);
      throw new Error(`Failed to create line comment: ${error.message}`);
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
      // Get merge request diff to get the commit SHA
      const mrDetails = await this.getMergeRequestDiff(projectId, mergeRequestId);
      const headSha = mrDetails.diff_refs.head_sha;
      const startSha = mrDetails.diff_refs.start_sha;
      const baseSha = mrDetails.diff_refs.base_sha;

      // Filter comments that have a line number (needed for GitLab line comments)
      const lineComments = comments.filter(comment => comment.line > 0);
      
      // Post each comment
      const postedComments = [];
      
      for (const comment of lineComments) {
        // Get file path from comment or use a default
        const filePath = comment.file || 'app.js';
        
        // Create GitLab comment object
        const lineComment: GitlabComment = {
          body: `**${comment.type.toUpperCase()}**: ${comment.text}${comment.suggestion ? `\n\nSuggestion: ${comment.suggestion}` : ''}`,
          position: {
            baseSha,
            startSha, 
            headSha,
            positionType: 'text',
            newLine: comment.line,
            newPath: filePath,
            oldPath: filePath
          }
        };
        
        // Post the comment
        const response = await this.createMergeRequestLineComment(projectId, mergeRequestId, lineComment);
        
        // Add the posted comment to the list
        postedComments.push({
          id: response.id,
          body: lineComment.body,
          line: comment.line,
          file: filePath
        });
      }
      
      // Post a summary comment if there are any comments without line numbers
      const generalComments = comments.filter(comment => !comment.line || comment.line <= 0);
      
      if (generalComments.length > 0) {
        const summaryComment = {
          body: `# Code Review Summary\n\n${generalComments.map(c => `**${c.type.toUpperCase()}**: ${c.text}${c.suggestion ? `\n- Suggestion: ${c.suggestion}` : ''}`).join('\n\n')}`
        };
        
        const response = await this.createMergeRequestComment(projectId, mergeRequestId, summaryComment);
        
        postedComments.push({
          id: response.id,
          body: summaryComment.body,
          line: 0,
          file: null
        });
      }
      
      return postedComments;
    } catch (error) {
      console.error('GitLab API Error (postCodeReviewComments):', error);
      throw new Error(`Failed to post code review comments: ${error.message}`);
    }
  }
}