<script lang="ts">
    import { onMount } from 'svelte';
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
    import { Button } from "$lib/components/ui/button";
    import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-svelte';
    import 'swiper/css';
    import 'swiper/css/navigation';
    import 'swiper/css/pagination';
    
    export let data: { spaceName: string };
    let testimonials: any[] = [];
    let isLoading = true;
    let swiper: any;
    let iframeResizerContentWindow: any;
    let collection: any = null;
    let notification = {
        show: false,
        message: '',
        type: 'success' // or 'error'
    };

    onMount(async () => {
        // Initialize iframeResizer content window
        iframeResizerContentWindow = (window as any).iframeResizerContentWindow;

        try {
            // First fetch collection to get customization settings
            const collectionResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/collections/${data.spaceName}`);
            if (!collectionResponse.ok) throw new Error('Failed to load collection');
            collection = await collectionResponse.json();

            // Then fetch testimonials
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/testimonials/public/${data.spaceName}`);
            if (!response.ok) throw new Error('Failed to load testimonials');
            testimonials = await response.json();
            isLoading = false;

            // Initialize Swiper after testimonials are loaded
            const Swiper = (await import('swiper')).default;
            const { Navigation, Pagination, Autoplay } = await import('swiper/modules');

            swiper = new Swiper('.swiper', {
                modules: [Navigation, Pagination, Autoplay],
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                breakpoints: {
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                },
                on: {
                    slideChange: () => {
                        // Notify parent when slide changes
                        if (iframeResizerContentWindow) {
                            iframeResizerContentWindow.sendMessage('slideChanged');
                            iframeResizerContentWindow.size(); // Trigger resize
                        }
                    },
                    resize: () => {
                        // Notify parent when Swiper resizes
                        if (iframeResizerContentWindow) {
                            iframeResizerContentWindow.size();
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error:', error);
            isLoading = false;
        }
    });

    function getInitials(name: string) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
</script>

<svelte:window
    on:resize={() => {
        if (iframeResizerContentWindow) {
            iframeResizerContentWindow.size();
        }
    }}
/>

<div class="testify-carousel bg-transparent p-4 rounded-lg">
    {#if isLoading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    {:else if testimonials.length === 0}
        <div class="text-center text-gray-600 dark:text-gray-400 text-lg">No testimonials yet</div>
    {:else}
        <div class="swiper relative px-12 overflow-hidden">
            <div class="swiper-wrapper">
                {#each testimonials as testimonial}
                    <div class="swiper-slide px-1">
                        <Card 
                            class="border max-w-full"
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
                                    <Quote class="text-indigo-500 h-8 w-8" />
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
                                <p class="text-gray-700 dark:text-gray-300 mb-6">{testimonial.testimonialText}</p>
                                <div class="flex items-center">
                                    <Avatar class="h-12 w-12 mr-4">
                                        <AvatarImage src={testimonial.extraInfo?.avatarUrl} alt={testimonial.extraInfo?.name || 'Anonymous'} />
                                        <AvatarFallback>{getInitials(testimonial.extraInfo?.name || 'A')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p class="font-semibold text-gray-900 dark:text-gray-100">{testimonial.extraInfo?.name || 'Anonymous'}</p>
                                        {#if testimonial.extraInfo?.title}
                                            <p class="text-sm text-gray-500 dark:text-gray-400">{testimonial.extraInfo.title}</p>
                                        {/if}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                {/each}
            </div>
            <div class="swiper-pagination !-bottom-8"></div>
            <Button variant="outline" size="icon" class="swiper-button-prev !left-0 !mt-0 -translate-y-1/2 !w-8 !h-8 rounded-full absolute z-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronLeft class="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" class="swiper-button-next !right-0 !mt-0 -translate-y-1/2 !w-8 !h-8 rounded-full absolute z-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronRight class="h-4 w-4" />
            </Button>
        </div>
    {/if}
</div>

{#if notification.show}
    <div
        transition:fade
        class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg {notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white"
        role="alert"
    >
        {notification.message}
    </div>
{/if}

<style lang="postcss">
    :global(html, body) {
        margin: 0;
        padding: 0;
        background: transparent;
    }

    .testify-carousel {
        @apply font-sans;
    }

    :global(.swiper) {
        @apply pb-10; /* Add padding for pagination */
    }

    :global(.swiper-slide) {
        height: auto !important;
    }

    :global(.swiper-pagination) {
        @apply bottom-0 !important;
    }

    :global(.swiper-pagination-bullet) {
        @apply bg-gray-300 dark:bg-gray-700 opacity-100;
    }

    :global(.swiper-pagination-bullet-active) {
        @apply bg-indigo-500;
    }

    :global(.swiper-button-next),
    :global(.swiper-button-prev) {
        @apply text-gray-600 dark:text-gray-400;
    }

    :global(.swiper-button-next::after),
    :global(.swiper-button-prev::after) {
        @apply hidden;
    }
</style>
