<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card } from "$lib/components/ui/card";
    import { ChevronLeft } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { Loader } from "lucide-svelte";
  
    let email = "";
    let password = "";
    let errorMessage = "";
    let isLoading = false;
  
    async function handleSubmit() {
      isLoading = true;
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          goto('/dashboard');
        } else {
          errorMessage = data.message || 'Invalid email or password';
        }
      } catch (error) {
        console.error('Error:', error);
        errorMessage = 'An error occurred. Please try again.';
      } finally {
        isLoading = false;
      }
    }
  </script>
  
  <div class="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex flex-col">
    <header class="container mx-auto px-4 py-6">
      <nav>
        <a href="/" class="text-purple-600 hover:text-purple-800 flex items-center">
          <ChevronLeft class="mr-2 h-4 w-4" />
          Back to Home
        </a>
      </nav>
    </header>
  
    <main class="flex-grow flex items-center justify-center px-4">
      <Card class="w-full max-w-md p-8 bg-white shadow-lg">
        <h1 class="text-3xl font-bold text-center mb-6 text-purple-600">Sign In to testify.live</h1>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input type="email" id="email" bind:value={email} required />
          </div>
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input type="password" id="password" bind:value={password} required />
          </div>
          {#if errorMessage}
            <p class="text-red-500 text-sm">{errorMessage}</p>
          {/if}
          <Button 
            type="submit" 
            class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            disabled={isLoading}
          >
            {#if isLoading}
              <Loader class="animate-spin mr-2 h-4 w-4" />
              Signing in...
            {:else}
              Sign In
            {/if}
          </Button>
        </form>
        <div class="mt-6 text-center space-y-2">
          <p class="text-sm text-purple-600">
            <a href="/forgot-password" class="font-semibold text-purple-800 hover:underline">Forgot password?</a>
          </p>
          <p class="text-sm text-purple-600">
            Don't have an account? 
            <a href="/signup" class="font-semibold text-purple-800 hover:underline">Sign up</a>
          </p>
        </div>
      </Card>
    </main>
  
    <footer class="bg-purple-800 py-6 text-white">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2024 testify.live. All rights reserved.</p>
      </div>
    </footer>
  </div>
