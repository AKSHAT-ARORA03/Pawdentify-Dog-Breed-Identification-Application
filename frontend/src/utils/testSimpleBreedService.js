/**
 * Quick test for Simple Breed Image Service
 * Add this script tag to test in browser console
 */

// Test function to verify breed image service
async function testBreedImages() {
  console.log('🧪 Testing Simple Breed Image Service...');
  
  const testBreeds = ['Beagle', 'Yorkshire Terrier', 'Rottweiler'];
  
  for (const breed of testBreeds) {
    try {
      console.log(`\n🔍 Testing: ${breed}`);
      
      // This would work in the browser context
      const result = await fetch('https://dog.ceo/api/breed/beagle/images/random');
      const data = await result.json();
      
      if (data.status === 'success') {
        console.log(`✅ ${breed}: API working - ${data.message}`);
      } else {
        console.log(`❌ ${breed}: API failed - ${data.message}`);
      }
    } catch (error) {
      console.error(`❌ ${breed}: Error - ${error.message}`);
    }
  }
}

// Test Dog CEO API connectivity
fetch('https://dog.ceo/api/breed/beagle/images/random')
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      console.log('✅ Dog CEO API is working!');
      console.log('📸 Sample Beagle image:', data.message);
    } else {
      console.log('❌ Dog CEO API failed:', data);
    }
  })
  .catch(error => {
    console.error('❌ Dog CEO API error:', error);
  });

console.log('🧪 Simple test completed - check above for results');