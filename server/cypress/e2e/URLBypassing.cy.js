describe('Automatizare URL Bypassing', () => {

  it('URL Bypassing', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.wait(1000);

    cy.visit('http://localhost:5000/index.html');
    cy.wait(1000);

    cy.url().should('include', 'login');
    
    cy.url().should('not.include', 'index.html');

    cy.contains('Log In').should('be.visible');

    cy.log('Tentativa de intruziune blocata cu succes!');
  });

});