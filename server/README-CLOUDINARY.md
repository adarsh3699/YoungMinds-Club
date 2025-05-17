# Cloudinary Configuration for Profile Picture Uploads

To enable profile picture uploads, you need to configure Cloudinary in your environment. Follow these steps:

## Step 1: Create a Cloudinary Account
If you don't already have one, create a free account at [Cloudinary](https://cloudinary.com/).

## Step 2: Get Your API Credentials
Once logged in to your Cloudinary dashboard, you'll find your account credentials:
- Cloud Name
- API Key
- API Secret

## Step 3: Add Cloudinary Credentials to Your .env File
Add the following variables to your `.env` file in the server directory:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with your actual Cloudinary credentials.

## Step 4: Restart Your Server
After adding the environment variables, restart your server for the changes to take effect.

## Testing the Upload
Once configured, you should be able to upload profile pictures from the profile page. 