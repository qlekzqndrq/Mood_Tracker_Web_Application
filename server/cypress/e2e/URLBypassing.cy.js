describe('Automatizare URL Bypassing', () => {

  it('URL Bypassing', () => {
    
    // 1. Ne asiguram ca NU suntem logati
    // (Curatam cookie-urile si memoria browserului ca sa fim siguri ca e un vizitator nou)
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.wait(1000);

    // 2. INCERCAM SA INTRAM PE FURIS
    // Scriem direct adresa paginii protejate, sarind peste login
    cy.visit('http://localhost:5000/index.html');
    cy.wait(1000);

    // 3. VERIFICARE
    // Aplicatia ar trebui sa ne redirectioneze automat catre Login
    
    // Verificam ca URL-ul final contine "login"
    cy.url().should('include', 'login');
    
    // Verificam ca URL-ul NU mai este "index.html"
    cy.url().should('not.include', 'index.html');

    // Optional: Verificam daca vedem butonul de "Log In"
    cy.contains('Log In').should('be.visible');

    cy.log('Tentativa de intruziune blocata cu succes!');

  });

});