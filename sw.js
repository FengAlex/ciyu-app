/* 词屿免费 PWA 离线缓存：学习主界面离线可用。OCR 需要联网加载第三方模型。 */
const CACHE = 'ciyu-shell-v3-fontfix-20261013';
const ESSENTIAL = ['./', './index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ESSENTIAL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('ciyu-shell-') && k !== CACHE).map(k => caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(resp=>{
      if(resp.ok && /\/(?:index\.html)?$/.test(new URL(request.url).pathname)){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));}
      return resp;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(resp=>{
    if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}
    return resp;
  })));
});
