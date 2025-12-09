<template>
    <div id="app" class="app-root">
        <div class="container">
            <Hud :altitude="altitude" :velocity="velocity" :fuel="fuel" :turn="turn" />

            <Renderer :altitude="altitude" :velocity="velocity" :thrust="thrust" :engine="activeEngine" />

            <Controls v-model:thrust="thrust" v-model:engine="activeEngine" :disabled="gameOver" @step="onStep"
                @reset="resetGame" />

            <div class="debug" v-if="debugInfo">
                <pre>{{ debugInfo }}</pre>
            </div>

            <div class="message" v-if="message">{{ message }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePhysics } from './composables/usePhysics'
import Hud from './components/Hud.vue'
import Controls from './components/Controls.vue'
import Renderer from './components/Renderer.vue'

const maxAltitude = 1200
const { altitude, velocity, fuel, step: physicsStep, reset, getState } = usePhysics({
    startAltitude: maxAltitude,
    startVelocity: 0,
    startFuel: 600,
    mass: 1600,
    maxThrust: 5200,
    maxConsumption: 6,
    g: 1.62,
    maxAltitude
})

const thrust = ref(50)
const activeEngine = ref('retro')
const turn = ref(0)
const message = ref('')
const gameOver = ref(false)

// Отладочная информация
const debugInfo = computed(() => {
    const state = getState ? getState() : null
    return {
        thrust: thrust.value,
        engine: activeEngine.value,
        turn: turn.value,
        gameOver: gameOver.value,
        altitude: altitude.value,
        velocity: velocity.value,
        fuel: fuel.value,
        state: state,
        isDescending: velocity.value > 0.1,
        isAscending: velocity.value < -0.1
    }
})

// Добавим watch для отслеживания изменений thrust
watch(thrust, (newVal) => {
    console.log('Thrust changed to:', newVal)
})

function onStep() {
    console.log('=== STEP CALLED ===')
    console.log('Before step:', {
        thrust: thrust.value,
        engine: activeEngine.value,
        altitude: altitude.value,
        velocity: velocity.value,
        fuel: fuel.value,
        gameOver: gameOver.value
    })

    if (gameOver.value) {
        console.log('Game over, step ignored')
        return
    }

    turn.value += 1
    try {
        // Вызываем physicsStep с правильными параметрами
        const res = physicsStep({
            throttlePct: thrust.value,
            engine: activeEngine.value,
            dt: 1
        })

        console.log('After step result:', res)

        if (res.landed) {
            gameOver.value = true
            if (Math.abs(res.velocity) <= 5) {
                message.value = `Touchdown! Safe landing. Velocity: ${res.velocity.toFixed(2)} m/s`
            } else {
                message.value = `Crashed! Impact velocity ${res.velocity.toFixed(2)} m/s > 5 m/s`
            }
            console.log('LANDED:', message.value)
            return
        }

        if (res.escaped) {
            gameOver.value = true
            message.value = 'You drifted away into space. Game over.'
            console.log('ESCAPED:', message.value)
            return
        }

        if (res.fuel <= 0 && !gameOver.value) {
            message.value = 'Out of fuel! You cannot apply thrust anymore.'
            console.log('OUT OF FUEL')
        } else {
            message.value = ''
        }

        // Обновляем reactive переменные из результата
        altitude.value = res.altitude
        velocity.value = res.velocity
        fuel.value = res.fuel

    } catch (error) {
        console.error('Error in physicsStep:', error)
        message.value = `Error: ${error.message}`
    }
}

function resetGame() {
    console.log('=== RESET GAME ===')
    reset()
    thrust.value = 50
    activeEngine.value = 'retro'
    turn.value = 0
    message.value = ''
    gameOver.value = false
}
</script>


<style scoped>
.container {
    max-width: 1100px;
    margin: 12px auto;
    padding: 8px;
}

.message {
    margin-top: 12px;
    color: #ffd;
    font-weight: 600;
    font-size: 18px;
    text-align: center;
    padding: 10px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 5px;
}

.debug {
    margin-top: 20px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: #0f0;
    font-family: monospace;
    font-size: 12px;
    border-radius: 5px;
    max-height: 200px;
    overflow: auto;
}

.app-root {
    background: linear-gradient(#020516, #04102a);
    min-height: 100vh;
    padding: 20px;
}
</style>
