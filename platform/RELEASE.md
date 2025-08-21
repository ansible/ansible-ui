# Release Process

## Tag Creation

- Git tags determine release version and inform PDE team
- **Checklist before tagging**:
  - All backports merged into `release/2.5-lts`
  - e2e tests for `release/2.5-lts` are green
  - Upgrade pipelines targeting `release/2.5-lts` are passing

### Current Release Branch

- Current shipping branch: `release/2.5-lts`
- > Note: This is the long-term support branch for AAP 2.5
- Remote assumed as `origin`

## Step-by-Step Instructions

### 1. Fetch the latest changes and switch to the release branch

- Commands:
  - `git fetch origin`
  - `git checkout origin/release/2.5-lts`

### 2. Verify your local `HEAD` matches the latest commit on the remote branch

- Goal: ensure your local commit is identical to `origin/release/2.5-lts`
- Commands:
  - `git status` (should say "up to date" or "detached at origin/release/2.5-lts")
  - `git rev-parse HEAD`
  - `git rev-parse origin/release/2.5-lts`
- SHAs must match exactly
- If not:
  - Pull/fetch again
  - Rerun checks
- You can also confirm latest SHA in GitHub UI

### 3. List existing `2.5` tags to determine the latest version

- Command:
  - `git tag | grep '^2\.5\.'`
- Example: shows latest like `2.5.10`

### 4. Create the next patch tag

- Increment the **PATCH** number
- Command:
  - `git tag 2.5.11`

### 5. Push the new tag to the remote

- Command:
  - `git push origin 2.5.11`

### 6. Verify that the tag exists

- Command:
  - `git tag | grep '^2\.5\.'`
- Also confirm tag appears in GitHub UI

## Communicating the New Tag

- PDE will open an issue in **Async Release Calendar**
- Update the issue's table with the new tag
- Post a comment:
  > `AAP-UI` tag `2.5.11` created and pushed.

## Notes

- Follow **Semantic Versioning**: **MAJOR.MINOR.PATCH**
- For 2.5 line, only increment **PATCH**
- Always tag the tip of `release/2.5-lts`, not any other commit
- Double-check your local tag list and GitHub Tags page before pushing
