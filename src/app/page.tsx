import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Link href="/tts">
        <Button variant="outline" size="lg">
          TTS
        </Button>
      </Link>
    </div>
  )
}
