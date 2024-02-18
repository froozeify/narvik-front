export class JwtToken {
	public access?: JwtAccessToken;
	public refresh?: JwtRefreshToken;
}

interface _Token {
	token: string,
	date: Date
}

export interface JwtAccessToken extends _Token {

}

export interface JwtRefreshToken extends _Token {

}
