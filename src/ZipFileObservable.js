import { fromBuffer } from 'yauzl';

import 'core-js/proposals/observable';

export default function (buffer) {
  return new Observable(observer => {
    fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
      if (err) {
        return observer.error(err);
      }

      zipFile.readEntry();

      zipFile.on('entry', entry => {
        if (/\/$/.test(entry.fileName)) {
          zipFile.readEntry();
        } else {
          zipFile.openReadStream(entry, (err, readStream) => {
            if (err) {
              observer.error(err);
            } else {
              observer.next({
                entry,
                next: () => zipFile.readEntry(),
                readStream
              });
            }
          });
        }
      });

      zipFile.on('end', () => observer.complete());
    });
  });
}
