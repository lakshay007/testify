<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Card } from "$lib/components/ui/card";
    import { ChevronRight, Star, Code, Send, Layout, Heart } from "lucide-svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
  
    const features = [
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
  
    let hearts: { x: number; y: number; scale: number }[] = [];
  
    onMount(() => {
      const interval = setInterval(() => {
        if (hearts.length < 10) {
          hearts = [...hearts, {
            x: Math.random() * 100,
            y: Math.random() * 100,
            scale: 0.5 + Math.random() * 0.5
          }];
        } else {
          hearts = hearts.slice(1);
        }
      }, 1000);
  
      return () => clearInterval(interval);
    });
  </script>
  
  <div class="bg-gradient-to-b from-purple-100 to-pink-100 min-h-screen">
    <header class="container mx-auto px-4 py-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-purple-600">testify.live</h1>
      <nav>
        <ul class="flex space-x-4">
          <li><a href="#features" class="text-purple-600 hover:text-purple-800">Features</a></li>
          <li><a href="#how-it-works" class="text-purple-600 hover:text-purple-800">How It Works</a></li>
          <li><a href="/signin" class="text-purple-600 hover:text-purple-800">Login</a></li>
          <li><a href="/signup" class="text-purple-600 hover:text-purple-800">Signup</a></li>
        </ul>
      </nav>
    </header>
  
    <main>
      <section class="container mx-auto px-4 py-20 text-center relative overflow-hidden">
        <h2 class="text-5xl font-bold mb-4 relative z-10">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Showcase Your Customer Love
          </span>
        </h2>
        <p class="text-xl text-purple-800 mb-8 relative z-10">Collect and display beautiful testimonials with ease</p>
        <Button on:click={() => goto('/signup')} size="lg" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          Get Started
          <ChevronRight class="ml-2 h-4 w-4" />
        </Button>
        {#each hearts as heart}
          <div class="absolute" style="left: {heart.x}%; top: {heart.y}%; transform: scale({heart.scale});">
            <Heart class="text-pink-400 animate-pulse" />
          </div>
        {/each}
      </section>
  
      <section id="features" class="bg-white py-20">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12 text-purple-600">Features</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {#each features as feature}
              <Card class="p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300">
                <svelte:component this={feature.icon} class="h-12 w-12 text-purple-600 mb-4" />
                <h3 class="text-xl font-semibold mb-2 text-purple-800">{feature.title}</h3>
                <p class="text-purple-600">{feature.description}</p>
              </Card>
            {/each}
          </div>
        </div>
      </section>
  
      <section id="how-it-works" class="py-20 bg-gradient-to-b from-purple-100 to-pink-100">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12 text-purple-600">How It Works</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {#each steps as step}
              <div class="flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 class="text-xl font-semibold mb-2 text-purple-800">{step.title}</h3>
                <p class="text-purple-600">{step.description}</p>
              </div>
            {/each}
          </div>
        </div>
      </section>
    </main>
  
    <footer class="bg-purple-800 py-12 text-white">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2024 testify.live. All rights reserved.</p>
      </div>
    </footer>
  </div>
  
  <style>
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
  
    :global(.animate-pulse) {
      animation: float 3s ease-in-out infinite;
    }
  </style>