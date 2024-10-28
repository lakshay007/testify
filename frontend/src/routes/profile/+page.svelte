<script lang="ts">
  import { CircleUser, Menu, Package2, Camera, Lock } from "lucide-svelte";

  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { Avatar, AvatarImage, AvatarFallback } from "$lib/components/ui/avatar/index.js";

    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { Label } from "$lib/components/ui/label";
    import Header from "$lib/components/Header.svelte";

    let firstName = "";
    let lastName = "";
    let email = "";
    let avatar = "";
    let currentPassword = "";
    let newPassword = "";
    let confirmPassword = "";
    let fileInput: HTMLInputElement;
    let isLoading = false;
    let errorMessage = "";
    let successMessage = "";

    onMount(async () => {
        await checkAuthentication();
        await loadUserProfile();
    });
    async function checkAuthentication() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            // Verify token
            const authResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!authResponse.ok) {
                throw new Error('Authentication failed');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            goto('/signin');
        }
    }

    async function loadUserProfile() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                goto('/signin');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                firstName = userData.firstName;
                lastName = userData.lastName;
                email = userData.email;
                avatar = userData.avatarURL || "";  
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    function handleAvatarUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > 200) {
                            height *= 200 / width;
                            width = 200;
                        }
                    } else {
                        if (height > 200) {
                            width *= 200 / height;
                            height = 200;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    avatar = canvas.toDataURL('image/jpeg', 0.7);
                    
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    async function updateProfile() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    avatarURL: avatar || null  
                })
            });

            if (response.ok) {
                successMessage = "Profile updated successfully";
                setTimeout(() => successMessage = "", 3000);
            } else {
                const errorData = await response.json();
                errorMessage = errorData.message || 'Failed to update profile';
                setTimeout(() => errorMessage = "", 3000);
            }
        } catch (error) {
            errorMessage = error.message || "Failed to update profile";
            setTimeout(() => errorMessage = "", 3000);
        }
    }
    function handleSignOut() {
        localStorage.removeItem('token');
        goto('/signin');
    }
    function goToDashboard() {
        goto('/dashboard');
    }

    async function updatePassword() {
        if (newPassword !== confirmPassword) {
            errorMessage = "Passwords don't match";
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (response.ok) {
                successMessage = "Password updated successfully!";
                currentPassword = "";
                newPassword = "";
                confirmPassword = "";
                setTimeout(() => successMessage = "", 3000);
            } else {
                const errorData = await response.json();
                errorMessage = errorData.message || 'Failed to update password!';
                setTimeout(() => errorMessage = "", 3000);
            }
        } catch (error) {
            errorMessage = error.message || "Failed to update password!";
            setTimeout(() => errorMessage = "", 3000);
        }
    }
</script>




<div class="flex min-h-screen w-full flex-col bg-gray-900 text-gray-100">
  <header class="bg-gray-800 sticky top-0 flex h-16 items-center gap-4 border-b border-gray-700 px-4 md:px-6">
    <nav
      class="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6"
    >
      <a href="##" class="flex items-center gap-2 text-lg font-semibold md:text-base">
        <img 
          src="/logo2.svg" 
          alt="Testify Logo" 
          class="h-6 w-6 text-indigo-400"
        />
        <span class="text-indigo-400">Testify</span>
      </a>
    </nav>
    <Sheet.Root>
      <Sheet.Trigger asChild let:builder>
        <Button
          variant="outline"
          size="icon"
          class="shrink-0 md:hidden bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 hover:text-gray-100"
          builders={[builder]}
        >
          <Menu class="h-5 w-5" />
          <span class="sr-only">Toggle navigation menu</span>
        </Button>
      </Sheet.Trigger>
      <Sheet.Content side="left" class="bg-gray-800 text-gray-100">
        <nav class="grid gap-6 text-lg font-medium">
          <a href="##" class="flex items-center gap-2 text-lg font-semibold">
            <img 
              src="/logo2.svg" 
              alt="Testify Logo" 
              class="h-6 w-6 text-indigo-400"
            />
            <span class="text-indigo-400">Testify</span>
          </a>
          <a href="##" class="text-gray-400 hover:text-indigo-400">General</a>
          <div class="flex items-center gap-2 text-gray-500 cursor-not-allowed">
            <Lock class="h-4 w-4" />
            <span>Security</span>
          </div>
          <div class="flex items-center gap-2 text-gray-500 cursor-not-allowed">
            <Lock class="h-4 w-4" />
            <span>Integrations</span>
          </div>
          <div class="flex items-center gap-2 text-gray-500 cursor-not-allowed">
            <Lock class="h-4 w-4" />
            <span>Support</span>
          </div>
          <div class="flex items-center gap-2 text-gray-500 cursor-not-allowed">
            <Lock class="h-4 w-4" />
            <span>Organizations</span>
          </div>
          <div class="flex items-center gap-2 text-gray-500 cursor-not-allowed">
            <Lock class="h-4 w-4" />
            <span>Advanced</span>
          </div>
        </nav>
      </Sheet.Content>
    </Sheet.Root>
    <div class="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
          <Button
            builders={[builder]}
            variant="secondary"
            size="icon"
            class="rounded-full bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 hover:text-gray-100"
          >
            <CircleUser class="h-5 w-5" />
            <span class="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" class="bg-gray-800 text-gray-100 border-gray-700">
          <DropdownMenu.Label>My Account</DropdownMenu.Label>
          <DropdownMenu.Separator class="bg-gray-700" />
          <DropdownMenu.Item class="focus:bg-gray-700 focus:text-gray-100" on:click={goToDashboard}>Dashboard</DropdownMenu.Item>
          <DropdownMenu.Item class="focus:bg-gray-700 focus:text-gray-100" on:click={handleSignOut}>Sign Out</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </header>
  <main
    class="bg-gray-800 flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10"
  >
    <div class="mx-auto grid w-full max-w-6xl gap-2">
      <h1 class="text-3xl font-semibold text-indigo-300">Settings</h1>
    </div>
    <div
      class="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]"
    >
      <nav class="text-gray-400 grid gap-4 text-sm hidden md:grid"
        data-x-chunk-container="chunk-container after:right-0">
        <a href="##" class="text-indigo-400 font-semibold">General</a>
        <div class="flex items-center gap-2 text-gray-500 cursor-not-allowed">
          <Lock class="h-4 w-4" />
          <span>Security</span>
        </div>
        <div class="flex items-center gap-2 text-gray-500 cursor-not-allowed">
          <Lock class="h-4 w-4" />
          <span>Integrations</span>
        </div>
        <div class="flex items-center gap-2 text-gray-500 cursor-not-allowed">
          <Lock class="h-4 w-4" />
          <span>Support</span>
        </div>
        <div class="flex items-center gap-2 text-gray-500 cursor-not-allowed">
          <Lock class="h-4 w-4" />
          <span>Organizations</span>
        </div>
        <div class="flex items-center gap-2 text-gray-500 cursor-not-allowed">
          <Lock class="h-4 w-4" />
          <span>Advanced</span>
        </div>
      </nav>
      <div class="grid gap-6">
        <Card.Root class="bg-gray-800 border-gray-700">
          <Card.Header>
            <Card.Title class="text-indigo-300">Personal Information</Card.Title>
            <Card.Description class="text-gray-400">
              Update your personal details here.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <form class="space-y-4">
              <div class="space-y-2">
                <label for="firstName" class="text-sm font-medium text-gray-300">First Name</label>
                <Input id="firstName" bind:value={firstName} class="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" />
              </div>
              <div class="space-y-2">
                <label for="lastName" class="text-sm font-medium text-gray-300">Last Name</label>
                <Input id="lastName" bind:value={lastName} class="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" />
              </div>
              <div class="space-y-2">
                <label for="email" class="text-sm font-medium text-gray-300">Email</label>
                <Input id="email" type="email" bind:value={email} disabled class="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" />
              </div>
            </form>
          </Card.Content>
          <Card.Footer class="border-t border-gray-700 px-6 py-4">
            <Button class="bg-indigo-600 hover:bg-indigo-700 text-white" on:click={updateProfile}>Save Changes</Button>
          </Card.Footer>
        </Card.Root>
        <Card.Root class="bg-gray-800 border-gray-700">
          <Card.Header>
            <Card.Title class="text-indigo-300">Change Password</Card.Title>
            <Card.Description class="text-gray-400">
              Update your password here.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <form class="space-y-4">
              <div class="space-y-2">
                <label for="current-password" class="text-sm font-medium text-gray-300">Current Password</label>
                <Input 
                  id="current-password" 
                  type="password" 
                  bind:value={currentPassword}
                  class="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" 
                />
              </div>
              <div class="space-y-2">
                <label for="new-password" class="text-sm font-medium text-gray-300">New Password</label>
                <Input 
                  id="new-password" 
                  type="password" 
                  bind:value={newPassword}
                  class="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" 
                />
              </div>
              <div class="space-y-2">
                <label for="confirm-password" class="text-sm font-medium text-gray-300">Confirm New Password</label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  bind:value={confirmPassword}
                  class="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" 
                />
              </div>
            </form>
          </Card.Content>
          <Card.Footer class="border-t border-gray-700 px-6 py-4">
            <Button class="bg-indigo-600 hover:bg-indigo-700 text-white" on:click={updatePassword}>Update Password</Button>
          </Card.Footer>
        </Card.Root>
      </div>
    </div>
  </main>
</div>

{#if successMessage}
  <div class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
    {successMessage}
  </div>
{/if}

{#if errorMessage}
  <div class="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
    {errorMessage}
  </div>
{/if}








