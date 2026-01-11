describe('Automatizare Login', () => {
  it('Verificare Login', () => {
    // 1. Deschide aplicatia
    cy.visit('http://localhost:5000'); 
    cy.wait(1000); // Asteapta 2 secunde sa te uiti la pagina

    // 2. Scrie userul (Pune un email valid din baza ta!)
    cy.get('input[type="email"]').type('test@moodtracker.com'); 
    cy.wait(1000); // Asteapta 2 secunde sa te uiti la pagina

    // 3. Scrie parola (Pune parola corecta!)
    cy.get('input[type="password"]').type('123456');
    cy.wait(1000); // Asteapta 2 secunde sa te uiti la pagina

    // 4. Apasa butonul Log In
    cy.contains('Log In').click();
    cy.wait(1000); // Asteapta 2 secunde sa te uiti la pagina

    // 4. VERIFICARE:
    // Asteapta pana cand adresa din browser contine "index.html"
    // Asta confirma ca s-a facut redirectul catre Dashboard
    cy.url().should('include', 'index.html');
  });
});