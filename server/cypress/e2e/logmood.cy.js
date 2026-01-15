describe('Automatizare Log Mood', () => {

  it('Adaugare Mood nou (Flux Wizard Complet)', () => {
    cy.visit('http://localhost:5000');
    cy.get('input[type="email"]').type('test@moodtracker.com'); 
    cy.get('input[type="password"]').type('123456');
    cy.contains('Log In').click();
    cy.url().should('include', 'index.html');
    cy.wait(2000); 

    cy.get('#logMoodBtn').click({ force: true });
    cy.wait(1000); 

    cy.get('#mood-options > div:nth-child(1)').click({ force: true });
    
    cy.get('#step-1 button.primary-btn').click({ force: true });
    cy.wait(500);

    cy.get('#tags-container > div:nth-child(1)').click({ force: true });

    cy.get('#step-2 button.primary-btn').click({ force: true });
    cy.wait(500);

    const mesajUnic = 'Jurnal Automat ' + Date.now();

    cy.get('#wizard-reflection').type(mesajUnic, { force: true });

    cy.get('#step-3 button.primary-btn').click({ force: true });
    cy.wait(500);

    cy.get('#sleep-options > div:nth-child(2)').click({ force: true });

    cy.get('#step-4 button.primary-btn').click({ force: true });

    cy.wait(2000); 
    
    cy.contains(mesajUnic).should('be.visible');

    cy.log('Succes! Mood-ul a fost adaugat prin toti pasii wizard-ului.');
  });
  
});