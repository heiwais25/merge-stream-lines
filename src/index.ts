import { PassThrough, Readable, pipeline, Transform, TransformCallback } from 'stream'
import split2 from 'split2'

type IBuffer = {
  index: number,
  chunk: string,
  callback: TransformCallback
}

export type IOptions = {
  objectMode?: boolean
}

export function createMergeStream(options?: IOptions) {
  const { objectMode = false } = options || {}

  function mergeStream(...streams: Readable[]) {
    const buffer: IBuffer[] = []
    const totalStreamCount = streams.length

    const mergedStream = new PassThrough({
      objectMode,
    })

    let streamCounter = 0
    let lineCounter = 0
    const onChunkArrived = (index: number, chunk: string, callback: TransformCallback) => {
      buffer.push({ index, chunk, callback })
      if (++streamCounter !== totalStreamCount) {
        return
      }

      const bufferToSend = buffer.slice().sort((a, b) =>
        a.index - b.index,
      )

      buffer.length = 0
      streamCounter = 0

      bufferToSend.forEach(it => it.callback())

      if (objectMode) {
        mergedStream.push(bufferToSend.map(it => it.chunk))
      } else {
        bufferToSend.forEach(it => {
          mergedStream.push(`${lineCounter === 0 ? '' : '\n'}${it.chunk}`)
          lineCounter++
        })
      }
    }

    let finishedStreamCounter = 0
    const onFinish = () => {
      if (++finishedStreamCounter !== totalStreamCount) {
        return
      }
      mergedStream.destroy()
      mergedStream.end()
    }

    class CollectingStream extends Transform {
      constructor(
        private readonly index: number) {
        super({ encoding: 'utf-8' })
      }

      _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
        onChunkArrived(this.index, chunk.toString(), callback)
      }

      _flush(callback: TransformCallback) {
        callback()
        onFinish()
      }
    }

    streams.forEach((stream, idx) => {
      pipeline(
        stream,
        split2(),
        new CollectingStream(idx),
        (err) => {
          if (err) {
            mergedStream.destroy(err)
            streams
              .filter((_, filterIdx) => filterIdx === idx)
              .forEach(it => it.destroy(err))
          } else {
            // Handle after closing successfully
          }
        },
      )
    })

    return mergedStream
  }

  return mergeStream
}
