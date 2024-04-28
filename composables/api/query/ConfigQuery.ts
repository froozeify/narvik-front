import type {Config} from "~/types/config";
import {useFetchItem} from "~/composables/api/api";

export default class ConfigQuery {

    async get(requireLogin: boolean = false) {
        return useFetchItem<Config>(`public/config`, false, requireLogin);
    }
}
