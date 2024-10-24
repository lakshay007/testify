export const ssr = false;

export async function load({ params }) {
    return {
        spaceName: params.spaceName
    };
}
