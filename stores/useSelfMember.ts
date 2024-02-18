import {type Member, MemberRole} from "~/types/member";
import MemberQuery from "~/composables/api/query/MemberQuery";
import {getJwtCookies, useLogout} from "~/composables/api/api";

export const useSelfMemberStore = defineStore('selfMember', () => {
	const member: Ref<Member | undefined> = ref(undefined)

	async function refresh() {
		const memberQuery = new MemberQuery();
		const { retrieved } = await memberQuery.self()
		if (retrieved) {
			member.value = retrieved.value
		}
	}

	function logout() {
		useLogout() // Logout from the api (cookies)
		const toast = useToast();
		toast.add({
			title: "Vous avez été déconnecté."
		})

		member.value = undefined;
		navigateTo('/login');
	}

	function isLogged(): boolean {
		const cookies = getJwtCookies();
		if (cookies?.access || cookies?.refresh) {
			return true;
		}
		return false;
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
	}
})
