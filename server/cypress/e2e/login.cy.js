describe('Automatizare Login', () => {
  it('Verificare Login', () => {
    cy.visit('http://localhost:5000'); 
    cy.wait(1000); 

    cy.get('input[type="email"]').type('test@moodtracker.com'); 
    cy.wait(1000); 

    cy.get('input[type="password"]').type('123456');
    cy.wait(1000); 

    cy.contains('Log In').click();
    cy.wait(1000); 

    cy.url().should('include', 'index.html');
  });
  
});