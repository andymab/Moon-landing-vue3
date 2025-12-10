<!-- AudioManager.vue -->
<template>
    <!-- Этот компонент не рендерит DOM, только управляет звуком -->
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    thrust: Number, // 0-100%
    engine: String, // 'retro' или 'main'
    altitude: Number,
    velocity: Number,
    fuel: Number,
    gameOver: Boolean,
    isLanded: Boolean,
    message: String
})

const emit = defineEmits(['sound-state-change'])

// Состояния звуков
const engineSound = ref(null)
const voiceSound = ref(null)
const landingSound = ref(null)
const crashSound = ref(null)

// Громкости
const engineVolume = ref(0)
const enginePitch = ref(1.0)
const isPlaying = ref(false)

// Константы для настройки
const MIN_PITCH = 0.7
const MAX_PITCH = 1.8
const MIN_VOLUME = 0.05
const MAX_VOLUME = 0.8
const FADE_SPEED = 0.1 // Скорость изменения громкости
const FUEL_WARNING_THRESHOLD = 100 // Порог низкого топлива

// Предзагрузка аудиофайлов
const audioContext = ref(null)
const engineBuffer = ref(null)
const fuelWarningBuffer = ref(null)
const landingBuffer = ref(null)
const crashBuffer = ref(null)
const crashHorrorBuffer = ref(null)


const buttonSoundBuffer = ref(null)
const buttonAudio = ref(null)

// Инициализация аудио
async function initAudio() {
    try {
        // Создаем AudioContext
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)()

        // Создаем AudioBufferSourceNode для двигателя
        engineSound.value = audioContext.value.createBufferSource()
        const gainNode = audioContext.value.createGain()
        const pannerNode = audioContext.value.createStereoPanner()

        // Подключаем цепочку: source -> gain -> panner -> destination
        engineSound.value.connect(gainNode)
        gainNode.connect(pannerNode)
        pannerNode.connect(audioContext.value.destination)

        // Настройка зацикливания
        engineSound.value.loop = true
        gainNode.gain.value = 0
        pannerNode.pan.value = 0 // Центр

        await Promise.all([
            loadAudioFile('/sounds/engine.wav').then(buffer => {
                engineBuffer.value = buffer
                engineSound.value.buffer = buffer
            }),
            loadAudioFile('/sounds/button-step.wav').then(buffer => {
                buttonSoundBuffer.value = buffer
            }),
            loadAudioFile('/sounds/crash.wav').then(buffer => {
                crashBuffer.value = buffer
            }),
            loadAudioFile('/sounds/crash-horror.wav').then(buffer => {
                crashHorrorBuffer.value = buffer
            }),
            loadAudioFile('/sounds/landing.wav').then(buffer => {
                landingBuffer.value = buffer
            })
            
        ])

        console.log('Audio initialized successfully')
    } catch (error) {
        console.error('Audio initialization failed:', error)
    }
}

// Загрузка аудиофайла
async function loadAudioFile(url) {
    try {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        return await audioContext.value.decodeAudioData(arrayBuffer)
    } catch (error) {
        console.error(`Failed to load audio: ${url}`, error)
        return null
    }
}

// Расчет параметров звука двигателя
function calculateEngineSound(thrustPercent, fuel, gameOver) {
    if (gameOver || fuel <= 0 || thrustPercent === 0) {
        return { volume: 0, pitch: MIN_PITCH }
    }

    // Объем зависит от тяги
    const targetVolume = MIN_VOLUME + (MAX_VOLUME - MIN_VOLUME) * (thrustPercent / 100)

    // Высота тона зависит от тяги
    const targetPitch = MIN_PITCH + (MAX_PITCH - MIN_PITCH) * (thrustPercent / 100)

    // Если топливо на исходе - добавляем "дрожание"
    const fuelEffect = fuel < FUEL_WARNING_THRESHOLD ? Math.random() * 0.1 : 0

    return {
        volume: targetVolume * (1 - fuelEffect),
        pitch: targetPitch * (0.9 + fuelEffect * 0.2)
    }
}

// Плавное изменение параметров
function updateEngineSound() {
    if (!engineSound.value || !audioContext.value) return

    const { volume: targetVolume, pitch: targetPitch } = calculateEngineSound(
        props.thrust,
        props.fuel,
        props.gameOver
    )

    // Плавное изменение громкости
    engineVolume.value += (targetVolume - engineVolume.value) * FADE_SPEED

    // Плавное изменение высоты тона
    enginePitch.value += (targetPitch - enginePitch.value) * FADE_SPEED

    // Применяем параметры
    if (engineSound.value) {
        // Обновляем громкость через GainNode
        const gainNode = engineSound.value.context.createGain()
        engineSound.value.disconnect()
        engineSound.value.connect(gainNode)
        gainNode.connect(engineSound.value.context.destination)
        gainNode.gain.value = engineVolume.value

        // Обновляем высоту тона
        engineSound.value.playbackRate.value = enginePitch.value
    }

    // Управление воспроизведением
    if (engineVolume.value > 0.01 && !isPlaying.value) {
        startEngineSound()
    } else if (engineVolume.value <= 0.01 && isPlaying.value) {
        stopEngineSound()
    }
}

// Запуск звука двигателя
function startEngineSound() {
    if (!engineSound.value || isPlaying.value) return

    try {
        // Сбрасываем время воспроизведения
        if (audioContext.value.state === 'suspended') {
            audioContext.value.resume()
        }

        // Создаем новый источник для зацикленного звука
        const source = audioContext.value.createBufferSource()
        source.buffer = engineBuffer.value
        source.loop = true

        const gainNode = audioContext.value.createGain()
        gainNode.gain.value = engineVolume.value

        source.connect(gainNode)
        gainNode.connect(audioContext.value.destination)

        source.start(0)
        engineSound.value = source
        isPlaying.value = true

        console.log('Engine sound started')
    } catch (error) {
        console.error('Failed to start engine sound:', error)
    }
}

// Остановка звука двигателя
function stopEngineSound() {
    if (!engineSound.value || !isPlaying.value) return

    try {
        // Плавное затухание
        const gainNode = engineSound.value.context.createGain()
        engineSound.value.disconnect()
        engineSound.value.connect(gainNode)
        gainNode.connect(engineSound.value.context.destination)

        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.5)

        setTimeout(() => {
            if (engineSound.value) {
                engineSound.value.stop()
                isPlaying.value = false
                console.log('Engine sound stopped')
            }
        }, 500)
    } catch (error) {
        console.error('Failed to stop engine sound:', error)
    }
}

// Воспроизведение голосовых сообщений
function playVoiceMessage(message) {
    if (!audioContext.value) return

    // Определяем тип сообщения
    if (message.includes('Touchdown') || message.includes('Safe landing')) {
        playLandingSound()
    } else if (message.includes('Crashed') || message.includes('Impact')) {
        playCrashSound()
    } else if (message.includes('Out of fuel')) {
        playFuelWarning()
    }
}

// Звук посадки
function playLandingSound() {
    console.log('Playing landing sound')
    // Здесь будет логика воспроизведения звука посадки
  if (!audioContext.value || !landingBuffer.value) {
        console.warn('Crash sounds not loaded')
        return
    }

    try {
        // Останавливаем звук двигателя при приземлении
        stopEngineSound()

        // 1. Первый звук - crash.wav
        const landingSource = audioContext.value.createBufferSource()
        landingSource.buffer = landingBuffer.value

        const landingGain = audioContext.value.createGain()
        landingGain.gain.value = 0.6 // Громкость 60%

        landingSource.connect(landingGain)
        landingGain.connect(audioContext.value.destination)

        // Запускаем первый звук
        landingSource.start(0)
        console.log('First crash sound started')

        // Получаем длительность первого звука
        const firstSoundDuration = landingBuffer.value.duration

        // 2. Второй звук - crash-horror.wav запускаем после окончания первого
        // landingSource.onended = () => {
        //     console.log('First crash sound ended, starting horror sound')

        //     const successLandingSource = audioContext.value.createBufferSource()
        //     successLandingSource.buffer = successLandingBuffer.value

        //     const successGain = audioContext.value.createGain()
        //     successGain.gain.value = 0.7 // Громкость 70%

        //     successLandingSource.connect(successGain)
        //     successGain.connect(audioContext.value.destination)

        //     // Небольшая пауза между звуками (0.3 секунды)
        //     setTimeout(() => {
        //         successLandingSource.start(0)
        //         console.log('Horror crash sound started')

        //         successLandingSource.onended = () => {
        //             console.log('Crash sound sequence completed')
        //         }
        //     }, 300)
        // }

    } catch (error) {
        console.error('Failed to play crash sound:', error)
    }


}

// Звук крушения
function playCrashSound() {
    console.log('Playing crash sound')

    if (!audioContext.value || !crashBuffer.value || !crashHorrorBuffer.value) {
        console.warn('Crash sounds not loaded')
        return
    }

    try {
        // Останавливаем звук двигателя при крушении
        stopEngineSound()

        // 1. Первый звук - crash.wav
        const crashSource = audioContext.value.createBufferSource()
        crashSource.buffer = crashBuffer.value

        const crashGain = audioContext.value.createGain()
        crashGain.gain.value = 0.6 // Громкость 60%

        crashSource.connect(crashGain)
        crashGain.connect(audioContext.value.destination)

        // Запускаем первый звук
        crashSource.start(0)
        console.log('First crash sound started')

        // Получаем длительность первого звука
        const firstSoundDuration = crashBuffer.value.duration

        // 2. Второй звук - crash-horror.wav запускаем после окончания первого
        crashSource.onended = () => {
            console.log('First crash sound ended, starting horror sound')

            const horrorSource = audioContext.value.createBufferSource()
            horrorSource.buffer = crashHorrorBuffer.value

            const horrorGain = audioContext.value.createGain()
            horrorGain.gain.value = 0.7 // Громкость 70%

            horrorSource.connect(horrorGain)
            horrorGain.connect(audioContext.value.destination)

            // Небольшая пауза между звуками (0.3 секунды)
            setTimeout(() => {
                horrorSource.start(0)
                console.log('Horror crash sound started')

                horrorSource.onended = () => {
                    console.log('Crash sound sequence completed')
                }
            }, 300)
        }

    } catch (error) {
        console.error('Failed to play crash sound:', error)
    }
}

// Альтернативная версия с одновременным воспроизведением (если нужно)
function playCrashSoundSimultaneous() {
    console.log('Playing crash sounds simultaneously')

    if (!audioContext.value || !crashBuffer.value || !crashHorrorBuffer.value) {
        console.warn('Crash sounds not loaded')
        return
    }

    try {
        // Останавливаем звук двигателя
        stopEngineSound()

        // 1. Первый звук - crash.wav (громкий и резкий)
        const crashSource = audioContext.value.createBufferSource()
        crashSource.buffer = crashBuffer.value

        const crashGain = audioContext.value.createGain()
        crashGain.gain.value = 0.8

        crashSource.connect(crashGain)
        crashGain.connect(audioContext.value.destination)

        // 2. Второй звук - crash-horror.wav (с небольшой задержкой)
        const horrorSource = audioContext.value.createBufferSource()
        horrorSource.buffer = crashHorrorBuffer.value

        const horrorGain = audioContext.value.createGain()
        horrorGain.gain.value = 0.5

        // Создаем задержку для второго звука (0.5 секунды)
        const delayNode = audioContext.value.createDelay()
        delayNode.delayTime.value = 0.5

        horrorSource.connect(delayNode)
        delayNode.connect(horrorGain)
        horrorGain.connect(audioContext.value.destination)

        // Запускаем оба звука
        crashSource.start(0)
        horrorSource.start(0)

        console.log('Both crash sounds started')

    } catch (error) {
        console.error('Failed to play crash sounds:', error)
    }
}

// Предупреждение о низком топливе
function playFuelWarning() {
    console.log('Playing fuel warning')
    // Здесь будет логика предупреждения
}

function playStepSound() {
    console.log('Playing +++step+++ sound')
    playButtonSound() // Используем ту же функцию, что и в способе 1
}


function playButtonSound() {
    if (!audioContext.value || !buttonSoundBuffer.value) {
        // Если нет загруженного звука, создаем простой бип
        playBeepSound()
        return
    }

    try {
        // Создаем источник для одноразового звука
        const source = audioContext.value.createBufferSource()
        source.buffer = buttonSoundBuffer.value

        const gainNode = audioContext.value.createGain()
        gainNode.gain.value = 0.04 // 30% громкость

        source.connect(gainNode)
        gainNode.connect(audioContext.value.destination)

        source.start(0)

        // Очищаем ссылку после завершения
        source.onended = () => {
            source.disconnect()
        }

        console.log('Button sound played')
    } catch (error) {
        console.error('Failed to play button sound:', error)
        // Fallback на простой бип
        playBeepSound()
    }
}
// Простой бип-звук (fallback)
function playBeepSound() {
    try {
        const oscillator = audioContext.value.createOscillator()
        const gainNode = audioContext.value.createGain()

        oscillator.frequency.value = 800 // Частота в Гц
        oscillator.type = 'sine'

        gainNode.gain.value = 0.1
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.1)

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.value.destination)

        oscillator.start()
        oscillator.stop(audioContext.value.currentTime + 0.1)

        console.log('Beep sound played')
    } catch (error) {
        console.error('Failed to play beep:', error)
    }
}


// Наблюдатели
watch(() => props.thrust, updateEngineSound)
watch(() => props.fuel, updateEngineSound)
watch(() => props.gameOver, (newVal) => {
    if (newVal) {
        stopEngineSound()
    }
})
watch(() => props.message, (newMessage) => {
    if (newMessage) {
        playVoiceMessage(newMessage)
    }
})

// Жизненный цикл
onMounted(() => {
    initAudio()
})

onUnmounted(() => {
    if (engineSound.value && isPlaying.value) {
        engineSound.value.stop()
    }
    if (audioContext.value) {
        audioContext.value.close()
    }
})

defineExpose({
    playStepSound,
    playCrashSound,
    playLandingSound,
    stopEngineSound,
    // при необходимости можно добавить другие методы
})
</script>