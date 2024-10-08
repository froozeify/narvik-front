import {pathsMatch} from "~/utils/resource";
import {useSelfMemberStore} from "~/stores/useSelfMember";
import {useAppConfigStore} from "~/stores/useAppConfig";

const publicPaths = [
	"^/login$",
	"^/login/password-reset$",
	"^/login/bdg/.*",
]

const supervisorOnlyPaths = [
  "^/admin$",
  "^/admin/presences",
  "^/admin/members",
  "^/admin/thrombinoscope",

  "^/admin/sales",
]

export default defineNuxtRouteMiddleware(async (to, from) => {
	const selfStore = useSelfMemberStore();
	const appConfigStore = useAppConfigStore();

	if (!selfStore.member && selfStore.isLogged()) {
		await selfStore.refresh();
	}

	if (!appConfigStore.config) {
		await appConfigStore.refresh();
	}

	if (pathsMatch(publicPaths, to.fullPath)) {
		if (selfStore.isLogged()) { // User is logged
      return navigateTo("/");
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

    // User is not an admin (so supervisor) got access to only restrain uris
    if (!selfStore.isAdmin()) {
      if (!pathsMatch(supervisorOnlyPaths, to.fullPath)) {
        return navigateTo('/admin')
      }
    }
	}
})
