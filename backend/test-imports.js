console.log('Testing imports...');
try {
  require('./src/services/RealtimeService.js');
  console.log('All imports successful!');
} catch (error) {
  console.error('Import error:', error.message);
}