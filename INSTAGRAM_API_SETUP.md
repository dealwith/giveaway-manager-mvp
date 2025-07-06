# Instagram API Setup Guide

This application uses Instagram Graph API to fetch comments from Instagram posts. Due to Instagram's API limitations, proper setup is required.

## Requirements

1. **Instagram Business or Creator Account**: The Instagram account must be converted to a Business or Creator account.
2. **Facebook Page**: The Instagram account must be connected to a Facebook Page.
3. **Facebook App**: You need to create a Facebook App with Instagram permissions.

## Current Limitations

The Instagram Graph API has the following limitations:

1. **No Direct Shortcode to Media ID Conversion**: Instagram doesn't provide a direct way to convert post shortcodes (from URLs) to media IDs.
2. **Only Your Own Posts**: You can only fetch comments from posts that belong to your connected Instagram Business Account.
3. **Comments API**: Available only for Business/Creator accounts, not personal accounts.

## Environment Variables

Add these to your `.env.local` file:

```bash
# Instagram Graph API Access Token
INSTAGRAM_ACCESS_TOKEN=your_access_token_here

# Instagram Business Account ID
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_business_account_id_here
```

## How It Works

1. When you provide an Instagram post URL (e.g., `https://www.instagram.com/p/DDUpmjfIMJF/`), the system extracts the shortcode.
2. The system searches through your business account's recent posts to find a matching permalink.
3. Once the media ID is found, it fetches the comments using the Instagram Graph API.

## Troubleshooting

### "Could not find media ID for the Instagram post"

This error occurs when:

- The post doesn't belong to your Instagram Business Account
- The post is too old (not in recent 100 posts)
- The Instagram API credentials are incorrect

### "Invalid media ID"

This error indicates that the API received an invalid media ID format. Ensure you're using the correct Instagram Business Account ID.

### Alternative Solutions

If you frequently encounter issues with URL-based lookups, consider:

1. **Storing Media IDs**: When creating posts via API, store the media ID for later use.
2. **Manual Media ID Entry**: Allow users to input media IDs directly instead of URLs.
3. **Webhook Integration**: Set up webhooks to track new posts and their media IDs automatically.

## Getting Your Credentials

### Step 1: Convert to Business/Creator Account

1. Go to Instagram Settings
2. Switch to Professional Account
3. Choose Business or Creator

### Step 2: Connect to Facebook Page

1. In Instagram Settings, go to "Linked Accounts"
2. Connect your Facebook Page

### Step 3: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Instagram Basic Display or Instagram Graph API product
4. Generate access tokens

### Step 4: Get Your Business Account ID

Use the Graph API Explorer or make an API call to get your Instagram Business Account ID.

## API Rate Limits

Be aware of Instagram's rate limits:

- 200 calls per hour per user
- Comments are paginated (50 per request by default)

## Future Improvements

To improve the Instagram integration, consider:

1. Implementing a media ID cache system
2. Adding support for Instagram webhooks
3. Creating a UI for manual media ID input
4. Building a post management system that stores media IDs
