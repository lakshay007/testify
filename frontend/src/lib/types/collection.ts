export interface Collection {
    _id?: string;
    userId?: string;
    spaceName: string;
    logo: string | null;
    headerTitle: string;
    customMessage: string;
    questions: string[];
    extraInfo: {
        name: boolean;
        email: boolean;
        title: boolean;
        socialLink: boolean;
    };
    collectStarRatings: boolean;
    buttonColor: string;
    language: string;
    testimonials: number;
    createdAt: string;
}
