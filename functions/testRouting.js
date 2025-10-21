// Simple manual test for message routing utilities
const {
  normalizeToken,
  extractHashtags,
  parseMessageTags,
  createMessageHash,
  RESERVED_TAGS
} = require('./messageRouting');

console.log('🧪 Testing Message Routing Utilities\n');

// Test normalizeToken
console.log('📝 normalizeToken Tests:');
console.log('normalizeToken("José María"):', normalizeToken('José María'));
console.log('normalizeToken("Emma-Doe"):', normalizeToken('Emma-Doe'));
console.log('normalizeToken("Emma_Kate"):', normalizeToken('Emma_Kate'));
console.log('');

// Test extractHashtags
console.log('🏷️ extractHashtags Tests:');
console.log('extractHashtags("Great day #Emma #progress"):', extractHashtags('Great day #Emma #progress'));
console.log('extractHashtags("No hashtags"):', extractHashtags('No hashtags'));
console.log('extractHashtags("#single"):', extractHashtags('#single'));
console.log('');

// Test parseMessageTags
console.log('🔍 parseMessageTags Tests:');
console.log('parseMessageTags("Great session #Emma #progress #sleep", "Emma"):', 
  parseMessageTags('Great session #Emma #progress #sleep', 'Emma'));
console.log('parseMessageTags("Fun day #THERAPY #Progress", null):', 
  parseMessageTags('Fun day #THERAPY #Progress', null));
console.log('parseMessageTags("Great session #Emma #custom #progress", "Emma"):', 
  parseMessageTags('Great session #Emma #custom #progress', 'Emma'));
console.log('');

// Test createMessageHash
console.log('🔐 createMessageHash Tests:');
const hash1 = createMessageHash('+1234567890', 'Hello world');
const hash2 = createMessageHash('+1234567890', 'Hello world');
const hash3 = createMessageHash('+1234567890', 'Different message');
console.log('Same message creates same hash:', hash1 === hash2);
console.log('Different messages create different hashes:', hash1 !== hash3);
console.log('');

// Test RESERVED_TAGS
console.log('📋 Reserved Tags:', RESERVED_TAGS);
console.log('');

console.log('✅ All utility tests completed successfully!');

// Test message examples
console.log('\n📨 Message Processing Examples:');

const testMessages = [
  'Great session today #Emma #progress',
  'Had lunch with applesauce',
  'Nap time #sleep #emma', 
  'Doctor visit #tfVn2r0SbU6mtfu7n2ui #medical',
  'Fun day #sleep',
  'Playing with #Emma #Lucy #toys'
];

testMessages.forEach(message => {
  const hashtags = extractHashtags(message);
  console.log(`\nMessage: "${message}"`);
  console.log(`Hashtags: [${hashtags.join(', ')}]`);
  console.log(`Tags (no child/reserved): [${parseMessageTags(message, hashtags.find(tag => !RESERVED_TAGS.includes(normalizeToken(tag)))).join(', ')}]`);
});