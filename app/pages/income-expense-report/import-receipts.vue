<script setup lang="ts">
import { type GenerativeModel } from "@google/generative-ai";
import type { Database } from "~/data";

const database = inject('database') as Ref<Database>;
const addEntryToLedger = inject('add-ledger-entry');
const model = inject('gemini-model') as GenerativeModel;

const file = ref<File | null>(null);
const base64 = ref('');
const isLoading = ref(false);
const message = ref('');
const readyToImport = ref(false);

const toBase64 = (f: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(f);
    reader.onload = () => resolve(reader.result!.toString());
    reader.onerror = reject;
});

let analyzedData = { store: '', price: 0 };
async function analyze() {
    isLoading.value = true;
    readyToImport.value = false;

    if (file.value) {
        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64.value.split(',')[1]!,
                    mimeType: "image/jpeg",
                },
            },
            'What is the title of the store of this purchase and the price on the recipt? Respond only with the title and price seperated by a comma. Please do not include a space before or after the comma. Do not include any dollar signs or equivilant.',
        ]);

        const [store, price] = result.response.text().split(',');
        if (store == '' || price == '') {
            message.value = 'Could not analyze the receipt. Please try again.';
            isLoading.value = false;
            return;
        }

        analyzedData = { store: store as string, price: parseFloat(price || '') };

        message.value = `The receipt's total was: ${price} at ${store}.`;
        readyToImport.value = true;
    };

    isLoading.value = false;
};

const handleFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        file.value = target.files[0];
        base64.value = await toBase64(file.value as File);
    }
};

const importToLedger = () => {
    // @ts-ignore
    addEntryToLedger(analyzedData.store + ' Receipt', analyzedData.price);
    readyToImport.value = false;
};
</script>

<template>
    <div class="max-w-[50vw]">
        <h1 class="text-xl font-bold mb-4">Import A Receipt</h1>
        <UInput :loading="isLoading" :disabled="isLoading" type="file" @change="handleFileChange" class="mr-2" />
        <UButton @click="analyze">Analyze</UButton>
        <UButton @click="importToLedger" v-if="readyToImport" class="ml-2">Import to Ledger</UButton>
        <p class="my-2">{{ message }}</p>
        <img v-if="file" :src="base64" />
    </div>
</template>