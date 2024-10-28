<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card } from "$lib/components/ui/card";
    import { ChevronLeft, Loader } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { page } from '$app/stores';

    let newPassword = "";
    let confirmPassword = "";
    let errorMessage = "";
    let successMessage = "";
    let isLoading = false;

    const token = $page.params.token;

    async function handleSubmit() {
        if (newPassword !== confirmPassword) {
            errorMessage = "Passwords don't match";
            return;
        }

        isLoading = true;
        errorMessage = "";
        successMessage = "";

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    token,
                    newPassword 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                successMessage = "Password has been reset successfully";
                setTimeout(() => goto('/signin'), 2000);
            } else {
                errorMessage = data.message || 'Failed to reset password';
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
            <a href="/signin" class="text-purple-600 hover:text-purple-800 flex items-center">
                <ChevronLeft class="mr-2 h-4 w-4" />
                Back to Sign In
            </a>
        </nav>
    </header>

    <main class="flex-grow flex items-center justify-center px-4">
        <Card class="w-full max-w-md p-8 bg-white shadow-lg">
            <h1 class="text-3xl font-bold text-center mb-6 text-purple-600">Reset Password</h1>
            <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                <div class="space-y-2">
                    <Label for="newPassword">New Password</Label>
                    <Input 
                        type="password" 
                        id="newPassword" 
                        bind:value={newPassword} 
                        required 
                        minlength="6"
                    />
                </div>
                <div class="space-y-2">
                    <Label for="confirmPassword">Confirm Password</Label>
                    <Input 
                        type="password" 
                        id="confirmPassword" 
                        bind:value={confirmPassword} 
                        required 
                        minlength="6"
                    />
                </div>
                {#if errorMessage}
                    <p class="text-red-500 text-sm">{errorMessage}</p>
                {/if}
                {#if successMessage}
                    <p class="text-green-500 text-sm">{successMessage}</p>
                {/if}
                <Button 
                    type="submit" 
                    class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    disabled={isLoading}
                >
                    {#if isLoading}
                        <Loader class="animate-spin mr-2 h-4 w-4" />
                        Resetting...
                    {:else}
                        Reset Password
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