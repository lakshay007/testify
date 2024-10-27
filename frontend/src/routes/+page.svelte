<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { Button } from '$lib/components/ui/button';
  import { ChevronRight, Star, Code, Send, Layout, Menu, Heart } from 'lucide-svelte';

  let scrollY: number;
  let innerHeight: number;
  let features: HTMLElement;
  let howItWorks: HTMLElement;
  let isMenuOpen = false;

  const featuresList = [
    { icon: Star, title: "Collect Testimonials", description: "Easily gather feedback from your satisfied customers." },
    { icon: Code, title: "Generate Embed Code", description: "Create custom code to showcase testimonials on your website." },
    { icon: Send, title: "Share Testimonials", description: "Spread the word about your business with authentic reviews." },
    { icon: Layout, title: "Beautiful Display", description: "Present testimonials in an attractive, professional manner." },
  ];

  const steps = [
    { number: 1, title: "Create a Card", description: "Design a personalized testimonial request card for your customers." },
    { number: 2, title: "Send to Customers", description: "Share the card with your satisfied customers to gather feedback." },
    { number: 3, title: "Collect Responses", description: "Receive thoughtful testimonials from your happy clients." },
    { number: 4, title: "Generate Code", description: "Get a custom embed code to display testimonials on your site." },
  ];

  let hearts: { x: number; y: number; scale: number; opacity: number; id: number }[] = [];
  let heartId = 0;

  function addHeart() {
    const newHeart = {
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: 0.5 + Math.random() * 0.5,
      opacity: 1,
      id: heartId++
    };

    if (hearts.length < 10) {
      hearts = [...hearts, newHeart];
    } else {
      const oldestHeart = hearts[0];
      oldestHeart.opacity = 0;
      hearts = [...hearts.slice(1), newHeart];
      setTimeout(() => {
        hearts = hearts.filter(h => h.opacity > 0);
      }, 1000);
    }
  }

  $: featuresVisible = features && scrollY + innerHeight > features.offsetTop;
  $: howItWorksVisible = howItWorks && scrollY + innerHeight > howItWorks.offsetTop;

  onMount(() => {
    const updateScroll = () => {
      scrollY = window.scrollY;
      innerHeight = window.innerHeight;
    };
    window.addEventListener('scroll', updateScroll);
    updateScroll();

    const heartInterval = setInterval(addHeart, 1000);

    return () => {
      clearInterval(heartInterval);
      window.removeEventListener('scroll', updateScroll);
    };
  });

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<svelte:window bind:scrollY bind:innerHeight />

<div class="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100">
  <header class="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm pt-safe">
    <div class="container mx-auto px-4 py-4">
      <nav class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-purple-800">Testify.tech</h1>
        <button class="md:hidden" on:click={toggleMenu}>
          <Menu class="text-purple-800" />
        </button>
        <ul class="hidden md:flex space-x-6">
          <li><a href="#features" class="text-purple-800 hover:text-purple-600 transition-colors">Key Features</a></li>
          <li><a href="#how-it-works" class="text-purple-800 hover:text-purple-600 transition-colors">How It Works</a></li>
          <li><a href="/signin" class="text-purple-800 hover:text-purple-600 transition-colors">Login</a></li>
          <li><a href="/signup" class="text-purple-800 hover:text-purple-600 transition-colors">Signup</a></li>
        </ul>
      </nav>
    </div>
  </header>

  {#if isMenuOpen}
    <div class="fixed inset-0 z-40 bg-white bg-opacity-90 backdrop-blur-md md:hidden">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-2xl font-bold text-purple-800">Testify.tech</h1>
          <button on:click={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul class="flex flex-col space-y-4">
          <li><a href="#features" class="text-purple-800 hover:text-purple-600 transition-colors text-lg" on:click={toggleMenu}>Key Features</a></li>
          <li><a href="#how-it-works" class="text-purple-800 hover:text-purple-600 transition-colors text-lg" on:click={toggleMenu}>How It Works</a></li>
          <li><a href="/signin" class="text-purple-800 hover:text-purple-600 transition-colors text-lg">Login</a></li>
          <li><a href="/signup" class="text-purple-800 hover:text-purple-600 transition-colors text-lg">Signup</a></li>
        </ul>
      </div>
    </div>
  {/if}

  <main class="pt-safe">
    <section class="min-h-screen flex items-center justify-center text-center px-4 relative overflow-hidden">
      <div in:fade={{ duration: 1000, delay: 300 }}>
        <h2 class="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Showcase Your Customer Love
        </h2>
        <p class="text-xl md:text-2xl font-light leading-relaxed text-purple-800/90 mb-8 max-w-2xl mx-auto">
          <span class="block mb-2">Collect and display beautiful testimonials with ease.</span>
          <span class="text-lg md:text-xl text-purple-700/80">Elevate your brand with authentic customer stories.</span>
        </p>
        <Button on:click={() => (window.location.href = '/signup')} size="lg" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          Get Started
          <ChevronRight class="ml-2 h-4 w-4" />
        </Button>
      </div>
      {#each hearts as heart (heart.id)}
        <div 
          class="absolute pointer-events-none transition-opacity duration-1000"
          style="left: {heart.x}%; top: {heart.y}%; transform: scale({heart.scale}); opacity: {heart.opacity};"
        >
          <Heart class="text-pink-400 animate-pulse" />
        </div>
      {/each}
    </section>

    <section id="features" class="min-h-screen flex items-center py-20" bind:this={features}>
      <div class="container mx-auto px-4">
        <h2 class="text-6xl md:text-7xl font-bold text-center mb-20 text-purple-800">Key Features</h2>
        <div class="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
          {#each featuresList as feature, index}
            <div 
              class="flex-1 p-8 bg-white/50 rounded-2xl backdrop-blur-sm hover:bg-white/60 transition-all duration-300"
              in:fly={{ y: 50, duration: 500, delay: index * 200 }}
              class:opacity-0={!featuresVisible}
              class:translate-y-8={!featuresVisible}
              class:opacity-100={featuresVisible}
              class:translate-y-0={featuresVisible}
              style="transition: opacity 0.5s, transform 0.5s"
            >
              <svelte:component this={feature.icon} class="h-12 w-12 text-purple-600 mb-6" />
              <h3 class="text-2xl font-semibold mb-4 text-purple-800">{feature.title}</h3>
              <p class="text-lg text-purple-600/90 leading-relaxed">{feature.description}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section id="how-it-works" class="min-h-screen flex items-center py-20 bg-white/30 backdrop-blur-sm" bind:this={howItWorks}>
      <div class="container mx-auto px-4">
        <h2 class="text-6xl md:text-7xl font-bold text-center mb-20 text-purple-800">How It Works</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
          {#each steps as step, index}
            <div 
              class="flex flex-col items-center text-center"
              in:fly={{ y: 50, duration: 500, delay: index * 200 }}
              class:opacity-0={!howItWorksVisible}
              class:translate-y-8={!howItWorksVisible}
              class:opacity-100={howItWorksVisible}
              class:translate-y-0={howItWorksVisible}
              style="transition: opacity 0.5s, transform 0.5s"
            >
              <div class="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center text-4xl font-bold mb-6">
                {step.number}
              </div>
              <h3 class="text-3xl font-semibold mb-4 text-purple-800">{step.title}</h3>
              <p class="text-xl text-purple-600/90 leading-relaxed">{step.description}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>
  </main>

  <footer class="bg-purple-800 py-12 text-white">
    <div class="container mx-auto px-4 text-center">
      <p>&copy; 2024 Testify.tech. All rights reserved.</p>
    </div>
  </footer>
</div>

<style lang="postcss">
  :global(html) {
    scroll-behavior: smooth;
  }

  :global(body) {
    @apply bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100;
    background-attachment: fixed;
    /* Add support for safe areas */
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }

  /* Add these utility classes */
  .pt-safe {
    padding-top: env(safe-area-inset-top);
  }

  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  :global(.animate-pulse) {
    animation: float 3s ease-in-out infinite;
  }

  :global(.transition-opacity) {
    transition: opacity 1s ease-out;
  }
</style>
