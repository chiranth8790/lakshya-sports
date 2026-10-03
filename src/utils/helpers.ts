export const getHighResImage = (url: string) => {
  if (!url) return '';
  let cleanUrl = url;
  
  // Clean various e-commerce compression tags
  cleanUrl = cleanUrl.replace(/\._[a-zA-Z0-9_]+_\./g, '.');
  cleanUrl = cleanUrl.replace(/_[0-9]+x[0-9]+(?=\.[a-zA-Z]+$)/g, '');
  cleanUrl = cleanUrl.replace(/\/image\/[0-9]+\/[0-9]+\//g, '/image/original/original/');
  cleanUrl = cleanUrl.replace(/\/c_[a-z]+,w_[0-9]+(?:,q_[a-zA-Z0-9]+)?\//g, '/');
  
  return cleanUrl;
};