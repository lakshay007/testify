<script lang="ts">
    import { onMount } from 'svelte';
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { 
        Loader, 
        Inbox, 
        Trash2, 
        Code, 
        BarChart2, 
        Settings, 
        Edit, 
        Grid, 
        Menu, 
        X, 
        Copy, 
        Check, 
        User, 
        LogOut, 
        LayoutDashboard, 
        UserCircle,
        Quote,
        Star
    } from "lucide-svelte";
    import Header from "$lib/components/Header.svelte";
    import type { Collection } from '$lib/types/collection';
    import { goto } from '$app/navigation';
    import EmbedTestimonialsModal from "$lib/components/EmbedTestimonialsModal.svelte";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
    import { fade } from 'svelte/transition';

    export let data: { spaceName: string };
    
    let collection: Collection | null = null;
    let testimonials: any[] = [];
    let isLoading = true;
    let error: string | null = null;
    let activeTab = 'all';
    let isSidebarOpen = false;
    let copiedCarousel = false;
    let copiedWall = false;
    let isProfileDropdownOpen = false;
    let spamThreshold = 0.6;
    let isEmbedModalOpen = false;
    let notification = {
        show: false,
        message: '',
        type: 'success' // or 'error'
    };

    const defaultCustomization = {
        cardBgColor: "#ffffff",
        cardBorderColor: "#e5e7eb",
        textColor: "#374151",
        fontSize: "16",
        borderRadius: "8",
        padding: "24"
    };

    onMount(async () => {
        try {
            await checkAuthentication();
            // Fetch the collection details
            const collectionResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/collections/private/${data.spaceName}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!collectionResponse.ok) {
                throw new Error('Failed to fetch collection');
            }

            collection = await collectionResponse.json();
            console.log('Fetched collection:', collection); // Debug log

            // Then fetch testimonials
            const testimonialsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/testimonials/collection/${collection._id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!testimonialsResponse.ok) {
                throw new Error('Failed to fetch testimonials');
            }

            testimonials = await testimonialsResponse.json();
            isLoading = false;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load data';
            console.error('Error:', error); // Debug log
            isLoading = false;
        }
    });

    function setActiveTab(tab: string) {
        activeTab = tab;
    }

    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
    }
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

    function copyToClipboard(text: string, type: 'carousel' | 'wall') {
        navigator.clipboard.writeText(text).then(() => {
            if (type === 'carousel') {
                copiedCarousel = true;
                setTimeout(() => copiedCarousel = false, 2000);
            } else {
                copiedWall = true;
                setTimeout(() => copiedWall = false, 2000);
            }
        });
    }

    function toggleProfileDropdown() {
        isProfileDropdownOpen = !isProfileDropdownOpen;
    }

    function handleSignOut() {
        localStorage.removeItem('token');
        goto('/signin');
    }

    function goToDashboard() {
        goto('/dashboard');
    }

    function goToProfile() {
        goto('/profile');
    }

    // Add this function after your existing functions
    function calculateSpamScore(testimonial: any): number {
        let score = 0;
        const text = testimonial.testimonialText.toLowerCase();
        
        // Check for spam indicators
        const spamIndicators = {
            hasLinks: /(http|www|\.com|\.net|\.org)/i.test(text),
            excessivePunctuation: /[!?]{2,}/.test(text),
            allCaps: testimonial.testimonialText === testimonial.testimonialText.toUpperCase(),
            spamKeywords: /(buy|cheap|discount|offer|price|deal|free|warranty|casino|viagra|forex|crypto)/i.test(text),
            shortText: text.length < 10,
            repeatedCharacters: /(.)\1{4,}/.test(text), // Detects character repeated 5+ times
            fewWords: text.trim().split(/\s+/).length < 5 // Check for less than 5 words
        };

        // Weight different indicators
        if (spamIndicators.hasLinks) score += 0.3;
        if (spamIndicators.excessivePunctuation) score += 0.2;
        if (spamIndicators.allCaps) score += 0.2;
        if (spamIndicators.spamKeywords) score += 0.3;
        if (spamIndicators.shortText) score += 0.1;
        if (spamIndicators.repeatedCharacters) score += 0.2;
        if (spamIndicators.fewWords) score += 0.3; // Add significant weight for very short testimonials

        return Math.min(score, 1); // Cap score at 1
    }

    function openEmbedModal() {
        isEmbedModalOpen = true;
    }

    function showNotification(message: string, type: 'success' | 'error' = 'success') {
        notification = {
            show: true,
            message,
            type
        };
        setTimeout(() => {
            notification.show = false;
        }, 3000);
    }

    async function saveCustomization() {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/collections/${data.spaceName}/customization`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    customization: collection.customization
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update customization');
            }

            const updatedCollection = await response.json();
            collection = updatedCollection;
            showNotification('Customization saved successfully');
        } catch (error) {
            console.error('Error saving customization:', error);
            showNotification('Failed to save customization', 'error');
        }
    }

    function resetCustomization() {
        if (!collection) return;
        
        // Only update the local collection state, don't save to DB
        collection = {
            ...collection,
            customization: { ...defaultCustomization }
        };
        
        showNotification('Preview updated with default values. Click Save Changes to apply.');
    }

    // Add this variable to track changes
    let hasUnsavedChanges = false;

    // Add this function to handle customization changes
    function handleCustomizationChange() {
        if (!hasUnsavedChanges) {
            hasUnsavedChanges = true;
            showNotification('Click "Save Changes" to apply your customization', 'info');
        }
    }
</script>

<div class="min-h-screen bg-gray-900 text-gray-100">
   

    <!-- Profile Icon (Desktop only) -->
    <div class="absolute top-4 right-4 z-50 hidden lg:block">
        <div class="relative">
            <Button 
                variant="ghost" 
                size="icon" 
                class="text-indigo-400 hover:text-indigo-300"
                on:click={toggleProfileDropdown}
            >
                <User size={24} />
            </Button>
            
            {#if isProfileDropdownOpen}
                <div class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md overflow-hidden shadow-xl z-10">
                    <button 
                        class="w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-gray-700 flex items-center"
                        on:click={goToProfile}
                    >
                        <UserCircle size={18} class="mr-2" />
                        Profile
                    </button>
                    <button 
                        class="w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-gray-700 flex items-center"
                        on:click={goToDashboard}
                    >
                        <LayoutDashboard size={18} class="mr-2" />
                        Dashboard
                    </button>
                    <button 
                        class="w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-gray-700 flex items-center"
                        on:click={handleSignOut}
                    >
                        <LogOut size={18} class="mr-2" />
                        Sign Out
                    </button>
                </div>
            {/if}
        </div>
    </div>

    <div class="flex">
        <!-- Sidebar -->
        <aside class="hidden lg:block w-64 bg-gray-800 p-6 flex flex-col min-h-screen fixed">
            <div class="flex items-center justify-between mb-8 mt-14 lg:mt-0">
                <h2 class="text-xl font-bold text-indigo-300 lg:block">{data.spaceName}</h2>
                <Button variant="ghost" size="icon" class="text-indigo-400 hover:text-indigo-300">
                    <Edit size={20} />
                </Button>
            </div>
            <nav class="space-y-6 flex-grow">
                <div>
                    <h3 class="text-sm font-semibold text-gray-400 uppercase mb-2">Inbox</h3>
                    <ul class="space-y-2">
                        <li>
                            <button
                                class="flex items-center w-full p-2 rounded-md transition-colors {activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                                on:click={() => setActiveTab('all')}
                            >
                                <Inbox size={18} class="mr-2" />
                                All
                            </button>
                        </li>
                        <li>
                            <button
                                class="flex items-center w-full p-2 rounded-md transition-colors {activeTab === 'spam' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                                on:click={() => setActiveTab('spam')}
                            >
                                <Trash2 size={18} class="mr-2" />
                                Spam
                            </button>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-gray-400 uppercase mb-2">Embed</h3>
                    <ul class="space-y-2">
                        <li>
                            <button
                                class="flex items-center w-full p-2 rounded-md transition-colors text-gray-300 hover:bg-gray-700"
                                on:click={openEmbedModal}
                            >
                                <Code size={18} class="mr-2" />
                                Embed Testimonials
                            </button>
                        </li>
                        <li>
                            <button
                                class="flex items-center w-full p-2 rounded-md transition-colors {activeTab === 'customize' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                                on:click={() => setActiveTab('customize')}
                            >
                                <Settings size={18} class="mr-2" />
                                Customize Cards
                            </button>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-gray-400 uppercase mb-2">Analytics</h3>
                    <button
                        class="flex items-center w-full p-2 rounded-md transition-colors {activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                        on:click={() => setActiveTab('analytics')}
                    >
                        <BarChart2 size={18} class="mr-2" />
                        View Analytics
                    </button>
                </div>
            </nav>
            <!-- <div class="mt-auto">
                <Button variant="outline" class="w-full">
                    <Settings size={18} class="mr-2" />
                    Settings
                </Button>
            </div> -->
        </aside>

        <!-- Mobile Sidebar -->
        {#if isSidebarOpen}
            <aside class="lg:hidden fixed inset-0 bg-gray-800 z-30 p-6">
                <div class="flex items-center justify-between mb-8 mt-14 lg:mt-0">
                    <h2 class="text-xl font-bold text-indigo-300 lg:block">{data.spaceName}</h2>
                    <Button variant="ghost" size="icon" class="text-indigo-400 hover:text-indigo-300" on:click={toggleSidebar}>
                        <X size={24} />
                    </Button>
                </div>
                <nav class="space-y-6 flex-grow">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-400 uppercase mb-2">Inbox</h3>
                        <ul class="space-y-2">
                            <li>
                                <button
                                    class="flex items-center w-full p-2 rounded-md transition-colors {activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                                    on:click={() => setActiveTab('all')}
                                >
                                    <Inbox size={18} class="mr-2" />
                                    All
                                </button>
                            </li>
                            <li>
                                <button
                                    class="flex items-center w-full p-2 rounded-md transition-colors {activeTab === 'spam' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                                    on:click={() => setActiveTab('spam')}
                                >
                                    <Trash2 size={18} class="mr-2" />
                                    Spam
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-gray-400 uppercase mb-2">Embed</h3>
                        <ul class="space-y-2">
                            <li>
                                <button
                                    class="flex items-center w-full p-2 rounded-md transition-colors text-gray-300 hover:bg-gray-700"
                                    on:click={openEmbedModal}
                                >
                                    <Code size={18} class="mr-2" />
                                    Embed Testimonials
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-gray-400 uppercase mb-2">Analytics</h3>
                        <button
                            class="flex items-center w-full p-2 rounded-md transition-colors {activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                            on:click={() => setActiveTab('analytics')}
                        >
                            <BarChart2 size={18} class="mr-2" />
                            View Analytics
                        </button>
                    </div>
                </nav>
            </aside>
        {/if}

        <!-- Main Content -->
        <main class="flex-1 p-6 lg:ml-64">
            <!-- Mobile Header with Hamburger and Profile -->
            <div class="lg:hidden flex justify-between items-center mb-6 relative">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    class="text-indigo-400 hover:text-indigo-300"
                    on:click={toggleSidebar}
                >
                    <Menu size={24} />
                </Button>
                <h2 class="text-xl font-bold text-indigo-300">{data.spaceName}</h2>
                <div class="relative">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        class="text-indigo-400 hover:text-indigo-300"
                        on:click={toggleProfileDropdown}
                    >
                        <User size={24} />
                    </Button>
                    
                    {#if isProfileDropdownOpen}
                        <div class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md overflow-hidden shadow-xl z-50">
                            <button 
                                class="w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-gray-700 flex items-center"
                                on:click={goToProfile}
                            >
                                <UserCircle size={18} class="mr-2" />
                                Profile
                            </button>
                            <button 
                                class="w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-gray-700 flex items-center"
                                on:click={goToDashboard}
                            >
                                <LayoutDashboard size={18} class="mr-2" />
                                Dashboard
                            </button>
                            <button 
                                class="w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-gray-700 flex items-center"
                                on:click={handleSignOut}
                            >
                                <LogOut size={18} class="mr-2" />
                                Sign Out
                            </button>
                        </div>
                    {/if}
                </div>
            </div>

            {#if isLoading}
                <div class="flex justify-center items-center h-[60vh]">
                    <Loader class="animate-spin h-12 w-12 text-indigo-400" />
                </div>
            {:else if error}
                <div class="text-center py-12">
                    <p class="text-xl text-red-400">{error}</p>
                </div>
            {:else}
                <div class="mb-8">
                    <h1 class="text-2xl lg:text-3xl font-bold text-indigo-300">Testimonials for {data.spaceName}</h1>
                    <p class="text-gray-400 mt-2">View and manage testimonials for this collection</p>
                </div>

                {#if activeTab === 'all' || activeTab === 'spam'}
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {#if testimonials.length === 0}
                            <div class="col-span-full text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                                <p class="text-xl text-indigo-300 mb-4">No testimonials yet</p>
                                <p class="text-gray-400">Share your collection link to start receiving testimonials!</p>
                            </div>
                        {:else}
                            {#each testimonials.filter(t => {
                                const isSpam = calculateSpamScore(t) >= spamThreshold;
                                return activeTab === 'spam' ? isSpam : !isSpam;
                            }) as testimonial}
                                <Card class="bg-gray-800 border-gray-700 {calculateSpamScore(testimonial) >= spamThreshold ? 'border-red-800' : ''}">
                                    <CardHeader>
                                        <div class="flex justify-between items-start">
                                            <div>
                                                {#if testimonial.extraInfo?.name}
                                                    <CardTitle class="text-indigo-300">{testimonial.extraInfo.name}</CardTitle>
                                                    {#if testimonial.extraInfo?.title}
                                                        <p class="text-sm text-gray-400">{testimonial.extraInfo.title}</p>
                                                    {/if}
                                                {:else}
                                                    <CardTitle class="text-indigo-300">Anonymous</CardTitle>
                                                {/if}
                                            </div>
                                            {#if testimonial.rating}
                                                <div class="flex items-center">
                                                    {#each Array(testimonial.rating) as _}
                                                        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    {/each}
                                                </div>
                                            {/if}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p class="text-gray-300 whitespace-pre-wrap">{testimonial.testimonialText}</p>
                                        {#if testimonial.image}
                                            <img 
                                                src={testimonial.image} 
                                                alt="Testimonial image" 
                                                class="mt-4 rounded-lg max-h-48 object-cover"
                                            />
                                        {/if}
                                        {#if testimonial.extraInfo?.socialLink}
                                            <a 
                                                href={testimonial.extraInfo.socialLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300"
                                            >
                                                View Profile →
                                            </a>
                                        {/if}
                                        <div class="mt-4 text-sm text-gray-500">
                                            {new Date(testimonial.createdAt).toLocaleDateString()}
                                        </div>
                                        <!-- Add spam score indicator for debugging -->
                                        <div class="text-xs text-gray-500 mt-2">
                                            Spam Score: {(calculateSpamScore(testimonial) * 100).toFixed(1)}%
                                        </div>
                                    </CardContent>
                                </Card>
                            {/each}
                        {/if}
                    </div>
                {:else if activeTab === 'widget1'}
                    <div class="bg-gray-800 p-4 lg:p-6 rounded-lg">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl lg:text-2xl font-bold text-indigo-300">Embed Testimonials</h2>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                class="text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 transition-colors"
                                on:click={() => copyToClipboard(`<iframe id="testify-carousel" src="${import.meta.env.VITE_FRONTEND_URL}/carousel/${data.spaceName}" frameborder="0" scrolling="yes" width="100%"></iframe>
<script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js"></script>
<script>iFrameResize({ log: false, checkOrigin: false }, '#testify-carousel');</script>`, 'carousel')}
                            >
                                {#if copiedCarousel}
                                    <Check class="h-4 w-4 mr-2" />
                                    Copied!
                                {:else}
                                    <Copy class="h-4 w-4 mr-2" />
                                    Copy Code
                                {/if}
                            </Button>
                        </div>
                        <p class="text-gray-400 mb-4">Copy and paste this code to embed your testimonials carousel on your website:</p>
                        <div class="max-w-full overflow-x-auto">
                            <pre class="bg-gray-900 p-3 lg:p-4 rounded-md text-sm lg:text-base whitespace-pre-wrap break-all"><code class="text-indigo-300">{`<iframe id="testify-carousel" src="${import.meta.env.VITE_FRONTEND_URL}/carousel/${data.spaceName}" frameborder="0" scrolling="no" width="100%"></iframe>
<script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js"></script>
<script>iFrameResize({ log: false, checkOrigin: false }, '#testify-carousel');</script>`}</code></pre>
                        </div>
                    </div>
                {:else if activeTab === 'wall'}
                    <div class="bg-gray-800 p-4 lg:p-6 rounded-lg">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl lg:text-2xl font-bold text-indigo-300">Embed Wall of Shoutouts</h2>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                class="text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 transition-colors"
                                on:click={() => copyToClipboard(`<iframe id="testify-wall" src="${import.meta.env.VITE_FRONTEND_URL}/wall/${data.spaceName}" frameborder="0" scrolling="no" width="100%" ></iframe>
<script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js"></script>
<script>iFrameResize({ log: false, checkOrigin: false }, '#testify-wall');</script>`, 'wall')}
                            >
                                {#if copiedWall}
                                    <Check class="h-4 w-4 mr-2" />
                                    Copied!
                                {:else}
                                    <Copy class="h-4 w-4 mr-2" />
                                    Copy Code
                                {/if}
                            </Button>
                        </div>
                        <p class="text-gray-400 mb-4">Copy and paste this code to embed a wall of testimonials on your website:</p>
                        <div class="max-w-full overflow-x-auto">
                            <pre class="bg-gray-900 p-3 lg:p-4 rounded-md text-sm lg:text-base whitespace-pre-wrap break-all"><code class="text-indigo-300">{`<iframe id="testify-wall" src="${import.meta.env.VITE_FRONTEND_URL}/wall/${data.spaceName}" frameborder="0" scrolling="yes" width="100%"></iframe>
<script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js"></script>
<script>iFrameResize({ log: false, checkOrigin: false }, '#testify-wall');</script>`}</code></pre>
                        </div>
                    </div>
                {:else if activeTab === 'analytics'}
                    <div class="bg-gray-800 p-4 lg:p-6 rounded-lg">
                        <h2 class="text-xl lg:text-2xl font-bold text-indigo-300 mb-4">Analytics</h2>
                        <p class="text-gray-400">Analytics data will be displayed here.</p>
                    </div>
                {:else if activeTab === 'customize'}
                    <div class="bg-gray-800 p-4 lg:p-6 rounded-lg">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl lg:text-2xl font-bold text-indigo-300">Customize Testimonial Cards</h2>
                        </div>
                        
                        {#if collection}
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label class="text-indigo-300">Card Background Color</Label>
                                    <div class="flex gap-2">
                                        <Input 
                                            type="color" 
                                            bind:value={collection.customization.cardBgColor}
                                            on:change={handleCustomizationChange}
                                            class="w-12 h-12 p-1 bg-gray-700 border-gray-600"
                                        />
                                        <Input 
                                            type="text" 
                                            bind:value={collection.customization.cardBgColor}
                                            on:input={handleCustomizationChange}
                                            class="flex-1 bg-gray-700 border-gray-600 text-gray-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label class="text-indigo-300">Card Border Color</Label>
                                    <div class="flex gap-2">
                                        <Input 
                                            type="color" 
                                            bind:value={collection.customization.cardBorderColor}
                                            on:change={handleCustomizationChange}
                                            class="w-12 h-12 p-1 bg-gray-700 border-gray-600"
                                        />
                                        <Input 
                                            type="text" 
                                            bind:value={collection.customization.cardBorderColor}
                                            on:input={handleCustomizationChange}
                                            class="flex-1 bg-gray-700 border-gray-600 text-gray-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label class="text-indigo-300">Text Color</Label>
                                    <div class="flex gap-2">
                                        <Input 
                                            type="color" 
                                            bind:value={collection.customization.textColor}
                                            on:change={handleCustomizationChange}
                                            class="w-12 h-12 p-1 bg-gray-700 border-gray-600"
                                        />
                                        <Input 
                                            type="text" 
                                            bind:value={collection.customization.textColor}
                                            on:input={handleCustomizationChange}
                                            class="flex-1 bg-gray-700 border-gray-600 text-gray-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label class="text-indigo-300">Font Size (px)</Label>
                                    <Input 
                                        type="number" 
                                        bind:value={collection.customization.fontSize}
                                        on:input={handleCustomizationChange}
                                        min="12"
                                        max="24"
                                        class="bg-gray-700 border-gray-600 text-gray-200"
                                    />
                                </div>

                                <div>
                                    <Label class="text-indigo-300">Border Radius (px)</Label>
                                    <Input 
                                        type="number" 
                                        bind:value={collection.customization.borderRadius}
                                        on:input={handleCustomizationChange}
                                        min="0"
                                        max="24"
                                        class="bg-gray-700 border-gray-600 text-gray-200"
                                    />
                                </div>

                                <div>
                                    <Label class="text-indigo-300">Padding (px)</Label>
                                    <Input 
                                        type="number" 
                                        bind:value={collection.customization.padding}
                                        on:input={handleCustomizationChange}
                                        min="12"
                                        max="48"
                                        class="bg-gray-700 border-gray-600 text-gray-200"
                                    />
                                </div>
                            </div>

                            <div class="mt-6 col-span-full flex justify-end gap-2">
                                <Button 
                                    variant="outline"
                                    class="text-indigo-300 border-indigo-300 hover:bg-indigo-300/10"
                                    on:click={resetCustomization}
                                >
                                    Reset to Default
                                </Button>
                                <Button 
                                    class="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    on:click={saveCustomization}
                                >
                                    Save Changes
                                </Button>
                            </div>

                            <!-- Preview Card -->
                            <div class="mt-8 col-span-full">
                                <h3 class="text-lg font-semibold text-indigo-300 mb-4">Preview</h3>
                                <Card 
                                    class="border max-w-md"
                                    style="
                                        background-color: {collection.customization.cardBgColor}; 
                                        border-color: {collection.customization.cardBorderColor}; 
                                        border-radius: {collection.customization.borderRadius}px;
                                    "
                                >
                                    <CardContent 
                                        class="flex flex-col"
                                        style="
                                            color: {collection.customization.textColor}; 
                                            font-size: {collection.customization.fontSize}px;
                                            padding: {collection.customization.padding}px;
                                        "
                                    >
                                        <div class="flex justify-between items-start mb-4">
                                            <Quote class="text-indigo-500 h-8 w-8" />
                                            <div class="flex gap-0.5">
                                                {#each Array(5) as _}
                                                    <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                {/each}
                                            </div>
                                        </div>
                                        <p class="mb-6">This is a preview of how your testimonial cards will look with the current customization settings.</p>
                                        <div class="flex items-center">
                                            <Avatar class="h-12 w-12 mr-4">
                                                <AvatarFallback>P</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p class="font-semibold">Preview Name</p>
                                                <p class="text-sm opacity-75">Preview Title</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        {:else}
                            <div class="text-center py-12">
                                <p class="text-xl text-gray-400">Loading...</p>
                            </div>
                        {/if}
                    </div>
                {/if}
            {/if}
        </main>
    </div>
</div>

<style>
    /* Add any additional styles here */
</style>

{#if isEmbedModalOpen}
    <EmbedTestimonialsModal
        isOpen={isEmbedModalOpen}
        onClose={() => isEmbedModalOpen = false}
        spaceName={data.spaceName}
    />
{/if}

<!-- Add this before the closing </div> of the main container -->
{#if notification.show}
    <div
        transition:fade
        class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg 
        {notification.type === 'success' ? 'bg-green-500' : 
         notification.type === 'error' ? 'bg-red-500' : 
         'bg-blue-500'} text-white z-50"
        role="alert"
    >
        {notification.message}
    </div>
{/if}





