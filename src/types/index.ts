export enum StoryGenre {
  DRAMA = 'drama',
  COMEDY = 'comedy',
  ADVENTURE = 'adventure',
  SCIENCE_FICTION = 'science_fiction',
  ROMANCE = 'romance',
  THRILLER = 'thriller',
  MYSTERY = 'mystery',
  FANTASY = 'fantasy',
  HORROR = 'horror',
  HISTORICAL = 'historical'
}

export interface Story {
  id: string;
  title: string;
  content: string;
  language: string;
  level?: string;
  minutes?: number;
  words?: number;
  genre?: StoryGenre;
  thumbnail?: {
    backgroundColor: string;
    svgIndex: number;
  };
  description?: string;
  coverImageUri?: string;
}

export interface SavedWord {
  id: string;
  word: string;
  meaning: string;
}

export interface UserLanguageData {
  stories: Story[];
  words: SavedWord[];
}

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  coin: number;
  languages: {
    [languageCode: string]: UserLanguageData;
  };
}
