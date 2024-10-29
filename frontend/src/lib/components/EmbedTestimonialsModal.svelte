<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Card } from "$lib/components/ui/card";
    import { Grid, Code, Copy, Check, X } from "lucide-svelte";

    export let isOpen = false;
    export let onClose: () => void;
    export let spaceName: string;

    let step = 1;
    let selectedType: 'carousel' | 'wall' | null = null;
    let copied = false;

    function selectType(type: 'carousel' | 'wall') {
        selectedType = type;
        step = 2;
    }

    async function copyToClipboard() {
        const code = selectedType === 'carousel' 
        ? `<iframe id="testify-carousel" src="${import.meta.env.VITE_FRONTEND_URL}/carousel/${spaceName}" frameborder="0" scrolling="yes" width="100%"></iframe>
<script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js"><\/script>
<script>iFrameResize({ log: false, checkOrigin: false }, '#testify-carousel');<\/script>`
                            :  `<iframe id="testify-wall" src="${import.meta.env.VITE_FRONTEND_URL}/wall/${spaceName}" frameborder="0" scrolling="yes" width="100%"></iframe>
<script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js"><\/script>
<script>iFrameResize({ log: false, checkOrigin: false }, '#testify-wall');<\/script>`;

        await navigator.clipboard.writeText(code);
        copied = true;
        setTimeout(() => copied = false, 2000);
    }

    function goBack() {
        step = 1;
        selectedType = null;
    }
</script>

{#if isOpen}
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-gray-800 p-6 rounded-lg w-full max-w-2xl mx-4">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-xl font-bold text-indigo-300">Embed Testimonials</h2>
                <p class="text-sm text-gray-400 mt-1">Step {step} of 2</p>
            </div>
            <Button variant="ghost" size="icon" class="text-gray-400 hover:text-gray-300" on:click={onClose}>
                <X size={20} />
            </Button>
        </div>

        {#if step === 1}
            <div class="space-y-4">
                <p class="text-gray-400 mb-6">Choose how you want to display your testimonials:</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Carousel Option -->
                    <button class="w-full text-left" on:click={() => selectType('carousel')}>
                        <Card class="p-6 bg-gray-700 hover:bg-gray-600 transition-colors border-2 border-transparent hover:border-indigo-500">
                            <div class="flex flex-col items-center text-center">
                                <Code class="w-12 h-12 mb-4 text-indigo-400" />
                                <h3 class="text-lg font-semibold text-indigo-300 mb-2">Carousel</h3>
                                <p class="text-gray-400 text-sm">Display testimonials in a beautiful sliding carousel</p>
                            </div>
                        </Card>
                    </button>

                    <!-- Wall Option -->
                    <button class="w-full text-left" on:click={() => selectType('wall')}>
                        <Card class="p-6 bg-gray-700 hover:bg-gray-600 transition-colors border-2 border-transparent hover:border-indigo-500">
                            <div class="flex flex-col items-center text-center">
                                <Grid class="w-12 h-12 mb-4 text-indigo-400" />
                                <h3 class="text-lg font-semibold text-indigo-300 mb-2">Wall of Shoutouts</h3>
                                <p class="text-gray-400 text-sm">Show all testimonials in a responsive grid layout</p>
                            </div>
                        </Card>
                    </button>
                </div>
            </div>
        {:else}
            <div class="space-y-4">
                <Button variant="ghost" size="sm" class="text-indigo-400 mb-4" on:click={goBack}>← Back</Button>
                <div class="bg-gray-700 p-4 rounded-lg mb-4">
                    <h3 class="text-lg font-semibold text-indigo-300 mb-2">
                        {selectedType === 'carousel' ? 'Carousel Embed Code' : 'Wall Embed Code'}
                    </h3>
                    <div class="flex justify-between items-center mb-4">
                        <p class="text-gray-400">Copy and paste this code to your website:</p>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            class="text-indigo-400 hover:text-indigo-300"
                            on:click={copyToClipboard}
                        >
                            {#if copied}
                                <Check class="h-4 w-4 mr-2" />
                                Copied!
                            {:else}
                                <Copy class="h-4 w-4 mr-2" />
                                Copy Code
                            {/if}
                        </Button>
                    </div>
                    <div class="relative">
                        <pre class="bg-gray-900 p-4 rounded-md text-sm overflow-x-auto"><code class="text-indigo-300">{selectedType === 'carousel' 
                            ? `<iframe id="testify-carousel" src="${import.meta.env.VITE_FRONTEND_URL}/carousel/${spaceName}" frameborder="0" scrolling="yes" width="100%"></iframe>
<script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js"><\/script>
<script>iFrameResize({ log: false, checkOrigin: false }, '#testify-carousel');<\/script>`
                            : `<iframe id="testify-wall" src="${import.meta.env.VITE_FRONTEND_URL}/wall/${spaceName}" frameborder="0" scrolling="yes" width="100%"></iframe>
<script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.6/iframeResizer.min.js"><\/script>
<script>iFrameResize({ log: false, checkOrigin: false }, '#testify-wall');<\/script>`}</code></pre>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
{/if} 