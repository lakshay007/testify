<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card } from "$lib/components/ui/card";
    import { ChevronLeft, Star, Loader } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { fade, fly } from 'svelte/transition';
  
    let firstName = "";
    let lastName = "";
    let email = "";
    let phoneNumber = "";
    let password = "";
    let errorMessage = "";
    let isLoading = false;  // Add loading state
  
    async function handleSubmit() {
        isLoading = true;  // Start loading
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, email, phoneNumber, password }),
            });
  
            const data = await response.json();
  
            if (response.ok) {
                localStorage.setItem('token', data.token);
                goto('/dashboard');
            } else {
                errorMessage = data.message || 'An error occurred during signup';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage = 'An error occurred. Please try again.';
        } finally {
            isLoading = false;  // End loading
        }
    }
  </script>
  
  <div class="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex flex-col relative overflow-hidden">
    <!-- Decorative background elements -->
    {#each Array(20) as _, i}
      <div
        class="absolute text-purple-300 opacity-20"
        style="top: {Math.random() * 100}%; left: {Math.random() * 100}%; transform: scale({0.5 + Math.random()});"
        in:fade={{ duration: 1000, delay: i * 100 }}
      >
        <Star size={24} />
      </div>
    {/each}
  
    <header class="container mx-auto px-4 py-6 relative z-10">
      <nav>
        <a href="/" class="text-purple-600 hover:text-purple-800 flex items-center transition-colors duration-200">
          <ChevronLeft class="mr-2 h-4 w-4" />
          Back to Home
        </a>
      </nav>
    </header>
  
    <main class="flex-grow flex items-center justify-center px-4 relative z-10">
      <div in:fly={{ y: 50, duration: 500 }}>
        <Card class="w-full max-w-md p-8 bg-white shadow-lg">
          <h1 class="text-3xl font-bold text-center mb-6 text-purple-600">Join Testify</h1>
          <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="firstName">First Name</Label>
                <Input type="text" id="firstName" bind:value={firstName} required />
              </div>
              <div class="space-y-2">
                <Label for="lastName">Last Name</Label>
                <Input type="text" id="lastName" bind:value={lastName} required />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input type="email" id="email" bind:value={email} required />
            </div>
            <div class="space-y-2">
              <Label for="phoneNumber">Phone Number</Label>
              <Input type="tel" id="phoneNumber" bind:value={phoneNumber} required />
            </div>
            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input type="password" id="password" bind:value={password} required />
            </div>
            {#if errorMessage}
              <p class="text-red-500 text-sm" in:fade>{errorMessage}</p>
            {/if}
            <Button 
                type="submit" 
                class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-200 transform hover:scale-105"
                disabled={isLoading}
            >
                {#if isLoading}
                    <Loader class="animate-spin mr-2 h-4 w-4" />
                    Creating Account...
                {:else}
                    Create Account
                {/if}
            </Button>
          </form>
          <div class="mt-6 text-center">
            <p class="text-sm text-purple-600">
              Already have an account? 
              <a href="/signin" class="font-semibold text-purple-800 hover:underline transition-colors duration-200">Sign in</a>
            </p>
          </div>
        </Card>
      </div>
    </main>
  
    <footer class="bg-purple-800 py-6 text-white relative z-10">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2024 Testify. All rights reserved.</p>
      </div>
    </footer>
  </div>
  
  <style>
    :global(body) {
      background-color: #f3e8ff;
    }
  </style>
