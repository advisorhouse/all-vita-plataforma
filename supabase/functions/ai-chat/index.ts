import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, tenant_id, partner_id, voice_enabled = false } = await req.json();

    if (!tenant_id) {
      return new Response(JSON.stringify({ error: "tenant_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Fetch AI Persona for the tenant
    const { data: persona, error: personaError } = await supabaseAdmin
      .from("ai_personas")
      .select("*")
      .eq("tenant_id", tenant_id)
      .eq("active", true)
      .maybeSingle();

    if (personaError) {
      console.error("Error fetching persona:", personaError);
    }

    // 2. Fallback to default persona if none found
    const systemPrompt = persona?.system_prompt || "Você é uma assistente virtual prestativa da All Vita.";
    const name = persona?.name || "Assistente";
    const useEmojis = persona?.use_emojis ?? true;
    const tone = persona?.tone_of_voice || "professional";

    // 3. Prepare messages for OpenAI
    const openAiMessages = [
      { role: "system", content: `${systemPrompt}\n\nTom de voz: ${tone}. ${useEmojis ? 'Use emojis moderadamente.' : 'Não use emojis.'}` },
      ...messages
    ];

    // 4. Call OpenAI
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: openAiMessages,
        temperature: 0.7,
      }),
    });

    const openAiData = await openAiResponse.json();
    console.log("OpenAI raw response:", JSON.stringify(openAiData));

    if (!openAiData.choices || openAiData.choices.length === 0) {
      console.error("OpenAI Error:", openAiData);
      throw new Error(openAiData.error?.message || "OpenAI failed to return choices");
    }

    const assistantMessage = openAiData.choices[0].message.content;

    let voiceUrl = null;

    // 5. If voice enabled, call ElevenLabs
    if (voice_enabled && persona?.voice_id) {
      const elevenLabsKey = Deno.env.get("ELEVEN_LABS_API_KEY");
      const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${persona.voice_id}`, {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: assistantMessage,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (voiceResponse.ok) {
        const audioBlob = await voiceResponse.blob();
        // Here you would typically upload to Supabase Storage and return a URL
        // For now, we'll return the base64 or placeholder logic
        // In a real scenario, we'd use: 
        // const { data: uploadData } = await supabaseAdmin.storage.from('voice-clips').upload(`${crypto.randomUUID()}.mp3`, audioBlob);
        // voiceUrl = supabaseAdmin.storage.from('voice-clips').getPublicUrl(uploadData.path).data.publicUrl;
      }
    }

    return new Response(JSON.stringify({
      message: assistantMessage,
      voice_url: voiceUrl,
      persona: {
        name,
        tone
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
