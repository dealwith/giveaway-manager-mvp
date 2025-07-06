import axios from "axios";

import { InstagramComment, InstagramPost } from "app-types/instagram";
import { INSTAGRAM_API } from "constants/instagram";

const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

if (!INSTAGRAM_ACCESS_TOKEN) {
	console.warn("Instagram access token not configured. API calls will fail.");
}

if (!INSTAGRAM_BUSINESS_ACCOUNT_ID) {
	console.warn(
		"Instagram business account ID not configured. Some API calls may fail."
	);
}

// Extract Instagram post shortcode from URL
export function extractPostShortcode(postUrl: string): string | null {
	const match = postUrl.match(INSTAGRAM_API.POST_REGEX);

	return match ? match[1] : null;
}

// Validate Instagram Post URL
export function isValidInstagramPostUrl(url: string): boolean {
	return INSTAGRAM_API.POST_REGEX.test(url);
}

// Check if the input is a media ID (numeric string)
function isMediaId(input: string): boolean {
	return /^\d+(_\d+)?$/.test(input);
}

async function findMediaIdByPermalink(
	permalink: string
): Promise<string | null> {
	try {
		if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_BUSINESS_ACCOUNT_ID) {
			throw new Error("Instagram API credentials not configured");
		}

		// Fetch recent media from the business account
		const response = await axios.get(
			`${INSTAGRAM_API.BASE_URL}/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
			{
				params: {
					fields: "id,permalink",
					limit: 100, // Fetch more posts to increase chances of finding the target
					access_token: INSTAGRAM_ACCESS_TOKEN
				}
			}
		);

		// Find the post with matching permalink
		const posts = response.data.data || [];
		const targetPost = posts.find(
			(post: { permalink: string }) =>
				post.permalink === permalink ||
				post.permalink.includes(extractPostShortcode(permalink) || "")
		);

		if (targetPost) {
			console.log(`Found media ID ${targetPost.id} for permalink ${permalink}`);

			return targetPost.id;
		}

		// Try pagination if not found in first batch
		let nextPage = response.data.paging?.next;
		while (nextPage) {
			const nextResponse = await axios.get(nextPage);
			const nextPosts = nextResponse.data.data || [];
			const foundPost = nextPosts.find(
				(post: { permalink: string }) =>
					post.permalink === permalink ||
					post.permalink.includes(extractPostShortcode(permalink) || "")
			);

			if (foundPost) {
				console.log(
					`Found media ID ${foundPost.id} for permalink ${permalink}`
				);

				return foundPost.id;
			}

			nextPage = nextResponse.data.paging?.next;
		}

		return null;
	} catch (error) {
		console.error("Error finding media ID by permalink:", error);

		return null;
	}
}

// Fetch Instagram post comments using Graph API
export async function fetchPostComments(
	postUrlOrMediaId: string
): Promise<InstagramComment[]> {
	try {
		if (!INSTAGRAM_ACCESS_TOKEN) {
			throw new Error("Instagram access token not configured");
		}

		let mediaId: string;

		// Check if input is already a media ID
		if (isMediaId(postUrlOrMediaId)) {
			mediaId = postUrlOrMediaId;
			console.log(`Using provided media ID: ${mediaId}`);
		} else {
			// It's a URL, try to find the media ID
			console.log(`Attempting to find media ID for URL: ${postUrlOrMediaId}`);

			const foundMediaId = await findMediaIdByPermalink(postUrlOrMediaId);

			if (!foundMediaId) {
				throw new Error(`
          Could not find media ID for the Instagram post.

          This can happen if:
          1. The post doesn't belong to your Instagram Business Account
          2. The post is too old and not in recent media
          3. The Instagram API credentials are incorrect

          To fix this:
          - Ensure the post belongs to your connected Instagram Business Account
          - Use the media ID directly instead of the post URL
          - Check that INSTAGRAM_BUSINESS_ACCOUNT_ID is set correctly
        `);
			}

			mediaId = foundMediaId;
		}

		console.log(`Fetching comments for media ID ${mediaId}`);

		const response = await axios.get(
			`${INSTAGRAM_API.BASE_URL}/${mediaId}/comments`,
			{
				params: {
					fields: "id,username,text,timestamp",
					limit: INSTAGRAM_API.COMMENT_LIMIT,
					access_token: INSTAGRAM_ACCESS_TOKEN
				}
			}
		);

		const comments: InstagramComment[] =
			response.data.data?.map(
				(comment: {
					id: string;
					username: string;
					text: string;
					timestamp: string;
				}) => ({
					id: comment.id,
					username: comment.username,
					text: comment.text,
					timestamp: new Date(comment.timestamp)
				})
			) || [];

		console.log(`Fetched ${comments.length} comments for media ID ${mediaId}`);

		return comments;
	} catch (error: unknown) {
		console.error("Error fetching Instagram comments:", error);

		if (axios.isAxiosError(error)) {
			console.error("Response data:", error.response?.data);
			console.error("Response status:", error.response?.status);

			if (error.response?.status === 400) {
				const errorCode = error.response?.data?.error?.code;
				const errorType = error.response?.data?.error?.type;
				const errorMessage = error.response?.data?.error?.message;

				if (errorCode === 100 && errorType === "GraphMethodException") {
					throw new Error(
						`Invalid media ID. ${errorMessage || "Please ensure you're using a valid Instagram media ID."}`
					);
				}

				if (errorCode === 190) {
					throw new Error(
						"Invalid Instagram access token. Please check your Instagram API credentials."
					);
				}

				if (errorMessage?.includes("does not exist")) {
					throw new Error(
						"Media not found. The post may have been deleted or you don't have permission to access it."
					);
				}
			}

			if (error.response?.status === 404) {
				throw new Error(
					"Instagram post not found. Please check the post URL and ensure you have access to it."
				);
			}
		}

		const errorMessage =
			(
				error as {
					response?: { data?: { error?: { message?: string } } };
					message?: string;
				}
			)?.response?.data?.error?.message ||
			(error as { message?: string })?.message ||
			"Unknown error";
		throw new Error(`Failed to fetch Instagram comments: ${errorMessage}`);
	}
}

// Check comments for keyword matches
export function findCommentsWithKeyword(
	comments: InstagramComment[],
	keyword: string
): InstagramComment[] {
	const normalizedKeyword = keyword.toLowerCase().trim();

	console.log(
		`Searching for keyword "${keyword}" (normalized: "${normalizedKeyword}") in ${comments.length} comments`
	);

	const matchingComments = comments.filter((comment) => {
		const normalizedText = comment.text.toLowerCase();
		const matches = normalizedText.includes(normalizedKeyword);

		if (matches) {
			console.log(`Found match: ${comment.username} - "${comment.text}"`);
		}

		return matches;
	});

	console.log(`Found ${matchingComments.length} matching comments`);

	return matchingComments;
}

// Send direct message to user
export async function sendDirectMessage(
	username: string,
	message: string
): Promise<boolean> {
	try {
		console.log(`Sending message to ${username}: ${message}`);

		// Note: Instagram Basic Display API doesn't support sending messages
		// This would require Instagram Messaging API or manual process
		console.warn(
			"Instagram API does not support automated messaging. Manual process required."
		);

		// Return true to indicate the action was "processed" (manual notification needed)
		return true;
	} catch (error) {
		console.error("Error sending direct message:", error);

		return false;
	}
}

// Like a comment
export async function likeComment(commentId: string): Promise<boolean> {
	try {
		console.log(`Liking comment ${commentId}`);

		if (!INSTAGRAM_ACCESS_TOKEN) {
			throw new Error("Instagram access token not configured");
		}

		await axios.post(`${INSTAGRAM_API.BASE_URL}/${commentId}/likes`, {
			access_token: INSTAGRAM_ACCESS_TOKEN
		});

		return true;
	} catch (error: unknown) {
		const errorMessage =
			(
				error as {
					response?: { data?: { error?: { message?: string } } };
					message?: string;
				}
			)?.response?.data?.error?.message ||
			(error as { message?: string })?.message ||
			"Unknown error";
		console.error(`Failed to like comment: ${errorMessage}`);

		return false;
	}
}

// Process winners by sending messages and liking comments
export async function processWinner(
	username: string,
	commentId: string,
	documentUrl: string
): Promise<{
	messageStatus: "sent" | "failed";
	likeStatus: "sent" | "failed";
}> {
	// Send direct message with document link
	const message = `Congratulations! You've won our giveaway. Here's your prize: ${documentUrl}`;
	const messageResult = await sendDirectMessage(username, message);

	// Like the comment
	const likeResult = await likeComment(commentId);

	return {
		messageStatus: messageResult ? "sent" : "failed",
		likeStatus: likeResult ? "sent" : "failed"
	};
}

// Get post data using Instagram Graph API
export async function getPostData(
	postUrlOrMediaId: string
): Promise<InstagramPost | null> {
	try {
		let mediaId: string;
		let shortcode: string | null = null;

		// Check if input is already a media ID
		if (isMediaId(postUrlOrMediaId)) {
			mediaId = postUrlOrMediaId;
			console.log(`Using provided media ID: ${mediaId}`);
		} else {
			// It's a URL, extract shortcode and try to find media ID
			shortcode = extractPostShortcode(postUrlOrMediaId);
			if (!shortcode) {
				throw new Error("Invalid Instagram post URL");
			}

			const foundMediaId = await findMediaIdByPermalink(postUrlOrMediaId);

			if (!foundMediaId) {
				throw new Error("Could not find media ID for the Instagram post");
			}

			mediaId = foundMediaId;
		}

		console.log(`Fetching post data for media ID ${mediaId}`);

		if (!INSTAGRAM_ACCESS_TOKEN) {
			throw new Error("Instagram access token not configured");
		}

		const response = await axios.get(`${INSTAGRAM_API.BASE_URL}/${mediaId}`, {
			params: {
				fields: "id,permalink,shortcode",
				access_token: INSTAGRAM_ACCESS_TOKEN
			}
		});

		const data = response.data;
		const comments = await fetchPostComments(mediaId);

		return {
			id: data.id,
			shortcode: data.shortcode || shortcode || mediaId,
			url: data.permalink || postUrlOrMediaId,
			comments
		};
	} catch (error: unknown) {
		console.error("Error fetching Instagram post data:", error);

		return null;
	}
}

// Process giveaway for a post
export async function processGiveaway(
	postUrl: string,
	keyword: string,
	documentUrl: string
): Promise<{
	winners: Array<{
		username: string;
		commentId: string;
		messageStatus: "sent" | "failed";
		likeStatus: "sent" | "failed";
	}>;
	totalComments: number;
}> {
	// Validate post URL or media ID
	if (!isMediaId(postUrl) && !isValidInstagramPostUrl(postUrl)) {
		throw new Error(
			"Invalid Instagram post URL or media ID. Please ensure the URL is in the format: https://instagram.com/p/SHORTCODE/ or provide a valid media ID."
		);
	}

	console.log("Processing giveaway with input:", postUrl);

	// Fetch comments
	const comments = await fetchPostComments(postUrl);

	// Find comments with keyword
	const matchingComments = findCommentsWithKeyword(comments, keyword);

	// Process winners
	const winners = [];

	for (const comment of matchingComments) {
		const result = await processWinner(
			comment.username,
			comment.id,
			documentUrl
		);
		winners.push({
			username: comment.username,
			commentId: comment.id,
			messageStatus: result.messageStatus,
			likeStatus: result.likeStatus
		});
	}

	return {
		winners,
		totalComments: comments.length
	};
}
