<script setup lang="ts">
import { GenerativeModel } from "@google/generative-ai";
import type { Database } from "~/data";

const question = ref<string>('');
const answer = ref<string>('');

const database = inject('database') as Ref<Database>;
const model = inject('gemini-model') as GenerativeModel;

const messages = ref([
    { isRight: false, text: 'Hello, how can I help you today?' },
]);

async function handleSubmit() {
    if (question.value === '') return;

    messages.value.push({ isRight: true, text: question.value });
    messages.value.push({ isRight: false, text: 'Thinking...' });

    const message = `${question.value}`;
    const result = await model.generateContent(message);

    question.value = '';

    messages.value[messages.value.length - 1]!.text = result.response.text();
};
</script>


<template>
    <div class="p-6 max-w-4xl mx-auto flex flex-col h-full">
        <UCard class="flex-1 overflow-y-auto mb-4 p-4 bg-gray-800">
            <h2 class="text-2xl font-bold mb-4 text-center">Business Advisor</h2>
            <div v-for="(message, index) in messages" :key="index" class="mb-4 clear-both">
                <div
                    :class="message.isRight ? 'bg-blue-600 text-white p-3 rounded-2xl rounded-br-none max-w-xs float-right my-2' : 'bg-gray-700 p-3 my-2 rounded-2xl rounded-bl-none max-w-xs float-left'">
                    <p>{{ message.text }}</p>
                </div>
            </div>
        </UCard>

        <UForm :state="{}" class="flex items-center gap-2 mt-auto" @submit="handleSubmit">
            <UInput v-model="question" placeholder="Ask your business question..." class="flex-1 resize-none" />
            <UButton type="submit" class="h-fit">Send</UButton>
        </UForm>
    </div>
</template>