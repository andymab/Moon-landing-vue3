<template>

        <div class="hud">
            <div class="hud-container">
                <div class="stat"><label>Высота</label>
                    <div class="stat-info">{{ altitudeDisplay }}</div>
                </div>
                <div class="stat"><label>Ускорение</label>
                    <div class="stat-info">{{ velocityDisplay }}</div>
                </div>
                <div class="stat"><label>Топливо</label>
                    <div class="stat-info">{{ fuelDisplay }}</div>
                </div>
                <div class="stat"><label>Уровень</label>
                    <div>{{ turn }}</div>
                </div>
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
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 100;
}



.hud-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 100px;
}

.stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    transition: background-color 0.2s;
}

.stat-info{
    font-size: 1.2rem;
    color: #fdd290;
}
label {
    color: #a0c8ff;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    opacity: 0.8;
}

.value {
    color: #fff;
    font-size: 20px;
    font-weight: 600;
    font-family: 'Courier New', monospace;
    text-shadow: 0 0 10px rgba(100, 180, 255, 0.3);
}

/* Специальные стили для разных значений */
.stat:nth-child(1) .value {
    /* Altitude */
    color: #4fc3f7;
}

.stat:nth-child(2) .value {
    /* Velocity */
    color: #ffb74d;
}

.stat:nth-child(3) .value {
    /* Fuel */
    color: #81c784;
}

.stat:nth-child(4) .value {
    /* Turn */
    color: #ba68c8;
}
</style>
