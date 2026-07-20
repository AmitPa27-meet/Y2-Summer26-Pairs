import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const { systemPrompt, messages, apiKey, baseURL } = await req.json();
    const client = new Anthropic({
      apiKey: apiKey ?? Deno.env.get('ANTHROPIC_API_KEY') ?? '',
      baseURL: baseURL ?? Deno.env.get('ANTHROPIC_BASE_URL') ?? undefined,
    });
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt ?? '',
      messages,
    });
    let text = '';
    for (const block of resp.content) {
      if (block.type === 'text') text += block.text;
    }
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
