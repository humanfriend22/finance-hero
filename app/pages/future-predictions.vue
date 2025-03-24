<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import type { Database } from '@/data';
import regression from 'regression';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)

function sqrtRegression(x: number[], y: number[]) {
    const n = x.length;
    if (n === 0 || n !== y.length) {
        throw new Error("Input arrays must have the same non-zero length.");
    }

    // Transform x values using the square root
    const sqrtX = x.map(v => Math.sqrt(v));

    // Compute sums needed for the regression formulas
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
        // @ts-ignore
        sumX += sqrtX[i];
        // @ts-ignore
        sumY += y[i];
        // @ts-ignore
        sumXY += sqrtX[i] * y[i];
        // @ts-ignore
        sumX2 += sqrtX[i] * sqrtX[i];
    }

    // Calculate slope (b) and intercept (a)
    const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const a = (sumY - b * sumX) / n;

    return { a, b };
};

function runRegression(x: number[], y: number[]) {
    // Get last data 

    let points: regression.DataPoint[] = [];
    for (let i = 0; i < x.length; i++) {
        points.push([x[i], y[i]] as regression.DataPoint);
    };

    return regression.polynomial(points, { order: 1 });
};

const database = inject('database') as Ref<Database>;

const chartOptions = { responsive: true };
const chartData = computed(() => {

    // Dataset 1
    const originalXValues = database.value.ledger.map(entry => entry.timestamp);
    const originalYValues = database.value.ledger.map(entry => entry.runningProfit);

    // Only calculate regression with last data point of the day
    let dictionary: { [key: number]: number | undefined } = {};
    for (let i = 0; i < originalXValues.length; i++) {
        const xValue = originalXValues[i]!
        const yValue = originalYValues[i]!;
        dictionary[xValue] = yValue;
    };

    let regressionXValues = Object.keys(dictionary).map(a => parseInt(a));
    let regressionXOriginalYValues = Object.values(dictionary) as number[];

    // Calculate sqrt regression
    const { a, b } = sqrtRegression(regressionXValues, regressionXOriginalYValues);
    const evaluateRegression = (x: number) => a + (b * Math.sqrt(x));

    // Extended dataset for regression curve
    const lastRegressionXValue = regressionXValues[regressionXValues.length - 1]!;
    let regressionYValues = [...regressionXOriginalYValues];
    for (let i = 1; i < 100; i++) {
        regressionXValues.push(lastRegressionXValue + i);
        regressionYValues.push(evaluateRegression(lastRegressionXValue + i));
    }

    return {
        labels: regressionXValues,
        xAxis: 'Days After 2024-01-01',
        yAxis: 'Profit',
        datasets: [
            {
                label: 'Original Data',
                data: regressionXOriginalYValues,
                fill: false,
                borderColor: 'rgb(53 161 235)',
                tension: 0.1
            },
            {
                label: 'Predicted Profit Growth',
                // @ts-ignore
                data: regressionXValues.map(evaluateRegression),
                fill: false,
                borderColor: 'rgb(254 100 131)',
                tension: 0.1
            },
        ]
    };
});
</script>

<template>
    <div>
        <h1 class="text-xl font-bold mb-4">Future Predictions</h1>
        <Line id="future-predicitions-graph" :options="chartOptions" :data="chartData" />
    </div>
</template>