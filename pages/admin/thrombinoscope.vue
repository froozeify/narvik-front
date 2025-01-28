<script setup lang="ts">
  import type {Member} from "~/types/api/item/clubDependent/member";
  import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";
  import ImageQuery from "~/composables/api/query/ImageQuery";
  import {convertUuidToUrlUuid} from "~/utils/resource";

  definePageMeta({
    layout: "admin"
  });

  useHead({
    title: 'Trombinoscope'
  })

  const isLoading = ref(true);

  const page = ref(1);
  const itemsPerPage = ref(100);
  const sort = ref({
    column: 'lastname',
    direction: 'asc'
  });
  const totalMembers: Ref<number> = ref(0);

  const members: Ref<Member[]> = ref([]);

  const memberQuery = new MemberQuery();
  const imageQuery = new ImageQuery();

  getMembers();

  function getMembers() {
    isLoading.value = true;

    const urlParams = new URLSearchParams({
      page: page.value.toString(),
      itemsPerPage: itemsPerPage.value.toString(),
      'exists[licence]': 'true',
    });

    urlParams.append(`order[${sort.value.column}]`, sort.value.direction);
    urlParams.append(`order[firstname]`, 'asc');
    urlParams.append('currentSeason[memberSeasons.season]', 'true');

    memberQuery.getAll(urlParams).then(value => {
      isLoading.value = false;

      if (value.items) {
        value.items.forEach(member => {
          loadMemberProfileImage(member).then(img => {
            if (img) {
              member.profileImageBase64 = img;
            }
          })
        })

        members.value = members.value.concat(value.items)


        if (value.totalItems && totalMembers.value == 0) {
          totalMembers.value = value.totalItems
        }

        if (value.view && value.view["next"]) {
          page.value = page.value + 1;
          getMembers();
          return;
        }
      }
    });
  }

  async function loadMemberProfileImage(member: Member) {
    if (!member.profileImage?.privateUrl) return null;

    const { retrieved } = await imageQuery.getFromUrl(member.profileImage.privateUrl);
    if (!retrieved || !retrieved.base64) return null

    return retrieved.base64
  }
</script>

<template>
  <div>
    <UCard class="print:ring-0 print:shadow-none">
      <div class="text-xl font-bold mb-4">Trombinoscope pour la saison actuelle ({{totalMembers}} membres)</div>

      <UProgress
        v-if="isLoading"
        class="mb-4"
        :value="members.length"
        :max="totalMembers"
        indicator
      >
        <template #indicator="{percent}">
          <div class="text-right" :style="{ width: `${percent}%` }">
            <span class="text-xs">Liste chargée à {{ Math.round(percent) || 0 }} %</span>
          </div>
        </template>
      </UProgress>

      <div class="grid grid-flow-row gap-4 grid-cols-1 sm:grid-cols-3 xl:grid-cols-5">
        <NuxtLink
          v-for="member in (members)"
          :to="`/admin/members/${convertUuidToUrlUuid(member.uuid)}`"
          target="_blank"
          class="transition ease-in-out hover:scale-105 duration-300 "
        >
          <UCard
            :ui="{
              background: 'bg-white dark:bg-slate-950'
            }"
          >
            <div v-if="member.profileImageBase64" class="h-24 w-24 aspect-square mx-auto">
              <NuxtImg class="rounded-full w-full h-full object-contain bg-gray-100 dark:bg-gray-800"  :src="member.profileImageBase64" />
            </div>

            <div class="mt-4 mx-auto text-center">
              <p>{{ member.lastname }}</p>
              <p>{{ member.firstname }}</p>
            </div>

            <div class="mx-auto text-center mt-1">
              {{ member.licence }}
            </div>

          </UCard>

        </NuxtLink>

        <template v-if="isLoading">
          <UCard
            v-for="i in (totalMembers - members.length + 7)"
            :ui="{
              background: 'bg-white dark:bg-slate-950'
            }"
          >
            <div class="mx-auto my-0 h-24 w-24 aspect-square">
              <USkeleton class="w-full h-full" :ui="{ rounded: 'rounded-full' }"/>
            </div>

            <div class="space-y-4 w-full mt-4">
              <div v-for="w in ['w-52 h-8', 'w-36 h-4']" class="flex justify-center">
                <USkeleton :class="w" />
              </div>
            </div>
          </UCard>
        </template>
      </div>

    </UCard>
  </div>
</template>

<style scoped lang="scss">

</style>
