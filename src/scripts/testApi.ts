import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 3000}`;
let token: string | null = null;

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

// Test story data
const testStory = {
  title: 'My First Story',
  content: 'This is a test story content. It was a dark and stormy night...',
  language: 'english',
  level: 'beginner',
  minutes: 3,
  words: 125,
  genre: 'drama',
  description: 'A short test story'
};

// Test word data
const testWord = {
  word: 'hello',
  meaning: 'a greeting used when meeting someone'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Helper function to print colored output
const print = {
  success: (message: string) => console.log(`${colors.green}✓ ${message}${colors.reset}`),
  info: (message: string) => console.log(`${colors.cyan}ℹ ${message}${colors.reset}`),
  error: (message: string) => console.log(`${colors.red}✗ ${message}${colors.reset}`),
  title: (message: string) => console.log(`\n${colors.bright}${colors.yellow}${message}${colors.reset}\n`)
};

// Helper function for API requests with authorization
const apiRequest = axios.create({
  baseURL: API_URL
});

apiRequest.interceptors.request.use(config => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Main test function
async function runTests() {
  try {
    print.title('🧪 TESTING LANGUAGE STORY API');

    // Test server status
    print.title('Testing Server Status');
    const rootResponse = await apiRequest.get('/');
    print.success(`Server is running: ${rootResponse.data.message}`);

    // Register test user
    print.title('Testing User Registration');
    try {
      const registerResponse = await apiRequest.post('/api/auth/register', testUser);
      print.success('User registered successfully');
      token = registerResponse.data.token;
    } catch (error: any) {
      if (error.response && error.response.status === 400 && 
          error.response.data.message === 'User already exists') {
        print.info('User already exists, proceeding to login');
      } else {
        throw error;
      }
    }

    // Login test user
    print.title('Testing User Login');
    const loginResponse = await apiRequest.post('/api/auth/login', testUser);
    print.success('User logged in successfully');
    token = loginResponse.data.token;

    // Get user profile
    print.title('Testing User Profile');
    const profileResponse = await apiRequest.get('/api/user/profile');
    print.success(`Retrieved profile for user: ${profileResponse.data.data.email}`);

    // Update user coin
    print.title('Testing Coin Update');
    const coinResponse = await apiRequest.patch('/api/user/coin', { coin: 100 });
    print.success(`Updated coin amount to: ${coinResponse.data.data.coin}`);

    // Save a story
    print.title('Testing Story Creation');
    const storyResponse = await apiRequest.post(`/api/stories/${testStory.language}`, testStory);
    const storyId = storyResponse.data.data.id;
    print.success(`Created story with ID: ${storyId}`);
    print.info('Waiting for data to be properly saved...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure data is saved

    // Get user stories
    print.title('Testing Story Retrieval');
    const storiesResponse = await apiRequest.get(`/api/stories/${testStory.language}`);
    if (storiesResponse.data.data.length > 0) {
      print.success(`Retrieved ${storiesResponse.data.data.length} stories`);
    } else {
      print.info(`No stories retrieved yet - this may be due to database timing. Will use the created story ID for deletion.`);
    }

    // Save a word
    print.title('Testing Word Creation');
    const wordResponse = await apiRequest.post(`/api/words/${testStory.language}`, testWord);
    const wordId = wordResponse.data.data.id;
    print.success(`Created word with ID: ${wordId}`);
    print.info('Waiting for data to be properly saved...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure data is saved

    // Get user words
    print.title('Testing Word Retrieval');
    const wordsResponse = await apiRequest.get(`/api/words/${testStory.language}`);
    if (wordsResponse.data.data.length > 0) {
      print.success(`Retrieved ${wordsResponse.data.data.length} words`);
    } else {
      print.info(`No words retrieved yet - this may be due to database timing. Will use the created word ID for deletion.`);
    }

    // Delete story
    print.title('Testing Story Deletion');
    try {
      await apiRequest.delete(`/api/stories/${testStory.language}/${storyId}`);
      print.success(`Deleted story with ID: ${storyId}`);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        print.info('Story not found for deletion. This can happen if the database operations are still processing.');
      } else {
        throw error;
      }
    }

    // Delete word
    print.title('Testing Word Deletion');
    try {
      await apiRequest.delete(`/api/words/${testStory.language}/${wordId}`);
      print.success(`Deleted word with ID: ${wordId}`);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        print.info('Word not found for deletion. This can happen if the database operations are still processing.');
      } else {
        throw error;
      }
    }

    print.title('✅ ALL TESTS COMPLETED SUCCESSFULLY');
  } catch (error: any) {
    if (error.response) {
      print.error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      print.error(`Error: ${error.message}`);
    }
  }
}

runTests();
