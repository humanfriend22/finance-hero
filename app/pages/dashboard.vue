<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { onMounted, ref } from 'vue'
import type { Database } from '~/data'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)

const database = inject('database') as Ref<Database>;

const totalRevenue = computed(() => {
    let sum = 0;
    for (const entry of database.value.ledger) {
        if (entry.amount > 0) {
            sum += entry.amount;
        }
    }
    return sum;
});
const totalExpenses = computed(() => {
    let sum = 0;
    for (const entry of database.value.ledger) {
        if (entry.amount < 0) {
            sum -= entry.amount;
        }
    }
    return sum;
});
const netProfit = computed(() => database.value.ledger[database.value.ledger.length - 1]!.runningProfit);

const chartOptions = { responsive: true };
const chartData = computed(() => {

    // Dataset 1
    // From the end
    const offset = -100;
    const startingPoint = database.value.ledger.length - 1 + offset;
    const originalXValues = database.value.ledger.map(entry => entry.timestamp);

    let expenseOnlyPoints = [], revenueOnlyPoints = [];
    for (let i = 0; i < database.value.ledger.length; i++) {
        const entry = database.value.ledger[i]!;
        if (entry.amount < 0) {
            expenseOnlyPoints.push([originalXValues[i], entry.amount]);
        } else {
            revenueOnlyPoints.push([originalXValues[i], entry.amount]);
        }
    };

    return {
        labels: originalXValues.slice(offset),
        xAxisID: 'Days After 2024-01-01',
        yAxisID: 'Profit',
        datasets: [
            {
                label: 'Expenses',
                data: expenseOnlyPoints.slice(offset),
                fill: false,
                borderColor: 'rgb(254 100 131)',
                tension: 0.1
            },
            {
                label: 'Revenue',
                data: revenueOnlyPoints.slice(offset),
                fill: false,
                borderColor: 'rgb(53 161 235)',
                tension: 0.1
            },
        ]
    };
});
</script>

<template>
    <div>
        <h1 class="text-xl font-bold mb-2">
            Welcome to Ducky's Bakery
        </h1>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard>
                <h2 class="text-xl font-bold">Total Revenue</h2>
                <p class="text-2xl text-green-400">${{ totalRevenue }}</p>
            </UCard>

            <UCard>
                <h2 class="text-xl font-bold">Total Expenses</h2>
                <p class="text-2xl text-red-400">${{ totalExpenses }}</p>
            </UCard>

            <UCard>
                <h2 class="text-xl font-bold">Current Net Profit</h2>
                <p class="text-2xl text-green-400">${{ netProfit }}</p>
            </UCard>

            <UCard class="col-span-1 md:col-span-2 lg:col-span-3">
                <h2 class="text-xl font-bold mb-4">Revenue & Expense Trend</h2>
                <!-- @vue-ignore -->
                <Line id="revenue-expense-graph" :options="chartOptions" :data="chartData" />
            </UCard>

        </div>
    </div>

</template>



<style scoped>
canvas {
    max-width: 100%;
}
</style>