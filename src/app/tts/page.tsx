'use client'
import { useEffect, useRef, useState } from 'react'
import { Live2DCubismModel } from 'live2d-renderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getWavDuration } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

export default function TTSPage() {
  const [canvasSize, setCanvasSize] = useState(0)
  const [model, setModel] = useState<Live2DCubismModel>()
  const [connection, setConnection] = useState<WebSocket>()
  const rendererRef = useRef<HTMLCanvasElement>(null)
  //   const text = useRef<string>(`
  // The rain had started to fall in quiet sheets, a soft patter against the window that filled the room with an almost comforting rhythm. In the dim light, Evelyn sat by the fire, her fingers tracing the edges of an old book. The smell of wood burning, mixed with the fresh scent of rain, hung in the air. Her mind wandered back to the days when she was a child, the days when everything seemed simpler—when she would lie in her bed listening to the rain and let it carry her into dreams of grand adventures.

  // She sighed and opened the book, the pages crackling softly. It was a journal, one she had found in the attic of her family’s old house. She had read it countless times, but tonight something felt different. There was a certain weight to the words, as though they were calling out to her in a way they never had before. The ink was faded, but the handwriting was unmistakable—her grandmother’s.

  // As she turned the page, she found a drawing of a map, intricate and detailed, leading through a dense forest and across a wide river. The caption beneath it read: "Follow the path, and you will find what has been lost." Evelyn’s heart quickened. Her grandmother had always been a woman of mystery, full of strange tales and hidden meanings. But now, with the map in her hands, Evelyn realized there might be more truth to those stories than she had ever imagined.

  // A flash of lightning illuminated the room, and in that instant, Evelyn felt an unexplainable pull to the forest beyond the garden—where the path from the map might just begin. She closed the book, her mind racing. The adventure, it seemed, had finally found her.

  // `)
  // const text = useRef<string>(
  //   "As a Reader assistant, I'm familiar with new technology. which are key to its improved performance in terms of both training speed and inference efficiency. Let's break down the components"
  // )
  const text =
    useRef<string>(`雨开始安静地落下，轻轻地拍打着窗户，以一种几乎令人欣慰的节奏充满了房间。在昏暗的灯光下，伊芙琳坐在火炉旁，手指抚摸着一本旧书的边缘。空气中弥漫着木柴燃烧的气味，夹杂着雨水的清新气味。她的思绪飘回到了她还是个孩子的日子，那些一切似乎都比较简单的日子——那时她会躺在床上听着雨声，让雨声带着她进入宏大冒险的梦想。

她叹了口气，打开了书，书页发出轻柔的噼啪声。那是一本日记，她在她家老房子的阁楼上找到的。她已经读了无数遍，但今晚感觉有些不同。这些话有一定的分量，仿佛它们在以一种前所未有的方式呼唤着她。墨水已经褪色，但笔迹却清晰可辨——她祖母的。

当她翻开书页时，她发现了一张地图图，错综复杂，细节丰富，穿过一片茂密的森林，穿过一条宽阔的河流。它下面的说明文字写道：“沿着小路走，你会找到丢失的东西。伊芙琳的心跳加速了。她的祖母一直是一个神秘的女人，充满了奇怪的故事和隐藏的意义。但现在，手里拿着地图，伊芙琳意识到这些故事的真实性可能比她想象的要多。

一道闪电照亮了房间，在那一瞬间，Evelyn 感到一股无法解释的拉力，被拉向了花园外的森林——地图上的路径可能才刚刚开始。她合上书，脑子飞速运转。这次冒险似乎终于找到了她。`)
  const modelRef = useRef<Live2DCubismModel>(null)
  // const currentTime = useRef<number>(Date.now())
  const lastStartTime = useRef<number>(0)
  const lastDuration = useRef<number>(0)

  useEffect(() => {
    modelRef.current = model!
  }, [model])

  useEffect(() => {
    const handleResize = () => setCanvasSize(Math.min(window.innerWidth, 700))
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // load live2d model
  const load = async () => {
    const l2dm = new Live2DCubismModel(rendererRef.current!, {
      cubismCorePath:
        'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
      lipsyncSmoothing: 0.1,
      autoInteraction: false,
      tapInteraction: false,
      enableMotion: false,
    })
    await l2dm.load('/resources/Hiyori/Hiyori.model3.json')
    // await l2dm.load('/resources/Haru/Haru.model3.json')
    // await l2dm.load('/resources/Mark/Mark.model3.json')
    // await l2dm.load('/resources/Natori/Natori.model3.json')
    // await l2dm.load('/resources/Rice/Rice.model3.json')
    setModel(l2dm)
  }

  useEffect(() => {
    if (!model) {
      console.log('Model not loaded')
      load()
    }
    console.log('Model loaded')
  }, [])

  // establish websocket connection
  useEffect(() => {
    // const ws = new WebSocket('ws://ms.muxixyz.com:7890')
    const ws = new WebSocket('ws://localhost:7890')
    ws.onopen = () => {
      console.log('Connected to server.')
      setConnection(ws)
    }
    ws.onmessage = async (e) => {
      if (e.data instanceof Blob) {
        e.data.arrayBuffer().then((buffer: ArrayBuffer) => {
          const duration = getWavDuration(buffer.slice())
          setTimeout(
            () => {
              lastDuration.current = duration * 1000
              lastStartTime.current = Date.now()
              modelRef.current!.inputAudio(buffer.slice(), true)
            },
            lastDuration.current === 0
              ? 0
              : lastStartTime.current - Date.now() + lastDuration.current
          )
        })
      }

      if (e.data === 'END') {
        setTimeout(() => {
          console.log('Audio processing complete')
          // currentTime.current = 0
        }, 2000)
      }
    }
    ws.onclose = () => {
      console.log('Connection closed.')
      setConnection(undefined)
    }
    ws.onerror = (e) => {
      console.error('WebSocket error:', e)
    }
    return () => connection?.close()
  }, [])

  async function play(text: string) {
    lastDuration.current = 0
    lastStartTime.current = Date.now()
    connection?.send(text)
  }

  // async function test() {
  //   fetch('http://localhost:3000/audio_output.wav')
  //     .then((res) => res.arrayBuffer())
  //     .then((buffer) => {
  //       if (!model) {
  //         console.log('Model not loaded')
  //         return
  //       }
  //       model.inputAudio(buffer.slice(), true)
  //     })
  // }

  return (
    <div className="w-screen h-screen flex flex-row items-center justify-center gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">输入文本</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 items-center">
            <Textarea
              className="w-96 h-64"
              onChange={(e) => (text.current = e.target.value)}
              defaultValue={text.current}
            />
            <Button onClick={() => play(text.current)}>Play</Button>
          </div>
        </CardContent>
      </Card>
      <canvas ref={rendererRef} width={canvasSize} height={canvasSize} />
    </div>
  )
}
