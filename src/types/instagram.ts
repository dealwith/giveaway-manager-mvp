export interface InstagramComment {
	id: string;
	username: string;
	text: string;
	timestamp: Date;
}

export interface InstagramPost {
	id: string;
	shortcode: string;
	url: string;
	comments: InstagramComment[];
}
