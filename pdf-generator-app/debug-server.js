const http = require('http');
const { parse } = require('url');

const server = http.createServer((req, res) => {
  console.log('\n=== INCOMING REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    console.log('\n=== REQUEST BODY ===');
    console.log('Length:', body.length);
    console.log('First 2000 chars:');
    console.log(body.substring(0, 2000));
    
    // Look for generator field
    if (body.includes('generator')) {
      console.log('\n✅ GENERATOR FIELD FOUND in request body');
      
      // Extract the generator field content
      const generatorMatch = body.match(/name="generator"[\s\S]*?croatia_passport/);
      if (generatorMatch) {
        console.log('Generator field content:', generatorMatch[0]);
      }
    } else {
      console.log('\n❌ GENERATOR FIELD NOT FOUND in request body');
    }
    
    // Count fields
    const fieldMatches = body.match(/name="/g);
    console.log('Total fields found:', fieldMatches ? fieldMatches.length : 0);
    
    // List all field names
    const allFields = body.match(/name="([^"]+)"/g);
    if (allFields) {
      console.log('All field names:', allFields.map(f => f.replace(/name="|"/g, '')));
    }
    
    // Send response
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Request captured',
      bodyLength: body.length,
      hasGenerator: body.includes('generator'),
      fieldCount: fieldMatches ? fieldMatches.length : 0
    }));
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Debug server listening on port ${PORT}`);
  console.log('You can now send requests to http://localhost:8080');
});