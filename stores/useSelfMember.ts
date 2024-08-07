import {type Member, MemberRole} from "~/types/api/item/member";
import MemberQuery from "~/composables/api/query/MemberQuery";
import {MIME_TYPE_JSON} from "~/composables/api/api";
import {JwtToken} from "~/types/jwtTokens";
import type {Ref} from "vue";
import type {Image} from "~/types/api/item/image";
import ImageQuery from "~/composables/api/query/ImageQuery";
import GlobalSettingQuery from "~/composables/api/query/GlobalSettingQuery";

export const useSelfMemberStore = defineStore('selfMember', () => {
  const member: Ref<Member | undefined> = ref(undefined)

  const appConfigStore = useAppConfigStore()

  // Session Management
  const selfJwtToken: Ref<JwtToken | null> = ref(null)
  const isRefreshingJwtToken = ref(false);
  function getSelfJwtToken(): Ref<JwtToken|null> {
    if (selfJwtToken.value) {
      // We remove the authCookie if he is not in the cookie
      const authCookie = useCookie('auth');
      if (!authCookie || authCookie.value == undefined) {
        selfJwtToken.value.access = undefined
        refreshCookie('auth')
      }

      const refreshTokenCookie = useCookie('auth_refresh');
      if (!refreshTokenCookie || refreshTokenCookie.value == undefined) {
        selfJwtToken.value.refresh = undefined
        refreshCookie('auth_refresh')
      }

      return selfJwtToken
    }

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
      refreshCookie('auth')
    }

    if (payload.refresh && payload.refresh.date) {
      // Expire at the date returned by the refresh token
      const refreshTokenCookie = useCookie('auth_refresh', {
        expires: new Date(payload.refresh.date),
        httpOnly: false,
        sameSite: true,
      });
      refreshTokenCookie.value = btoa(JSON.stringify(payload.refresh))
      refreshCookie('auth_refresh')
    }
  }

  function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  function displayJwtError(description: string, redirect: boolean = true) {
    const toast = useToast()
    toast.add({
      color: "red",
      title: "Erreur d'authentification",
      description: description
    })
    return logJwtError(description, redirect)
  }

  function logJwtError(description: string, redirect: boolean = true) {
    console.error('JWT Error: ' + description)
    logout(redirect)
    return ref(null)
  }

  async function enhanceJwtTokenDefined(delayedCalled: number = 0) {
    const jwtToken = getSelfJwtToken()

    if (!jwtToken || !jwtToken.value) {
      return logJwtError("No auth token.")
    }

    // Access token is expired
    if (!jwtToken.value.access || !jwtToken.value.access.token || (jwtToken.value.access && jwtToken.value.access.date < new Date() )) {
      if (!(jwtToken.value.refresh && jwtToken.value.refresh.token)) {
        return logJwtError("No refresh access token.")
      }

      // Already refreshing
      if (isRefreshingJwtToken.value) {
        // We are already refreshing we wait
        await delay(100)
        // Taking to long to refresh we are in timeout
        if (delayedCalled > 100) { // 10 secondes
          return displayJwtError("Taking too long to refresh the token.", true);
        }
        return enhanceJwtTokenDefined(++delayedCalled);
      }

      isRefreshingJwtToken.value = true
      const newJwtToken = await useRefreshAccessToken(jwtToken)
      if (!newJwtToken || !jwtToken.value) {
        return logJwtError('An error occurred when refreshing the token.')
      }
      isRefreshingJwtToken.value = false
    }

    return jwtToken;
  }

  async function useRefreshAccessToken(jwtToken: Ref<JwtToken|null>) {
    if (!jwtToken.value || !jwtToken.value.refresh || !jwtToken.value.refresh.token) {
      logJwtError("No refresh token defined in the JwtToken", false)
      return null;
    }

    try {
      const data = await $localApi("auth/token/refresh", {
        method: "POST",
        headers: {
          Accept: MIME_TYPE_JSON,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: `refresh_token=${jwtToken.value.refresh.token}`
      });
      return setJwtSelfJwtTokenFromApiResponse(data);
    } catch (e) {
      return null;
    }
  }

  function setJwtSelfJwtTokenFromApiResponse(data: any): JwtToken {
    const jwtToken = new JwtToken();
    jwtToken.access = {
      date: new Date(Date.now() + (3480 * 1000)), // Expires in 1h - 2mn (to get some room on the token expiration),
      token: data.token
    }

    jwtToken.refresh = {
      date: new Date((data.refresh_token_expiration - 120) * 1000),
      token: data.refresh_token
    }

    setSelfJwtToken(jwtToken);

    return jwtToken;
  }



  // End Session Management


  async function refresh() {
    const memberQuery = new MemberQuery();
    const {retrieved} = await memberQuery.self()
    if (retrieved) {
      member.value = retrieved

      // We load the profile image
      const image = await loadProfileImage()
      if (image) {
        member.value.profileImageBase64 = image
      }
    }

    // We refresh the config we got from the api
    appConfigStore.refresh()
  }

  async function loadProfileImage() {
    if (!member.value || !member.value.profileImage) return null;

    const imageQuery = new ImageQuery();
    const { retrieved } = await imageQuery.get(member.value.profileImage);

    if (!retrieved || !retrieved.base64) return null

    return retrieved.base64
  }

  function logout(redirect: boolean = true) {
    if (!selfJwtToken.value && member.value == undefined) return;

    selfJwtToken.value = null
    member.value = undefined

    const authCookie = useCookie('auth');
    authCookie.value = null
    refreshCookie('auth')

    const refreshTokenCookie = useCookie('auth_refresh');
    refreshTokenCookie.value = null;
    refreshCookie('auth_refresh')

    // We refresh the config we got from the api
    appConfigStore.refresh(false)

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
    displayJwtError,
    logJwtError,
  }
})
