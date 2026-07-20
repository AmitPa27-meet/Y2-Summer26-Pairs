import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const MEMORY_INSTRUCTION = `
You have long-term memory for this user. Use the provided memories to personalize your responses. If the user shares important new information (name, age, art style, skill level, favorite artists, favorite programming languages, learning goals, etc.), you MUST append a line at the very end of your reply in this exact format:
@@MEMORY@@key=value
You may add multiple such lines. The system will store them. Do not mention this mechanism to the user.
`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const { systemPrompt, messages, memories, apiKey, baseURL } = await req.json();
    const memLines = Array.isArray(memories) && memories.length
      ? memories.map((m: any) => '- ' + m.key + ': ' + m.value).join('\n')
      : '';
    const fullSystem = (systemPrompt ?? '') + MEMORY_INSTRUCTION +
      (memLines ? '\nKnown memories about this user:\n' + memLines + '\n' : '');

    const client = new Anthropic({
      apiKey: apiKey ?? Deno.env.get('ANTHROPIC_API_KEY') ?? '',
      baseURL: baseURL ?? Deno.env.get('ANTHROPIC_BASE_URL') ?? undefined,
    });

    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: fullSystem,
      messages,
    });

    let text = '';
    for (const block of resp.content) {
      if (block.type === 'text') text += block.text;
    }

    const memRegex = /@@MEMORY@@([^=\n]+)=([^\n]+)/g;
    const newMemories: { key: string; value: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = memRegex.exec(text)) !== null) {
      newMemories.push({ key: m[1].trim(), value: m[2].trim() });
    }
    text = text.replace(memRegex, '').trim();

    return new Response(JSON.stringify({ text, newMemories }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
