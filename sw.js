const CACHE_NAME = 'poker-solo-v3.6.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/main.js',
  './js/game.js',
  './js/game_online.js',
  './js/ui.js',
  './js/card.js',
  './js/evaluator.js',
  './js/player.js',
  './js/data.js',
  './js/achievements.js',
  './js/network.js',
  './js/audio.js',
  './js/timer.js'
];

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
  self.clients.claim();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
