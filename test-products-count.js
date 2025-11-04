// Simple test to check product count
const API_BASE_URL = 'http://localhost:5000/api';

async function checkProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    const data = await response.json();
    
    console.log(`📊 Total Products: ${data.products.length}`);
    console.log('\n📦 Product List:');
    
    data.products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price} (${product.category})`);
    });
    
    console.log(`\n✅ Successfully loaded ${data.products.length} products!`);
    
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

checkProducts();