<template>
    <div id="app" class="app-root">
        <div class="app-wrapper">
            <div class="app-container">

                <StartScreen v-if="turn === 0" :sufix-ratio="ratio" @start="turn = turn + 1" @start-auto="AutoPilot" />
                <template v-else>
                    <Renderer :altitude="altitude" :velocity="velocity" :thrust="thrust" :engine="activeEngine"
                        :fuel="fuel" :turn="turn" :sufix-ratio="ratio" />
                    <Controls v-model:thrust="thrust" v-model:engine="activeEngine" :disabled="gameOver" @step="onStep"
                        @reset="resetGame" />
                </template>





                <AudioManager :thrust="thrust" :engine="activeEngine" :altitude="altitude" :velocity="velocity"
                    :fuel="fuel" :gameOver="gameOver" :message="message" :isLanded="isLanded" ref="audioManager" />

                <!-- 
            <div class="debug" v-if="debugInfo">
                <pre>{{ debugInfo }}</pre>
            </div> -->
                <div v-if="message" class="message-container">
                    <div class="message">{{ message }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { usePhysics } from './composables/usePhysics'

import StartScreen from './components/StartScreen.vue'
import Controls from './components/Controls.vue'
import Renderer from './components/Renderer.vue'
import AudioManager from './components/AudioManager.vue'


const ratio = ref('')
const updateRatio = () => {
    const wh = window.innerWidth / window.innerHeight
    ratio.value = wh > 1.7 ? '169' : wh > 1.45 ? '43' : '916'
}
updateRatio()
onMounted(() => {
    window.addEventListener('resize', updateRatio)
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', updateRatio)
})

const maxAltitude = 1200
const { altitude, velocity, fuel, step: physicsStep, reset, getState, soundEvents, isEngineActive, hasFuel } = usePhysics({
    startAltitude: maxAltitude,
    startVelocity: 0,
    startFuel: 300,
    mass: 1600,
    maxThrust: 5200,
    maxConsumption: 6,
    g: 1.62,
    maxAltitude
})

const thrust = ref(0)
const activeEngine = ref('retro')
const turn = ref(0)
const message = ref('')
const gameOver = ref(false)





// Добавляем ref для AudioManager
// Добавляем ref для AudioManager
const audioManager = ref(null)

// Добавим console.log для отладки ref
onMounted(() => {
    console.log('App mounted, audioManager ref:', audioManager.value)
})


// свойство для определения посадки
const isLanded = computed(() => {
    return altitude.value <= 0 && !gameOver.value
})

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
        soundEvents: soundEvents.value, // Добавляем звуковые события
        isDescending: velocity.value > 0.1,
        isAscending: velocity.value < -0.1
    }
})

// Watch для звуковых событий
watch(soundEvents, (newEvents) => {
    if (newEvents.length > 0) {
        console.log('Sound events detected:', newEvents)
        // Здесь можно добавить логику обработки звуковых событий
        // или передать их в AudioManager через props
    }
}, { deep: true })

// Добавим watch для отслеживания изменений thrust
watch(thrust, (newVal) => {
    console.log('Thrust changed to:', newVal)
})

function AutoPilot() {
    console.log('Автопилот активирован')
    // Логика автопилота
    let autoThrust = 0

    const autoInterval = setInterval(() => {
        if (gameOver.value) {
            clearInterval(autoInterval)
            return
        }

        // Простая логика автопилота
        if (altitude.value > 790) {
            autoThrust = 0
        } else if (altitude.value > 100) {
            autoThrust = 80
        } else if (altitude.value > 70) {
            autoThrust = 60
        }


        thrust.value = autoThrust
        onStep()
    }, 1000)
}

function onStep() {
    // Проигрываем звук кнопки
    console.log('audioManager ref:', audioManager.value)

    // Проигрываем звук кнопки
    if (audioManager.value && audioManager.value.playStepSound) {
        console.log('Calling playStepSound...')
        audioManager.value.playStepSound()
    } else {
        console.error('Cannot call playStepSound:')
        console.error('- audioManager.value:', audioManager.value)
        console.error('- playStepSound exists:', audioManager.value?.playStepSound)

        // Попробуем альтернативный метод
        setTimeout(() => {
            console.log('Trying again after timeout...')
            if (audioManager.value && audioManager.value.playStepSound) {
                audioManager.value.playStepSound()
            }
        }, 100)
    }



    if (gameOver.value) {
        console.log('Игра окончена, шаг проигнорирован')
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
                message.value = `Ура ТЫ совершили посадку ускорение: ${res.velocity.toFixed(2)} m/s`
                setTimeout(() => {
                    audioManager.value.playLandingSound()
                }, 300)
            } else {
                message.value = `Катастрофа слишком большое ускорение ${res.velocity.toFixed(2)} m/s > 5 m/s`
                setTimeout(() => {
                    audioManager.value.playCrashSound()
                }, 300)
            }
            console.log('LANDED:', message.value)
            return
        }

        if (res.escaped) {
            gameOver.value = true
            message.value = 'Ты улетел в космос. Игра окончена.'
            console.log('ESCAPED:', message.value)
            return
        }

        if (res.fuel <= 0 && !gameOver.value) {
            message.value = 'Топливо закончилось! Вы больше не можете использовать тягу.'
            console.log('OUT OF FUEL')
            setTimeout(() => {
                audioManager.value.playFuelEmptySound()
            }, 300)
        } else {
            message.value = ''
        }

        // Обновляем reactive переменные из результата
        altitude.value = res.altitude
        velocity.value = res.velocity
        fuel.value = res.fuel


        // Логируем звуковые события
        if (res.soundEvents && res.soundEvents.length > 0) {
            console.log('Sound events:', res.soundEvents)

            res.soundEvents.forEach(event => {
                if (audioManager.value) {
                    // if (event.type === 'crash' && audioManager.value.playCrashSound) {
                    //     console.log('Direct crash sound trigger')
                    //     audioManager.value.playCrashSound()
                    // }
                    // if (event.type === 'landing_success' && audioManager.value.playLandingSound) {
                    //     console.log('Direct landing sound trigger')
                    //     // Задержка для лучшего эффекта
                    //     setTimeout(() => {
                    //         audioManager.value.playLandingSound()
                    //     }, 300)
                    // }


                }
            })

        }

    } catch (error) {
        console.error('Error in physicsStep:', error)
        message.value = `Error: ${error.message}`
    }
}

function resetGame() {
    reset()
    thrust.value = 50
    activeEngine.value = 'retro'
    turn.value = 0
    message.value = ''
    gameOver.value = false
}


</script>


<style scoped>
.app-wrapper {
    /* fallback + современный dvh */
    height: 100vh;
    height: 100dvh;
    /* где поддерживается */
    /* [web:49][web:52] */
    display: flex;
    justify-content: center;
    align-items: flex-start;
    /* чтобы origin: top работал естественно */
    /* [web:47][web:56] */
    background: #111;
    overflow: hidden;
}

.app-container {
    width: min(1200px, 95vw);
    height: min(700px, 90dvh);
    max-width: 95vw;
    max-height: 90dvh;

    transform-origin: top center;
    /* [web:31][web:40] */
}

/*  старое убераем */
.container {
    width: 1200px;
    height: 700px;
    /* height: 100%; */
    /* min-height: 100vh;
  min-height: -webkit-fill-available; /* Критически важно для iOS */
    /* min-height: 100dvh; Новый стандарт  */
    /* width: 100%; */
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.app-root {
    background: linear-gradient(#020516, #04102a);
    /* height: 100%; */
    /* min-height: 100vh;
  min-height: -webkit-fill-available;
  min-height: 100dvh; */
    overflow: hidden;
    position: relative;
}

/* Для iOS с dynamic island/челкой */
@supports (padding: max(0px)) {
    .container {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
    }
}


.message-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    /* height: 100%; */
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 20%;
    pointer-events: none;
    z-index: 1000;
}


.message {
    max-width: 80%;
    /* ограничение ширины */
    margin: 12px;
    color: #ffd;
    font-weight: 600;
    font-size: 18px;
    text-align: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    backdrop-filter: blur(5px);
    /* эффект размытия фона */
    pointer-events: auto;
    /* включаем клики на самом сообщении */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.debug {
    position: absolute;
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


/* Адаптивность для мобильных */
@media (max-width: 768px) {
    .container {
        /* height: 100%; */
        /* min-height: -webkit-fill-available; */
        padding-bottom: max(20px, env(safe-area-inset-bottom));
    }

    .message {
        font-size: 16px;
        padding: 15px;
        margin: 10px;
        max-width: 90%;
    }

    .message-container {
        padding-top: calc(15% + env(safe-area-inset-top, 0px));
    }
}

@media (max-width: 480px) {
    .message {
        font-size: 14px;
        padding: 12px;
    }

    .message-container {
        padding-top: 20%;
    }
}
</style>
