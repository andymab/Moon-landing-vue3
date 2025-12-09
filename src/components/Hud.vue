<template>
    <div class="hud">
        <div class="stat"><label>Altitude</label>
            <div>{{ altitudeDisplay }}</div>
        </div>
        <div class="stat"><label>Velocity</label>
            <div>{{ velocityDisplay }}</div>
        </div>
        <div class="stat"><label>Fuel</label>
            <div>{{ fuelDisplay }}</div>
        </div>
        <div class="stat"><label>Turn</label>
            <div>{{ turn }}</div>
        </div>
    </div>
</template>

<script setup>
import { computed, toRefs } from 'vue'
const props = defineProps({ altitude: Number, velocity: Number, fuel: Number, turn: { type: Number, default: 0 } })
const { altitude, velocity, fuel } = toRefs(props)

const altitudeDisplay = computed(() => `${Math.max(0, altitude.value).toFixed(1)} m`)
const velocityDisplay = computed(() => `${velocity.value.toFixed(2)} m/s`)
const fuelDisplay = computed(() => `${Math.max(0, fuel.value).toFixed(1)} kg`)
</script>

<style scoped>
.hud {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-start;
    padding: 8px;
}

.stat {
    background: rgba(255, 255, 255, 0.03);
    padding: 8px 12px;
    border-radius: 8px;
    min-width: 130px
}

label {
    display: block;
    color: #9fb;
    font-size: 12px
}
</style>
