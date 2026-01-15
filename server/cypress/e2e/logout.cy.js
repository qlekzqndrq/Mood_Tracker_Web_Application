describe('Automatizare Logout', () => {

  it('Verificare Logout', () => {
    cy.visit('http://localhost:5000');
    cy.get('input[type="email"]').type('test@moodtracker.com'); 
    cy.wait(1000); 

    cy.get('input[type="password"]').type('123456');
    cy.wait(1000); 

    cy.contains('Log In').click();
    
    cy.url().should('include', 'index.html');
    cy.wait(1000); 

    cy.get('#nav-avatar').click(); 

    cy.wait(1000);

    cy.contains('Logout').click({ force: true });

    cy.url().should('include', 'login');
  });
  
});