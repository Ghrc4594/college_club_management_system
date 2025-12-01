import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {
    // Only accept DELETE requests
    if (req.method !== 'DELETE') {
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

    const sql = neon(process.env.DATABASE_URL);

    // Delete with parameterized query
    const result = await sql(
      'DELETE FROM members WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Item not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({
      message: 'Deleted successfully',
      deleted: result[0]
    }), {
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