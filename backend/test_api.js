
async function run() {
  const res = await fetch('http://localhost:5000/api/ai/suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer standalone-fake-token'
    },
    body: JSON.stringify({ question: 'Can you explain the Node.js event loop?' })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
