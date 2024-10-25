<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Search, Plus, Loader, ChevronRight, Edit } from "lucide-svelte";
    import Header from "$lib/components/Header.svelte";
    import AddCollectionModal from "$lib/components/AddCollectionModal.svelte";
    import EditCollectionModal from "$lib/components/EditCollectionModal.svelte";

    let isLoading = true;
    let currentPlan = "Free";  // Default to Free
    let collections: any[] = [];
    let searchQuery = "";
    let isAddCollectionModalOpen = false;
    let isEditCollectionModalOpen = false;
    let selectedCollection: any = null;

    onMount(async () => {
        await checkAuthentication();
    });

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

          
            const userResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!userResponse.ok) {
                throw new Error('Failed to fetch user details');
            }

            const userData = await userResponse.json();
            currentPlan = userData.plan;  

            isLoading = false;
            await fetchCollections();
        } catch (error) {
            console.error('Authentication error:', error);
            goto('/signin');
        }
    }

    async function fetchCollections() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/collections`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch collections');
            }

            collections = await response.json();
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    }

    function handleSearch() {
        console.log("Searching for:", searchQuery);
    }

    function openAddCollectionModal() {
        isAddCollectionModalOpen = true;
    }

    function closeAddCollectionModal() {
        isAddCollectionModalOpen = false;
    }

    function openEditCollectionModal(collection: any) {
        selectedCollection = collection;
        isEditCollectionModalOpen = true;
    }

    function closeEditCollectionModal() {
        isEditCollectionModalOpen = false;
        selectedCollection = null;
    }
</script>

<div class="min-h-screen bg-gray-900 text-gray-100">
    <Header />

    {#if isLoading}
        <div class="flex justify-center items-center h-screen">
            <Loader class="animate-spin h-12 w-12 text-indigo-400" />
        </div>
    {:else}
        <main class="container mx-auto px-4 py-8">
            <h1 class="text-3xl font-bold text-indigo-300 mb-6">Dashboard</h1>

            <section class="mb-12">
                <h2 class="text-2xl font-semibold text-indigo-300 mb-4">Overview</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card class="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle class="text-indigo-300">Total Collections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p class="text-4xl font-bold text-indigo-400">{collections.length}</p>
                        </CardContent>
                    </Card>
                    <Card class="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle class="text-indigo-300">Current Plan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p class="text-4xl font-bold text-indigo-400">{currentPlan}</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section>
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-semibold text-indigo-300">Collections</h2>
                    <Button on:click={openAddCollectionModal} class="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus class="mr-2 h-4 w-4" />
                        Add Collection
                    </Button>
                </div>

                <div class="mb-6">
                    <form on:submit|preventDefault={handleSearch} class="flex gap-2">
                        <Input type="text" placeholder="Search collections..." bind:value={searchQuery} class="flex-grow bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400" />
                        <Button type="submit" variant="outline" class="bg-gray-800 border-gray-700 text-indigo-400 hover:bg-gray-700">
                            <Search class="h-4 w-4" />
                        </Button>
                    </form>
                </div>

                {#if collections.length > 0}
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {#each collections as collection}
                            <div class="relative">
                                <Button 
                                    on:click={() => openEditCollectionModal(collection)}
                                    class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 p-2 rounded-full z-10"
                                >
                                    <Edit class="h-4 w-4 text-indigo-300" />
                                </Button>
                                <a href="/dashboard/{collection.spaceName}" class="block transition-transform hover:-translate-y-1">
                                    <Card class="bg-gray-800 border-gray-700 hover:border-indigo-500">
                                        <CardHeader>
                                            <CardTitle class="text-indigo-300">{collection.spaceName}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p class="text-sm text-gray-400">{collection.testimonials} testimonials</p>
                                            <div class="mt-4 flex items-center text-indigo-400">
                                                <span>View collection card</span>
                                                <ChevronRight class="h-4 w-4 ml-1" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </a>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                        <p class="text-xl text-indigo-300 mb-4">You don't have any collections yet.</p>
                        <p class="text-gray-400">Click the "Add Collection" button to get started!</p>
                        <svg class="mx-auto mt-4 h-12 w-12 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                    </div>
                {/if}
            </section>
        </main>
    {/if}

    <AddCollectionModal isOpen={isAddCollectionModalOpen} onClose={closeAddCollectionModal} />
    <EditCollectionModal 
        isOpen={isEditCollectionModalOpen} 
        onClose={closeEditCollectionModal}
        collection={selectedCollection}
        onUpdate={fetchCollections}
    />
</div>
