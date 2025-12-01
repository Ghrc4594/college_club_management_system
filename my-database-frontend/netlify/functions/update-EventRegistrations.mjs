import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {
    // Only accept PUT requests
    if (req.method !== 'PUT') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get ID from query parameter
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID parameter required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { column1, column2, column3 } = body;

    // Validate input
    if (!column1 || !column2) {
      return new Response(
        JSON.stringify({ error: 'Required fields missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Update with parameterized query
    const result = await sql(
      'UPDATE EventRegistrations SET column1 = $1, column2 = $2, column3 = $3 WHERE id = $4 RETURNING *',
      [column1, column2, column3, id]
    );

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Item not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(result[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};