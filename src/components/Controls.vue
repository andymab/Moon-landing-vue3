<template>
    <div class="controls">

        <div class="control-group">
            <h4>Тяга:</h4>

            <div class="radio-group">
                <label class="radio-label info">
                    {{ Math.round(thrustLocal) }}%
                </label>
                <label class="radio-label" :class="{ active: engineLocal === 'retro' }">
                    <input type="radio" v-model="engineLocal" value="retro" />
                    <!-- <span class="radio-dot"></span> -->
                    <svg class="thrust-icon" viewBox="0 0 24 24" width="48" height="48"
                        xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
                        <title>Thrust Up</title>
                        <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                            stroke-linejoin="round">
                            <!-- arrow shaft -->
                            <path d="M12 18 V6" />
                            <!-- arrow head -->
                            <path d="M7.5 10.5 L12 6 L16.5 10.5" />
                            <!-- flame / thrust lines -->
                            <path
                                d="M9.2 19c-.6-1.2-.8-2.6-.4-3.8C9.3 13.4 10.5 12.6 12 12.6s2.7.8 3.2 2.6c.4 1.2.2 2.6-.4 3.8" />
                            <path d="M8 21c-.8-1.6-.8-3.2 0-4.6" opacity="0.9" />
                            <path d="M16 21c.8-1.6.8-3.2 0-4.6" opacity="0.9" />
                        </g>
                    </svg>
                    <!-- <span class="radio-text">Торможение (↑)</span> -->
                </label>
                <label class="radio-label" :class="{ active: engineLocal === 'main' }">
                    <input type="radio" v-model="engineLocal" value="main" />
                    <svg class="thrust-icon" viewBox="0 0 24 24" width="48" height="48"
                        xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
                        <title>Thrust Down</title>
                        <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                            stroke-linejoin="round">
                            <!-- arrow shaft -->
                            <path d="M12 6v12" />
                            <!-- arrow head (down) -->
                            <path d="M7.5 13.5 L12 18 L16.5 13.5" />
                            <!-- flame / thrust lines (top side for down-thrust) -->
                            <path
                                d="M9.2 5c-.6 1.2-.8 2.6-.4 3.8C9.3 10.6 10.5 11.4 12 11.4s2.7-.8 3.2-2.6c.4-1.2.2-2.6-.4-3.8" />
                            <path d="M8 3c-.8 1.6-.8 3.2 0 4.6" opacity="0.9" />
                            <path d="M16 3c.8 1.6.8 3.2 0 4.6" opacity="0.9" />
                        </g>
                    </svg>
                    <!-- <span class="radio-text">Спуск (↓)</span> -->
                </label>
            </div>
        </div>


        <div class="control-row">
            <label>Мощность: </label>
            <input type="range" min="0" max="100" v-model.number="thrustLocal" />
        </div>

        <div class="control-row buttons" >
            <button @click="emitReset" class="btn-contol">Сбросить</button>
            <button @click="emitStep" class="btn-contol" :disabled="disabled">Применить (1s)</button>
            
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
    position: absolute;
    bottom: 0;
    z-index: 2;
    width: 100%;


    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
    padding: 10px;
    background-color: #020516;
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
.btn-contol{
    font-size: 1.4rem;
}
button:disabled {
    opacity: 0.5
}


/** Двигатель */
.control-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.control-group h4,
label {
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
    background: rgba(0, 0, 0, 0.03);
    transition: all 0.2s;
}

.radio-label:hover {
    background: rgba(255, 255, 255, 0.05);
}

.radio-label.info {
    font-size: 1.4rem;
    background: rgba(33, 150, 243, 0.15);
    color: bisque;
    border: 1px solid #c7c7c7;
}

.radio-label.active {
    background: rgba(33, 150, 243, 0.15);
    border: 1px solid #2196f3;
}

s .radio-label input {
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

@media (min-width: 1024px) {
    .controls {
        padding: 40px;
        justify-content: center;
        flex-direction: row;
    }

    /** Двигатель */
    .control-group {
        align-items: center;
        justify-content: flex-start;
        gap: 26px;
        width: auto;
    }

    .control-row {
        width: auto;
        margin-left: 4rem;
    }

}
</style>
