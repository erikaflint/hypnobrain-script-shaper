# GitHub Repository Setup Guide

## ✅ Repository Created
**URL:** https://github.com/erikaflint/hypnobrain-script-shaper

## 📤 Step 1: Push Your Code to GitHub

Since direct git operations are restricted in Replit, use the **Replit Git UI**:

1. Click on the **Git icon** in the left sidebar (or use the Version Control pane)
2. Click **"Connect Existing"** button in the Git pane
3. Enter the repository URL: `https://github.com/erikaflint/hypnobrain-script-shaper.git`
4. Replit will prompt for authentication - authorize with your GitHub account
5. Click **"Push"** to upload all your commits to GitHub

**Alternative:** Use the Shell if you have git expertise:
```bash
git remote add origin https://github.com/erikaflint/hypnobrain-script-shaper.git
git push -u origin main
```

## 🔐 Step 2: Configure GitHub Secrets

For the nightly tests and Slack notifications to work, add these secrets in GitHub:

1. Go to: https://github.com/erikaflint/hypnobrain-script-shaper/settings/secrets/actions
2. Click **"New repository secret"** for each:

### Required Secrets:

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | AI script generation in tests |
| `OPENAI_API_KEY` | Your OpenAI API key | DALL-E image generation & TTS |
| `TESTING_STRIPE_SECRET_KEY` | Stripe test secret key (sk_test_...) | Payment testing |
| `TESTING_VITE_STRIPE_PUBLIC_KEY` | Stripe test public key (pk_test_...) | Frontend payment testing |
| `SLACK_WEBHOOK_URL` | Your Slack webhook URL | Test notifications |

### How to Get a Slack Webhook URL:

1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. Name it "HypnoBrain CI" and select your workspace
4. Click **"Incoming Webhooks"** → Enable it
5. Click **"Add New Webhook to Workspace"**
6. Select the channel (e.g., #engineering or #ci-notifications)
7. Copy the webhook URL (starts with `https://hooks.slack.com/services/...`)
8. Add it as `SLACK_WEBHOOK_URL` secret in GitHub

## 🤖 Step 3: GitHub Actions Workflows

Two workflows have been created:

### 1. **Nightly Tests** (`.github/workflows/nightly-tests.yml`)
- Runs every night at 2 AM UTC
- Tests full application with PostgreSQL database
- Sends Slack notifications on success/failure
- Can be triggered manually from Actions tab

### 2. **PR Tests** (`.github/workflows/pr-tests.yml`)
- Runs on every pull request
- Runs on pushes to main branch
- Provides quick feedback on code changes

## 📊 Monitoring

After setup, you'll receive Slack notifications:
- ✅ **Success:** Green notification with test results
- ❌ **Failure:** Red alert with link to failure details

## 🔧 Testing the Setup

After pushing code and configuring secrets:

1. Go to https://github.com/erikaflint/hypnobrain-script-shaper/actions
2. Click on **"Nightly Tests"** workflow
3. Click **"Run workflow"** → **"Run workflow"** (manual trigger)
4. Watch it run and check your Slack for notification

## 📝 Next Steps

1. ✅ Push code to GitHub (via Replit Git UI)
2. ✅ Add GitHub secrets
3. ✅ Configure Slack webhook
4. ✅ Test manual workflow run
5. ✅ Verify Slack notification received

---

**Questions?** Check the GitHub Actions tab for logs: https://github.com/erikaflint/hypnobrain-script-shaper/actions
