<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card } from "$lib/components/ui/card";
    import { ChevronLeft, Loader } from "lucide-svelte";
    import { goto } from "$app/navigation";

    let email = "";
    let errorMessage = "";
    let successMessage = "";
    let isLoading = false;
    let timeRemaining = 0;
    let countdownInterval: NodeJS.Timeout;

    function startCountdown(seconds: number) {
        timeRemaining = seconds;
        countdownInterval = setInterval(() => {
            timeRemaining--;
            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    async function handleSubmit() {
        if (timeRemaining > 0) {
            errorMessage = `Please wait ${timeRemaining} seconds before requesting another reset link`;
            return;
        }

        isLoading = true;
        errorMessage = "";
        successMessage = "";

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                successMessage = "Password reset link has been sent to your email";
                email = "";
                startCountdown(60); // Start 60-second countdown
            } else if (response.status === 429) {
                errorMessage = data.message;
                startCountdown(data.timeRemaining);
            } else {
                errorMessage = data.message || 'Failed to process request';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage = 'An error occurred. Please try again.';
        } finally {
            isLoading = false;
        }
    }

    // Cleanup interval on component unmount
    import { onDestroy } from 'svelte';
    onDestroy(() => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    });
</script>

<div class="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex flex-col">
    <header class="container mx-auto px-4 py-6">
        <nav>
            <a href="/signin" class="text-purple-600 hover:text-purple-800 flex items-center">
                <ChevronLeft class="mr-2 h-4 w-4" />
                Back to Sign In
            </a>
        </nav>
    </header>

    <main class="flex-grow flex items-center justify-center px-4">
        <Card class="w-full max-w-md p-8 bg-white shadow-lg">
            <h1 class="text-3xl font-bold text-center mb-6 text-purple-600">Reset Password</h1>
            <p class="text-gray-600 text-center mb-6">
                Enter your email address and we'll send you a link to reset your password.
            </p>
            <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                <div class="space-y-2">
                    <Label for="email">Email</Label>
                    <Input 
                        type="email" 
                        id="email" 
                        bind:value={email} 
                        required 
                        placeholder="Enter your email address"
                        disabled={timeRemaining > 0}
                    />
                </div>
                {#if errorMessage}
                    <p class="text-red-500 text-sm">{errorMessage}</p>
                {/if}
                {#if successMessage}
                    <p class="text-green-500 text-sm">{successMessage}</p>
                {/if}
                {#if timeRemaining > 0}
                    <p class="text-gray-500 text-sm">You can request another reset link in {timeRemaining} seconds</p>
                {/if}
                <Button 
                    type="submit" 
                    class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    disabled={isLoading || timeRemaining > 0}
                >
                    {#if isLoading}
                        <Loader class="animate-spin mr-2 h-4 w-4" />
                        Sending...
                    {:else}
                        Send Reset Link
                    {/if}
                </Button>
            </form>
        </Card>
    </main>

    <footer class="bg-purple-800 py-6 text-white">
        <div class="container mx-auto px-4 text-center">
            <p>&copy; 2024 Testify. All rights reserved.</p>
        </div>
    </footer>
</div> 