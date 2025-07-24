export async function GET() {
  const response = await fetch('http://localhost:5000/summary')
  return response
}