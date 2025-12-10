<template>
    <div class="controls">

        <div class="control-group">
            <h4>Двигатель:</h4>
            <div class="radio-group">
                <label class="radio-label" :class="{ active: engineLocal === 'retro' }">
                    <input type="radio" v-model="engineLocal" value="retro" />
                    <span class="radio-dot"></span>
                    <span class="radio-text">Тяга (↑)</span>
                </label>
                <label class="radio-label" :class="{ active: engineLocal === 'main' }">
                    <input type="radio" v-model="engineLocal" value="main" />
                    <span class="radio-dot"></span>
                    <span class="radio-text">Тяга (↓)</span>
                </label>
            </div>
        </div>


        <div class="control-row">
            <label>Мощность: {{ Math.round(thrustLocal) }}%</label>
            <input type="range" min="0" max="100" v-model.number="thrustLocal" />
        </div>

        <div class="control-row buttons" style="margin-top: 1rem;">
            <button @click="emitStep" :disabled="disabled">Применить (1s)</button>
            <button @click="emitReset">Сбросить</button>
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
    padding-top: 10px;
    /* background: rgba(255, 255, 255, 0.02); */
    border-radius: 8px;
}

.control-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
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


/** Двигатель */
.control-group {
    display: flex;
    align-items: center;
    justify-content: space-between ;
    width: 100%;
}

.control-group h4, label {
    color: #a0c8ff;
    font-size: 13px;
    font-weight: 500;
}

.radio-group {
    display: flex;

    gap: 8px;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.03);
    transition: all 0.2s;
}

.radio-label:hover {
    background: rgba(255, 255, 255, 0.05);
}

.radio-label.active {
    background: rgba(33, 150, 243, 0.15);
    border: 1px solid #2196f3;
}

.radio-label input {
    display: none;
}

.radio-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.radio-label.active .radio-dot {
    background: #2196f3;
    border-color: #2196f3;
}

.radio-text {
    color: #fff;
    font-size: 14px;
}
</style>
