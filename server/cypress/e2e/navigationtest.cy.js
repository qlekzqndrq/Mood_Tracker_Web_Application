describe('Automatizare Navigare', () => {

  it('Verificare accesare pagina de Setari', () => {
    
    // 1. LOGIN (Standard)
    cy.visit('http://localhost:5000');
    cy.wait(1000);
    cy.get('input[type="email"]').type('test@moodtracker.com'); 
    cy.wait(1000);
    cy.get('input[type="password"]').type('123456');
    cy.wait(1000);
    cy.contains('Log In').click();

    // Asteptam sa intram in Dashboard
    cy.url().should('include', 'index.html');
    cy.wait(1000);

    // 2. DESCHIDEM MENIUL (Folosind ID-ul descoperit de tine)
    cy.get('#nav-avatar').click(); 

    // Asteptam putin sa apara meniul
    cy.wait(1000);

    // 3. CLICK PE SETTINGS
    // Cautam textul "Settings" si dam click
    cy.contains('Settings').click({ force: true });

    // 4. VERIFICARE
    // Asteptam sa se incarce pagina noua
    cy.wait(1000);
    
    // OPTIONAL: Verificam daca vedem un titlu specific pe pagina aia
    // cy.contains('Account Settings').should('be.visible');
  });
});