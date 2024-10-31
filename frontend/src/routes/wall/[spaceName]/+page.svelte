<script lang="ts">
    import { onMount } from 'svelte';
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
    import { Quote, Star } from 'lucide-svelte';

    export let data: { spaceName: string };
    let testimonials: any[] = [];
    let isLoading = true;
    let collection: any = null;

    onMount(async () => {
        try {
            const collectionResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/collections/${data.spaceName}`);
            if (!collectionResponse.ok) throw new Error('Failed to load collection');
            collection = await collectionResponse.json();

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/testimonials/public/${data.spaceName}`);
            if (!response.ok) throw new Error('Failed to load testimonials');
            testimonials = await response.json();
            isLoading = false;
        } catch (error) {
            console.error('Error:', error);
            isLoading = false;
        }
    });

    function getInitials(name: string) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
</script>

<div class="testify-wall bg-transparent p-4">
    {#if isLoading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    {:else if testimonials.length === 0}
        <div class="text-center text-gray-600 dark:text-gray-400 text-lg">No testimonials yet</div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {#each testimonials as testimonial}
                <Card 
                    class="border"
                    style="
                        background-color: {collection?.customization?.cardBgColor || '#ffffff'}; 
                        border-color: {collection?.customization?.cardBorderColor || '#e5e7eb'}; 
                        border-radius: {collection?.customization?.borderRadius || '8'}px;
                    "
                >
                    <CardContent 
                        class="flex flex-col"
                        style="
                            color: {collection?.customization?.textColor || '#374151'}; 
                            font-size: {collection?.customization?.fontSize || '16'}px;
                            padding: {collection?.customization?.padding || '24'}px;
                        "
                    >
                        <div class="flex justify-between items-start mb-4">
                            <Quote class="text-indigo-500 h-8 w-8 flex-shrink-0" />
                            {#if testimonial.rating}
                                <div class="flex gap-0.5">
                                    {#each Array(5) as _, i}
                                        <Star 
                                            class="h-4 w-4 {i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}"
                                        />
                                    {/each}
                                </div>
                            {/if}
                        </div>
                        <p class="mb-6 flex-grow">{testimonial.testimonialText}</p>
                        <div class="flex items-center mt-auto">
                            <Avatar class="h-12 w-12 mr-4 flex-shrink-0">
                                <AvatarImage src={testimonial.extraInfo?.avatarUrl} alt={testimonial.extraInfo?.name || 'Anonymous'} />
                                <AvatarFallback>{getInitials(testimonial.extraInfo?.name || 'A')}</AvatarFallback>
                            </Avatar>
                            <div class="min-w-0">
                                <p class="font-semibold truncate">{testimonial.extraInfo?.name || 'Anonymous'}</p>
                                {#if testimonial.extraInfo?.title}
                                    <p class="text-sm opacity-75 truncate">{testimonial.extraInfo.title}</p>
                                {/if}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </div>
    {/if}
</div>

<style lang="postcss">
    :global(html, body) {
        margin: 0;
        padding: 0;
        background: transparent;
        overflow: auto; /* Allow scrolling */
    }

    .testify-wall {
        @apply font-sans;
    }
</style>
