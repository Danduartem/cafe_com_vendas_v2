// Presenter structure
export interface PresenterSchema {
  '@context': string;
  '@type': string;
  name: string;
  jobTitle: string;
  url: string;
  sameAs: string[];
}

export interface PresenterData {
  name: string;
  subtitle: string;
  bio: string;
  photoAlt: string;
  highlights: string[];
  microStory: string;
  social: {
    instagram: string;
  };
  schema: PresenterSchema;
}