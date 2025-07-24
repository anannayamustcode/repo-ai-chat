export async function POST(request) {
  const formData = await request.formData()
  const file = formData.get('file')
  
  // Forward to Flask backend
  const flaskResponse = await fetch('http://localhost:5000/upload', {
    method: 'POST',
    body: formData
  })
  
  return flaskResponse
}