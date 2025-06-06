// src/lib/instagram.ts
import { InstagramComment, InstagramPost } from "app-types/instagram";
import { INSTAGRAM_API } from "constants/instagram";

// Extract Instagram post ID from URL
export function extractPostId(postUrl: string): string | null {
	const match = postUrl.match(INSTAGRAM_API.POST_REGEX);

	return match ? match[1] : null;
}

// Validate Instagram Post URL
export function isValidInstagramPostUrl(url: string): boolean {
	return INSTAGRAM_API.POST_REGEX.test(url);
}

// Simulated Instagram API function (in a real app, you would use the actual Instagram API)
// For demo purposes, we're simulating the API calls
// In production, you would replace these with actual Instagram Graph API calls
export async function fetchPostComments(
	postId: string
): Promise<InstagramComment[]> {
	// This is a simulation - in a real app you would use the Instagram Graph API
	// and proper authentication
	try {
		console.log(`Fetching comments for post ${postId}`);

		// In a real implementation, you would call Instagram API here
		// For demo purposes, we'll simulate a response
		// This would be replaced with actual API calls in production

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Simulate some comments
		const simulatedComments: InstagramComment[] = Array.from({
			length: 15
		}).map((_, i) => ({
			id: `comment_${i + 1}_${postId}`,
			username: `user_${i + 1}`,
			text: i % 3 === 0 ? "Great post! #winner" : "Nice content!",
			timestamp: new Date(Date.now() - i * 3600000)
		}));

		return simulatedComments;
	} catch (error) {
		console.error("Error fetching Instagram comments:", error);
		throw new Error("Failed to fetch Instagram comments");
	}
}

// Check comments for keyword matches
export function findCommentsWithKeyword(
	comments: InstagramComment[],
	keyword: string
): InstagramComment[] {
	const normalizedKeyword = keyword.toLowerCase().trim();

	return comments.filter((comment) =>
		comment.text.toLowerCase().includes(normalizedKeyword)
	);
}

// Send direct message to user (simulated)
export async function sendDirectMessage(
	username: string,
	message: string
): Promise<boolean> {
	try {
		console.log(`Sending message to ${username}: ${message}`);

		// In a real implementation, you would call Instagram API here
		// For demo purposes, we'll simulate success

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return true;
	} catch (error) {
		console.error("Error sending direct message:", error);

		return false;
	}
}

// Like a comment (simulated)
export async function likeComment(commentId: string): Promise<boolean> {
	try {
		console.log(`Liking comment ${commentId}`);

		// In a real implementation, you would call Instagram API here
		// For demo purposes, we'll simulate success

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return true;
	} catch (error) {
		console.error("Error liking comment:", error);

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

// Get post data (simulated)
export async function getPostData(
	postId: string
): Promise<InstagramPost | null> {
	try {
		console.log(`Fetching post data for ${postId}`);

		// In a real implementation, you would call Instagram API here
		// For demo purposes, we'll simulate a response

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const comments = await fetchPostComments(postId);

		return {
			id: postId,
			shortcode: postId,
			url: `https://instagram.com/p/${postId}`,
			comments
		};
	} catch (error) {
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
	// Extract post ID
	const postId = extractPostId(postUrl);

	if (!postId) {
		throw new Error("Invalid Instagram post URL");
	}

	// Fetch comments
	const comments = await fetchPostComments(postId);

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
