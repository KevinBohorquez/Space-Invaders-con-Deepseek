// test-setup.js
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost'
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.CanvasRenderingContext2D = function() {};

// Mock para canvas
HTMLCanvasElement.prototype.getContext = function() {
  return {
    fillRect: () => {},
    clearRect: () => {},
    fillText: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    beginPath: () => {},
    closePath: () => {},
    stroke: () => {},
    fill: () => {},
    arc: () => {},
    rect: () => {},
    measureText: () => ({ width: 0 }),
    font: '',
    fillStyle: '',
    textAlign: ''
  };
};