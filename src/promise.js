function createDefaultPromise() {
  let tResolve = null;
  let tReject = null;

  const nPromise = new Promise((resolve, reject) => {
    tResolve = resolve;
    tReject = reject;
  });

  nPromise.resolve = tResolve;
  nPromise.reject = tReject;

  return nPromise;
}

export {createDefaultPromise};
