<script lang="ts">
    import { onMount } from 'svelte';
    import { Button } from "$lib/components/ui/button";
    import { Pen, Loader } from "lucide-svelte";
    import type { Collection } from '$lib/types/collection';
    import TestimonialFormModal from "$lib/components/TestimonialFormModal.svelte";

    export let data: { spaceName: string };
    
    let collection: Collection | null = null;
    let isLoading = true;
    let error: string | null = null;
    let isFormModalOpen = false;

    onMount(async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/collections/${data.spaceName}`);
            if (!response.ok) {
                throw new Error('Collection not found');
            }
            collection = await response.json();
            isLoading = false;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load collection';
            isLoading = false;
        }
    });

    function openFormModal() {
        isFormModalOpen = true;
    }

    function closeFormModal() {
        isFormModalOpen = false;
    }
</script>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    {#if isLoading}
        <div class="flex justify-center items-center h-[60vh]">
            <Loader class="animate-spin h-12 w-12 text-indigo-600" />
        </div>
    {:else if error}
        <div class="text-center">
            <h1 class="text-2xl font-bold text-gray-900">Error</h1>
            <p class="mt-2 text-gray-600">{error}</p>
        </div>
    {:else if collection}
        <div class="max-w-3xl mx-auto">
            <div class="bg-white rounded-lg shadow-xl overflow-hidden">
                <div class="p-8">
                    <!-- Logo -->
                    {#if collection.logo}
                        <div class="flex justify-center mb-6">
                            <img 
                                src={collection.logo} 
                                alt="Collection Logo" 
                                class="w-20 h-20 object-cover rounded-lg"
                            />
                        </div>
                    {/if}

                    <!-- Title and Message -->
                    <h1 class="text-3xl font-bold text-center text-gray-900 mb-4">
                        {collection.headerTitle}
                    </h1>
                    <p class="text-center text-gray-600 mb-8 whitespace-pre-wrap">
                        {collection.customMessage}
                    </p>

                    <!-- Questions -->
                    <div class="space-y-6 mb-8">
                        {#each collection.questions as question}
                            {#if question}
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <p class="text-gray-800 font-medium">{question}</p>
                                </div>
                            {/if}
                        {/each}
                    </div>

                    <!-- Submit Button -->
                    <Button 
                        class="w-full flex items-center justify-center text-white" 
                        style="background-color: {collection.buttonColor};"
                        on:click={openFormModal}
                    >
                        <Pen class="mr-2 h-4 w-4" />
                        Send in text
                    </Button>
                </div>
            </div>
        </div>
    {/if}

    {#if collection && isFormModalOpen}
        <TestimonialFormModal
            isOpen={isFormModalOpen}
            onClose={closeFormModal}
            collection={collection}
        />
    {/if}
</div>
