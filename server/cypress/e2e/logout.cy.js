describe('Automatizare Logout', () => {

  it('Verificare Logout', () => {
    
    // --- PARTEA 1: PRECONDITIA (Trebuie sa intram in aplicatie intai) ---
    cy.visit('http://localhost:5000');
    
    // Foloseste contul TAU care merge
    cy.get('input[type="email"]').type('test@moodtracker.com'); 
    cy.wait(1000); // Asteapta o secunda sa te uiti la pagina

    cy.get('input[type="password"]').type('123456');
    cy.wait(1000); // Asteapta o secunda sa te uiti la pagina

    cy.contains('Log In').click();
    
    // Verificam ca am intrat
    cy.url().should('include', 'index.html');
    cy.wait(1000); 

    // 2. Click pe Avatar folosind ID-ul gasit de tine
    // (Simbolul # inseamna ID)
    cy.get('#nav-avatar').click(); 

    // 3. Asteptam putin sa apara meniul
    cy.wait(1000);

    // 4. Click pe Logout (fortat, ca sa fim siguri)
    cy.contains('Logout').click({ force: true });

    // 5. Verificare finala
    cy.url().should('include', 'login');
  });
});