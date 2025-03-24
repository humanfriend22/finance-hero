<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'

const router = useRouter();

const isLoggedIn = useStorage('is-logged-in', false);
const email = useStorage('email', '');

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<any>) {
    isLoggedIn.value = true
    toast.add({ title: 'Woo!', description: 'You are now logged in.', color: 'success' })
    router.push('/dashboard')
};

function logout() {
    isLoggedIn.value = false;
    email.value = '';
    toast.add({ title: 'Bye!', description: 'You are now logged out.', color: 'error' });
};
</script>

<template>
    <div>
        <h1 class="text-xl font-bold mb-4">
            {{ isLoggedIn ? 'Welcome back!' : 'Hey there!' }}
        </h1>
        <div v-if="isLoggedIn">
            <h2>Currently logged in as: {{ email }} </h2>
            <UButton @click="logout" class="mt-2 cursor-pointer bg-red-400 hover:bg-red-500">Logout</UButton>
        </div>
        <div v-else>
            <UForm :state="{}" class="space-y-4" @submit="onSubmit">
                <UFormField label="Email" name="email">
                    <UInput v-model="email" type="email" />
                </UFormField>

                <UFormField label="Password" name="password">
                    <UInput type="password" />
                </UFormField>

                <UButton type="submit">
                    Submit
                </UButton>
            </UForm>
        </div>
    </div>
</template>