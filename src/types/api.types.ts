// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  created_at?: string;
  updated_at?: string;
}

// Common Types
export interface Image {
  aspect_ratio: number;
  file_path: string;
  height: number;
  width: number;
  vote_average?: number;
  vote_count?: number;
  iso_639_1?: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  iso_639_1: string;
  iso_3166_1: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface WatchProviderRegion {
  link: string;
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  flatrate?: WatchProvider[];
}

export interface Review {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  gender?: number;
  known_for_department?: string;
  popularity?: number;
  credit_id?: string;
}

export interface Crew {
  id: number;
  name: string;
  department: string;
  job: string;
  profile_path: string | null;
  gender?: number;
  known_for_department?: string;
  popularity?: number;
  credit_id?: string;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

// API Response Types
export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// API Parameter Types
export interface SearchParams {
  query: string;
  page?: number;
  include_adult?: boolean;
  language?: string;
  region?: string;
  year?: number;
  primary_release_year?: number;
  first_air_date_year?: number;
}

export interface DiscoverMovieParams {
  sort_by?: string;
  primary_release_year?: number;
  with_genres?: string;
  with_watch_providers?: string;
  page?: number;
  language?: string;
  region?: string;
  include_adult?: boolean;
  vote_average_gte?: number;
  vote_average_lte?: number;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  with_original_language?: string;
  with_companies?: string;
  with_keywords?: string;
}

export interface DiscoverTVShowParams {
  sort_by?: string;
  first_air_date_year?: number;
  with_genres?: string;
  with_watch_providers?: string;
  page?: number;
  language?: string;
  region?: string;
  include_adult?: boolean;
  vote_average_gte?: number;
  vote_average_lte?: number;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  with_original_language?: string;
  with_companies?: string;
  with_keywords?: string;
  with_status?: string;
  with_type?: string;
  with_networks?: string;
}

// Movie Types
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  video: boolean;
}

export interface MovieDetails extends Movie {
  belongs_to_collection: null | {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };
  budget: number;
  genres: Genre[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  revenue: number;
  runtime: number | null;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string | null;
  images?: {
    backdrops: Image[];
    posters: Image[];
    logos: Image[];
  };
}

// TV Show Types
export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  original_name: string;
}

export interface TVShowDetails extends TVShow {
  created_by: Person[];
  episode_run_time: number[];
  genres: Genre[];
  homepage: string | null;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: Episode | null;
  next_episode_to_air: Episode | null;
  networks: Network[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: Season[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string | null;
  type: string;
  images?: {
    backdrops: Image[];
    posters: Image[];
    logos: Image[];
  };
}

export interface Season {
  id: number;
  air_date: string;
  episode_count: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
}

export interface Episode {
  id: number;
  air_date: string;
  episode_number: number;
  name: string;
  overview: string;
  production_code: string;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

// Person Types
export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  adult: boolean;
  popularity: number;
  known_for_department: string;
}

export interface PersonDetails extends Person {
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  imdb_id: string | null;
  place_of_birth: string | null;
}

// Network Types
export interface Network {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

// Additional Types
export interface MovieCredit {
  id: number;
  title: string;
  original_title: string;
  character?: string;
  department?: string;
  job?: string;
  release_date: string;
  poster_path: string | null;
  media_type: 'movie';
}

export interface TVCredit {
  id: number;
  name: string;
  original_name: string;
  character?: string;
  department?: string;
  job?: string;
  first_air_date: string;
  poster_path: string | null;
  media_type: 'tv';
} 