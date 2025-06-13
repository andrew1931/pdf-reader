import { useDbInit } from './hooks';
import { LS } from './LS';

export type DbFileMeta = {
   fileName: string;
   createdAt: Date;
   lastViewedAt: Date;
   title: string;
   author: string;
   numberOfPages: number;
   size: number;
   pdfVersion: string;
   lastViewedPage: number;
   lastViewedPageTextMode: number;
   fontSizeZoom: number;
   bookmarks: { page: number; note: string }[];
};

type EditFileMeta = {
   title?: DbFileMeta['title'];
   author?: DbFileMeta['author'];
   pdfVersion?: DbFileMeta['pdfVersion'];
   lastViewedAt?: DbFileMeta['lastViewedAt'];
   numberOfPages?: DbFileMeta['numberOfPages'];
   lastViewedPage?: DbFileMeta['lastViewedPage'];
   lastViewedPageTextMode?: DbFileMeta['lastViewedPageTextMode'];
   fontSizeZoom?: DbFileMeta['fontSizeZoom'];
   bookmarks?: DbFileMeta['bookmarks'];
};

export type DbFile = {
   fileName: string;
   createdAt: Date;
   file: File;
};

export class KeyExistsError extends Error {
   constructor() {
      super('Key already exists in DB');
   }
}

export class NotInitError extends Error {
   constructor() {
      super('Db is not initialized');
   }
}

export class NotEnabledError extends Error {
   constructor() {
      super('Storage is not enabled, you can enable it settings to use this feature');
   }
}

export const DEFAULT_FONT_SIZE_ZOOM = 100;

export const DB = (() => {
   const MAX_CONNECT_ATTEMPTS = 3;
   const DB_NAME = '@pdf-swiper';
   const FILES_STORE = 'pdf_files';
   const FILES_META_STORE = 'pdf_meta';
   const VERSION = 1;

   let dbIsDisabled = !LS.getDbIsEnabled();

   let db;

   const createFilesStore = (db) => {
      db.createObjectStore(FILES_STORE, {
         keyPath: 'fileName',
      });
      db.createObjectStore(FILES_META_STORE, {
         keyPath: 'fileName',
      });
   };

   const deleteDb = (): Promise<void> => {
      console.log('[DB] delete attempt');
      const reloadTimer = setTimeout(() => {
         // in case delete requests hangs more than 3 seconds
         // reload closes all clients connections
         window.location.reload();
      }, 3000);
      return new Promise((resolve, reject) => {
         try {
            if (db) {
               db.close();
            }
            const request = indexedDB.deleteDatabase(DB_NAME);
            request.onsuccess = () => {
               console.log('[DB] delete db success');
               clearTimeout(reloadTimer);
               resolve();
            };
            request.onerror = (e) => {
               console.error('[DB] Error deleting database: ', e);
               clearTimeout(reloadTimer);
               reject(e);
            };
            request.onblocked = () => {
               console.error('[DB] Error deleting database is blocked');
               clearTimeout(reloadTimer);
               reject('database is blocked');
            };
         } catch (error) {
            console.error('[DB] deleteDb', error);
            clearTimeout(reloadTimer);
            reject(error);
         }
      });
   };

   let connectAttempts = 0;

   const connect = () => {
      connectAttempts++;
      console.log('[DB] connect attempt: ', connectAttempts);
      if (connectAttempts > MAX_CONNECT_ATTEMPTS) return;
      const openRequest = indexedDB.open(DB_NAME, VERSION);
      openRequest.onupgradeneeded = (e) => {
         console.log('[DB] upgrade needed: ', e.oldVersion, VERSION);
         try {
            db = openRequest.result;
            if (e.oldVersion === 0) {
               console.log('[DB] creating store...');
               createFilesStore(db);
            } else {
               // handle db migrations
            }
         } catch (error) {
            console.error('[DB] connect: ', error);
         }
      };

      openRequest.onerror = () => {
         console.error('[DB] openRequest', openRequest.error);
      };

      openRequest.onsuccess = () => {
         console.log('[DB] connect success');
         db = openRequest.result;
         useDbInit.emit();
      };
   };

   const transaction = <T>(
      store: string,
      cb: (store: IDBObjectStore) => IDBRequest
   ): Promise<T> => {
      return new Promise((resolve, reject) => {
         if (db) {
            const transaction = db.transaction(store, 'readwrite');
            const files = transaction.objectStore(store);
            const request = cb(files);
            request.onsuccess = () => {
               resolve(request.result);
            };
            request.onerror = () => {
               if (
                  request.error &&
                  'name' in request.error &&
                  request.error.name === 'ConstraintError'
               ) {
                  reject(new KeyExistsError());
               } else {
                  reject(request.error);
               }
            };
         } else {
            reject(new NotInitError());
         }
      });
   };

   return {
      connect: connect,
      isDisabled() {
         return dbIsDisabled;
      },
      disable() {
         LS.saveDbIsEnabled('0');
         dbIsDisabled = true;
      },
      enable() {
         LS.saveDbIsEnabled('1');
         dbIsDisabled = false;
      },
      addFile(file: File, fileMeta: EditFileMeta): Promise<void> {
         if (dbIsDisabled) return Promise.reject(new NotEnabledError());
         return new Promise((resolve, reject) => {
            return transaction(FILES_STORE, (files) => {
               return files.add({
                  createdAt: new Date(),
                  fileName: file.name,
                  file,
               } as DbFile);
            })
               .then(() => {
                  transaction(FILES_META_STORE, (meta) => {
                     return meta.add({
                        createdAt: new Date(),
                        fileName: file.name,
                        size: file.size,
                        pdfVersion: fileMeta.pdfVersion || '',
                        lastViewedAt: new Date(),
                        title: fileMeta.title || '',
                        author: fileMeta.author || '',
                        numberOfPages: fileMeta.numberOfPages || 0,
                        lastViewedPage: 0,
                        lastViewedPageTextMode: 0,
                        fontSizeZoom: DEFAULT_FONT_SIZE_ZOOM,
                        bookmarks: [],
                     } as DbFileMeta);
                  })
                     .then(() => resolve())
                     .catch(() => {
                        // delete added file if files meta adding failed
                        transaction(FILES_STORE, (files) => files.delete(file.name))
                           .catch(console.error)
                           .finally(reject);
                     });
               })
               .catch(reject);
         });
      },
      editFileMeta(fileName: string, data: EditFileMeta): Promise<void> {
         if (dbIsDisabled) return Promise.reject(new NotEnabledError());
         return new Promise((resolve, reject) => {
            transaction<DbFileMeta>(FILES_META_STORE, (files) => files.get(fileName))
               .then((file) => {
                  Object.keys(data).forEach((key) => {
                     file[key] = data[key];
                  });
                  transaction<void>(FILES_META_STORE, (files) => files.put(file))
                     .then(resolve)
                     .catch(reject);
               })
               .catch(reject);
         });
      },
      getAllFilesMeta(): Promise<DbFileMeta[]> {
         return transaction<DbFileMeta[]>(FILES_META_STORE, (files) => {
            return files.getAll();
         });
      },
      getFile(fileName: string): Promise<DbFile> {
         return transaction<DbFile>(FILES_STORE, (files) => {
            return files.get(fileName);
         });
      },
      getFileMeta(fileName: string): Promise<DbFileMeta> {
         return transaction<DbFileMeta>(FILES_META_STORE, (files) => {
            return files.get(fileName);
         });
      },
      deleteFile(fileName: string): Promise<void> {
         return new Promise((resolve, reject) => {
            Promise.all([
               transaction(FILES_STORE, (files) => files.delete(fileName)),
               transaction(FILES_META_STORE, (meta) => meta.delete(fileName)),
            ])
               .then(() => resolve())
               .catch(reject);
         });
      },
      getUsedSize(): Promise<number> {
         return new Promise((resolve) => {
            transaction<DbFile[]>(FILES_STORE, (files) => files.getAll())
               .then((res) => {
                  resolve(res.reduce((acc, curr) => acc + curr.file.size, 0));
               })
               .catch(() => resolve(0));
         });
      },
      clear(): Promise<void> {
         return deleteDb();
      },
   };
})();
