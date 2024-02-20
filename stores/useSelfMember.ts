import {type Member, MemberRole} from "~/types/member";
import MemberQuery from "~/composables/api/query/MemberQuery";
import {MIME_TYPE_JSON} from "~/composables/api/api";
import {JwtToken} from "~/types/jwtTokens";
import type {Ref} from "vue";

export const useSelfMemberStore = defineStore('selfMember', () => {
	const member: Ref<Member | undefined> = ref(undefined)

	// Session Management
	const selfJwtToken: Ref<JwtToken | null> = ref(null)
	const isRefreshingJwtToken = ref(false);
	function getSelfJwtToken(): Ref<JwtToken|null> {
		if (selfJwtToken.value) return selfJwtToken

		// Settings from cookies storage
		let jwtToken: JwtToken|null = null;

		const authCookie = useCookie('auth');
		if (authCookie && authCookie.value != undefined) {
			jwtToken = new JwtToken();
			jwtToken.access = JSON.parse(atob(authCookie.value));
		}

		const refreshTokenCookie = useCookie('auth_refresh');
		if (refreshTokenCookie && refreshTokenCookie.value != undefined) {
			if (!jwtToken) {
				jwtToken = new JwtToken()
			}
			jwtToken.refresh = JSON.parse(atob(refreshTokenCookie.value));
		}

		if (jwtToken) {
			setSelfJwtToken(jwtToken)
		}

		return selfJwtToken;
	}

	function setSelfJwtToken(payload: JwtToken) {
		// We update the selfJwtToken ref
		selfJwtToken.value = payload

		if (payload.access) {
			const authCookie = useCookie('auth', {
				expires: new Date(payload.access.date),
				httpOnly: false,
				sameSite: true,
			});
			authCookie.value = btoa(JSON.stringify(payload.access))
		} else {
			console.warn("No access token in the payload.")
		}

		if (payload.refresh && payload.refresh.date) {
			// Expire at the date returned by the refresh token
			const refreshTokenCookie = useCookie('auth_refresh', {
				expires: new Date(payload.refresh.date),
				httpOnly: false,
				sameSite: true,
			});
			refreshTokenCookie.value = btoa(JSON.stringify(payload.refresh));
		}
	}

	function delay(time: number) {
		return new Promise(resolve => setTimeout(resolve, time));
	}

	async function enhanceJwtTokenDefined(delayedCalled: number = 0) {
		const jwtToken = getSelfJwtToken()

		if (!jwtToken || !jwtToken.value) {
			throw new Error("No auth token.");
		}

		// Access token is expired
		if (!jwtToken.value.access || !jwtToken.value.access.token || (jwtToken.value.access && jwtToken.value.access.date < new Date() )) {
			if (!(jwtToken.value.refresh && jwtToken.value.refresh.token)) {
				logout(false)
				throw new Error("No refresh access token.");
			}

			// First request is refreshing
			if (isRefreshingJwtToken.value) {
				// We are already refreshing we wait
				await delay(100)
				// Taking to long to refresh we are in timeout
				if (delayedCalled > 100) { // 10 secondes
					logout(false)
					throw new Error("Taking too long to refresh the token.");
				}
				return enhanceJwtTokenDefined(++delayedCalled);
			}

			isRefreshingJwtToken.value = true
			await useRefreshAccessToken(jwtToken)
			if (!jwtToken.value) {
				logout(false)
				throw new Error("An error occurred when refreshing the token.");
			}
			isRefreshingJwtToken.value = false
		}

		return jwtToken;
	}

	async function useRefreshAccessToken(jwtToken: Ref<JwtToken|null>) {
		if (!jwtToken.value || !jwtToken.value.refresh || !jwtToken.value.refresh.token) {
			console.error("No refresh token defined in the JwtToken")
			return null;
		}

		const { data, error } = await useLocalApiData("auth/token/refresh", {
			method: "POST",
			headers: {
				Accept: MIME_TYPE_JSON,
				'content-type': 'application/x-www-form-urlencoded',
			},
			body: `refresh_token=${jwtToken.value.refresh.token}`
		});

		if (error.value) {
			console.error(error.value)
			return null;
		}

		return setJwtSelfJwtTokenFromApiResponse(data);
	}

	function setJwtSelfJwtTokenFromApiResponse(data: Ref<any>): JwtToken {
		const jwtToken = new JwtToken();
		jwtToken.access = {
			date: new Date(Date.now() + (3480 * 1000)), // Expires in 1h - 2mn (to get some room on the token expiration),
			token: data.value.token
		}

		jwtToken.refresh = {
			date: new Date((data.value.refresh_token_expiration - 120) * 1000),
			token: data.value.refresh_token
		}

		setSelfJwtToken(jwtToken);

		return jwtToken;
	}



	// End Session Management



	async function refresh() {
		const memberQuery = new MemberQuery();
		const { retrieved } = await memberQuery.self()
		if (retrieved) {
			member.value = retrieved.value
		}
	}

	function logout(redirect: boolean = true) {
		selfJwtToken.value = null
		member.value = undefined;

		const authCookie = useCookie('auth');
		authCookie.value = null

		const refreshTokenCookie = useCookie('auth_refresh');
		refreshTokenCookie.value = null;

		// We stay on same page
		if (!redirect) return;

		const toast = useToast();
		toast.add({
			title: "Vous avez été déconnecté."
		})
		navigateTo('/login')
	}

	function isLogged(): boolean {
		const selfToken = getSelfJwtToken();

		if (
			!selfToken.value ||
			!selfToken.value?.refresh
		) return false

		return true
	}

	function isAdmin(): boolean {
		if (!isLogged()) return false;

		if (member.value && member.value.role) {
			return member.value.role === MemberRole.Admin
		}
		return false;
	}

	function hasSupervisorRole(): boolean {
		if (!isLogged()) return false;

		if (member.value && member.value.role) {
			return member.value.role === MemberRole.Supervisor || isAdmin()
		}

		return false;
	}

	function isBadger(): boolean {
		if (!isLogged()) return false;

		if (member.value && member.value.role) {
			return member.value.role === MemberRole.Badger
		}
		return false;
	}

	return {
		member,

		refresh,
		logout,

		isLogged,
		isAdmin,
		isBadger,

		hasSupervisorRole,

		// Session management
		selfJwtToken,
		setJwtSelfJwtTokenFromApiResponse,
		enhanceJwtTokenDefined,
	}
})
