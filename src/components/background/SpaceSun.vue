<template>
  <svg class="space-background" viewBox="0 0 1200 650" preserveAspectRatio="xMidYMid slice">
    <defs>
      <!-- Градиент для фона -->
      <linearGradient id="spaceBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0a0e29" />
        <stop offset="100%" stop-color="#020414" />
      </linearGradient>
      
      <!-- Градиент для солнца -->
      <radialGradient id="simpleSun">
        <stop offset="0%" stop-color="#FFD95A" />
        <stop offset="60%" stop-color="#FFA726" />
        <stop offset="100%" stop-color="#FF7043" stop-opacity="0.3" />
      </radialGradient>
      
      <!-- Градиенты для звезд -->
      <radialGradient id="starWhite">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#E0E0E0" />
      </radialGradient>
      
      <radialGradient id="starBlue">
        <stop offset="0%" stop-color="#B3E5FC" />
        <stop offset="100%" stop-color="#81D4FA" />
      </radialGradient>
      
      <radialGradient id="starYellow">
        <stop offset="0%" stop-color="#FFF176" />
        <stop offset="100%" stop-color="#FFD54F" />
      </radialGradient>
      
      <!-- Фильтр для свечения звезд -->
      <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Фон -->
    <rect width="1200" height="650" fill="url(#spaceBg)" />
    
    <!-- Звезды первого слоя (дальние, мелкие) -->
    <g v-for="(star, i) in backgroundStars" :key="`bg-star-${i}`">
      <circle 
        :cx="star.x" 
        :cy="star.y" 
        :r="star.r" 
        fill="url(#starWhite)" 
        :opacity="star.o"
      >
        <animate 
          attributeName="opacity" 
          :values="`${star.o};${star.o * 0.4};${star.o}`" 
          :dur="`${star.blink}s`" 
          repeatCount="indefinite" 
        />
      </circle>
    </g>
    
    <!-- Звезды второго слоя (ближние, крупные) -->
    <g v-for="(star, i) in foregroundStars" :key="`fg-star-${i}`">
      <!-- Свечение -->
      <circle 
        :cx="star.x" 
        :cy="star.y" 
        :r="star.r * 2" 
        :fill="star.gradient" 
        :opacity="star.o * 0.4"
        filter="url(#starGlow)"
      >
        <animate 
          attributeName="r" 
          :values="`${star.r * 1.8};${star.r * 2.2};${star.r * 1.8}`" 
          :dur="`${star.pulse}s`" 
          repeatCount="indefinite" 
        />
      </circle>
      
      <!-- Основная звезда -->
      <circle 
        :cx="star.x" 
        :cy="star.y" 
        :r="star.r" 
        :fill="star.gradient" 
        :opacity="star.o"
      >
        <animate 
          attributeName="r" 
          :values="`${star.r * 0.9};${star.r * 1.1};${star.r * 0.9}`" 
          :dur="`${star.pulse}s`" 
          repeatCount="indefinite" 
        />
        <animate 
          attributeName="opacity" 
          :values="`${star.o};${star.o * 0.7};${star.o}`" 
          :dur="`${star.blink}s`" 
          repeatCount="indefinite" 
        />
      </circle>
    </g>
    
    <!-- Солнце -->
    <circle cx="800" cy="200" r="95" fill="url(#simpleSun)" opacity="0.9">
      <animate 
        attributeName="r" 
        values="92;98;92" 
        dur="8s" 
        repeatCount="indefinite" 
      />
    </circle>
    
    <!-- Свечение солнца -->
    <circle cx="800" cy="200" r="160" fill="#FF9800" opacity="0.15">
      <animate 
        attributeName="opacity" 
        values="0.1;0.2;0.1" 
        dur="6s" 
        repeatCount="indefinite" 
      />
    </circle>
  </svg>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const backgroundStars = ref([])
const foregroundStars = ref([])

const generateStars = () => {
  // Фоновые звезды (мелкие)
  for (let i = 0; i < 80; i++) {
    backgroundStars.value.push({
      x: Math.random() * 1200,
      y: Math.random() * 650,
      r: Math.random() * 1 + 0.5, // 0.5-1.5px
      o: Math.random() * 0.4 + 0.3,
      blink: Math.random() * 3 + 2
    })
  }
  
  // Передние звезды (крупные и яркие)
  const gradients = ['url(#starWhite)', 'url(#starBlue)', 'url(#starYellow)']
  
  for (let i = 0; i < 40; i++) {
    const starType = Math.random()
    let r, o
    
    if (starType < 0.6) {
      // Обычные звезды
      r = Math.random() * 2 + 1.5 // 1.5-3.5px
      o = Math.random() * 0.6 + 0.4
    } else if (starType < 0.9) {
      // Яркие звезды
      r = Math.random() * 3 + 2.5 // 2.5-5.5px
      o = Math.random() * 0.4 + 0.6
    } else {
      // Очень яркие звезды
      r = Math.random() * 4 + 3 // 3-7px
      o = Math.random() * 0.3 + 0.7
    }
    
    foregroundStars.value.push({
      x: Math.random() * 1200,
      y: Math.random() * 650,
      r: r,
      o: o,
      gradient: gradients[Math.floor(Math.random() * gradients.length)],
      blink: Math.random() * 4 + 3,
      pulse: Math.random() * 5 + 4
    })
  }
}

onMounted(() => {
  generateStars()
})
</script>