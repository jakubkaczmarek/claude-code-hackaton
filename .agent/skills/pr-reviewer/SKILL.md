---
name: PR Review
description: Guidelines and tools for reviewing pull requests in this AngularJS-to-Angular migration project.
---

# PR Review Guidelines

When reviewing a pull request for this AngularJS → Angular 17 migration project, follow these essential guidelines:

1. **Context & Ecosystem**:
   - This is a migration project — every PR should move code *away* from AngularJS patterns and *toward* Angular 17 standards.
   - Reject any PR that introduces new AngularJS patterns (`$scope`, `ng-controller`, `.controller(`, `.factory(`, etc.).
   - All migrated code must follow the rules in `CLAUDE.md`.

2. **Key Focus Areas**:
   - **Comprehensive Reviews**: You **MUST always** perform a deep, comprehensive review of the _entire_ pull request. If the user asks you to look into a specific issue, file, or area of concern, you must investigate that specific area _in addition to_ reviewing the rest of the PR's substantive changes. Do not terminate your review after addressing only the user's focal point.
   - **Migration Correctness**: Verify that all migrated code follows the rules in `CLAUDE.md`. Flag any leftover AngularJS patterns (`$scope`, `ng-*` attributes, `.controller(`, `.factory(`, `$http`, `$q`, `$timeout`, `$broadcast`, `$emit`, `$rootScope`).
   - **Angular 17 Standards**: Every component must have `standalone: true`, `ChangeDetectionStrategy.OnPush`, and use `inject()` for DI. Flag violations.
   - **Template syntax**: New templates must use `@if` / `@for` control flow. Flag `*ngIf` / `*ngFor` in new code.
   - **Commit Messages**: Evaluate the quality of commit messages. They should explain the _why_ behind the change, not just the _what_.
   - **Code Cleanliness**: Ensure the code is readable, maintainable, and follows the conventions in `CLAUDE.md`.
   - **TypeScript types**: No `any` unless documented as unavoidable. Flag untyped HTTP responses, untyped EventEmitters.
   - **Subscriptions**: Flag `.subscribe()` without `takeUntilDestroyed()` or `toSignal()`. Memory leaks are a common migration mistake.
   - **Testing**: Ensure migrated components have basic unit tests. **Do NOT run tests locally** — CI handles this.

3. **Execution Workflow**:
   Determine the appropriate review method. If the user explicitly asks for a `remote` or `local` review in their request, that takes precedence (e.g. "leave comments on the PR" implies `remote`). Otherwise, use the GitHub MCP or available scripts to determine if the review should be `local` or `remote`.

   **Common Review Practices (Applies to both Local and Remote)**
   - **Preparation & Checklist**:
     - First, create a task list (e.g., in `task.md`) that you can easily reference containing **all** the review requirements from the "Key Focus Areas" section (Commit Messages, Performance, Testing, etc.), along with any specific review notes or requests from the user.
     - Before doing an in-depth review, expand this list into more detailed items of what you plan to explore and verify in the PR.
     - As you conduct the review, check off items in this list, adding your assessment or findings underneath each item.
     - At the end of your review, refer back to the checklist to ensure every single requirement was completely verified.
   - **Fetch PR Metadata Safely**: When you need to read the PR description or context, do NOT use `gh pr view <PR_NUMBER>` by itself, as its default GraphQL query may fail due to lack of `read:org` and `read:discussion` token scopes. Instead, use `read_url_content` on the PR URL or use `gh pr view <PR_NUMBER> --json title,body,state,author`.
   - **Check Existing Comments First**: Before formulating feedback, use the GitHub MCP or available scripts to fetch existing comments on the PR. Review this feedback to avoid duplicate comments, and incorporate its insights into your own review process.
   - **Constructive Feedback**: Provide clear, actionable, and polite feedback. Explain the _why_ behind your suggestions or edits. Do **NOT** leave inline comments purely to praise, agree with, or acknowledge a correct implementation detail, as this clutters the review. If you want to praise the PR, do so in the single general PR comment.

   **A. Local Code Review (If the PR is owned by the author requesting the review)**
   - **Checkout**: Check out the PR branch locally (if it doesn't already exist, fetch it). If checking out the branch fails due to a worktree claim (e.g. "fatal: '<branch>' is already used by worktree at '<path>'"), do the review in that directory.
   - **Review & Edit**: Execute the review directly on the code. Instead of adding inline PR comments for suggestions, format the codebase or apply the edits directly to the files.
   - **Feedback**: Summarize the review findings and the concrete changes you made in a message to the user, referencing the completed items from your checklist.
   - **Do NOT Commit or Push**: Leave the changes uncommitted in the working directory so the user can easily review the pending edits locally. Let the user know the changes are ready for their review, but do not ask for approval to push.
   - **Resolve Comments**: Once the user confirms the changes are good and should be committed/pushed, respond to the existing comments as 'resolved' using the GitHub MCP or available scripts.

   **B. Remote Code Review (For all other PRs)**
   - **Batching Comments (MCP Server - Preferred)**: If you have the GitHub MCP Server configured, you **MUST** follow this workflow to avoid spamming the author with multiple notifications:
     1. Create a pending review using `mcp_github-mcp-server_pull_request_review_write` (method `create`).
     2. Add your inline comments to the pending review using `mcp_github-mcp-server_add_comment_to_pending_review`.
     3. Submit the review using `mcp_github-mcp-server_pull_request_review_write` (method `submit_pending`).
   - **Batching Comments (Scripts - Fallback)**: If you do **NOT** have access to the GitHub MCP Server (e.g., specific MCP tools are missing from your context), fallback to using the provided scripts. Use `post_inline_comment.sh` to stage your comments locally. Once all comments are staged, you **MUST** call `submit_pr_review.sh` to publish them as a single batched review (and send a single notification). Try to keep comments minimal or use a general comment if you have many suggestions.
   - **Use Suggested Changes**: Whenever appropriate (e.g., for simple code fixes, refactoring suggestions, or typo corrections), prefer using GitHub's **Suggested Changes** syntax (`suggestion ... `) in your inline comments. This allows the author to apply your suggested code improvements with a single click in the GitHub UI.
   - **Review Type**: Never mark an external PR review as an "approval" unless explicitly instructed by a repo maintainer. Always use "Request Changes" or "Comment". Note that some tools might only support commenting.
   - **Require User Approval Before Posting**: Prepare your review comments and present them to the user, alongside a summary of your completed checklist. Do NOT post comments to the PR without explicitly asking the user for permission first. Only post the review after the user approves.
   - **Prefix Agent Comments**: To make it clear when comments are generated and posted by an AI agent rather than a human user, **always** prefix your review comments with `AGENT: `.

## Available Tools

We prefer using standard **GitHub MCP Server** tools when available. If not configured, fall back to the `gh` CLI.

### GitHub MCP Tools (Preferred)

- `mcp_github-mcp-server_pull_request_review_write`
- `mcp_github-mcp-server_add_comment_to_pending_review`

### gh CLI Fallback

Use `gh` CLI commands when MCP tools are unavailable:

```bash
# Read PR metadata safely (avoids GraphQL scope issues)
gh pr view <PR_NUMBER> --json title,body,state,author

# Read existing comments to avoid duplicates
gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments

# Post a review with comments
gh pr review <PR_NUMBER> --comment --body "AGENT: <summary>"
```
