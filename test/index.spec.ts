import { expect } from 'chai'
import { createMergeStream } from '../src'
import { Readable } from 'stream'

describe('mergeStreamLines', () => {
  it('Should return same lines', (done) => {
    const sourceText = 'hello\nbye'
    const readable = Readable.from(sourceText)
    const mergeStream = createMergeStream()
    const result = mergeStream(readable)

    result.on('readable', () => {
      let chunk: any
      const results = []

      while ((chunk = result.read()) !== null) {
        results.push(...chunk.toString().split('\n'))
      }

      expect(results).to.be.eql(sourceText.split('\n'))
    })
    done()
  })

  it('Should return merged lines', (done) => {
    const sourceTexts = ['hello\nbye', 'nice\ngood']
    const readables = sourceTexts.map(text => Readable.from(text))
    const mergeStream = createMergeStream()
    const result = mergeStream(...readables)

    result.on('readable', () => {
      let chunk: any
      const results = []

      while ((chunk = result.read()) !== null) {
        results.push(...chunk.toString().split('\n'))
      }

      const references = ['hello', 'nice', 'bye', 'good']

      expect(results).to.be.eql(references)
    })
    done()
  })

  it('Should return array list in the object mode', (done) => {
    const sourceTexts = ['hello\nbye', 'nice\ngood']
    const readables = sourceTexts.map(text => Readable.from(text))
    const mergeStream = createMergeStream({ objectMode: true })
    const result = mergeStream(...readables)

    result.on('readable', () => {
      let chunk: any
      const results = []

      while ((chunk = result.read()) !== null) {
        results.push(chunk)
      }

      const references = [['hello', 'nice'], ['bye', 'good']]

      expect(results).to.be.eql(references)
    })
    done()
  })

})
