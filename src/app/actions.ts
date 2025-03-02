'use server'

import { Client, handle_file } from '@gradio/client'

interface TTSOutput {
  url: string
}

export async function tts(file: File, text: string): Promise<string> {
  const client = await Client.connect('http://ms.muxixyz.com:7860/')
  const res = await client.predict('/basic_tts', [
    handle_file(file), // ref_audio_input
    '', // ref_text_input
    text, // gen_text_input
    false, // remove_silence
    0.15, // cross_fade_duration_slider
    32, // nfe_slider
    1, // speed_slider
  ])

  const output = (res.data as never[])?.[0] as TTSOutput
  return Promise.resolve(output.url)
}
