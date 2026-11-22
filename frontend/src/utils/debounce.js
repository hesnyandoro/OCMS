export function debounce(fn, waitMs) {
  let timer = null;
  const wrapped = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
  wrapped.cancel = () => {
    clearTimeout(timer);
    timer = null;
  };
  return wrapped;
}

export function shouldGeocodeQuery(query) {
  return String(query || '').trim().length >= 3;
}
