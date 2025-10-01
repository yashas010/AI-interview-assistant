import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple test to check available models
export async function listAvailableModels() {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
  
  if (!apiKey) {
    console.error('No API key found');
    return { success: false, error: 'No API key found' };
  }

  console.log('🔍 Testing with API Key:', apiKey.substring(0, 10) + '...');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Skip direct model listing as it's not available in browser SDK
    
    // If listing fails, try direct API call with different API versions
    console.log('🔄 Trying direct API calls with different endpoints...');
    
    const apiEndpoints = [
      { version: 'v1', baseUrl: 'https://generativelanguage.googleapis.com/v1' },
      { version: 'v1beta', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' }
    ];
    
    for (const endpoint of apiEndpoints) {
      console.log(`🧪 Trying API version: ${endpoint.version}`);
      
      try {
        // Try a direct fetch to check if the API key works
        const testUrl = `${endpoint.baseUrl}/models?key=${apiKey}`;
        const response = await fetch(testUrl);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Success with ${endpoint.version}:`, data);
          
          // Try to find a working model from the list
          if (data.models && data.models.length > 0) {
            for (const modelInfo of data.models.slice(0, 3)) { // Try first 3 models
              try {
                console.log(`🧪 Testing model from API: ${modelInfo.name}`);
                const model = genAI.getGenerativeModel({ model: modelInfo.name });
                const result = await model.generateContent('Hello');
                const response = await result.response;
                const text = response.text();
                
                return { 
                  success: true, 
                  workingModel: modelInfo.name, 
                  response: text,
                  apiVersion: endpoint.version,
                  availableModels: data.models
                };
              } catch (modelError) {
                console.log(`❌ Failed with ${modelInfo.name}:`, modelError);
                continue;
              }
            }
          }
        } else {
          console.log(`❌ API ${endpoint.version} failed:`, response.status, await response.text());
        }
      } catch (endpointError) {
        console.log(`❌ Failed to test ${endpoint.version}:`, endpointError);
      }
    }
    
    return { success: false, error: 'All API endpoints and models failed' };
    
  } catch (error) {
    console.error('❌ General error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}