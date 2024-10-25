<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "$lib/components/ui/select";
    import { Textarea } from "$lib/components/ui/textarea";
    import { X, Plus, Pen, Upload, ChevronDown } from "lucide-svelte";
    import type { Collection } from "$lib/types/collection";
  
    export let isOpen = false;
    export let onClose: () => void;
    export let collection: Collection | null = null;
    export let onUpdate: () => void;
  
    let spaceName = "";
    let headerTitle = "";
    let customMessage = "";
    let questions: string[] = [];
    let extraInfo = {
        name: false,
        email: false,
        title: false,
        socialLink: false
    };
    let collectStarRatings = false;
    let buttonColor = "#4F46E5";
    let language = "English";
    let logo: string | null = null;
    let fileInput: HTMLInputElement;
    let extraInfoDropdownOpen = false;
    let initialized = false;

    const languages = [
        "English", "Spanish", "French", "German", "Chinese (Simplified)", "Chinese (Traditional)",
        "Japanese", "Korean", "Arabic", "Russian", "Portuguese", "Italian", "Dutch", "Polish",
        "Turkish", "Swedish", "Danish", "Norwegian", "Finnish", "Greek", "Hebrew", "Hindi",
        "Thai", "Vietnamese", "Indonesian", "Malay", "Tagalog", "Other"
    ];
  
    $: if (collection && isOpen && !initialized) {
        spaceName = collection.spaceName;
        headerTitle = collection.headerTitle;
        customMessage = collection.customMessage;
        questions = [...collection.questions];
        extraInfo = { ...collection.extraInfo };
        collectStarRatings = collection.collectStarRatings;
        buttonColor = collection.buttonColor;
        language = collection.language;
        logo = collection.logo;
        initialized = true;
    }

    $: if (!isOpen) {
        initialized = false;
    }

    function addQuestion() {
        if (questions.length < 5) {
            questions = [...questions, ""];
        }
    }

    function handleLogoUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > 200) {
                            height *= 200 / width;
                            width = 200;
                        }
                    } else {
                        if (height > 200) {
                            width *= 200 / height;
                            height = 200;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    logo = canvas.toDataURL('image/jpeg', 0.7);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    function triggerFileInput() {
        fileInput.click();
    }

    function toggleExtraInfoDropdown() {
        extraInfoDropdownOpen = !extraInfoDropdownOpen;
    }

    async function handleUpdate() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/collections/${collection?.spaceName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    logo,
                    headerTitle,
                    customMessage,
                    questions,
                    extraInfo,
                    collectStarRatings,
                    buttonColor,
                    language
                })
            });

            const data = await response.json();

            if (response.ok) {
                onClose();
                onUpdate();
            } else {
                throw new Error(data.message || 'Failed to update collection');
            }
        } catch (error) {
            console.error('Error updating collection:', error);
            alert(error instanceof Error ? error.message : 'Failed to update collection');
        }
    }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-900 rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto text-gray-100">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-indigo-300">Edit Collection</h2>
        <button on:click={onClose} class="text-gray-400 hover:text-indigo-300 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-6">
          <div>
            <Label for="spaceName" class="text-indigo-300">Space name</Label>
            <Input 
              type="text" 
              id="spaceName" 
              value={spaceName} 
              disabled 
              class="bg-gray-800 border-gray-700 text-gray-100 cursor-not-allowed opacity-60" 
            />
            <p class="text-sm text-gray-400 mt-1">Public URL is: testify.to/{spaceName}</p>
          </div>

          <div>
            <Label class="text-indigo-300">Update the logo</Label>
            <div class="mt-2 flex items-center">
              <Button variant="outline" class="bg-gray-800 text-indigo-300 border-indigo-600 hover:bg-gray-700" on:click={triggerFileInput}>
                <Upload class="mr-2 h-4 w-4" />
                Change
              </Button>
              {#if logo}
                <span class="ml-2 text-sm text-gray-400">Logo uploaded</span>
              {/if}
            </div>
            <input
              bind:this={fileInput}
              type="file"
              accept="image/*"
              on:change={handleLogoUpload}
              class="hidden"
            />
          </div>

          <div>
            <Label for="headerTitle" class="text-indigo-300">Header title *</Label>
            <Input type="text" id="headerTitle" bind:value={headerTitle} class="bg-gray-800 border-gray-700 text-gray-100" />
          </div>

          <div>
            <Label for="customMessage" class="text-indigo-300">Your custom message *</Label>
            <Textarea id="customMessage" bind:value={customMessage} class="bg-gray-800 border-gray-700 text-gray-100" />
            <p class="text-sm text-gray-400 mt-1">Markdown supported</p>
          </div>

          <div>
            <Label class="text-indigo-300">Questions</Label>
            {#each questions as question, i}
              <div class="mt-2">
                <Input type="text" bind:value={questions[i]} class="bg-gray-800 border-gray-700 text-gray-100" />
                <p class="text-sm text-gray-400 mt-1">{question.length}/100</p>
              </div>
            {/each}
            {#if questions.length < 5}
              <Button variant="outline" class="mt-2 bg-gray-800 text-indigo-300 border-indigo-600 hover:bg-gray-700" on:click={addQuestion}>
                <Plus class="mr-2 h-4 w-4" />
                Add one (up to 5)
              </Button>
            {/if}
          </div>

          <div class="relative">
            <Label class="text-indigo-300">Collect extra information</Label>
            <div 
                class="mt-2 bg-gray-800 border border-gray-700 rounded-md p-2 flex justify-between items-center cursor-pointer"
                on:click={toggleExtraInfoDropdown}
            >
                <span class="text-gray-300">Select additional info</span>
                <ChevronDown class="text-gray-300" size={20} />
            </div>
            {#if extraInfoDropdownOpen}
                <div class="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                    <div class="p-2 space-y-2">
                        <div class="flex items-center">
                            <Checkbox bind:checked={extraInfo.name} id="name" class="border-indigo-600 text-indigo-600" />
                            <Label for="name" class="ml-2 text-gray-300">Name</Label>
                        </div>
                        <div class="flex items-center">
                            <Checkbox bind:checked={extraInfo.email} id="email" class="border-indigo-600 text-indigo-600" />
                            <Label for="email" class="ml-2 text-gray-300">Email</Label>
                        </div>
                        <div class="flex items-center">
                            <Checkbox bind:checked={extraInfo.title} id="title" class="border-indigo-600 text-indigo-600" />
                            <Label for="title" class="ml-2 text-gray-300">Title</Label>
                        </div>
                        <div class="flex items-center">
                            <Checkbox bind:checked={extraInfo.socialLink} id="socialLink" class="border-indigo-600 text-indigo-600" />
                            <Label for="socialLink" class="ml-2 text-gray-300">Social link</Label>
                        </div>
                    </div>
                </div>
            {/if}
          </div>

          <div class="flex items-center">
            <Checkbox bind:checked={collectStarRatings} id="starRatings" class="border-indigo-600 text-indigo-600" />
            <Label for="starRatings" class="ml-2">Collect star ratings</Label>
          </div>

          <div>
            <Label for="buttonColor" class="text-indigo-300">Custom button color</Label>
            <div class="flex items-center mt-2">
              <Input type="color" id="buttonColor" bind:value={buttonColor} class="w-12 h-12 p-1 bg-gray-800 border-gray-700" />
              <span class="ml-2 text-gray-300">{buttonColor}</span>
            </div>
          </div>

          <div>
            <Label for="language" class="text-indigo-300">Language</Label>
            <Select value={language} onValueChange={(value) => language = value}>
              <SelectTrigger class="bg-gray-800 border-gray-700 text-gray-100">
                <SelectValue>{language}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {#each languages as lang}
                  <SelectItem value={lang}>{lang}</SelectItem>
                {/each}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="bg-gray-800 p-6 rounded-lg">
          <h3 class="text-lg font-semibold mb-4 text-indigo-300">Live Preview</h3>
          <div class="bg-white p-6 rounded shadow-lg">
            <!-- Logo display -->
            <div class="flex justify-center mb-4">
              {#if logo}
                <img src={logo} alt="Collection Logo" class="w-16 h-16 rounded-lg object-cover" />
              {:else}
                <div class="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Pen size={24} class="text-gray-400" />
                </div>
              {/if}
            </div>

            <!-- Title and custom message -->
            <h4 class="font-bold text-2xl text-center text-gray-800">{headerTitle || "Please share your feedback"}</h4>
            <p class="text-sm mt-2 text-center text-gray-600">{customMessage || "We would love to hear from you!"}</p>
            
            <!-- Questions -->
            <div class="mt-6">
              <h5 class="font-semibold text-gray-700 mb-2">QUESTIONS</h5>
              <ul class="space-y-2">
                {#each questions as question}
                  {#if question}
                    <li class="flex items-start">
                      <span class="text-indigo-600 mr-2">•</span>
                      <span class="text-gray-700">{question}</span>
                    </li>
                  {/if}
                {/each}
              </ul>
            </div>

            <!-- Send in text button -->
            <div class="mt-6">
              <Button class="w-full flex items-center justify-center" style="background-color: {buttonColor};">
                <Pen class="mr-2 h-4 w-4" />
                Send in text
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-end">
        <Button on:click={onClose} variant="outline" class="mr-2 bg-gray-800 text-indigo-300 border-indigo-600 hover:bg-gray-700">
          Cancel
        </Button>
        <Button on:click={handleUpdate} class="bg-indigo-600 text-white hover:bg-indigo-700">
          Update Collection
        </Button>
      </div>
    </div>
  </div>
{/if}
