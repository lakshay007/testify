<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import { X, Star, ImagePlus, Heart } from "lucide-svelte";
    import type { Collection } from "$lib/types/collection";

    export let isOpen = false;
    export let onClose: () => void;
    export let collection: Collection;

    let testimonialText = "";
    let rating = 0;
    let image: string | null = null;
    let fileInput: HTMLInputElement;
    let extraFields = {
        name: "",
        email: "",
        title: "",
        socialLink: ""
    };

    let showSuccessMessage = false;
    const wordLimit = 100; // Set your desired word limit

    function handleInput(event: Event) {
        const target = event.target as HTMLTextAreaElement;
        const words = target.value.split(/\s+/).filter(word => word.length > 0);
        if (words.length > wordLimit) {
            // Trim the input to the word limit
            testimonialText = words.slice(0, wordLimit).join(' ');
        } else {
            testimonialText = target.value;
        }
    }

    async function handleSubmit() {
        try {
            const testimonialData = {
                rating: collection.collectStarRatings ? rating : undefined,
                testimonialText,
                image,
                extraFields: {
                    name: collection.extraInfo.name ? extraFields.name : undefined,
                    email: collection.extraInfo.email ? extraFields.email : undefined,
                    title: collection.extraInfo.title ? extraFields.title : undefined,
                    socialLink: collection.extraInfo.socialLink ? extraFields.socialLink : undefined
                }
            };

            const response = await fetch(`http://localhost:4000/api/testimonials/by-space/${collection.spaceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testimonialData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit testimonial');
            }

            showSuccessMessage = true;
        } catch (error) {
            console.error('Error submitting testimonial:', error);
            alert(error.message || 'Failed to submit testimonial. Please try again.');
        }
    }

    function setRating(value: number) {
        rating = value;
    }

    async function handleImageUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimensions
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    image = canvas.toDataURL('image/jpeg', 0.7);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    function triggerFileInput() {
        fileInput?.click();
    }

    function removeImage() {
        image = null;
        if (fileInput) fileInput.value = '';
    }

    function closeSuccessMessage() {
        showSuccessMessage = false;
        onClose();
    }
</script>

{#if isOpen}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {#if showSuccessMessage}
            <div class="bg-white rounded-lg p-8 max-w-md w-full text-center relative">
                <button 
                    class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                    on:click={closeSuccessMessage}
                >
                    <X size={24} />
                </button>
                <div class="flex flex-col items-center space-y-4">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Heart class="w-8 h-8 text-green-500 fill-current" />
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">Thank you for the amazing shoutout! ❤️</h2>
                    <p class="text-gray-600">Your feedback means a lot to us.</p>
                </div>
            </div>
        {:else}
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex flex-col items-center mb-6">
                    <div class="flex justify-between w-full mb-4">
                        <h2 class="text-2xl font-bold text-gray-900">Give a shoutout to</h2>
                        <button 
                            class="text-gray-500 hover:text-gray-700"
                            on:click={onClose}
                        >
                            <X size={24} />
                        </button>
                    </div>
                    
                    {#if collection.logo}
                        <img 
                            src={collection.logo} 
                            alt="Company Logo" 
                            class="w-20 h-20 object-cover rounded-lg"
                        />
                    {/if}
                </div>

                <form on:submit|preventDefault={handleSubmit} class="space-y-6">
                    {#if collection.collectStarRatings}
                        <div>
                            <Label class="text-gray-700 mb-2 block">Overall Rating</Label>
                            <div class="flex gap-2">
                                {#each Array(5) as _, i}
                                    <button
                                        type="button"
                                        on:click={() => setRating(i + 1)}
                                        class="focus:outline-none"
                                    >
                                        <Star
                                            size={24}
                                            class={rating > i ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                        />
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <div>
                        <div class="mb-4 bg-gray-50 p-4 rounded-lg space-y-2">
                            {#each collection.questions as question}
                                <p class="text-gray-700">• {question}</p>
                            {/each}
                        </div>
                        <Textarea
                            bind:value={testimonialText}
                            rows={6}
                            class="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Write your response here..."
                            on:input={handleInput}
                        />
                        <p class="text-sm text-gray-500 mt-1">{testimonialText.split(/\s+/).filter(word => word.length > 0).length} / {wordLimit} words</p>
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <Label class="text-gray-700">Add Image</Label>
                            <span class="text-sm text-gray-500">(optional)</span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            class="hidden"
                            bind:this={fileInput}
                            on:change={handleImageUpload}
                        />
                        {#if !image}
                            <Button
                                type="button"
                                variant="outline"
                                class="w-full border-dashed border-2 h-32 flex flex-col items-center justify-center space-y-2"
                                on:click={triggerFileInput}
                            >
                                <ImagePlus class="h-8 w-8 text-gray-400" />
                                <span class="text-sm text-gray-500">Click to upload an image</span>
                            </Button>
                        {:else}
                            <div class="relative">
                                <img
                                    src={image}
                                    alt="Uploaded preview"
                                    class="w-full h-32 object-cover rounded-lg"
                                />
                                <Button
                                    type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                                    on:click={removeImage}
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        {/if}
                    </div>

                    {#if Object.values(collection.extraInfo).some(v => v)}
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-gray-900">Additional Information</h3>
                            
                            {#if collection.extraInfo.name}
                                <div>
                                    <Label for="name" class="text-gray-700">Name</Label>
                                    <Input
                                        type="text"
                                        id="name"
                                        bind:value={extraFields.name}
                                        class="w-full border-gray-300"
                                    />
                                </div>
                            {/if}

                            {#if collection.extraInfo.email}
                                <div>
                                    <Label for="email" class="text-gray-700">Email</Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        bind:value={extraFields.email}
                                        class="w-full border-gray-300"
                                    />
                                </div>
                            {/if}

                            {#if collection.extraInfo.title}
                                <div>
                                    <Label for="title" class="text-gray-700">Title</Label>
                                    <Input
                                        type="text"
                                        id="title"
                                        bind:value={extraFields.title}
                                        class="w-full border-gray-300"
                                    />
                                </div>
                            {/if}

                            {#if collection.extraInfo.socialLink}
                                <div>
                                    <Label for="socialLink" class="text-gray-700">Social Link</Label>
                                    <Input
                                        type="url"
                                        id="socialLink"
                                        bind:value={extraFields.socialLink}
                                        class="w-full border-gray-300"
                                        placeholder="https://"
                                    />
                                </div>
                            {/if}
                        </div>
                    {/if}

                    <div class="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            on:click={onClose}
                            class="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            style="background-color: {collection.buttonColor};"
                            class="text-white"
                        >
                            Submit Feedback
                        </Button>
                    </div>
                </form>
            </div>
        {/if}
    </div>
{/if}
