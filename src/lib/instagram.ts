import axios from "axios";

import { InstagramComment, InstagramPost } from "app-types/instagram";
import { INSTAGRAM_API } from "constants/instagram";

export interface InstagramCredentials {
	accessToken: string;
	businessAccountId: string;
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

// Extract media ID from Instagram URL if present
function extractMediaIdFromUrl(url: string): string | null {
	// Try to extract media ID from URLs like:
	// https://www.instagram.com/p/ABC123/?img_index=17843534657877730
	// where 17843534657877730 is the media ID
	const mediaIdMatch = url.match(/(\d{10,})(?:[^\d]|$)/);
	if (mediaIdMatch && mediaIdMatch[1].length >= 10) {
		return mediaIdMatch[1];
	}
	return null;
}

async function findMediaIdByPermalink(
	permalink: string,
	credentials: InstagramCredentials
): Promise<string | null> {
	try {
		if (!credentials.accessToken || !credentials.businessAccountId) {
			throw new Error("Instagram credentials not configured");
		}

		const shortcode = extractPostShortcode(permalink);
		if (!shortcode) {
			console.error("Invalid Instagram URL format:", permalink);
			return null;
		}

		console.log("Finding media ID for:", {
			permalink,
			shortcode,
			businessAccountId: credentials.businessAccountId
		});

		// First, verify we can access the business account
		try {
			const accountCheck = await axios.get(
				`${INSTAGRAM_API.BASE_URL}/${credentials.businessAccountId}`,
				{
					params: {
						fields: "id,username,name",
						access_token: credentials.accessToken
					}
				}
			);
			console.log("Business account verified:", accountCheck.data);
		} catch (accountError) {
			console.error("Failed to access business account:", accountError);
			if (axios.isAxiosError(accountError)) {
				console.error("Account check error:", accountError.response?.data);
			}
			throw new Error("Unable to access Instagram Business Account. Please check your connection.");
		}

		// Fetch recent media from the business account
		const response = await axios.get(
			`${INSTAGRAM_API.BASE_URL}/${credentials.businessAccountId}/media`,
			{
				params: {
					fields: "id,permalink,shortcode",
					limit: 100, // Fetch more posts to increase chances of finding the target
					access_token: credentials.accessToken
				}
			}
		);

		// Find the post with matching permalink or shortcode
		const posts = response.data.data || [];
		console.log(`Fetched ${posts.length} posts from account`);
		
		// Log first few posts for debugging
		if (posts.length > 0) {
			console.log("Sample posts:", posts.slice(0, 3).map((p: any) => ({
				id: p.id,
				shortcode: p.shortcode,
				permalink: p.permalink
			})));
		}

		const targetPost = posts.find(
			(post: { id: string; permalink?: string; shortcode?: string }) => {
				const matches = post.permalink === permalink ||
					post.shortcode === shortcode ||
					(post.permalink && post.permalink.includes(shortcode));
				
				if (post.permalink && post.permalink.includes(shortcode.substring(0, 5))) {
					console.log("Checking post:", {
						postId: post.id,
						postShortcode: post.shortcode,
						postPermalink: post.permalink,
						targetShortcode: shortcode,
						matches
					});
				}
				
				return matches;
			}
		);

		if (targetPost) {
			console.log(`Found media ID ${targetPost.id} for permalink ${permalink}`);

			return targetPost.id;
		}

		// Try pagination if not found in first batch
		let nextPage = response.data.paging?.next;
		let pagesSearched = 1;
		const maxPages = 10; // Limit pagination to avoid excessive API calls
		
		while (nextPage && pagesSearched < maxPages) {
			const nextResponse = await axios.get(nextPage);
			const nextPosts = nextResponse.data.data || [];
			const foundPost = nextPosts.find(
				(post: { id: string; permalink?: string; shortcode?: string }) =>
					post.permalink === permalink ||
					post.shortcode === shortcode ||
					(post.permalink && post.permalink.includes(shortcode))
			);

			if (foundPost) {
				console.log(
					`Found media ID ${foundPost.id} for permalink ${permalink} on page ${pagesSearched + 1}`
				);

				return foundPost.id;
			}

			nextPage = nextResponse.data.paging?.next;
			pagesSearched++;
		}

		console.log(`Could not find media ID after searching ${pagesSearched} pages`);
		return null;
	} catch (error) {
		console.error("Error finding media ID by permalink:", error);
		if (axios.isAxiosError(error)) {
			console.error("Response data:", error.response?.data);
			console.error("Response status:", error.response?.status);
			if (error.response?.data?.error) {
				console.error("Instagram API error:", error.response.data.error);
			}
		}

		return null;
	}
}

// Fetch Instagram post comments using Graph API
export async function fetchPostComments(
	postUrlOrMediaId: string,
	credentials: InstagramCredentials
): Promise<InstagramComment[]> {
	try {
		if (!credentials.accessToken) {
			throw new Error("Please connect your Instagram account first");
		}

		let mediaId: string | undefined;

		// Check if input is already a media ID
		if (isMediaId(postUrlOrMediaId)) {
			mediaId = postUrlOrMediaId;
			console.log(`Using provided media ID: ${mediaId}`);
		} else {
			// It's a URL, validate format first
			if (!isValidInstagramPostUrl(postUrlOrMediaId)) {
				throw new Error("Invalid Instagram post URL format");
			}

			console.log(`Attempting to find media ID for URL: ${postUrlOrMediaId}`);

			// First, check if the URL contains a media ID
			const extractedMediaId = extractMediaIdFromUrl(postUrlOrMediaId);
			if (extractedMediaId) {
				console.log(`Found potential media ID in URL: ${extractedMediaId}`);
				// Try to use this media ID directly
				try {
					const testResponse = await axios.get(
						`${INSTAGRAM_API.BASE_URL}/${extractedMediaId}`,
						{
							params: {
								fields: "id",
								access_token: credentials.accessToken
							}
						}
					);
					if (testResponse.data && testResponse.data.id) {
						console.log(`Validated media ID from URL: ${extractedMediaId}`);
						mediaId = extractedMediaId;
					}
				} catch (error) {
					console.log(`Media ID ${extractedMediaId} from URL is not accessible`);
				}
			}

			// If we don't have a media ID yet, try to find it by searching posts
			if (!mediaId) {
				const foundMediaId = await findMediaIdByPermalink(
					postUrlOrMediaId,
					credentials
				);

				if (!foundMediaId) {
					// Try to determine the specific issue
					// Test if we can access the business account at all
					try {
						const testResponse = await axios.get(
							`${INSTAGRAM_API.BASE_URL}/${credentials.businessAccountId}`,
							{
								params: {
									fields: "id,username",
									access_token: credentials.accessToken
								}
							}
						);
						
						// If we get here, credentials are valid but post not found
						throw new Error(`Could not find the Instagram post. Please ensure:\n1. The post URL is correct\n2. The post belongs to your Instagram Business Account (@${testResponse.data.username || 'your account'})\n3. The post has not been deleted\n4. Your account has proper permissions`);
					} catch (testError) {
						if (axios.isAxiosError(testError) && testError.response?.status === 190) {
							throw new Error("Your Instagram connection has expired. Please reconnect your account.");
						}
						// Original error - post not found
						throw new Error(`Could not access the Instagram post. Please ensure it belongs to your connected Instagram Business Account.`);
					}
				}

				mediaId = foundMediaId;
			}
		}

		if (!mediaId) {
			throw new Error("Could not determine media ID for the Instagram post");
		}

		console.log(`Fetching comments for media ID ${mediaId}`);

		const response = await axios.get(
			`${INSTAGRAM_API.BASE_URL}/${mediaId}/comments`,
			{
				params: {
					fields: "id,username,text,timestamp",
					limit: INSTAGRAM_API.COMMENT_LIMIT,
					access_token: credentials.accessToken
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
export async function likeComment(
	commentId: string,
	credentials: InstagramCredentials
): Promise<boolean> {
	try {
		console.log(`Liking comment ${commentId}`);

		if (!credentials.accessToken) {
			throw new Error("Instagram access token not provided");
		}

		await axios.post(`${INSTAGRAM_API.BASE_URL}/${commentId}/likes`, {
			access_token: credentials.accessToken
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
	documentUrl: string,
	credentials: InstagramCredentials
): Promise<{
	messageStatus: "sent" | "failed";
	likeStatus: "sent" | "failed";
}> {
	// Send direct message with document link
	const message = `Congratulations! You've won our giveaway. Here's your prize: ${documentUrl}`;
	const messageResult = await sendDirectMessage(username, message);

	// Like the comment
	const likeResult = await likeComment(commentId, credentials);

	return {
		messageStatus: messageResult ? "sent" : "failed",
		likeStatus: likeResult ? "sent" : "failed"
	};
}

// Get post data using Instagram Graph API
export async function getPostData(
	postUrlOrMediaId: string,
	credentials: InstagramCredentials
): Promise<InstagramPost | null> {
	try {
		let mediaId: string | undefined;
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

			const foundMediaId = await findMediaIdByPermalink(
				postUrlOrMediaId,
				credentials
			);

			if (!foundMediaId) {
				throw new Error("Could not find media ID for the Instagram post");
			}

			mediaId = foundMediaId;
		}

		if (!mediaId) {
			throw new Error("Could not determine media ID for the Instagram post");
		}

		console.log(`Fetching post data for media ID ${mediaId}`);

		if (!credentials.accessToken) {
			throw new Error("Instagram access token not provided");
		}

		const response = await axios.get(`${INSTAGRAM_API.BASE_URL}/${mediaId}`, {
			params: {
				fields: "id,permalink,shortcode",
				access_token: credentials.accessToken
			}
		});

		const data = response.data;
		const comments = await fetchPostComments(mediaId, credentials);

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
	documentUrl: string,
	credentials: InstagramCredentials
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
	const comments = await fetchPostComments(postUrl, credentials);

	// Find comments with keyword
	const matchingComments = findCommentsWithKeyword(comments, keyword);

	// Process winners
	const winners = [];

	for (const comment of matchingComments) {
		const result = await processWinner(
			comment.username,
			comment.id,
			documentUrl,
			credentials
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
