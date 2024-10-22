<script lang="ts">
    import { User, LogOut, Home } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let isDropdownOpen = false;
    let dropdownRef: HTMLDivElement;

    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }

    function handleSignOut() {
        // Implement sign out logic here
        localStorage.removeItem('token'); // Remove the token from localStorage
        goto('/signin'); // Redirect to sign in page
    }

    // Close dropdown when clicking outside
    onMount(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
                isDropdownOpen = false;
            }
        }

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<header class="bg-gray-800 shadow-md">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center">
            <svg class="h-8 w-8 text-indigo-400 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 12V8H4V12M20 12V16H4V12M20 12H4M4 6H20V18H4V6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="text-xl font-bold text-indigo-400">testify.live</span>
        </div>
        <div class="relative" bind:this={dropdownRef}>
            <button 
                on:click={toggleDropdown}
                class="p-2 rounded-full bg-gray-700 text-indigo-400 hover:bg-gray-600 transition-colors duration-200"
            >
                <User size={24} />
            </button>
            {#if isDropdownOpen}
                <div class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md overflow-hidden shadow-xl z-10">
                    <a href="/dashboard" class="block px-4 py-2 text-sm text-indigo-400 hover:bg-gray-700 flex items-center">
                        <Home size={18} class="mr-2" />
                        Dashboard
                    </a>
                    <a href="/profile" class="block px-4 py-2 text-sm text-indigo-400 hover:bg-gray-700 flex items-center">
                        <User size={18} class="mr-2" />
                        Profile
                    </a>
                    <button 
                        on:click={handleSignOut}
                        class="block w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-gray-700 flex items-center"
                    >
                        <LogOut size={18} class="mr-2" />
                        Sign Out
                    </button>
                </div>
            {/if}
        </div>
    </div>
</header>
