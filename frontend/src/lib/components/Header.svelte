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
        
        localStorage.removeItem('token'); 
        goto('/signin'); 
    }

    
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
            <img 
                src="/logo2.svg" 
                alt="Testify Logo" 
                class="h-8 w-8 text-indigo-400 mr-2"
            />
            <span class="text-xl font-bold text-indigo-400">Testify</span>
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
                        Settings
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
