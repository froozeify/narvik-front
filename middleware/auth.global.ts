import {pathsMatch} from "~/utils/resource";
import {useSelfMemberStore} from "~/stores/useSelfMember";

const publicPaths = [
	"^/login$",
	"^/login/bdg/.*"
]

export default defineNuxtRouteMiddleware(async (to, from) => {
	const selfStore = useSelfMemberStore();

	if (!selfStore.member && selfStore.isLogged()) {
		await selfStore.refresh();
	}

	if (pathsMatch(publicPaths, to.fullPath)) {
		if (selfStore.isLogged()) { // User is logged
			// User is on login page, we redirect him to the default home
			if (to.fullPath === "/login") {
				return navigateTo("/");
			}
		}

		// Nothing more to do, user is free to browse public page
		return;
	}

	// Protected pages

	// User not logged, we redirect him to login page
	if (!selfStore.isLogged()) {
		return navigateTo("/login");
	}

	if (to.fullPath === "/") {
		if (!selfStore.hasSupervisorRole() && !selfStore.isBadger()) {
			return navigateTo("/self")
		}
	}

	if (pathsMatch(["^/admin", "^/admin/.*"], to.fullPath)) {
		if (!selfStore.hasSupervisorRole()) {
			return navigateTo("/self");
		}
	}
})
