# Kahani Application Flow

## Overview
Kahani is a movie and TV show companion application that helps users discover, track, and enjoy their favorite entertainment content. The application is built with React and uses Supabase for authentication and data storage, with OpenAI integration for personalized recommendations.

## 1. Landing Page
- **Purpose**: Introduce the app to new users
- **Flow**:
  1. User arrives at the **Landing** page (`/`)
  2. CTA buttons:
     - "Get Started" → **OAuthLogin** (new users)
     - "Sign In" → **OAuthLogin** (returning users)
  3. Features showcase and value proposition

## 2. Authentication (OAuthLogin)
- **Purpose**: Secure sign-in via Google OAuth
- **Flow**:
  1. User clicks "Sign In with Google" (`/login`)
  2. Redirected to Google OAuth
  3. On success:
     - **New users** → **PromptPage** (preference setup)
     - **Returning users** → **Dashboard**
  4. Auth callback (`/auth/callback`):
     - Handles OAuth response
     - Creates/updates user profile
     - Manages session establishment

## 3. Prompt Page
- **Purpose**: Capture user preferences for personalization
- **Flow**:
  1. User enters preferences (e.g., "I love 90s sci-fi movies")
  2. OpenAI processes input for recommendations
  3. Redirects to **Dashboard** with personalized results
- **Features**:
  - Natural language preference input
  - AI-powered preference analysis
  - Real-time recommendation generation

## 4. Dashboard
- **Purpose**: Central hub for recommendations and exploration
- **Structure**:
  - **Results Section**: AI-generated recommendations
  - **Explore Section**: Trending movies/TV shows
- **Flow**:
  1. User interactions:
     - Recommendation cards → **MovieDetail**/**TvShowDetail**
     - Trending titles → Horizontal scroll exploration
     - Search bar → **Search** page
  2. Navigation options:
     - **ReadingList**: Saved content
     - **Profile**: Account management

## 5. Content Browsing & Interaction
- **Purpose**: Deep-dive into movies and shows
- **Pages**:
  - **Movies**/**TvShows** (`/movies`, `/tv`): Content catalogs
  - **MovieDetail**/**TvShowDetail** (`/movie/:id`, `/tv/:id`): Detailed views
  - **SeasonDetail**/**EpisodeDetail** (`/tv/:showId/season/:seasonNumber`): TV specifics
- **Flow**:
  1. Content selection from any page
  2. Detailed view access
  3. Available actions:
     - Save to **ReadingList**
     - Explore related content
     - View trailers and cast info

## 6. Search & Recommendations
- **Purpose**: Content discovery and preference refinement
- **Pages**:
  - **Search** (`/search`): Advanced filtering
  - **Recommendations**: AI-curated suggestions
- **Flow**:
  1. Search functionality:
     - Text-based search
     - Filter options (genre, year, rating)
  2. Recommendation updates:
     - Via **PromptPage** refinements
     - Based on user interactions

## 7. Profile Management
- **Purpose**: Account and preference management
- **Pages**:
  - **Profile** (`/profile`): User hub
  - **ProfileSettings**: Preference control
  - **ReadingList**: Saved content management
- **Flow**:
  1. Profile access and updates
  2. Preference management
  3. Reading list organization

## 8. Logout
- **Purpose**: Secure application exit
- **Flow**:
  1. Logout action from any page
  2. Session termination
  3. Redirect to **Landing**

## Admin Flow
- **Purpose**: Platform management and analytics
- **Access**: Elevated Supabase permissions
- **Components**:
  1. **Admin Dashboard**:
     - User management
     - Content oversight
  2. **ABTestManager**:
     - Recommendation algorithm testing
     - Feature experiments
  3. **AnalyticsDashboard**:
     - User engagement metrics
     - Content performance tracking

## Security Features
- PKCE authentication flow
- Token refresh management
- Session timeout handling
- Rate limiting protection
- Secure storage handling

## Visual Flow Diagram
```plaintext
Landing → OAuthLogin → PromptPage → Dashboard → (Recommendations / Explore)
                   ↑                |
                   |                → Search → MovieDetail/TvShowDetail
                   |                → ReadingList
                   |                → Profile → ProfileSettings
                   |
Admin Flow: OAuthLogin → Admin Dashboard → ABTestManager/AnalyticsDashboard
```

## Technical Implementation Notes
1. **Backward Compatibility**:
   - Maintains existing route structure
   - Preserves current authentication flow
   - Supports legacy features

2. **Integration Points**:
   - Supabase for authentication and data
   - OpenAI for recommendation engine
   - React for UI components
   - Real-time updates via Supabase subscriptions

3. **Performance Considerations**:
   - Lazy loading for route components
   - Optimized state management
   - Efficient data caching
   - Rate limiting for API calls 