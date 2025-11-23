import { expect } from 'chai';

describe('Test Setup', () => {
    it('chai debe estar funcionando correctamente', () => {
        expect(true).to.be.true;
        expect(1 + 1).to.equal(2);
    });

    it('debe poder importar módulos ES6', () => {
        expect(import.meta).to.exist;
    });
});