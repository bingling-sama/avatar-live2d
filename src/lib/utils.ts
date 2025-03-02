import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWavDuration(arrayBuffer: ArrayBuffer): number {
  // 创建DataView来读取ArrayBuffer内容
  const view = new DataView(arrayBuffer)

  // 读取文件头部分的参数
  const sampleRate = view.getInt32(24, true) // 采样率，通常在文件头的24-27字节
  const bitDepth = view.getInt16(34, true) // 位深，通常在文件头的34-35字节
  const numChannels = view.getInt16(22, true) // 声道数，通常在文件头的22-23字节
  const dataSize = view.getInt32(40, true) // 数据部分的大小，通常在文件头的40-43字节

  // 每个采样点的字节数
  const bytesPerSample = (bitDepth / 8) * numChannels

  // 计算音频时长：数据大小 / 每个采样点的字节数 / 采样率
  const durationInSeconds = dataSize / (bytesPerSample * sampleRate)

  return durationInSeconds
}
