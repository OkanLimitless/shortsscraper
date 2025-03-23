# Deploying to Vercel

This guide will walk you through the process of deploying the KVK Document Generator to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (can be created for free at [vercel.com](https://vercel.com))

## Deployment Steps

### 1. Push to GitHub

First, push the project to a GitHub repository:

```bash
# Navigate to the project directory
cd pdf-generator-app

# Initialize a Git repository if it's not already initialized
git init

# Add all files to Git
git add .

# Commit the changes
git commit -m "Initial commit"

# Add your GitHub repository as a remote
git remote add origin https://github.com/yourusername/kvk-document-generator.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click on "Add New..." and select "Project".
3. Import the GitHub repository you just created.
4. Vercel will automatically detect that this is a Next.js project.
5. Keep the default settings (they should match the values in `vercel.json`).
6. Click "Deploy".

Vercel will build and deploy your application. Once completed, you'll receive a URL where your application is hosted.

### 3. Custom Domain (Optional)

If you want to use a custom domain:

1. Go to your project settings in Vercel.
2. Navigate to the "Domains" section.
3. Add your custom domain and follow the verification steps.

## Updating Your Deployment

After making changes to your application, you can update your deployment by pushing the changes to GitHub:

```bash
git add .
git commit -m "Update application"
git push
```

Vercel will automatically detect the changes and redeploy your application.

## Troubleshooting

If you encounter any issues during deployment:

1. Check the build logs in Vercel for error messages.
2. Ensure all dependencies are correctly listed in `package.json`.
3. Verify that the PDF template file is correctly included in the `public` directory.

## Local Development vs. Production

The PDF generation process works slightly differently in development and production:

- In development, the PDF template is loaded from the public directory.
- In production, the same process applies, but ensure the paths are correct in the deployed environment.

## Environment Variables (If Needed)

If you need to add environment variables:

1. Go to your project settings in Vercel.
2. Navigate to the "Environment Variables" section.
3. Add your key-value pairs.
4. Redeploy your application for the changes to take effect. 