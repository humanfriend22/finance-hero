<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn, FormSubmitEvent } from '@nuxt/ui';
import { type LedgerEntry, type Database } from '@/data';
import { useStorage } from '@vueuse/core';
import { mkConfig, generateCsv, download } from "export-to-csv";

const database = inject('database') as Ref<Database>;
const addEntryToLedger = inject('add-ledger-entry');

const reversedLedger = computed(() => {
    const newArray = [...Array.from(database.value.ledger)];
    return newArray.reverse();
});

function addDays(date: Date, days: number) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const columns: TableColumn<LedgerEntry>[] = [
    {
        accessorKey: 'id',
        header: '#',
        cell: ({ row }) => `#${row.getValue('id')}`
    },
    {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: ({ row }) => {
            const offset = row.getValue('timestamp') as number;
            const date = addDays(new Date(2024, 0, 1), offset);

            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            const seconds = String(date.getUTCSeconds()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}`;
        }
    },
    {
        accessorKey: 'description',
        header: 'Description',
    },
    {
        accessorKey: 'amount',
        header: () => h('div', { class: 'text-right' }, 'Amount'),
        cell: ({ row }) => {
            // Amount
            const amount = Number.parseFloat(row.getValue('amount'))

            // With $
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount)

            // Color Class
            const colorClass = amount < 0 ? 'text-red-400' : 'text-green-400'

            return h('div', { class: `text-right font-medium ${colorClass}` }, formatted)
        }
    },
    {
        accessorKey: 'runningProfit',
        header: () => h('div', { class: 'text-right' }, 'Running Profit'),
        cell: ({ row }) => {
            const amount = Number.parseFloat(row.getValue('runningProfit'))

            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount)

            return h('div', { class: 'text-right font-medium' }, formatted)
        }
    }

];

const state = reactive<LedgerEntry>({
    id: 3,
    description: '',
    amount: 0,
    timestamp: Date.now(),
    runningProfit: 0
});

const toast = useToast();
const open = ref(false);

async function onSubmit(event: FormSubmitEvent<any>) {
    toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' });
    if (state.description != '') {
        // @ts-ignore
        console.log(addEntryToLedger(state.description, state.amount));
    };
    open.value = false;
}
function clearLocalStorage() {
    localStorage.clear();
}

const email = useStorage('email', '');
function exportAsPDF() {
    const config = mkConfig({ useKeysAsHeaders: true, showTitle: true, title: `FinanceHero_${email.value}_${Date.now()}`, filename: `FinanceHero_${email.value}_${Date.now()}.csv` });
    // @ts-ignore
    download(config)(generateCsv(config)(database.value.ledger));
};
</script>

<template>
    <div>
        <h1 class="text-xl font-bold mb-4">Ledger</h1>
        <UModal title="Add Ledger Entry" :open="open">

            <UButton label="Add Ledger Entry" color="neutral" variant="subtle" class="cursor-pointer mr-2" @click="open = true">
                <UIcon name="i-lucide-plus" class="size-5" />
                <p class="text-sm">Add Ledger Entry</p>
            </UButton>
            <!-- <UButton label="Add Ledger Entry" color="neutral" variant="subtle" class=" cursor-pointer" @click="clearLocalStorage">
                <UIcon name="i-lucide-plus" class="size-5" />
                <p class="text-sm">Clear Local Storage</p>
            </UButton> -->
            <UButton label="Add Ledger Entry" color="neutral" variant="subtle" class=" cursor-pointer" @click="exportAsPDF">
                <UIcon name="i-lucide-download" class="size-5" />
                <p class="text-sm">Export as CSV</p>
            </UButton>

            <template #body>
                <UForm :state="state" class="gap-4 flex flex-col w-60" @submit="onSubmit">
                    <UFormField label="Description" name="description">
                        <UInput v-model="state.description" />
                    </UFormField>

                    <UFormField label="Amount" name="price" class="w-20">
                        <UInput v-model="state.amount" type="number" />
                    </UFormField>

                    <div>
                        <UButton type="submit">
                            Submit
                        </UButton>
                    </div>
                </UForm>
            </template>
        </UModal>
        <br>
        <UTable :data="reversedLedger" :columns="columns" class="flex-1" />
    </div>
</template>
