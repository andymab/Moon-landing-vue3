<template>
    <div class="controls">
        <div class="control-row">
            <label>Engine</label>
            <select v-model="engineLocal">
                <option value="retro">Retro (up / brake)</option>
                <option value="main">Main (down / accelerate)</option>
            </select>
        </div>

        <div class="control-row">
            <label>Thrust: {{ Math.round(thrustLocal) }}%</label>
            <input type="range" min="0" max="100" v-model.number="thrustLocal" />
        </div>

        <div class="control-row buttons">
            <button @click="emitStep" :disabled="disabled">Apply thrust (1s)</button>
            <button @click="emitReset">Reset</button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ thrust: { type: Number, default: 0 }, engine: { type: String, default: 'retro' }, disabled: { type: Boolean, default: false } })
const emit = defineEmits(['update:thrust', 'update:engine', 'step', 'reset'])

const thrustLocal = ref(props.thrust)
const engineLocal = ref(props.engine)

watch(thrustLocal, (v) => emit('update:thrust', v))
watch(engineLocal, (v) => emit('update:engine', v))

function emitStep() { emit('step') }
function emitReset() { emit('reset') }
</script>

<style scoped>
.controls {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
    padding: 10px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
}

.control-row {
    display: flex;
    align-items: center;
    gap: 8px
}

input[type=range] {
    width: 260px
}

.buttons button {
    margin-right: 8px
}

button {
    padding: 8px 12px;
    border-radius: 8px;
    background: #1b2940;
    color: #fff;
    border: none
}

button:disabled {
    opacity: 0.5
}
</style>
