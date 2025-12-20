# 🌿 Git Branching Guide

A comprehensive guide to creating and managing branches in Git. This guide covers essential commands and best practices for effective branch management in your development workflow.

---

## 📋 Table of Contents

- [Introduction to Git Branches](#introduction-to-git-branches)
- [The `git branch` Command](#the-git-branch-command)
- [The `git checkout` Command](#the-git-checkout-command)
- [The `git merge` Command](#the-git-merge-command)
- [The `git rebase` Command](#the-git-rebase-command)
- [Common Workflows](#common-workflows)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Introduction to Git Branches

Git branches are essentially pointers to a specific commit in your repository. They allow you to:
- Work on multiple features simultaneously
- Isolate experimental changes
- Organize work by feature, bug fix, or release
- Collaborate with team members without interfering with each other's work

The default branch in most repositories is called `main` (or `master` in older repositories).

---

## The `git branch` Command

The `git branch` command is used to create, list, rename, and delete branches.

### List All Branches

```bash
# List all local branches
git branch

# List all remote branches
git branch -r

# List all branches (local and remote)
git branch -a

# List branches with additional information (last commit)
git branch -v

# List branches with additional information including tracking branches
git branch -vv
```

**Example Output:**
```
* main
  feature/add-farmer-export
  bugfix/fix-payment-status
```
The asterisk (*) indicates your current branch.

### Create a New Branch

```bash
# Create a new branch
git branch feature/amazing-feature

# Create a new branch from a specific commit
git branch feature/new-feature abc123

# Create a new branch from a specific tag
git branch release/v2.0 v1.9
```

**Example:**
```bash
# Create a branch for a new authentication feature
git branch feature/authentication-system

# Verify the branch was created
git branch
```

### Delete a Branch

```bash
# Delete a branch (safe - prevents deletion if unmerged changes exist)
git branch -d feature/completed-feature

# Force delete a branch (caution - deletes even with unmerged changes)
git branch -D feature/abandoned-feature

# Delete a remote branch
git push origin --delete feature/old-feature
```

**Example:**
```bash
# Delete a merged feature branch
git branch -d feature/farmer-export

# Force delete an experimental branch you no longer need
git branch -D experiment/new-ui
```

### Rename a Branch

```bash
# Rename the current branch
git branch -m new-branch-name

# Rename a different branch
git branch -m old-branch-name new-branch-name
```

**Example:**
```bash
# Rename current branch to follow naming convention
git branch -m feature/user-authentication

# Rename a specific branch
git branch -m old-feature-name feature/proper-name
```

---

## The `git checkout` Command

The `git checkout` command is used to switch between branches and restore files. In newer versions of Git (2.23+), some functionality has been split into `git switch` and `git restore`.

### Switch to an Existing Branch

```bash
# Switch to an existing branch
git checkout feature/amazing-feature

# Switch to the previous branch
git checkout -

# Using the newer git switch command (Git 2.23+)
git switch feature/amazing-feature
```

**Example:**
```bash
# Switch to the main branch
git checkout main

# Switch to a feature branch
git checkout feature/payment-processing

# Quickly switch back to the previous branch
git checkout -
```

### Create and Switch to a New Branch

```bash
# Create a new branch and switch to it
git checkout -b feature/new-feature

# Create a new branch from a specific starting point
git checkout -b feature/new-feature develop

# Using the newer git switch command (Git 2.23+)
git switch -c feature/new-feature
```

**Example:**
```bash
# Create and switch to a new feature branch
git checkout -b feature/delivery-tracking

# Create a hotfix branch from main
git checkout -b hotfix/critical-bug main

# Create a release branch from develop
git checkout -b release/v2.0 develop
```

### Checkout a Specific Commit or Tag

```bash
# Checkout a specific commit (detached HEAD state)
git checkout abc123def

# Checkout a specific tag
git checkout v1.0.0

# Create a branch from a tag
git checkout -b hotfix/v1.0.1 v1.0.0
```

**Example:**
```bash
# Inspect the state at a specific commit
git checkout 9f8a7b6

# Create a hotfix branch from a production tag
git checkout -b hotfix/security-patch v1.2.3
```

### Restore Files from a Branch

```bash
# Restore a specific file from another branch
git checkout main -- path/to/file.js

# Restore all files in a directory from another branch
git checkout feature/old-code -- src/components/

# Using the newer git restore command (Git 2.23+)
git restore --source=main path/to/file.js
```

**Example:**
```bash
# Restore a configuration file from main
git checkout main -- backend/config/database.js

# Get the latest version of all components from develop
git checkout develop -- frontend/src/components/
```

---

## The `git merge` Command

The `git merge` command integrates changes from one branch into another. It creates a new "merge commit" that combines the histories of both branches.

### Basic Merge

```bash
# Merge a branch into your current branch
git merge feature/amazing-feature

# Merge with a custom commit message
git merge feature/amazing-feature -m "Merge amazing feature into main"

# Merge without fast-forward (always create a merge commit)
git merge --no-ff feature/amazing-feature
```

**Example:**
```bash
# Switch to main branch
git checkout main

# Merge a completed feature
git merge feature/payment-processing

# Example output:
# Updating abc123..def456
# Fast-forward
#  src/payments.js | 45 +++++++++++++++++++++++++++++++++++++++++
#  1 file changed, 45 insertions(+)
```

### Merge Strategies

```bash
# Fast-forward merge (default when possible)
git merge feature/simple-fix

# No fast-forward merge (creates a merge commit even if fast-forward is possible)
git merge --no-ff feature/important-feature

# Squash merge (combine all commits into one)
git merge --squash feature/multiple-commits
```

**Example:**
```bash
# Merge a feature with explicit merge commit for history tracking
git checkout main
git merge --no-ff feature/user-authentication

# Squash multiple commits into one before merging
git checkout develop
git merge --squash feature/refactor-database
git commit -m "Refactor database layer"
```

### Merge with Conflict Resolution

```bash
# Attempt to merge
git merge feature/conflicting-changes

# If conflicts occur, Git will notify you:
# Auto-merging src/app.js
# CONFLICT (content): Merge conflict in src/app.js
# Automatic merge failed; fix conflicts and then commit the result.

# View conflicting files
git status

# After manually resolving conflicts in your editor:
git add src/app.js
git commit -m "Merge feature/conflicting-changes, resolved conflicts in app.js"

# Or abort the merge if needed
git merge --abort
```

**Example:**
```bash
# Merge a branch with potential conflicts
git checkout main
git merge feature/dashboard-redesign

# If conflicts occur:
# 1. Open conflicting files and look for conflict markers:
#    <<<<<<< HEAD
#    (your current branch changes)
#    =======
#    (incoming branch changes)
#    >>>>>>> feature/dashboard-redesign

# 2. Manually edit files to resolve conflicts
# 3. Stage the resolved files
git add frontend/src/pages/Dashboard.jsx

# 4. Complete the merge
git commit -m "Merge dashboard redesign, resolved styling conflicts"
```

### Verify Merge Before Committing

```bash
# See what changes will be merged
git diff main...feature/new-feature

# See the commits that will be merged
git log main..feature/new-feature

# Perform a merge but don't commit (allows review)
git merge --no-commit feature/new-feature
# Review changes, then:
git commit -m "Merge feature after review"
```

**Example:**
```bash
# Preview what will be merged
git diff main...feature/farmer-management

# Review the commits
git log --oneline main..feature/farmer-management

# Merge without auto-commit for final review
git merge --no-commit feature/farmer-management
# Review the staged changes
git diff --staged
# Complete the merge
git commit
```

---

## The `git rebase` Command

The `git rebase` command reapplies commits on top of another base branch. Unlike merge, it creates a linear history without merge commits.

### Basic Rebase

```bash
# Rebase current branch onto main
git rebase main

# Rebase a specific branch onto another
git rebase main feature/amazing-feature
```

**Example:**
```bash
# Update your feature branch with latest main changes
git checkout feature/payment-processing
git rebase main

# Example output:
# First, rewinding head to replay your work on top of it...
# Applying: Add payment validation
# Applying: Implement payment history
```

### Interactive Rebase

Interactive rebase allows you to modify commits during the rebase process.

```bash
# Interactive rebase for the last 3 commits
git rebase -i HEAD~3

# Interactive rebase onto main
git rebase -i main
```

**Example:**
```bash
# Clean up the last 5 commits
git rebase -i HEAD~5

# An editor will open with options:
# pick abc123 Add farmer model
# pick def456 Fix typo in farmer model
# pick ghi789 Add farmer validation
# pick jkl012 Update farmer tests
# pick mno345 Fix test error

# You can change 'pick' to:
# - reword (edit commit message)
# - edit (amend commit)
# - squash (combine with previous commit)
# - fixup (like squash but discard commit message)
# - drop (remove commit)

# Example: squash typo fix into the original commit
# pick abc123 Add farmer model
# fixup def456 Fix typo in farmer model
# pick ghi789 Add farmer validation
# squash jkl012 Update farmer tests
# drop mno345 Fix test error
```

### Rebase Workflow

```bash
# Standard workflow to keep feature branch updated
git checkout feature/my-feature
git fetch origin
git rebase origin/main

# If conflicts occur during rebase:
# 1. Resolve conflicts in files
git add resolved-file.js
# 2. Continue the rebase
git rebase --continue

# Or skip a commit if needed
git rebase --skip

# Or abort the rebase
git rebase --abort
```

**Example:**
```bash
# Update feature branch with latest main changes
git checkout feature/delivery-tracking
git fetch origin
git rebase origin/main

# If conflicts arise:
# CONFLICT (content): Merge conflict in src/delivery.js
# Resolve the conflict manually

# After resolving:
git add src/delivery.js
git rebase --continue

# Continue until rebase is complete
```

### Rebase vs Merge: When to Use Each

**Use Rebase When:**
- Working on a feature branch and want to incorporate upstream changes
- Cleaning up local commit history before sharing
- Maintaining a linear project history
- Working on local commits not yet pushed

**Use Merge When:**
- Integrating a completed feature into main branch
- Working on a shared/public branch
- Want to preserve the complete history of a feature
- Collaborating with others on the same branch

**Example:**
```bash
# During feature development: use rebase to stay updated
git checkout feature/user-auth
git rebase main

# When feature is complete: use merge to integrate
git checkout main
git merge --no-ff feature/user-auth
```

### Rebase onto a Different Branch

```bash
# Rebase current branch onto a different base
git rebase --onto main feature-old feature-new

# Move commits from one branch to another
git rebase --onto new-base old-base branch-to-move
```

**Example:**
```bash
# You created a feature branch from develop but want to rebase onto main
git rebase --onto main develop feature/my-feature

# Move hotfix commits from develop to main
git rebase --onto main develop hotfix/critical-bug
```

---

## Common Workflows

### Feature Branch Workflow

```bash
# 1. Create a new feature branch from main
git checkout main
git pull origin main
git checkout -b feature/amazing-feature

# 2. Make changes and commit
git add .
git commit -m "Add amazing feature"

# 3. Keep feature branch updated (use rebase)
git fetch origin
git rebase origin/main

# 4. Push feature branch to remote
git push origin feature/amazing-feature

# 5. Create a pull request (on GitHub/GitLab)
# After code review and approval...

# 6. Merge feature into main (on GitHub/GitLab or locally)
git checkout main
git merge --no-ff feature/amazing-feature
git push origin main

# 7. Delete the feature branch
git branch -d feature/amazing-feature
git push origin --delete feature/amazing-feature
```

### Hotfix Workflow

```bash
# 1. Create a hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix the bug and commit
git add .
git commit -m "Fix critical security vulnerability"

# 3. Merge into main
git checkout main
git merge --no-ff hotfix/critical-bug
git tag -a v1.0.1 -m "Version 1.0.1 - Security hotfix"
git push origin main --tags

# 4. Merge into develop to keep it updated
git checkout develop
git merge --no-ff hotfix/critical-bug
git push origin develop

# 5. Delete the hotfix branch
git branch -d hotfix/critical-bug
git push origin --delete hotfix/critical-bug
```

### Release Branch Workflow

```bash
# 1. Create a release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v2.0

# 2. Update version numbers, documentation
git add .
git commit -m "Bump version to 2.0"

# 3. Merge into main for production
git checkout main
git merge --no-ff release/v2.0
git tag -a v2.0 -m "Version 2.0"
git push origin main --tags

# 4. Merge back into develop
git checkout develop
git merge --no-ff release/v2.0
git push origin develop

# 5. Delete the release branch
git branch -d release/v2.0
git push origin --delete release/v2.0
```

---

## Best Practices

### Branch Naming Conventions

Use descriptive, consistent branch names:

```bash
# Feature branches
feature/user-authentication
feature/payment-processing
feature/export-to-csv

# Bug fix branches
bugfix/fix-login-error
bugfix/correct-payment-calculation

# Hotfix branches (for production fixes)
hotfix/security-patch
hotfix/critical-data-loss

# Release branches
release/v1.0
release/v2.0-beta

# Experimental branches
experiment/new-database
experiment/performance-optimization
```

### Keep Branches Short-Lived

- Merge or delete branches as soon as their purpose is fulfilled
- Long-lived feature branches can become difficult to merge
- Aim to merge features within a few days to a week

### Commit Early and Often

```bash
# Make small, focused commits
git add src/authentication.js
git commit -m "Add user login validation"

git add tests/auth.test.js
git commit -m "Add tests for login validation"

# Easier to review, revert, or cherry-pick later
```

### Pull Before Push

```bash
# Always pull latest changes before pushing
git checkout main
git pull origin main
git checkout feature/my-feature
git rebase main
git push origin feature/my-feature
```

### Use Meaningful Commit Messages

```bash
# Good commit messages
git commit -m "Add farmer export to CSV functionality"
git commit -m "Fix payment calculation rounding error"
git commit -m "Update dashboard with real-time notifications"

# Bad commit messages
git commit -m "fix stuff"
git commit -m "changes"
git commit -m "asdf"
```

### Protect Important Branches

Configure branch protection on platforms like GitHub:
- Require pull request reviews before merging
- Require status checks to pass
- Require branches to be up to date before merging
- Prevent force pushes and deletions

### Clean Up Merged Branches

```bash
# Delete local branches that have been merged
git branch --merged | grep -v "\*" | grep -v "main" | xargs -n 1 git branch -d

# Delete remote-tracking branches that no longer exist on remote
git remote prune origin

# Or fetch with prune
git fetch --prune
```

---

## Troubleshooting

### Undo a Merge (Before Push)

```bash
# Reset to the commit before the merge
git reset --hard HEAD~1

# Or use the commit hash before merge
git reset --hard abc123
```

### Undo a Merge (After Push)

```bash
# Create a new commit that reverses the merge
git revert -m 1 HEAD

# Push the revert commit
git push origin main
```

### Recover a Deleted Branch

```bash
# Find the commit hash of the deleted branch
git reflog

# Recreate the branch from that commit
git branch feature/recovered abc123
```

### Fix a Rebase Gone Wrong

```bash
# Abort an ongoing rebase
git rebase --abort

# Reset to before the rebase using reflog
git reflog
git reset --hard HEAD@{5}  # Use appropriate reflog entry
```

### Resolve Complex Merge Conflicts

```bash
# Use a merge tool
git mergetool

# Or manually edit files and look for conflict markers
# <<<<<<< HEAD
# (your changes)
# =======
# (their changes)
# >>>>>>> branch-name

# After resolving:
git add resolved-file.js
git commit
```

### Check Branch Differences

```bash
# See what commits are in feature branch but not in main
git log main..feature/my-feature

# See what commits are in main but not in feature branch
git log feature/my-feature..main

# See all different commits between branches
git log --oneline --graph --decorate main feature/my-feature
```

### Find Which Branch Contains a Commit

```bash
# Find branches containing a specific commit
git branch --contains abc123

# Find branches in remote containing a specific commit
git branch -r --contains abc123
```

---

## Summary

Mastering Git branching requires understanding when to use each command:

- **`git branch`**: Create, list, rename, and delete branches
- **`git checkout`**: Switch between branches and restore files
- **`git merge`**: Integrate changes from one branch into another
- **`git rebase`**: Reapply commits on top of another branch for linear history

By following these examples and best practices, you'll be able to effectively manage branches in your Git workflow, collaborate with team members, and maintain a clean project history.

---

## Additional Resources

- [Git Official Documentation](https://git-scm.com/doc)
- [Pro Git Book](https://git-scm.com/book/en/v2)
- [GitHub Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)
- [Learn Git Branching (Interactive)](https://learngitbranching.js.org/)

---

**Happy Branching! 🌿**
