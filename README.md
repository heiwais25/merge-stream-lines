# merge-stream-lines

Merge each line in the multiple streams like below

```text
stream1: 1 / 2 / 3 / 4
stream2: 5 / 6 / 7 / 8
======================
merged : 1 / 5 / 2 / 6 / 3 / 7 / 4 / 8 
```

## Usage

```typescript
import { createMergeStream } from "merge-stream-lines"

// In seqeuntial flat-array
// ex) 1 / 5 / 2 / 6 ...
const sequentialFlatStream = createMergeStream()
sequentialFlatStream(...stream).pipe(process.stdout)

// In seqeuntial flat-array
// ex) [1, 5] / [2, 6] ...
const sequentialObjectArray = createMergeStream()
sequentialObjectArray(...stream).pipe(process.stdout)
```


