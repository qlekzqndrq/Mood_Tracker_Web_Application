describe('Automatizare Navigare', () => {

  it('Verificare accesare pagina de Setari', () => {
    cy.visit('http://localhost:5000');
    cy.wait(1000);
    cy.get('input[type="email"]').type('test@moodtracker.com'); 
    cy.wait(1000);
    cy.get('input[type="password"]').type('123456');
    cy.wait(1000);
    cy.contains('Log In').click();

    cy.url().should('include', 'index.html');
    cy.wait(1000);

    cy.get('#nav-avatar').click(); 

    cy.wait(1000);

    cy.contains('Settings').click({ force: true });

    cy.wait(1000);
  });
  
});