import {type Member} from "~/types/api/item/clubDependent/member";
import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";
import {MIME_TYPE_JSON} from "~/composables/api/api";
import {JwtToken} from "~/types/jwtTokens";
import type {Ref} from "vue";
import ImageQuery from "~/composables/api/query/ImageQuery";
import {defineStore} from "pinia";
import dayjs from "dayjs";
import UserQuery from "~/composables/api/query/UserQuery";
import type {LinkedProfile} from "~/types/api/linkedProfile";
import type {User} from "~/types/api/item/user";
import {UserRole} from "~/types/api/item/user";
import {type Club, ClubRole} from "~/types/api/item/club";
import ClubQuery from "~/composables/api/query/ClubQuery";
import ClubSettingQuery from "~/composables/api/query/clubDependent/ClubSettingQuery";

export const useSelfUserStore = defineStore('selfUser', () => {
  const member: Ref<Member | undefined> = ref(undefined)
  const user: Ref<User | undefined> = ref(undefined)
  const selectedProfile: Ref<LinkedProfile | undefined> = ref(undefined)

  const isImpersonating = ref(false)
  const impersonatedUser: Ref<string | undefined> = ref(undefined)

  const appConfigStore = useAppConfigStore()

  // Session Management
  const selfJwtToken: Ref<JwtToken | null> = ref(null)
  const isRefreshingJwtToken = ref(false);
  function getSelfJwtToken(): Ref<JwtToken|null> {
    return selfJwtToken;
  }

  function setSelfJwtToken(payload: JwtToken) {
    // We update the selfJwtToken ref
    selfJwtToken.value = payload
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
    if (!jwtToken.value.access || !jwtToken.value.access.token || (jwtToken.value.access && dayjs(jwtToken.value.access?.date).isBefore() )) {
      if (!(jwtToken.value.refresh && jwtToken.value.refresh.token)) {
        return logJwtError("No refresh access token.")
      }

      // Already refreshing
      if (isRefreshingJwtToken.value) {
        // We are already refreshing we wait
        await delay(100)
        // Taking to long to refresh we are in timeout
        if (delayedCalled > 100) { // 10 seconds
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
    const userQuery = new UserQuery()
    const {retrieved} = await userQuery.self()
    if (retrieved) {
      user.value = retrieved

      if (!retrieved.linkedProfiles || retrieved.linkedProfiles.length === 0) {
        return
      }

      if (selectedProfile.value === undefined) {
        selectedProfile.value = retrieved.linkedProfiles[0]
      } else {
        if (selectedProfile.value && !selectedProfile.value.id.startsWith('sc-')) {
          selectedProfile.value = retrieved.linkedProfiles.find( (profile) => profile.id === selectedProfile.value?.id)
        }
      }

      // We refresh the club in an async way
      refreshSelectedClub()

      const memberQuery = new MemberQuery()
      member.value = selectedProfile.value?.member
      if (member.value && member.value.uuid) {
        const { retrieved:retrievedMember } = await memberQuery.get(member.value.uuid.toString())
        if (retrievedMember) {
          member.value = retrievedMember

          // We load the profile image
          const image = await loadProfileImage()
          if (image) {
            member.value.profileImageBase64 = image
          }
        }
      }
    }

    // We refresh the config we got from the api
    appConfigStore.refresh()
  }

  async function refreshSelectedClub() {
    if (selectedProfile.value?.club) {
      const clubQuery = new ClubQuery()
      const { retrieved: retrievedClub } = await clubQuery.getCurrentClub()
      if (retrievedClub) {
        selectedProfile.value.club = retrievedClub

        if (retrievedClub.settings?.uuid) {
          const clubSettingQuery = new ClubSettingQuery()
          const { retrieved: clubSettings } = await clubSettingQuery.get(retrievedClub.settings.uuid)
          if (clubSettings) {
            selectedProfile.value.club.settings = clubSettings

            // We load the club logo
            const image = await loadClubLogo()
            if (image) {
              selectedProfile.value.club.settings.logoBase64 = image
            }
          }
        }
      }
    }
  }

  async function impersonateClub(club: Club) {
    if (!isSuperAdmin()) return false

    const fakeProfile: LinkedProfile = {
      id: 'sc-' + club.uuid,
      club: club,
      displayName: `${club.name}`,
      role: ClubRole.Admin
    }

    selectedProfile.value = fakeProfile
    await refresh()
    isImpersonating.value = true

    return true
  }

  async function impersonateUser(userImpersonated: User) {
    if (!isSuperAdmin()) return false

    selectedProfile.value = undefined
    member.value = undefined
    user.value = userImpersonated
    impersonatedUser.value = userImpersonated.email
    await refresh()
    isImpersonating.value = true

    navigateTo('/') // We always send to the homepage

    return true
  }


  async function stopImpersonation() {
    selectedProfile.value = undefined
    impersonatedUser.value = undefined
    isImpersonating.value = false
    await refresh()

    if (isSuperAdmin()) {
      navigateTo('/super-admin')
    } else {
      navigateTo('/admin')
    }
  }

  async function loadProfileImage() {
    if (!member.value || !member.value.profileImage?.privateUrl) return null;

    const imageQuery = new ImageQuery();
    const { retrieved } = await imageQuery.getFromUrl(member.value.profileImage.privateUrl);

    if (!retrieved || !retrieved.base64) return null

    return retrieved.base64
  }

  async function loadClubLogo() {
    if (!selectedProfile.value?.club.settings.logo?.publicUrl) return null;
    const imageQuery = new ImageQuery();
    const { retrieved } = await imageQuery.getFromUrl(selectedProfile.value.club.settings.logo.publicUrl);

    if (!retrieved || !retrieved.base64) return null

    return retrieved.base64
  }

  function logout(redirect: boolean = true) {
    if (!selfJwtToken.value && member.value == undefined) return;

    selfJwtToken.value = null
    member.value = undefined
    user.value = undefined
    selectedProfile.value = undefined

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

  function isSuperAdmin(): boolean {
    if (!isLogged()) return false;
    if (user.value) {
      return user.value.role === UserRole.SuperAdmin
    }

    return false
  }

  function isAdmin(): boolean {
    if (!isLogged()) return false;

    if (isSuperAdmin()) return true;

    if (selectedProfile.value && selectedProfile.value.role) {
      return selectedProfile.value.role === ClubRole.Admin
    }
    return false;
  }

  function hasSupervisorRole(): boolean {
    if (!isLogged()) return false;

    if (isSuperAdmin()) return true;

    if (selectedProfile.value && selectedProfile.value.role) {
      return selectedProfile.value.role === ClubRole.Supervisor || isAdmin()
    }

    return false;
  }

  function isBadger(): boolean {
    if (!isLogged()) return false;

    if (user.value) {
      return user.value.role === UserRole.Badger
    }
    return false;
  }

  return {
    user,
    member,
    selectedProfile,

    isImpersonating,
    impersonatedUser,
    impersonateClub,
    impersonateUser,
    stopImpersonation,

    refresh,
    refreshSelectedClub,
    logout,

    isLogged,
    isSuperAdmin,
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
}, {
  persist: {
    // We only save those attributes
    pick: [
      // 'user',
      // 'member',
      'isImpersonating',
      'selectedProfile.id',
      'selectedProfile.club.@id',
      'selectedProfile.club.uuid',
      'selfJwtToken',
    ],
  }
})
