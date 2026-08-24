export function createBuilderStyleLoader(loadStyles) {
  let ready = false;
  let pending = null;
  let error = null;

  return {
    get ready() { return ready; },
    get error() { return error; },
    load() {
      if (ready) return Promise.resolve();
      if (pending) return pending;

      error = null;
      try {
        pending = Promise.resolve(loadStyles());
      } catch (loadError) {
        error = loadError;
        return Promise.reject(loadError);
      }
      pending = pending
        .then(() => {
          ready = true;
          pending = null;
        })
        .catch((loadError) => {
          error = loadError;
          pending = null;
          throw loadError;
        });
      return pending;
    },
  };
}

export const workspaceBuilderStyles = createBuilderStyleLoader(() => import('./builder.css'));
