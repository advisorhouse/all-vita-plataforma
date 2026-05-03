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
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const tenant_id = formData.get("tenant_id") as string;

    if (!file || !tenant_id) {
      return new Response(JSON.stringify({ error: "file and tenant_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openAiKey = Deno.env.get("OPENAI_API_KEY");

    // Whisper transcription
    const transcriptionFormData = new FormData();
    transcriptionFormData.append("file", file);
    transcriptionFormData.append("model", "whisper-1");

    const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiKey}`,
      },
      body: transcriptionFormData,
    });

    if (!transcriptionResponse.ok) {
      const err = await transcriptionResponse.text();
      console.error("Transcription error:", err);
      throw new Error("Failed to transcribe audio");
    }

    const transcriptionData = await transcriptionResponse.json();

    return new Response(JSON.stringify({
      text: transcriptionData.text,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-chat-voice function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
