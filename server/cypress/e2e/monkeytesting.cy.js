describe('Automatizare Monkey Testing', () => {

  it('Monkey Testing', () => {
    
    // 1. LOGIN
    cy.visit('http://localhost:5000');
    cy.get('input[type="email"]').type('test@moodtracker.com'); 
    cy.get('input[type="password"]').type('123456');
    cy.contains('Log In').click();
    
    cy.url().should('include', 'index.html');
    cy.wait(1000);

    // --- INCEPE HAOSUL ---

    // 2. Click pe TOATE Titlurile (H1)
    // Adaugam 'multiple: true' ca sa le apese pe toate, daca sunt mai multe
    cy.get('h1').click({ multiple: true, force: true });
    cy.log('Am dat click pe toate titlurile!');

    // 3. Click pe toate textele (Paragrafe)
    // Aici folosim each, e varianta cea mai sigura
    cy.get('p').each(($el) => {
      // Verificam daca elementul e vizibil inainte sa dam click, ca sa nu dea erori ciudate
      if (Cypress.dom.isVisible($el)) {
        cy.wrap($el).click({ force: true });
      }
    });

    // 4. "Rage Click" (Click nervos pe un element aleatoriu)
    // Apasam de 5 ori pe titlul "How are you feeling"
    for(let i = 0; i < 5; i++){
        // Folosim first() ca sa fim siguri ca luam doar unul singur pentru rage click
        cy.contains('How are you').first().click({ force: true });
    }

    // 5. Click pe fundal (Body)
    cy.get('body').click('topLeft', { force: true });
    cy.get('body').click('bottomRight', { force: true });

    // --- VERIFICARE FINALĂ ---
    
    // Verificam daca aplicatia a supravietuit
    cy.url().should('include', 'index.html');
    
    // Verificam daca putem deschide meniul (semn ca JavaScript-ul inca merge)
    cy.get('#nav-avatar').click({ force: true });
    cy.contains('Logout').should('exist');

    cy.log('Aplicatia a rezistat cu succes!');
  });
});