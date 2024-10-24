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

    onMount(async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/testimonials/public/${data.spaceName}`);
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
</script>

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
                        <Card class="border border-gray-200 dark:border-gray-700 max-w-full">
                            <CardContent class="p-6 flex flex-col">
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
