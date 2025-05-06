# Ring & Wing Mobile App Deployment

This README provides instructions for deploying the Ring & Wing backend to Render.com, setting up MongoDB Atlas, and connecting your Android application.

## Prerequisites

- MongoDB Atlas account (free tier available)
- Render.com account (free tier available)
- Android Studio for Android app development
- Git installed locally

## MongoDB Atlas Setup

1. **Create a Free MongoDB Atlas Cluster:**
   - Sign up or log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new project
   - Create a free tier cluster (M0)

2. **Configure Database Access:**
   - In Security → Database Access, create a new database user
   - Use password authentication
   - Give appropriate permissions (readWrite to your database)

3. **Configure Network Access:**
   - In Security → Network Access, add a new IP address
   - For development, you can allow access from anywhere (0.0.0.0/0)
   - For production, restrict to your application server IPs

4. **Get Connection String:**
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Add the string to your project's `.env` file as `MONGO_URI`

## Render.com Deployment

1. **Deploy Backend to Render:**
   - Log in to [Render](https://render.com)
   - Create a new Web Service
   - Connect your GitHub repository
   - Use the following settings:
     - Name: `ring-wing-backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Plan: Free
   
2. **Configure Environment Variables on Render:**
   - Add the following environment variables:
     - `MONGO_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string
     - `OPENROUTER_API_KEY`: Your OpenRouter API key
     - `NODE_ENV`: `production`

3. **Deploy the Application:**
   - Click "Create Web Service"
   - Wait for the deployment to complete
   - Note the URL of your deployed API (e.g., `https://ring-wing-backend.onrender.com`)

## Android App Setup

1. **Configure API Endpoint:**
   - Open `android-app-config.js` in your project
   - Update the `BASE_URL` with your Render.com deployment URL
   - Example: `BASE_URL: 'https://ring-wing-backend.onrender.com'`

2. **Android Studio Project Setup:**
   - Create a new Android Studio project
   - Choose an Empty Activity template
   - Set minimum API level (recommend API 24+)

3. **Add Required Dependencies:**
   Add the following to your app-level `build.gradle`:

   ```gradle
   dependencies {
       // Retrofit for API calls
       implementation 'com.squareup.retrofit2:retrofit:2.9.0'
       implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
       implementation 'com.squareup.okhttp3:logging-interceptor:4.9.1'
       
       // ViewModel and LiveData
       implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2'
       implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.6.2'
       
       // Coroutines
       implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.6.4'
       
       // Image loading
       implementation 'com.github.bumptech.glide:glide:4.15.1'
       
       // Camera X for timeclock functionality
       implementation 'androidx.camera:camera-camera2:1.2.3'
       implementation 'androidx.camera:camera-lifecycle:1.2.3'
       implementation 'androidx.camera:camera-view:1.2.3'
   }
   ```

4. **Configure API Service:**
   - Create API service interfaces for each endpoint group
   - Set up OkHttpClient with proper timeout configurations
   - Implement authentication interceptors for JWT tokens

5. **Create Android Activities:**
   - Login activity
   - Time clock activity with camera integration
   - Order management activities
   - Inventory checking activities

## Testing the Integration

1. **Test API Connection:**
   - Use the health check endpoint: `GET /api/health`
   - If successful, you'll receive a `200 OK` response

2. **Test Authentication:**
   - Try logging in with one of your staff accounts
   - Verify that you receive a JWT token

3. **Test Time Clock Functions:**
   - Test clock-in and clock-out functionality
   - Verify that photos are properly uploaded

## Common Issues and Troubleshooting

- **Render.com Sleep:** Free tier services on Render will "sleep" after 15 minutes of inactivity. The first request after inactivity may take 30+ seconds.
- **MongoDB Connection Issues:** Double-check your network access settings in MongoDB Atlas.
- **CORS Errors:** Make sure your Android app properly sets the required headers for API requests.
- **Token Expiration:** Implement token refresh logic in your Android app.

## Security Considerations

- Always store sensitive data like API keys in secure environment variables
- Use HTTPS for all API communications
- Implement proper authentication and authorization
- Enforce secure password policies
- Consider implementing rate limiting for API endpoints
- Regularly update dependencies to patch security vulnerabilities