<script lang="ts">
    import { onMount } from 'svelte';
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Loader, Inbox, Trash2, Code, BarChart2, Settings, Edit, Grid } from "lucide-svelte";
    import Header from "$lib/components/Header.svelte";
    import type { Collection } from '$lib/types/collection';

    export let data: { spaceName: string };
    
    let collection: Collection | null = null;
    let testimonials: any[] = [];
    let isLoading = true;
    let error: string | null = null;
    let activeTab = 'all';

    onMount(async () => {
        try {
            // Fetch the collection details
            const collectionResponse = await fetch(`http://localhost:4000/api/collections/private/${data.spaceName}`, {
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
            const testimonialsResponse = await fetch(`http://localhost:4000/api/testimonials/collection/${collection._id}`, {
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
</script>

<div class="min-h-screen bg-gray-900 text-gray-100 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 p-6 flex flex-col">
        <div class="flex items-center justify-between mb-8">
            <h2 class="text-xl font-bold text-indigo-300">{data.spaceName}</h2>
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
                            class="flex items-center w-full p-2 rounded-md transition-colors {activeTab === 'widget1' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                            on:click={() => setActiveTab('widget1')}
                        >
                            <Code size={18} class="mr-2" />
                            Carousel Code
                        </button>
                    </li>
                    <li>
                        <button
                            class="flex items-center w-full p-2 rounded-md transition-colors {activeTab === 'wall' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}"
                            on:click={() => setActiveTab('wall')}
                        >
                            <Grid size={18} class="mr-2" />
                            Wall of Shoutouts
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
        <div class="mt-auto">
            <Button variant="outline" class="w-full">
                <Settings size={18} class="mr-2" />
                Settings
            </Button>
        </div>
    </aside>

    <!-- Main content -->
    <main class="flex-grow p-8">
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
                <h1 class="text-3xl font-bold text-indigo-300">Testimonials for {data.spaceName}</h1>
                <p class="text-gray-400 mt-2">View and manage testimonials for this collection</p>
            </div>

            {#if activeTab === 'all' || activeTab === 'spam'}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {#if testimonials.length === 0}
                        <div class="col-span-full text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                            <p class="text-xl text-indigo-300 mb-4">No testimonials yet</p>
                            <p class="text-gray-400">Share your collection link to start receiving testimonials!</p>
                        </div>
                    {:else}
                        {#each testimonials as testimonial}
                            <Card class="bg-gray-800 border-gray-700">
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
                                </CardContent>
                            </Card>
                        {/each}
                    {/if}
                </div>
            {:else if activeTab === 'widget1'}
                <div class="bg-gray-800 p-6 rounded-lg">
                    <h2 class="text-2xl font-bold text-indigo-300 mb-4">Embed Testimonials</h2>
                    <p class="text-gray-400 mb-4">Copy and paste this code to embed your testimonials carousel on your website:</p>
                    <div class="space-y-4">
                        <pre class="bg-gray-900 p-4 rounded-md overflow-x-auto">
                            <code class="text-indigo-300">{`<iframe id="testify-carousel" src="http://localhost:5173/carousel/${data.spaceName}" frameborder="0" scrolling="yes" width="100%" height="400px"></iframe>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js"></script>
<script type="text/javascript">
    iFrameResize({ log: false, checkOrigin: false }, '#testify-carousel');
</script>`}</code>
                        </pre>
                        
                    </div>
                </div>
            {:else if activeTab === 'wall'}
                <div class="bg-gray-800 p-6 rounded-lg">
                    <h2 class="text-2xl font-bold text-indigo-300 mb-4">Embed Wall of Shoutouts</h2>
                    <p class="text-gray-400 mb-4">Copy and paste this code to embed a wall of testimonials on your website:</p>
                    <div class="space-y-4">
                        <pre class="bg-gray-900 p-4 rounded-md overflow-x-auto">
                            <code class="text-indigo-300">{`<iframe id="testify-wall" src="http://localhost:5173/wall/${data.spaceName}" frameborder="0" scrolling="yes" width="100%" height="100vw"></iframe>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js"></script>
<script type="text/javascript">
    iFrameResize({ log: false, checkOrigin: false }, '#testify-wall');
</script>`}</code>
                        </pre>
                        
                    </div>
                </div>
            {:else if activeTab === 'analytics'}
                <div class="bg-gray-800 p-6 rounded-lg">
                    <h2 class="text-2xl font-bold text-indigo-300 mb-4">Analytics</h2>
                    <p class="text-gray-400">Analytics data will be displayed here.</p>
                </div>
            {/if}
        {/if}
    </main>
</div>
