describe('Automatizare Monkey Testing', () => {

  it('Monkey Testing', () => {
    cy.visit('http://localhost:5000');
    cy.get('input[type="email"]').type('test@moodtracker.com'); 
    cy.get('input[type="password"]').type('123456');
    cy.contains('Log In').click();
    
    cy.url().should('include', 'index.html');
    cy.wait(1000);

    cy.get('h1').click({ multiple: true, force: true });
    cy.log('Am dat click pe toate titlurile!');

    cy.get('p').each(($el) => {
      if (Cypress.dom.isVisible($el)) {
        cy.wrap($el).click({ force: true });
      }
    });

    for(let i = 0; i < 5; i++){
        cy.contains('How are you').first().click({ force: true });
    }

    cy.get('body').click('topLeft', { force: true });
    cy.get('body').click('bottomRight', { force: true });

    cy.url().should('include', 'index.html');
    
    cy.get('#nav-avatar').click({ force: true });
    cy.contains('Logout').should('exist');

    cy.log('Aplicatia a rezistat cu succes!');
  });
  
});