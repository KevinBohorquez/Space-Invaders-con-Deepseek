import { expect } from 'chai';
import { formatScore, getRandomInt, checkCollision } from '../src/utils/helpers.js';

describe('Helpers', function() {
  describe('formatScore()', function() {
    it('should pad zeros correctly for small numbers', function() {
      expect(formatScore(100)).to.equal('000100');
      expect(formatScore(9999)).to.equal('009999');
      expect(formatScore(0)).to.equal('000000');
    });

    it('should handle large numbers correctly', function() {
      expect(formatScore(123456)).to.equal('123456');
    });
  });

  describe('getRandomInt()', function() {
    it('should return numbers within specified range', function() {
      const min = 1;
      const max = 10;
      
      for (let i = 0; i < 100; i++) {
        const result = getRandomInt(min, max);
        expect(result).to.be.at.least(min);
        expect(result).to.be.at.most(max);
      }
    });

    it('should handle negative ranges', function() {
      const result = getRandomInt(-5, 5);
      expect(result).to.be.at.least(-5);
      expect(result).to.be.at.most(5);
    });
  });

  describe('checkCollision()', function() {
    it('should detect collisions between objects', function() {
      const obj1 = { x: 0, y: 0, width: 10, height: 10 };
      const obj2 = { x: 5, y: 5, width: 10, height: 10 };
      
      expect(checkCollision(obj1, obj2)).to.be.true;
    });

    it('should detect non-collisions', function() {
      const obj1 = { x: 0, y: 0, width: 10, height: 10 };
      const obj3 = { x: 20, y: 20, width: 10, height: 10 };
      
      expect(checkCollision(obj1, obj3)).to.be.false;
    });

    it('should handle edge cases', function() {
      const obj1 = { x: 0, y: 0, width: 10, height: 10 };
      const obj2 = { x: 10, y: 10, width: 10, height: 10 };
      
      // Just touching - should not collide
      expect(checkCollision(obj1, obj2)).to.be.false;
    });
  });
});