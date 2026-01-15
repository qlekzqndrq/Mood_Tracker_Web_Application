describe('Automatizare Negative Login', () => {

  it('Negative Login', () => {
    cy.visit('http://localhost:5000');
    cy.get('input[type="email"]').type('robot@test.com'); 
    cy.get('input[type="password"]').type('parola_aiurea_123');

    cy.contains('Log In').click();

    cy.url().should('not.include', 'index.html');

    cy.url().should('include', 'login');
  });

});