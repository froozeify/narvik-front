import {EventHandlerRequest, H3Event} from "h3";
import {NitroFetchOptions} from "nitropack";
import {pathsMatch} from "~/utils/resource";

const API_URL = useRuntimeConfig().public.apiUrl;
const MIME_TYPE = "application/ld+json";

const publicPaths = [
	"^auth$",
	"^auth\/.*"
];

async function checkJwtToken(event: H3Event<EventHandlerRequest>) {
	// We don't have a session defined, we return the default 401

	// const session = await requireUserSession(event);
	// console.log(session);
}

export default defineEventHandler(async (event) => {
	// @ts-ignore
	const { slug } = event.context.params;
	const method = getMethod(event);
	const body = method === "GET" ? undefined : await readBody(event);

	const targetUrl= new URL(slug, API_URL);
	targetUrl.search = getRequestURL(event).search

	let statusCode: number | undefined;

	let opts: NitroFetchOptions<any> = {
		method,
		body,
		headers: {
			Accept: MIME_TYPE,
		},

		onResponse(context): Promise<void> | void {
			statusCode = context.response.status
		},
	}

	if (!pathsMatch(publicPaths, slug)) {
		await checkJwtToken(event);
	}

	// We make the query
	const data = await $fetch(targetUrl.href, opts);
	setResponseStatus(event, statusCode)
	return data;
});
